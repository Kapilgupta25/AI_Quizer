import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

let googleScriptPromise;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById('google-gsi');

    const handleLoad = () => resolve();
    const handleError = () => reject(new Error('Failed to load Google Sign-In'));

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = handleLoad;
    script.onerror = handleError;
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const initializeGoogleIdentity = (clientId) => {
  if (!window.google?.accounts?.id) {
    throw new Error('Google Sign-In not loaded yet');
  }

  if (window.__googleGsiClientId !== clientId) {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => window.__googleCredentialHandler?.(response),
    });

    window.__googleGsiClientId = clientId;
  }
};

export default function GoogleButton() {
  const [isReady, setIsReady] = useState(false);
  const buttonContainerRef = useRef(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  useEffect(() => {
    window.__googleCredentialHandler = async ({ credential }) => {
      try {
        const { data } = await api.post('/auth/google', { idToken: credential });
        setAuth(data.user, data.accessToken, data.refreshToken);
        toast.success(`Welcome, ${data.user.name}!`);
        navigate('/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.error || 'Google sign-in failed');
      }
    };

    return () => {
      if (window.__googleCredentialHandler) {
        window.__googleCredentialHandler = null;
      }
    };
  }, [navigate, setAuth]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

    if (!clientId || clientId === 'your_google_client_id') {
      return;
    }

    let isCancelled = false;

    const setupGoogleButton = async () => {
      try {
        await loadGoogleScript();
        if (isCancelled || !buttonContainerRef.current) {
          return;
        }

        initializeGoogleIdentity(clientId);

        buttonContainerRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(buttonContainerRef.current, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'pill',
          width: buttonContainerRef.current.offsetWidth || 320,
          logo_alignment: 'left',
        });

        setIsReady(true);
      } catch (error) {
        if (!isCancelled) {
          toast.error(error.message || 'Google Sign-In failed to load');
        }
      }
    };

    setupGoogleButton();

    return () => {
      isCancelled = true;
    };
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  if (!clientId || clientId === 'your_google_client_id') {
    return (
      <button type="button" disabled className="btn-google">
        Google OAuth not configured
      </button>
    );
  }

  return (
    <div className="w-full">
      {!isReady && (
        <button type="button" disabled className="btn-google w-full">
          Loading Google Sign-In...
        </button>
      )}
      <div
        ref={buttonContainerRef}
        className={isReady ? 'w-full flex justify-center' : 'hidden'}
      />
    </div>
  );
}
