export type Provider = 'credentials' | 'google';

export interface User {
  id: string;
  name?: string;
  email: string;
  image?: string;
  lastLogin?: Date;
  provider: Provider;
  language?: string;
  voice?: string;
}

export type UpdatableUserAttribute = keyof Pick<
  User,
  'image' | 'language' | 'voice'
>;
