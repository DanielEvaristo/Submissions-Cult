import "next-auth";
import { AccountType, FollowersRange, LabelStatus, ListenersRange, RoleType } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      userType: "USER" | "ADMIN";
      accountType: AccountType;
      roleType: RoleType;
      artistName?: string | null;
      legalName?: string | null;
      isAdmin: boolean;
      isCurator: boolean;
      isMasterCurator: boolean;
      isVerifiedLabel: boolean;
      labelStatus: LabelStatus;
      emailVerified: Date | null;
      genre?: string | null;
      country?: string | null;
      instagram?: string | null;
      spotifyUrl?: string | null;
      subgenre?: string | null;
      monthlyListeners?: ListenersRange | null;
      instagramFollowers?: FollowersRange | null;
      credits: number;
    };
  }

  interface User {
    id: string;
    userType: "USER" | "ADMIN";
    accountType: AccountType;
    roleType: RoleType;
    artistName?: string | null;
    legalName?: string | null;
    isAdmin: boolean;
    isCurator: boolean;
    isMasterCurator: boolean;
    isVerifiedLabel: boolean;
    labelStatus: LabelStatus;
    emailVerified: Date | null;
    genre?: string | null;
    country?: string | null;
    monthlyListeners?: ListenersRange | null;
    instagramFollowers?: FollowersRange | null;
    instagram?: string | null;
    spotifyUrl?: string | null;
    subgenre?: string | null;
    credits: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userType: "USER" | "ADMIN";
    accountType: AccountType;
    roleType: RoleType;
    artistName?: string | null;
    legalName?: string | null;
    isAdmin: boolean;
    isCurator: boolean;
    isMasterCurator: boolean;
    isVerifiedLabel: boolean;
    labelStatus: LabelStatus;
    emailVerified: Date | null;
    genre?: string | null;
    subgenre?: string | null;
    country?: string | null;
    instagram?: string | null;
    spotifyUrl?: string | null;
    monthlyListeners?: ListenersRange | null;
    instagramFollowers?: FollowersRange | null;
    credits: number;
  }
}
