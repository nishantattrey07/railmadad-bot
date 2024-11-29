import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Spotify from 'next-auth/providers/spotify';

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Spotify({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.provider === 'spotify') {
        token.spotifyAccessToken = account.access_token;
        token.spotifyRefreshToken = account.refresh_token;
        token.spotifyExpiresAt = account.expires_at;
      }
      return token;
    }
  }
});
