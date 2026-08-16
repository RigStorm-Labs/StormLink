import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

const providers = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const handler = NextAuth({
  providers,
  secret: process.env.NEXTAUTH_SECRET || 'stormlink-dev-secret',
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) token.picture = profile.picture || token.picture;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token?.picture) session.user.image = token.picture;
      return session;
    },
  },
});

export const dynamic = 'force-dynamic';
export { handler as GET, handler as POST };
