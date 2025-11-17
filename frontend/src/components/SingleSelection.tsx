'use client';

import React, { JSX, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Props<T extends string> {
  label?: string;
  attribute?: string;
  options?: T[];
  initialOption?: T;
  handleChange?: (option: T) => void;
}

const SingleSelection = <T extends string>({
  label = 'Toggle',
  attribute = undefined,
  options = ['On', 'Off'] as T[],
  initialOption = undefined,
  handleChange = undefined,
}: Props<T>): JSX.Element | null => {
  const searchParams = useSearchParams();
  const initialValue = attribute
    ? (searchParams.get(attribute) ?? options[0])
    : initialOption && options.includes(initialOption)
      ? initialOption
      : options[0];

  const [selectOption, setSelectOption] = useState<string>(initialValue);

  const router = useRouter();

  if (options.length === 0) {
    return null;
  }

  const selectHandle = (option: T): void => {
    if (option === selectOption) {
      return;
    }

    if (handleChange) {
      handleChange(option);
    }

    setSelectOption(option);

    if (attribute) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(attribute, option);
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  return (
    <div className="flex flex-col select-none">
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
