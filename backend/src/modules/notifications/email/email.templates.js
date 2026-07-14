const { env } = require('../../../config/env');

function verificationEmailTemplate({ firstName, rawToken }) {
  const link = `${env.FRONTEND_URL}/verificar-correo?token=${rawToken}`;

  return {
    subject: 'Verifica tu correo electrónico',
    text: `Hola ${firstName}, verifica tu correo ingresando a: ${link}`,
    html: `<p>Hola ${firstName},</p><p>Verifica tu correo ingresando a <a href="${link}">${link}</a></p>`,
  };
}

function passwordResetEmailTemplate({ firstName, rawToken }) {
  const link = `${env.FRONTEND_URL}/restablecer-contrasena?token=${rawToken}`;

  return {
    subject: 'Recupera tu contraseña',
    text: `Hola ${firstName}, restablece tu contraseña ingresando a: ${link}`,
    html: `<p>Hola ${firstName},</p><p>Restablece tu contraseña ingresando a <a href="${link}">${link}</a></p>`,
  };
}

module.exports = { verificationEmailTemplate, passwordResetEmailTemplate };
