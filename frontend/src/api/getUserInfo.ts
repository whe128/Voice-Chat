import { User } from '@/types/user';
import { logger } from '@/utils/logger';

interface GetUserInfoResponse {
  user?: User;
  error?: string;
}

const apiGetUserInfo = async (id: string): Promise<GetUserInfoResponse> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    logger.log('Fetching User Info with id:', id);
    const res = await fetch(
      `${url}/api/getUserInfo/${encodeURIComponent(id)}`,
      {
        method: 'POST',
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

export default apiGetUserInfo;
