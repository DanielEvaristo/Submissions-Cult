import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[AUTH] Authorize called for:", credentials?.email);
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user) {
          console.log("[AUTH] Login failed: User not found", credentials.email);
          return null;
        }

        if (!user.password) {
          console.log("[AUTH] Login failed: User has no password set", credentials.email);
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          console.log("[AUTH] Login failed: Invalid password", credentials.email);
          return null;
        }

        console.log("[AUTH] Login successful:", credentials.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accountType: user.accountType,
          roleType: user.roleType,
          artistName: user.artistName,
          legalName: user.legalName,
          isAdmin: user.isAdmin,
          isCurator: user.isCurator,
          isMasterCurator: user.isMasterCurator,
          isVerifiedLabel: user.isVerifiedLabel,
          labelStatus: user.labelStatus,
          emailVerified: user.emailVerified,
          genre: user.genre,
          subgenre: user.subgenre,
          instagram: user.instagram,
          spotifyUrl: user.spotifyUrl,
          monthlyListeners: user.monthlyListeners,
          instagramFollowers: user.instagramFollowers,
          credits: user.credits,
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "update") {
        const userId = (token.id || token.sub) as string;
        if (userId) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
          });
          if (dbUser) {
            token.credits = dbUser.credits;
            token.genre = dbUser.genre;
            token.subgenre = dbUser.subgenre;
            token.instagram = dbUser.instagram;
            token.spotifyUrl = dbUser.spotifyUrl;
            token.emailVerified = dbUser.emailVerified;
            token.monthlyListeners = dbUser.monthlyListeners;
            token.instagramFollowers = dbUser.instagramFollowers;
          }
        }
      }

      if (user) {
        token.id = user.id;
        token.accountType = user.accountType;
        token.roleType = user.roleType;
        token.artistName = user.artistName;
        token.legalName = user.legalName;
        token.isAdmin = user.isAdmin;
        token.isCurator = user.isCurator;
        token.isMasterCurator = user.isMasterCurator;
        token.isVerifiedLabel = user.isVerifiedLabel;
        token.labelStatus = user.labelStatus;
        token.emailVerified = user.emailVerified;
        token.genre = user.genre;
        token.subgenre = user.subgenre;
        token.instagram = user.instagram;
        token.spotifyUrl = user.spotifyUrl;
        token.monthlyListeners = user.monthlyListeners;
        token.instagramFollowers = user.instagramFollowers;
        token.credits = user.credits;
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.accountType = token.accountType;
      session.user.roleType = token.roleType;
      session.user.artistName = token.artistName;
      session.user.legalName = token.legalName;
      session.user.isAdmin = token.isAdmin;
      session.user.isCurator = token.isCurator;
      session.user.isMasterCurator = token.isMasterCurator;
      session.user.isVerifiedLabel = token.isVerifiedLabel;
      session.user.labelStatus = token.labelStatus;
      session.user.emailVerified = token.emailVerified;
      session.user.genre = token.genre;
      session.user.subgenre = token.subgenre;
      session.user.instagram = token.instagram;
      session.user.spotifyUrl = token.spotifyUrl;
      session.user.monthlyListeners = token.monthlyListeners;
      session.user.instagramFollowers = token.instagramFollowers;
      session.user.credits = token.credits;
      return session;
    },
  },

  pages: {
    signIn: "/en/login",
    error: "/en/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
