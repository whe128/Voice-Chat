import { User } from '@/types/user';
import { logger } from '@/utils/logger';

interface GetUserResponse {
  user?: User;
  error?: string;
}

const apiGetUser = async (email: string): Promise<GetUserResponse> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    logger.log('Fetching user with email:', email);
    const res = await fetch(`${url}/api/getUser/${encodeURIComponent(email)}`, {
      method: 'POST',
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

export default apiGetUser;
