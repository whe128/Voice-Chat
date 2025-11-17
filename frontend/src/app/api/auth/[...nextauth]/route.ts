import NextAuth, {
  User as NextAuthUser,
  Account,
  Session,
  SessionStrategy,
} from 'next-auth';
import { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import apiGetUser from '@/api/getUser';
import apiRegister from '@/api/register';
import { Provider } from '@/types/user';
import apiAuthentication from '@/api/authentication';
import { logger } from '@/utils/logger';

const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'text',
          placeholder: 'your-email@example.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('please provide both email and password');
        }

        const { user: responseUser, error } = await apiAuthentication({
          email: credentials.email,
          password: credentials.password,
        });

        if (error || !responseUser) {
          throw new Error(error);
        }

        return responseUser;
      },
    }),

    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'login',
        },
      },
    }),
  ],
  // Session configuration
  session: {
    strategy: 'jwt' as SessionStrategy, //use JWT for session
    maxAge: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },

  // optional: JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  callbacks: {
    // called when user signs in
    signIn({
      user,
      account,
    }: {
      user: NextAuthUser & { id?: string; provider?: string };
      account?: Account | null;
    }): boolean {
      user.provider = account?.provider;

      return true;
    },

    // call jwt callback to include user id in token
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: NextAuthUser & { id?: string; provider?: Provider };
    }): Promise<JWT> {
      // oAuth provider, need to get the user id from backend
      if (user?.provider && user.provider !== 'credentials') {
        try {
          const { user: getUser, error: getUserError } = await apiGetUser(
            user.email ?? '',
          );

          // exist user in database, reset the token sub to the correct id
          if (!getUserError && getUser) {
            token.sub = getUser.id;

            return token;
          }

          // not exist user in database, need to register
          const { user: registerUser, error: registerUserError } =
            await apiRegister({
              email: user.email ?? '',
              password: '', // OAuth users do not need a password
              provider: user.provider,
              image: user.image ?? null,
            });

          if (registerUserError || !registerUser) {
            throw new Error(
              registerUserError ?? 'Failed to register user from OAuth login',
            );
          }

          token.sub = registerUser.id;

          return token;
        } catch (error) {
          logger.error('Error fetching user from backend:', error);
        }
      }

      // credentials provider, user id is already in user object
      if (user?.id) {
        token.sub = user.id;
      }

      return token;
    },

    // called when session is checked
    session({ session, token }: { session: Session; token: JWT }): Session {
      if (token.sub) {
        session.user.id = token.sub;
      }

      return session;
    },

    pages: {
      signIn: '/auth/sign-in',
      error: '/auth/sign-in',
      signOut: '/auth/sign-in',
    },
  },
};

const handler = NextAuth(authOptions) as (req: Request) => Promise<Response>;

export { handler as GET, handler as POST };
