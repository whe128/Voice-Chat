'use client';

import { FC, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Home: FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.push('/test');
  }, [router]);

  return (
    <div>
      <h1>Welcome to Home</h1>
    </div>
  );
};

export default Home;
