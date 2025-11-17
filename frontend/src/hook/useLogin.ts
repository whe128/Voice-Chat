import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Provider } from '@/types/user';

interface HandleSubmitParams {
  username?: string;
  password?: string;
  e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>;
  provider?: Provider;
}

const useLogin = (): {
  credentialLoading: boolean;
  googleLoading: boolean;
  guestLoading: boolean;
  loading: boolean;
  loginError: string;
  setLoginError: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (props: HandleSubmitParams) => Promise<void>;
  handleGuest: (e: React.MouseEvent<HTMLButtonElement>) => Promise<void>;
} => {
  const [loginError, setLoginError] = useState('');
  const [credentialLoading, setCredentialLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const loading = credentialLoading || googleLoading || guestLoading;

  const handleSubmit = async ({
    username = undefined,
    password = undefined,
    e,
    provider = 'credentials',
  }: HandleSubmitParams): Promise<void> => {
    if (provider === 'credentials') {
      setCredentialLoading(true);
    } else {
      setGoogleLoading(true);
    }

    // prevent default form submission behavior
    if ('preventDefault' in e) {
      e.preventDefault();
    }

    try {
      if (provider === 'credentials' && username?.toLowerCase() === 'guest') {
        throw new Error('Guest login is not allowed here.');
      }

      const result = await signIn(provider, {
        redirect: false, // we want to redirect on success
        email: provider === 'credentials' ? username : undefined,
        password: provider === 'credentials' ? password : undefined,
        callbackUrl: '/chat',
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    } finally {
      setCredentialLoading(false);
      setGoogleLoading(false);
    }
  };

  const handleGuest = async (
    e: React.MouseEvent<HTMLButtonElement>,
  ): Promise<void> => {
    setGuestLoading(true);

    // prevent default form submission behavior
    if ('preventDefault' in e) {
      e.preventDefault();
    }

    const result = await signIn('credentials', {
      redirect: false, // we want to redirect on success
      email: 'guest',
      password: crypto.randomUUID(),
      callbackUrl: '/chat',
    });

    if (result?.error) {
      setLoginError(result.error);
    }
    setGuestLoading(false);
  };

  return {
    credentialLoading,
    googleLoading,
    guestLoading,
    loading,
    loginError,
    setLoginError,
    handleSubmit,
    handleGuest,
  };
};

export default useLogin;
