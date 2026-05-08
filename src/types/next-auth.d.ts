import "next-auth";
import { AccountType, RoleType, LabelStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
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
    };
  }

  interface User {
    id: string;
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
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
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
  }
}
