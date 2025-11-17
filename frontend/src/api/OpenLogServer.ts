import { openLogServerResponse } from '@/types/command';

interface GetOpenLogResponse {
  openLogServer?: boolean;
  error?: string;
}

const apiSetOpenLogServer = async (
  openLog: boolean,
): Promise<{ error?: string }> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    // Define the expected response structure
    // POST api/openLog?openLog={openLog}
    const res = await fetch(
      `${url}/api/openLog/?openLog=${openLog ? 'true' : 'false'}`,
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

    return {};
  } catch {
    return { error: 'Cannot connect to the server' };
  }
};

const apiGetOpenLogServer = async (): Promise<GetOpenLogResponse> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    const res = await fetch(`${url}/api/openLog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'accessKey': accessKey ?? '',
      },
    });

    if (!res.ok) {
      return { error: await res.text() };
    }

    const data = (await res.json()) as openLogServerResponse;

    return { openLogServer: data.isEnabled };
  } catch {
    return { error: 'Cannot connect to the server' };
  }
};

export { apiSetOpenLogServer, apiGetOpenLogServer };
