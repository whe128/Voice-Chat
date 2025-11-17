import { User, Provider } from '@/types/user';

interface SignupRequest {
  email: string;
  password: string;
  provider: Provider;
  image: string | null;
}

interface SignupResponse {
  user?: User;
  error?: string;
}

const apiRegister = async (
  signupRequestBody: SignupRequest,
): Promise<SignupResponse> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    const res = await fetch(`${url}/api/register`, {
      method: 'POST',
      body: JSON.stringify(signupRequestBody),
      headers: {
        'Content-Type': 'application/json',
        'accessKey': accessKey ?? '',
      },
    });

    if (!res.ok) {
      return { error: await res.text() };
    }

    return { user: (await res.json()) as User };
  } catch {
    return { error: 'Cannot connect to the server' };
  }
};

export default apiRegister;
