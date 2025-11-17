import { FC, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import useLogin from '../hook/useLogin';
import { useSearchParams } from 'next/navigation';

const LoginForm: FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  const showGuestMode = (searchParams.get('guest') ?? 'false') === 'true';

  const {
    credentialLoading,
    googleLoading,
    guestLoading,
    loading,
    loginError,
    setLoginError,
    handleSubmit,
    handleGuest,
  } = useLogin();

  return (
    <div className="flex flex-col items-center py-4 pl-4 px-4 w-full h-full bg-pink-100 rounded-2xl overflow-y-auto">
      <div className="text-center text-blue-800 text-3xl font-bold select-none">
        Login
      </div>

      <div className="flex flex-col gap-3 w-7/8 h-130 mt-10">
        {/* User / Password Form */}
        {loginError && (
          <div className="text-red-500 text-sm ">{loginError}</div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit({
              username,
              password,
              e,
            });
          }}
          className="flex flex-col gap-3 items-end"
        >
          <input
            onClick={() => {
              if (loginError) {
                setLoginError('');
              }
            }}
            type="text"
            placeholder="Username"
            required
            onChange={(e) => setUsername(e.target.value)}
            className="px-4 py-2 w-full rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            onClick={() => {
              if (loginError) {
                setLoginError('');
              }
            }}
            type="password"
            placeholder="Password"
            required
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2  w-full  rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <Link
            href={query ? `/auth/sign-up?${query}` : `/auth/sign-up`}
            className="text-end w-fit text-sm underline hover:cursor-pointer "
            onClick={(e) => {
              if (loading) {
                e.preventDefault();
              }
            }}
          >
            No Account? Register
          </Link>

          <button
            type="submit"
            className={`flex justify-center w-full bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors select-none
              ${loading ? '' : 'hover:bg-blue-700 hover:cursor-pointer '} `}
            disabled={loading}
          >
            {credentialLoading ? (
              <div className="w-6 h-6 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>
        {/* Or separator */}
        <div className="flex items-center gap-2 text-gray-500 select-none">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="whitespace-nowrap">or</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>
        {/* Google Login */}
        <button
          type="button"
          onClick={(e) => void handleSubmit({ e, provider: 'google' })}
          className={`flex justify-center items-center font-bold gap-5 bg-gray-100/80 border border-gray-300 py-1.5 rounded-lg transition-colors w-full select-none
            ${loading ? '' : 'hover:bg-gray-200 hover:cursor-pointer'}`}
          disabled={loading}
        >
          {googleLoading ? (
            <div className="w-[25px] h-[25px] border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
          ) : (
            <Image
              src="/google-icon.png"
              alt="google"
              width={25}
              height={25}
              className="w-[25px] h-[25px]"
              priority
            />
          )}
          <span className="h-6"> Login with Google</span>
        </button>

        {/* Or separator */}
        {showGuestMode && (
          <div className="flex items-center gap-2 text-gray-500 select-none">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="whitespace-nowrap">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>
        )}

        {showGuestMode && (
          <button
            type="button"
            onClick={(e) => void handleGuest(e)}
            className={`flex justify-center w-full bg-green-600 text-white py-2 rounded-lg font-semibold transition-colors select-none
            ${loading ? '' : 'hover:bg-green-700 hover:cursor-pointer'}`}
            disabled={loading}
          >
            {guestLoading ? (
              <div className="w-6 h-6 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
            ) : (
              <span>Guest Mode</span>
            )}
          </button>
        )}
      </div>

      <div className="grid place-items-center h-full ">
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

export default LoginForm;
