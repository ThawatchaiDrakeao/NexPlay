const crypto = require("crypto");
const axios = require("axios");

const { env } = require("../../config/env");
const { getSupabaseAdminClient } = require("../../config/database");
const { HttpError } = require("../../utils/httpError");


const verifyLineSignature = (rawBody, signature) => {
  if (!env.lineChannelSecret) {
    throw new HttpError(500, "LINE channel secret is not configured");
  }

  if (!signature || !rawBody) {
    throw new HttpError(401, "Invalid LINE signature");
  }

  const expected = crypto
    .createHmac("sha256", env.lineChannelSecret)
    .update(rawBody)
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new HttpError(401, "Invalid LINE signature");
  }
};


const replyMessage = async (replyToken, text) => {
  if (!env.lineChannelAccessToken) {
    throw new HttpError(
      500,
      "LINE access token is not configured"
    );
  }


  await axios.post(
    "https://api.line.me/v2/bot/message/reply",
    {
      replyToken,
      messages: [
        {
          type: "text",
          text,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${env.lineChannelAccessToken}`,
        "Content-Type": "application/json",
      },
    }
  );
};


const findOrCreateLineUser = async (lineUserId) => {
  const db = getSupabaseAdminClient();


  const { data: existingUser, error: findError } = await db
    .from("users")
    .select("id, name, status, line_user_id")
    .eq("line_user_id", lineUserId)
    .maybeSingle();


  if (findError) {
    throw new HttpError(500, "Unable to load LINE user");
  }


  if (existingUser) {
    return existingUser;
  }


  const { data: user, error } = await db
    .from("users")
    .insert({
      line_user_id: lineUserId,
      name: "LINE User",
      status: "active",
    })
    .select("id, name, status, line_user_id")
    .single();


  if (error?.code === "23505") {

    const { data: duplicateUser, error: duplicateError } =
      await db
        .from("users")
        .select("id, name, status, line_user_id")
        .eq("line_user_id", lineUserId)
        .single();


    if (duplicateError || !duplicateUser) {
      throw new HttpError(
        500,
        "Unable to load LINE user"
      );
    }

    return duplicateUser;
  }


  if (error || !user) {
    throw new HttpError(
      500,
      "Unable to create LINE user"
    );
  }


  return user;
};



const handleWebhook = async ({
  rawBody,
  signature,
  body
}) => {

  verifyLineSignature(
    rawBody,
    signature
  );


  const events = Array.isArray(body?.events)
    ? body.events
    : [];


  for (const event of events) {


    console.log(
      "LINE EVENT:",
      JSON.stringify(event,null,2)
    );


    const lineUserId =
      event?.source?.userId;


    if (!lineUserId) {
      continue;
    }



    if (event.type === "follow") {


      await findOrCreateLineUser(
        lineUserId
      );


      await replyMessage(
        event.replyToken,
        "ยินดีต้อนรับสู่ NexPlay ⚽\nระบบจองสนามฟุตบอลออนไลน์"
      );

    }



    if (event.type === "message") {


      await findOrCreateLineUser(
        lineUserId
      );


      const text =
        event.message?.text || "";


      if (text.includes("จอง")) {


        await replyMessage(
          event.replyToken,
          "ระบบจองสนามกำลังเตรียมให้บริการครับ ⚽"
        );


      } else {


        await replyMessage(
          event.replyToken,
          "สวัสดีครับ NexPlay ⚽\nพิมพ์ 'จอง' เพื่อเริ่มจองสนาม"
        );

      }

    }

  }


  return {
    status:"ok"
  };

};



module.exports = {
  handleWebhook,
  verifyLineSignature,
  findOrCreateLineUser,
  replyMessage
};