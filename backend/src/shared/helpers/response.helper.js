function sendSuccess(res, { statusCode = 200, data = null, message } = {}) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(message ? { message } : {}),
  });
}

module.exports = { sendSuccess };
