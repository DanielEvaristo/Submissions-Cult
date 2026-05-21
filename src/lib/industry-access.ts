import type { AccountType } from "@prisma/client";

type IndustryAccessUser = {
  accountType: AccountType;
  isVerifiedLabel?: boolean;
};

export function assertVerifiedIndustry(user: IndustryAccessUser | null | undefined): string | null {
  if (!user || user.accountType !== "INDUSTRY") {
    return "Forbidden";
  }
  if (!user.isVerifiedLabel) {
    return "Industry account pending verification";
  }
  return null;
}
