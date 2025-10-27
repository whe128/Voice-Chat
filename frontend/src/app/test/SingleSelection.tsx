'use client';

import React, { JSX, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Props<T extends string> {
  label?: string;
  attribute?: string;
  options?: T[];
}

const SingleSelection = <T extends string>({
  label = 'Toggle',
  attribute = 'toggle',
  options = ['On', 'Off'] as T[],
}: Props<T>): JSX.Element | null => {
  const searchParams = useSearchParams();
  const initialValue = searchParams.get('attribute') ?? options[0];
  const [selectOption, setSelectOption] = useState<string>(initialValue);
  const router = useRouter();

  if (options.length === 0) {
    return null;
  }

  const selectHandle = (option: T): void => {
    if (option === selectOption) {
      return;
    }

    setSelectOption(option);

    const params = new URLSearchParams(window.location.search);

    params.set(attribute, option);
    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col">
      <div className="font-bold">{label} Selection</div>
      <div className="flex justify-between items-center w-full h-12 gap-2 p-2 text-gray-800 shadow bg-blue-300/50 border border-gray-300 rounded-lg">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => selectHandle(option)}
            className={`flex justify-center hover:cursor-pointer rounded-lg background:
            ${selectOption === option ? 'bg-red-600/70 text-white font-bold' : 'bg-transparent'}
            transition-all duration-300`}
            style={{ width: `${100 / options.length}%` }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SingleSelection;
