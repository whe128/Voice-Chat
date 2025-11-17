'use client';

import { FC, useRef, useState } from 'react';
import ToggleSelection from '@/components/SingleSelection';
import Image from 'next/image';
import './custom.css';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  logger,
  setLoggerEnabled,
  openLog as terminalOpenLogObj,
} from '@/utils/logger';
import { apiGetOpenLogServer, apiSetOpenLogServer } from '@/api/OpenLogServer';

const SetOpenLog: FC<{
  handleOpenSetting: () => void;
}> = ({ handleOpenSetting }) => {
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openLogOptions = [
    { label: 'On', value: true },
    { label: 'Off', value: false },
  ];

  const [serverOpenLog, setServerOpenLog] = useState<boolean | null>(null);
  const [setApproved, setSetApproved] = useState<boolean>(false);
  const [accessPassword, setAccessPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const initialTerminalOpenLogOption = openLogOptions.find(
    (opt) => opt.value === terminalOpenLogObj.value,
  )?.label;

  const initialServerOpenLogOption =
    serverOpenLog !== null
      ? openLogOptions.find((opt) => opt.value === serverOpenLog)?.label
      : undefined;

  const handleSetTerminalOpenLog = (option: string): void => {
    logger.log('Setting terminal open log to:', option);
    const selected = openLogOptions.find((opt) => opt.label === option);
    if (!selected) {
      return;
    }

    setLoggerEnabled(selected.value);

    terminalOpenLogObj.value = selected.value;
  };

  const handleSetServerOpenLog = (option: string): void => {
    logger.log('Setting server open log to:', option);
    const selected = openLogOptions.find((opt) => opt.label === option);

    if (!selected) {
      return;
    }
    void apiSetOpenLogServer(selected.value);
  };

  const fetchWithTimeout = async (): Promise<void> => {
    try {
      timeoutRef.current = setTimeout(() => {
        alert('Timeout to server OpenLog, please refresh.');
      }, 10000);

      const openOpenLogServerRes = await apiGetOpenLogServer();

      // error handling
      if (
        openOpenLogServerRes.error ||
        openOpenLogServerRes.openLogServer === undefined
      ) {
        alert(
          `Error to get server OpenLog: ${openOpenLogServerRes.error}\nplease refresh.`,
        );

        return;
      }

      setServerOpenLog(openOpenLogServerRes.openLogServer);
    } catch (err) {
      logger.error(err);
    } finally {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const accessKey = process.env.NEXT_PUBLIC_ACCESS_SET_LOG_KEY;
    if (accessPassword !== accessKey) {
      setError('Incorrect admin password');

      return;
    }

    setSetApproved(true);

    void fetchWithTimeout();
  };

  return (
    <div className="flex flex-col p-4 w-full h-full bg-pink-100 rounded-2xl overflow-y-auto">
      <div className="text-center text-blue-800 text-3xl font-bold select-none">
        Open Log
      </div>

      <Link
        href={query ? `/?${query}` : `/`}
        onClick={handleOpenSetting}
        className="absolute px-3 rounded-md hover:bg-gray-50 top-8 left-6 text-xl w-fit select-none hover:cursor-pointer active:scale-95 origin-left transition-transform duration-200"
      >
        🏠Home
      </Link>

      <div className="flex w-full h-1/2 flex-col items-center mt-10">
        {!setApproved ? (
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="flex flex-col justify-center h-full gap-4 w-7/8"
          >
            <div
              className={`text-red-500 text-sm
              ${error ? 'visible' : 'invisible'}`}
            >
              {error ? error : 'Placeholder'}
            </div>
            <input
              type="password"
              placeholder="Admin password"
              onChange={(e) => setAccessPassword(e.target.value)}
              onClick={() => setError('')}
              minLength={4}
              required
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className="flex justify-center bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors hover:bg-blue-700 hover:cursor-pointer"
            >
              <span>Access</span>
            </button>
          </form>
        ) : serverOpenLog == null ? (
          <div className="w-full h-full gap-2 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-5 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-gray-600 text-lg font-medium">
              Loading...
            </span>
          </div>
        ) : (
          <div className="flex w-7/8 flex-col gap-10">
            <ToggleSelection
              label="Terminal Log"
              initialOption={initialTerminalOpenLogOption}
              handleChange={handleSetTerminalOpenLog}
            />
            <ToggleSelection
              label="Server Log"
              initialOption={initialServerOpenLogOption}
              handleChange={handleSetServerOpenLog}
            />
          </div>
        )}
      </div>

      <div className="grid place-items-center w-full h-full ">
        <Image
          className="select-none"
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          priority
        />
      </div>
    </div>
  );
};

export default SetOpenLog;
