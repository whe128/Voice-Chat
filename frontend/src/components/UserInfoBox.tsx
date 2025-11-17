import { FC, useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const UserInfoBox: FC = () => {
  const [openSignOut, setOpenSignOut] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        !(event.target instanceof Element) ||
        triggerRef.current?.contains(event.target)
      ) {
        return;
      }
      setOpenSignOut(false);
    };

    window.addEventListener('click', handleClickOutside);

    return (): void => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="gap-0.5 flex flex-col">
      <button
        ref={triggerRef}
        onClick={() => setOpenSignOut(!openSignOut)}
        className={`text-md py-0.5 px-5 border border-gray-300
            ${openSignOut ? 'bg-gray-50' : 'border-transparent'}
            underline rounded-md hover:cursor-pointer hover:bg-gray-50 select-none`}
      >
        {session?.user.name?.split('@')[0] ?? 'User'}
      </button>

      {openSignOut && (
        <Link
          href={query ? `/auth/sign-out?${query}` : `/auth/sign-out`}
          className="flex text-xs p-1 justify-center bg-gray-50 rounded-md hover:cursor-pointer hover:bg-gray-200 select-none"
        >
          Sign Out
        </Link>
      )}
    </div>
  );
};

export default UserInfoBox;
