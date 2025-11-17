import { UpdatableUserAttribute } from '@/types/user';

interface UpdateUserAttributeResponse {
  error?: string;
}

interface Props {
  id?: string;
  attribute: UpdatableUserAttribute;
  value: string;
}

const apiUpdateUserAttribute = async ({
  id,
  attribute,
  value,
}: Props): Promise<UpdateUserAttributeResponse> => {
  try {
    if (!id) {
      return { error: 'User ID is required to update user attribute' };
    }
    const url = process.env.NEXT_PUBLIC_BACKEND_ACCESS_URL;
    const accessKey = process.env.NEXT_PUBLIC_BACKEND_ACCESS_KEY;

    // Define the expected response structure
    const res = await fetch(
      `${url}/api/updateUser/${encodeURIComponent(id)}?attribute=${encodeURIComponent(attribute)}&value=${encodeURIComponent(value)}`,
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

export default apiUpdateUserAttribute;
