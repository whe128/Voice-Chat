import { FC } from 'react';

const AiChat: FC = () => (
  <div className="flex flex-col p-4 gap-4 w-100 h-148 bg-pink-100/50 rounded-2xl">
    <div className="flex justify-center text-blue-800 text-3xl font-bold">
      AI Chat
    </div>
    <div className="flex flex-col gap-15">
      <div className="flex flex-col items-start">
        <div className="flex text-sm font-bold">Reply message</div>

        <div className="flex items-center">
          <textarea
            readOnly
            className="w-60 p-2 text-sm rounded border border-gray-300 resize-none focus:outline-none"
          />

          <button className="text-4xl p-1 select-none hover:cursor-pointer active:scale-85 transition-transform duration-200">
            🔉
          </button>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div className="text-sm font-bold">Ask message</div>

        <div className="flex items-center">
          <button className="text-4xl p-1 select-none rotate-180 hover:cursor-pointer active:scale-85 transition-transform duration-200">
            🔉
          </button>

          <textarea
            readOnly
            className="w-60 p-2 text-sm rounded border border-gray-300 resize-none focus:outline-none"
          />
        </div>
        <div className="text-sm font-bold">Grammar error</div>
        <textarea
          readOnly
          className="w-full h-25 p-2 text-sm rounded border border-gray-300 resize-none focus:outline-none"
        />
      </div>
    </div>
    <div className="flex flex-col gap-1">
      <div className="flex text-sm b-2 font-bold">Input Here</div>

      <div className="flex">
        <textarea
          defaultValue="hello"
          className="w-full text-sm p-2 rounded border border-gray-300 resize-none"
        />

        <div className="flex flex-col ml-4 gap-1">
          <button className="bg-blue-400 px-4 py-2 select-none font-bold rounded-lg hover:bg-blue-600 active:scale-95 transition duration-300">
            Send➣
          </button>

          <button className="bg-yellow-400 px-4 py-2 select-none font-bold rounded-lg hover:bg-yellow-600 active:scale-95 transition duration-300">
            Chat🎙
          </button>
        </div>
      </div>
      <div className="flex gap-10">
        <button className="bg-green-400 text-white select-none px-4 py-2 rounded-lg hover:bg-green-600 active:scale-95 transition duration-300">
          Translate
        </button>

        <button className="bg-red-400 text-white select-none px-4 py-2 rounded-lg hover:bg-red-600 active:scale-95 transition duration-300">
          Read🔊
        </button>
      </div>
    </div>
  </div>
);

export default AiChat;
