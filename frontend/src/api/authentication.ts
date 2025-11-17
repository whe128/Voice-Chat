import { User } from '@/types/user';

interface AuthenticationRequest {
  email: string;
  password: string;
}

interface AuthenticationResponse {
  user?: User;
  error?: string;
}

const apiAuthentication = async (
  authenticationRequestBody: AuthenticationRequest,
): Promise<AuthenticationResponse> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    const res = await fetch(`${url}/api/authentication`, {
      method: 'POST',
      body: JSON.stringify(authenticationRequestBody),
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

export default apiAuthentication;
