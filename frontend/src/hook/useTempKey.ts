import apiConnection from '@/api/connection';
import { useQuery } from '@tanstack/react-query';

const useTempKey = (): {
  tempKey?: string;
  isLoading: boolean;
  error: Error | null;
  handleGetTempKey: () => Promise<unknown>;
} => {
  const {
    data: tempKey,
    isLoading,
    error,
    refetch,
  } = useQuery<string>({
    queryKey: ['tempKey'],
    queryFn: async () => {
      const { tempKey: tempKeyResponse, error: responseError } =
        await apiConnection();

      if (responseError || !tempKeyResponse) {
        throw new Error(`Fail to get tempKey: ${responseError}`);
      }

      return tempKeyResponse.key;
    },
    // not fetch automatically
    enabled: false,
    initialData: '',
  });

  return {
    tempKey,
    isLoading,
    error: error ?? null,
    handleGetTempKey: refetch,
  };
};

export default useTempKey;
