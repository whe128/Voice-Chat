import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Provider } from '@/types/user';
import apiRegister from '@/api/register';

interface HandleSubmitParams {
  username: string;
  password: string;
  provider: Provider;
  e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>;
}

const useSignUp = (): {
  loading: boolean;
  signUpError: string;
  setSignUpError: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (props: HandleSubmitParams) => Promise<void>;
} => {
  const [signUpError, setSignUpError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ({
    username,
    password,
    provider,
    e,
  }: HandleSubmitParams): Promise<void> => {
    setLoading(true);

    // prevent default form submission behavior
    if ('preventDefault' in e) {
      e.preventDefault();
    }

    try {
      if (provider === 'credentials' && username.toLowerCase() === 'guest') {
        throw new Error('Guest signup is not allowed here.');
      }
      const { error } = await apiRegister({
        email: username,
        password,
        provider,
        image: null,
      });

      if (error) {
        throw new Error(error);
      }

      // wait for a moment to ensure the backend has processed the registration
      if (username !== 'guest') {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // after successful signup, automatically log in the user
      const result = await signIn('credentials', {
        redirect: false, // we want to redirect on success
        email: username,
        password,
        callbackUrl: '/chat',
      });

      if (result?.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      setSignUpError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signUpError,
    setSignUpError,
    handleSubmit,
  };
};

export default useSignUp;
