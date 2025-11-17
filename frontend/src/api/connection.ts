interface TempKey {
  key: string;
  expire: string;
}

interface TempKeyResponse {
  tempKey?: TempKey;
  error?: string;
}

const apiConnection = async (): Promise<TempKeyResponse> => {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    const res = await fetch(`${url}/api/connection`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accessKey': accessKey ?? '',
      },
    });

    if (!res.ok) {
      return { error: await res.text() };
    }

    return { tempKey: (await res.json()) as TempKey };
  } catch {
    return { error: 'Cannot connect to the server' };
  }
};

export default apiConnection;
