import { User } from '@/types/user';

interface DeleteAccountResponse {
  user?: User;
  error?: string;
}

const apiDeleteAccount = async (
  email: string,
): Promise<DeleteAccountResponse> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    const res = await fetch(
      `${url}/api/deleteAccount/${encodeURIComponent(email)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'accessKey': accessKey ?? '',
        },
      },
    );

    if (!res.ok) {
      return { error: await res.text() };
    }

    return { user: (await res.json()) as User };
  } catch {
    return { error: 'Cannot connect to the server' };
  }
};

export default apiDeleteAccount;
