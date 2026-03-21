import { type DefaultSession } from "next-auth";
import { PermissionCode } from "../lib/Routes";
import { UserRol } from "@prisma/client";

export type ExtendedUser = DefaultSession["user"] & {
  rol: UserRol;
};
declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}
