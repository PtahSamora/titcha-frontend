import NextAuth, { DefaultSession } from "next-auth";
import { UserMeta } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string;
      studentId?: string;
      parentId?: string;
      teacherId?: string;
      meta?: UserMeta;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role?: string;
    studentId?: string;
    parentId?: string;
    teacherId?: string;
    meta?: UserMeta;
  }
}
