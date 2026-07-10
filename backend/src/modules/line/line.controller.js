const lineService = require('./line.service');

const webhook = (req, res, next) => {
  try {
    lineService.handleWebhook({
      rawBody: req.rawBody,
      signature: req.headers['x-line-signature'],
      body: req.body
    });
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

module.exports = { webhook };
