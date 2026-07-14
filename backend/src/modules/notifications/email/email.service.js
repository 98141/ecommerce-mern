const provider = require('./email.provider');
const { verificationEmailTemplate, passwordResetEmailTemplate } = require('./email.templates');

async function sendVerificationEmail(user, rawToken) {
  const { subject, text, html } = verificationEmailTemplate({ firstName: user.firstName, rawToken });
  await provider.send({ to: user.email, subject, text, html });
}

async function sendPasswordResetEmail(user, rawToken) {
  const { subject, text, html } = passwordResetEmailTemplate({ firstName: user.firstName, rawToken });
  await provider.send({ to: user.email, subject, text, html });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
