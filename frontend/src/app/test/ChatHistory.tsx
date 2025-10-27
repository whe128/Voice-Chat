import { FC } from 'react';
import './custom.css';

const TranslateButton: FC = () => (
  <button className="text-block px-1 py-1 select-none hover:cursor-pointer active:scale-85 transition-transform duration-200">
    🔁
  </button>
);

const MessageBox: FC<{
  message: string;
  isOut?: boolean;
}> = ({ message, isOut = false }) => {
  if (isOut) {
    return (
      <div className="flex items-center">
        <TranslateButton />
        <div className="w-fit max-w-56 h-fit h-content shadow text-sm p-1 break-words rounded-xl bg-yellow-200/80">
          {message}
        </div>
        <button className="text-xl p-1 select-none hover:cursor-pointer active:scale-85 transition-transform duration-200">
          🔉
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex justify-end items-center">
        <button className="text-xl p-1 select-none hover:cursor-pointer active:scale-85 transition-transform duration-200 rotate-180">
          🔉
        </button>
        <div className="w-fit max-w-56 h-fit h-content shadow text-sm p-1 break-words rounded-xl bg-green-300/40">
          {message}
        </div>
        <TranslateButton />
      </div>
    );
  }
};

interface ChatMessage {
  id: string;
  text: string;
  isSendOut: boolean;
  time?: string;
}

const chatMessages: ChatMessage[] = [
  { id: '0', text: 'hello.', isSendOut: true, time: '2024-10-10 10:10' },
  {
    id: '1',
    text: 'hello, how are you?',
    isSendOut: false,
    time: '2024-10-10 10:11',
  },
  {
    id: '2',
    text: 'I am good and you are so kind!',
    isSendOut: true,
    time: '2024-10-10 10:12',
  },
  {
    id: '3',
    text: "I'am appreciate you!",
    isSendOut: false,
    time: '2024-10-10 10:13',
  },
  { id: '4', text: 'Thank you!', isSendOut: true, time: '2024-10-10 10:14' },
  {
    id: '5',
    text: 'Yeah, see you.',
    isSendOut: false,
    time: '2024-10-10 10:16',
  },
];

const ChatHistory: FC<{
  messages?: ChatMessage[];
}> = ({ messages = chatMessages }) => (
  <div className="flex flex-col py-4 pl-4 px-2 gap-1 w-100 h-148 bg-pink-100/50 rounded-2xl">
    <div className="flex justify-center text-blue-800 text-3xl font-bold">
      Chat History
    </div>
    <div className="flex select-none justify-end text-xs text-gray-500 pr-2">
      🔉speak 🔁translation
    </div>

    <div className="flex flex-col gap-1 overflow-y-auto scrollbar-custom">
      {messages.map((msg: ChatMessage) => (
        <MessageBox key={msg.id} message={msg.text} isOut={msg.isSendOut} />
      ))}
    </div>
  </div>
);

export default ChatHistory;
