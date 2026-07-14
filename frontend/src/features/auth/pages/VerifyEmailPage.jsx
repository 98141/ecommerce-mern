import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { authService } from '../../../services/auth.service';
import { ResendVerificationForm } from '../components/ResendVerificationForm';

const ERROR_MESSAGES = {
  INVALID_VERIFICATION_TOKEN: 'El enlace de verificación no es válido.',
  EXPIRED_VERIFICATION_TOKEN: 'El enlace de verificación expiró.',
  TOKEN_ALREADY_USED: 'Este correo ya fue verificado.',
};

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'loading' : 'idle');
  const [errorMessage, setErrorMessage] = useState(null);
  const requested = useRef(false);

  useEffect(() => {
    if (!token || requested.current) return;
    requested.current = true;

    authService
      .verifyEmail({ token })
      .then(() => setStatus('success'))
      .catch((error) => {
        const code = error.response?.data?.error?.code;
        setErrorMessage(ERROR_MESSAGES[code] || 'No se pudo verificar el correo.');
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="auth-page">
      <div className="card">
        <h1>Verificación de correo</h1>

        {status === 'loading' && <p>Verificando tu correo...</p>}

        {status === 'success' && (
          <div className="form-alert success" role="status">
            Tu correo fue verificado correctamente. Ya puedes iniciar sesión.
          </div>
        )}

        {status === 'error' && (
          <>
            <div className="form-alert error" role="alert">
              {errorMessage}
            </div>
            <ResendVerificationForm />
          </>
        )}

        {status === 'idle' && <ResendVerificationForm />}
      </div>
    </div>
  );
}
