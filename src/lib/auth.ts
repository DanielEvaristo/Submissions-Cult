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
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

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
        };
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
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
      return session;
    },
  },

  pages: {
    signIn: "/en/login",
    error: "/en/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
