
"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";

export const getPaginatedUsers = async () => {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return {
      ok: false,
      message: "Debe de ser un usuario administrador",
    };
  }

  const users = await db.orm.public.User
    .orderBy((user) => user.name.desc())
    .all();

  return {
    ok: true,
    users,
  };
};
