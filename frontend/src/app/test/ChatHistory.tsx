import { FC } from 'react';
import './custom.css';

const TranslateButton: FC = () => (
  <button className="text-block px-1 py-1 hover:cursor-pointer active:scale-85 transition-transform duration-200">
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
        <div className="w-fit max-w-56 h-fit h-content text-sm p-1 break-words border rounded-xl bg-yellow-200/80">
          {message}
        </div>
        <button className="text-xl p-1 hover:cursor-pointer active:scale-85 transition-transform duration-200">
          🔉
        </button>
      </div>
    );
  } else {
    return (
      <div className="flex justify-end items-center">
        <button className="text-xl p-1 hover:cursor-pointer active:scale-85 transition-transform duration-200 rotate-180">
          🔉
        </button>
        <div className="w-fit max-w-56 h-fit h-content text-sm p-1 break-words border rounded-xl bg-green-300/40">
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
  { id: '0', text: 'hello', isSendOut: true, time: '2024-10-10 10:10' },
  { id: '1', text: 'h!', isSendOut: false, time: '2024-10-10 10:11' },
  { id: '2', text: 'ho you?', isSendOut: true, time: '2024-10-10 10:12' },
  { id: '3', text: "I'mou!", isSendOut: false, time: '2024-10-10 10:13' },
  { id: '4', text: 'Who?', isSendOut: false, time: '2024-10-10 10:14' },
  { id: '5', text: 'Iha!', isSendOut: false, time: '2024-10-10 10:16' },
  { id: '7', text: 'Way?', isSendOut: true, time: '2024-10-10 10:17' },
  { id: '8', text: 'gk.', isSendOut: false, time: '2024-10-10 10:18' },
  { id: '9', text: 's nice!', isSendOut: true, time: '2024-10-10 10:19' },
  { id: '10', text: 'Ye.', isSendOut: false, time: '2024-10-10 10:20' },
  { id: '11', text: 'En', isSendOut: true, time: '2024-10-10 10:21' },
  { id: '12', text: 'Than.', isSendOut: false, time: '2024-10-10 10:22' },
  { id: '13', text: 'Bye!', isSendOut: true, time: '2024-10-10 10:23' },
  { id: '14', text: 'See y!', isSendOut: false, time: '2024-10-10 10:24' },
  { id: '15', text: 'Take!', isSendOut: true, time: '2024-10-10 10:25' },
  { id: '16', text: 'You ', isSendOut: false, time: '2024-10-10 10:26' },
  { id: '17', text: 'Go!', isSendOut: true, time: '2024-10-10 10:27' },
];
const ChatHistory: FC<{
  messages?: ChatMessage[];
}> = ({ messages = chatMessages }) => (
  <div className="flex flex-col py-4 pl-4 px-2 gap-1 w-100 h-148 bg-pink-100/50 rounded-2xl">
    <div className="relative flex justify-center items-center">
      <div className="flex justify-center text-blue-800 text-3xl font-bold">
        Chat History
      </div>
      <button className="absolute text-white right-2 top-2 px-2 text-base p-1 hover:cursor-pointer bg-purple-500 hover:bg-purple-600 rounded-lg active:scale-95 transition-transform duration-200 ">
        Update
      </button>
    </div>

    <div className="flex flex-col gap-1 overflow-y-auto scrollbar-custom">
      {messages.map((msg: ChatMessage) => (
        <MessageBox key={msg.id} message={msg.text} isOut={msg.isSendOut} />
      ))}
    </div>
  </div>
);

export default ChatHistory;
