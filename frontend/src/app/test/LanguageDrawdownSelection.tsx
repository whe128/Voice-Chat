'use client';

import { FC, useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LanguageType, sysLanguages } from './type';
import './custom.css';

const LanguageSelectedField: FC<{
  selectedLanguage?: LanguageType;
  dropdownOpen?: boolean;
  onClick?: () => void;
}> = ({
  selectedLanguage = 'English',
  dropdownOpen = false,
  onClick = undefined,
}) => (
  <div
    onClick={onClick}
    className="flex justify-between items-center w-full gap-2 pl-2 py-2 pr-4 text-gray-800 shadow bg-blue-300/50 border border-gray-300 rounded-lg hover:cursor-pointer"
  >
    {selectedLanguage}

    <div
      className={`flex ${dropdownOpen && 'rotate-180'} scale-x-130 select-none scale-y-70 transition-transform duration-300`}
    >
      V
    </div>
  </div>
);

const LanguageDropdown: FC<{
  languages: LanguageType[];
  dropdownOpen?: boolean;
  selectHandle?: (language: LanguageType) => void;
}> = ({ languages, dropdownOpen = false, selectHandle = undefined }) => (
  <div
    style={{ width: 'calc(100% + 0.4rem)' }}
    className={`absolute w-full h-80 top-18 left-0
    overflow-y-auto scrollbar-custom rounded-lg
    ${dropdownOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
    transition-all duration-100 z-10 bg-pink-100
    `}
  >
    {languages.map((language, index) => (
      <div
        onClick={() => {
          if (!selectHandle) {
            return;
          }
          selectHandle(language);
        }}
        key={language}
        className="flex justify-between items-center w-full gap-2 pl-2 py-1 pr-4 text-gray-800 shadow-lg bg-blue-300/50 border border-gray-300 rounded-lg hover:cursor-pointer"
      >
        <div>
          {index} | {language}
        </div>
      </div>
    ))}
  </div>
);

const LanguageSelection: FC = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchParams = useSearchParams();
  const triggerRef = useRef<HTMLDivElement>(null);
  const toggleDropdown = (): void => {
    setDropdownOpen(!dropdownOpen);
  };

  const initialLanguage = searchParams.get('language') ?? sysLanguages[0];
  const [selectLanguage, setLanguage] = useState<LanguageType>(initialLanguage);
  const router = useRouter();

  const selectHandle = (language: LanguageType): void => {
    setDropdownOpen(false);
    if (language === selectLanguage) {
      return;
    }
    setLanguage(language);
    const params = new URLSearchParams(window.location.search);

    params.set('language', language);
    router.replace(`${window.location.pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        !(event.target instanceof Element) ||
        triggerRef.current?.contains(event.target)
      ) {
        return;
      }
      setDropdownOpen(false);
    };

    window.addEventListener('click', handleClickOutside);

    return (): void => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative flex flex-col">
      <div className="font-bold">Language Selection</div>
      <div className="w-full" ref={triggerRef}>
        <LanguageSelectedField
          selectedLanguage={selectLanguage}
          dropdownOpen={dropdownOpen}
          onClick={toggleDropdown}
        />

        <LanguageDropdown
          languages={sysLanguages}
          dropdownOpen={dropdownOpen}
          selectHandle={selectHandle}
        />
      </div>
    </div>
  );
};

export default LanguageSelection;
