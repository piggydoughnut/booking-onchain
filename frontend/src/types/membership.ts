import type { MembershipManager } from "@/abi/types";

export type IsMemberReturn = Awaited<ReturnType<MembershipManager["isMember"]>>;
export type MembershipExpiresAtReturn = Awaited<
  ReturnType<MembershipManager["membershipExpiresAt"]>
>;

export type UseBuyMembershipResult = {
  buyMembership: (amount?: string, decimals?: number) => void;
  hash?: `0x${string}` | undefined;
  isPending: boolean;
  waiting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown;
};
