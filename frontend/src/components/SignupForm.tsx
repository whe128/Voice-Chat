import { FC, useState } from 'react';
import Image from 'next/image';
import useSignUp from '@/hook/useSignup';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const SignupForm: FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { loading, signUpError, setSignUpError, handleSubmit } = useSignUp();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  return (
    <div className="relative flex flex-col items-center py-4 pl-4 px-4 w-full h-full bg-pink-100 rounded-2xl overflow-y-auto">
      <Link
        href={query ? `/auth/sign-in?${query}` : `/auth/sign-in`}
        className="absolute w-20 top-8 left-6 cursor-pointer text-2xl"
      >
        <Image
          className="block select-none mx-auto "
          src="/left.png"
          alt="Logo"
          width={30}
          height={30}
          {...{ draggable: false }}
          priority
        />
      </Link>
      <div className="text-center text-blue-800 text-3xl font-bold select-none">
        Sign Up
      </div>

      <div className="flex flex-col gap-1 w-7/8 h-113 mt-5">
        {/* User / Password Form */}

        <div className="flex flex-col gap-1">
          <div
            className={`text-red-500 text-sm
            ${signUpError ? 'visible' : 'invisible'}`}
          >
            {signUpError ? signUpError : 'Placeholder'}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSubmit({
                username,
                password,
                provider: 'credentials',
                e,
              });
            }}
            className="flex flex-col gap-3"
          >
            <input
              onClick={() => {
                if (signUpError) {
                  setSignUpError('');
                }
              }}
              type="text"
              placeholder="Username"
              minLength={4}
              required
              pattern="[A-Za-z0-9_@.!#?$%^&*()+\-]+"
              title="Username can contain letters, numbers, and symbols: . _ % + -"
              onChange={(e) => setUsername(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              onClick={() => {
                if (signUpError) {
                  setSignUpError('');
                }
              }}
              type="password"
              placeholder="Password"
              minLength={6}
              required
              pattern="[A-Za-z0-9_@.!#?$%^&*()+\-]+"
              title="Password can contain letters, numbers, and symbols: _ @ . ! # ? $ % ^ & * ( ) -"
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              type="submit"
              className={`flex justify-center bg-blue-600 text-white py-2 rounded-lg font-semibold transition-colors
              ${loading ? '' : 'hover:bg-blue-700 hover:cursor-pointer select-none'} `}
              disabled={loading}
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
              ) : (
                <span>Sign Up</span>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="grid place-items-center w-full h-full ">
        <Image
          className="select-none"
          src="/logo.png"
          alt="Logo"
          width={200}
          height={200}
          {...{ draggable: false }}
          priority
        />
      </div>
    </div>
  );
};

export default SignupForm;
