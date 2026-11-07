
"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

export const changeUserRole = async (userId: string, role: string) => {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return {
      ok: false,
      message: "Debe de estar autenticado como admin",
    };
  }

  try {
    const newRole = role === "admin" ? "admin" : "user";

    const user = await db.orm.public.User
      .where({ id: userId })
      .update({ role: newRole });

    if (!user) {
      return {
        ok: false,
        message: "No se encontró el usuario",
      };
    }

    revalidatePath("/admin/users");

    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);

    return {
      ok: false,
      message: "No se pudo actualizar el role, revisar logs",
    };
  }
};
