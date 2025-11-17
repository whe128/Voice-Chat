'use client';

import { FC } from 'react';
import { redirect, useSearchParams } from 'next/navigation';

const Home: FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  redirect(query ? `/chat?${query}` : `/chat`);
};

export default Home;
