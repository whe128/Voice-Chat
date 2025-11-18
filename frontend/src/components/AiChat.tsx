import { FC, useState, useContext, useEffect } from 'react';
import './custom.css';
import UserInfoBox from './UserInfoBox';
import Image from 'next/image';
import SendMessageBar from './SendMessageBar';
import useChatHistory from '@/hook/useChatHistory';
import { WebSocketContext } from '@/provider/WebSocketProvider';
import ChatHistory from './ChatHistory';
import useUserInfo from '@/hook/useUserInfo';
import { sysLanguages, sysVoices } from '@/types/option';
import { useRouter } from 'next/navigation';

const AiChat: FC<{
  handleOpenSetting: () => void;
}> = ({ handleOpenSetting }) => {
  const { user } = useUserInfo();
  const wsContext = useContext(WebSocketContext);
  const [hasGetChatHistory, setHasGetChatHistory] = useState(false);
  const { chatMessages, handleGetChatHistory, isLoading } = useChatHistory(
    wsContext?.getWebSocket ?? null,
  );
  const connected = wsContext?.isConnected ?? false;
  const router = useRouter();

  useEffect(() => {
    const fetchChatHistory = async (): Promise<void> => {
      try {
        if (hasGetChatHistory || isLoading) {
          return;
        }
        console.log('Fetching chat history...');
        await handleGetChatHistory();
        setHasGetChatHistory(true);
        clearInterval(interval);
      } catch {
        router.refresh();
      }
    };

    //first fetch
    void (async (): Promise<void> => {
      await fetchChatHistory();
      setHasGetChatHistory(true);
    })();

    // initial fetch
    void handleGetChatHistory();

    // periodic fetch every 7 seconds
    const interval = setInterval((): void => void fetchChatHistory(), 7000);

    return (): void => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col py-4 pl-4 px-4 gap-1 w-full h-full bg-pink-100 rounded-2xl overflow-y-auto">
      <div className="absolute top-5 right-8">
        <UserInfoBox />
      </div>

      <div
        className={`absolute top-2 left-1/2 text-[8px] select-none w-fit px-1 background rounded-md mt-0 self-start ml-7
        ${connected ? 'bg-green-300/70' : 'bg-red-300/70'}`}
      >
        {connected ? '✅Connected' : '❌Disconnected'}
      </div>
      <div className="absolute top-4 left-6 flex flex-col gap- items-start">
        <button
          onClick={handleOpenSetting}
          className="text-xl px-3 select-none rounded-md text-gray-500 hover:bg-gray-50 hover:cursor-pointer active:scale-95 origin-left transition-transform duration-200"
        >
          ⚙️ Option
        </button>
        <div onClick={handleOpenSetting} className="hover:cursor-pointer">
          <div className="select-none text-xs text-gray-500 pr-2 flex items-center">
            <span>🔉 speak →</span>
            <span className="ml-1 text-blue-600 font-semibold">
              {user?.voice ?? sysVoices[0]}
            </span>
          </div>

          <div className="select-none text-xs text-gray-500 pr-2 flex items-center">
            <span>🔁translation →</span>
            <span className="ml-1 text-blue-600 font-semibold">
              {user?.language ?? sysLanguages[0]}
            </span>
          </div>
        </div>
      </div>

      <Image
        className="block select-none mx-auto mt-0"
        src="/logo-icon.png"
        alt="Logo"
        width={60}
        height={60}
        {...{ draggable: false }}
        priority
      />

      <ChatHistory
        chatMessages={chatMessages}
        hasGetChatHistory={hasGetChatHistory}
      />

      <SendMessageBar hasGetChatHistory={hasGetChatHistory} />
    </div>
  );
};

export default AiChat;
