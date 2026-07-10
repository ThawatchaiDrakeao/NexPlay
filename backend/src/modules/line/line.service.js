const crypto = require('crypto');

const { env } = require('../../config/env');
const { HttpError } = require('../../utils/httpError');

const verifyLineSignature = (rawBody, signature) => {
  if (!env.lineChannelSecret) {
    throw new HttpError(500, 'LINE channel secret is not configured');
  }

  if (!signature || !rawBody) {
    throw new HttpError(401, 'Invalid LINE signature');
  }

  const expected = crypto
    .createHmac('sha256', env.lineChannelSecret)
    .update(rawBody)
    .digest('base64');

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    throw new HttpError(401, 'Invalid LINE signature');
  }
};

const handleWebhook = ({ rawBody, signature, body }) => {
  verifyLineSignature(rawBody, signature);

  const events = Array.isArray(body?.events) ? body.events : [];
  console.log('LINE webhook received', {
    eventCount: events.length,
    eventTypes: events.map((event) => event.type).filter(Boolean)
  });

  return { status: 'ok' };
};

module.exports = {
  handleWebhook,
  verifyLineSignature
};
