const publicService = require("./public.service");
const bookingService = require("../booking/booking.service");
const { HttpError } = require("../../utils/httpError");
const { getSupabaseAdminClient } = require("../../config/database");
const crypto = require("crypto");

const listFields = async (req, res, next) => {
  try {
    const fields = await publicService.listPublicFields();
    res.status(200).json({ fields });
  } catch (error) {
    next(error);
  }
};

const createPublicBooking = async (req, res, next) => {
  try {
    const { fieldId, date, startTime, endTime, customer } = req.body;

    if (!fieldId || !date || !startTime || !endTime || !customer) {
      throw new HttpError(400, "ข้อมูลการจองไม่ครบถ้วน");
    }

    const db = getSupabaseAdminClient();

    const { data: fieldData, error: fieldError } = await db
      .from("fields")
      .select("tenant_id")
      .eq("id", fieldId)
      .single();

    if (fieldError || !fieldData) {
      throw new HttpError(404, "ไม่พบข้อมูลสนามนี้ในระบบ");
    }

    let guestUserId;

    const { data: existingGuest } = await db
      .from("users")
      .select("id")
      .eq("name", "LINE Guest User")
      .limit(1)
      .single();

    if (existingGuest) {
      guestUserId = existingGuest.id;
    } else {
      const newId = crypto.randomUUID();
      const { error: insertError } = await db.from("users").insert({
        id: newId,
        name: "LINE Guest User",
        phone: "0800000000",
      });

      if (!insertError) {
        guestUserId = newId;
      } else {
        const { data: fallbackUser } = await db
          .from("users")
          .select("id")
          .limit(1)
          .single();
        if (fallbackUser) {
          guestUserId = fallbackUser.id;
        } else {
          throw new HttpError(
            500,
            "ไม่สามารถสร้างหรือดึงข้อมูลลูกค้าจากตาราง users ได้เลย",
          );
        }
      }
    }

    const payload = {
      tenantId: fieldData.tenant_id,
      fieldId,
      bookingDate: date,
      startTime,
      endTime,
      totalAmount: 0,
    };

    const bookingResult = await bookingService.createBooking(
      guestUserId,
      payload,
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking: bookingResult,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPublicPayment = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      throw new HttpError(400, "ข้อมูลการยืนยันชำระเงินไม่ครบถ้วน");
    }

    const db = getSupabaseAdminClient();

    const { data: bookingData, error: bookingError } = await db
      .from("bookings")
      .update({ status: "awaiting_approval" })
      .eq("id", bookingId)
      .select("id, status")
      .maybeSingle();

    if (bookingError) {
      throw new HttpError(500, "ไม่สามารถอัปเดตสถานะการจองได้");
    }

    if (!bookingData) {
      throw new HttpError(404, "ไม่พบข้อมูลการจองนี้ในระบบ");
    }

    const { data: paymentData, error: paymentError } = await db
      .from("payments")
      .update({ status: "awaiting_approval" })
      .eq("booking_id", bookingId)
      .select("id, status")
      .maybeSingle();

    if (paymentError) {
      throw new HttpError(500, "ไม่สามารถอัปเดตสถานะการชำระเงินได้");
    }

    res.status(200).json({
      message: "Payment Submitted, Awaiting Admin Approval",
      bookingId,
      booking: bookingData,
      payment: paymentData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listFields,
  createPublicBooking,
  confirmPublicPayment,
};
