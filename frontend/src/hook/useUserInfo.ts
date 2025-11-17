import apiGetUserInfo from '@/api/getUserInfo';
import apiUpdateUserAttribute from '@/api/updateUserInfo';
import { LanguageType, VoiceType } from '@/types/option';
import { UpdatableUserAttribute, User } from '@/types/user';
import { logger } from '@/utils/logger';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const useUserInfo = (
  id?: string,
): {
  user?: User;
  isLoading: boolean;
  error: Error | null;
  handleGetUserInfo: () => Promise<unknown>;
  cleanupUserInfo: () => void;
  updateLanguage: (language: string) => void;
  updateVoice: (voice: string) => void;
} => {
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery<User>({
    queryKey: ['userInfo'],
    queryFn: async (): Promise<User> => {
      if (!id) {
        throw new Error('User ID is required to get user info');
      }

      const { user: userResponse, error: responseError } =
        await apiGetUserInfo(id);
      logger.log('apiGetUserInfo response:', { userResponse, responseError });

      if (responseError || !userResponse) {
        throw new Error(`Fail to Get User Profile: ${responseError}`);
      }

      return userResponse;
    },
    // not fetch automatically
    enabled: false,
    initialData: undefined,
  });

  const updateLanguage = (language: LanguageType): void => {
    // update locally first for better UX
    queryClient.setQueryData<User>(['userInfo'], (oldData) => {
      if (!oldData || oldData.language === language) {
        return oldData;
      }

      return { ...oldData, language };
    });

    // do not update for guest user
    if (user?.email === 'guest') {
      return;
    }

    void apiUpdateUserAttribute({
      id: user?.id,
      attribute: 'language' as UpdatableUserAttribute,
      value: language,
    });
  };

  const updateVoice = (voice: VoiceType): void => {
    // update locally first for better UX
    queryClient.setQueryData<User>(['userInfo'], (oldData) => {
      if (!oldData || voice === oldData.voice) {
        return oldData;
      }

      return { ...oldData, voice };
    });

    // do not update for guest user
    if (user?.email === 'guest') {
      return;
    }

    void apiUpdateUserAttribute({
      id: user?.id,
      attribute: 'voice' as UpdatableUserAttribute,
      value: voice,
    });
  };

  return {
    user,
    isLoading,
    error: error ?? null,
    handleGetUserInfo: refetch,
    cleanupUserInfo: () =>
      queryClient.removeQueries({ queryKey: ['userInfo'] }),
    updateLanguage,
    updateVoice,
  };
};

export default useUserInfo;
