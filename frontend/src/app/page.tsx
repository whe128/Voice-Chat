'use client';

import { FC } from 'react';
import { redirect } from 'next/navigation';

const Home: FC = () => {
  redirect('/chat');
};

export default Home;
