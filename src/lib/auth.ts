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
        
        const email = credentials.email.toLowerCase().trim();

        // 1. Check Admin Table
        const admin = await prisma.admin.findUnique({
          where: { email },
        });

        if (admin) {
          const isValid = await bcrypt.compare(credentials.password, admin.password);
          if (!isValid) {
            console.log("[AUTH] Admin login failed: Password mismatch for", email);
            return null;
          }
          console.log("[AUTH] Login successful for ADMIN:", admin.id, admin.email);
          return {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            userType: "ADMIN",
            accountType: "ARTIST", // Stub for types
            roleType: "ARTIST",    // Stub for types
            isAdmin: admin.role === "SUPER_ADMIN",
            isCurator: admin.role === "CURATOR" || admin.role === "SUPER_ADMIN" || admin.role === "MASTER_CURATOR",
            isMasterCurator: admin.role === "MASTER_CURATOR" || admin.role === "SUPER_ADMIN",
            isVerifiedLabel: false,
            labelStatus: "APPROVED",
            emailVerified: admin.createdAt,
            credits: 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any;
        }

        // 2. Check User Table
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          console.log("[AUTH] Login failed: User not found or has no password", email);
          return null;
        }

        if (user.accountStatus === "PENDING_CLAIM") {
          console.log("[AUTH] Login blocked: Account is PENDING_CLAIM (legacy import)", email);
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          console.log("[AUTH] Login failed: Password mismatch for", email);
          return null;
        }

        if (!user.emailVerified) {
          console.log("[AUTH] Login blocked: Email not verified for", email);
          throw new Error("EMAIL_NOT_VERIFIED:" + user.email);
        }

        console.log("[AUTH] Login successful for USER:", user.id, user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          userType: "USER",
          accountType: user.accountType,
          roleType: user.roleType,
          artistName: user.artistName,
          legalName: user.legalName,
          isAdmin: false,
          isCurator: false,
          isMasterCurator: false,
          isVerifiedLabel: user.isVerifiedLabel,
          labelStatus: user.labelStatus,
          emailVerified: user.emailVerified,
          genre: user.genre,
          subgenre: user.subgenre,
          country: user.country,
          instagram: user.instagram,
          spotifyUrl: user.spotifyUrl,
          monthlyListeners: user.monthlyListeners,
          instagramFollowers: user.instagramFollowers,
          credits: user.credits,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      },
    }),
  ],

  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "update") {
        const userId = (token.id || token.sub) as string;
        if (userId) {
          if (token.userType === "ADMIN") {
            const admin = await prisma.admin.findUnique({ where: { id: userId } });
            if (!admin) {
              token.isAdmin = false;
              token.isCurator = false;
              token.isMasterCurator = false;
              return token;
            }
            token.name = admin.name;
            token.isAdmin = admin.role === "SUPER_ADMIN";
            token.isCurator =
              admin.role === "CURATOR" ||
              admin.role === "SUPER_ADMIN" ||
              admin.role === "MASTER_CURATOR";
            token.isMasterCurator =
              admin.role === "MASTER_CURATOR" || admin.role === "SUPER_ADMIN";
          } else {
            const dbUser = await prisma.user.findUnique({ where: { id: userId } });
            if (!dbUser) {
              token.isAdmin = false;
              token.isCurator = false;
              token.isMasterCurator = false;
              return token;
            }
            token.name = dbUser.name;
            token.artistName = dbUser.artistName;
            token.legalName = dbUser.legalName;
            token.accountType = dbUser.accountType;
            token.roleType = dbUser.roleType;
            token.credits = dbUser.credits;
            token.genre = dbUser.genre;
            token.subgenre = dbUser.subgenre;
            token.country = dbUser.country;
            token.instagram = dbUser.instagram;
            token.spotifyUrl = dbUser.spotifyUrl;
            token.emailVerified = dbUser.emailVerified;
            token.monthlyListeners = dbUser.monthlyListeners;
            token.instagramFollowers = dbUser.instagramFollowers;
            token.isVerifiedLabel = dbUser.isVerifiedLabel;
            token.labelStatus = dbUser.labelStatus;
            token.isAdmin = false;
            token.isCurator = false;
            token.isMasterCurator = false;
          }
        }
      }

      if (user) {
        token.id = user.id;
        token.userType = user.userType as "USER" | "ADMIN";
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
        token.country = user.country;
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
      session.user.userType = token.userType;
      session.user.name = token.name;
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
      session.user.country = token.country;
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
