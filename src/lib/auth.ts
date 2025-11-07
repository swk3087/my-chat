import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// v5: 루트 auth.ts에서 { auth, handlers, signIn, signOut } export 패턴. :contentReference[oaicite:7]{index=7}
export const { auth, handlers, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  providers: [Google],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.provider === 'google') {
        token.email = profile?.email;
        token.name = (profile as any)?.name ?? token.name;
        token.picture = (profile as any)?.picture ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        session.user = {
          ...session.user,
          email: token.email as string,
          name: (token.name as string) ?? session.user?.name ?? 'User',
          image: (token.picture as string) ?? session.user?.image ?? null,
        } as any;
      }
      return session;
    },
  },
});
