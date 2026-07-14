const TOKEN_TYPES = Object.freeze({
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
});

const ALL_TOKEN_TYPES = Object.values(TOKEN_TYPES);

module.exports = { TOKEN_TYPES, ALL_TOKEN_TYPES };
