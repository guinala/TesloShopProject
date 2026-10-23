
"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";

export const getOrdersByUser = async () => {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false as const,
      message: "Debe de estar autenticado",
    };
  }

  const orders = await db.orm.public.Order
    .where({ userId: session.user.id })
    .select("id", "isPaid")
    .include("OrderAddress", (address) =>
      address.select("firstName", "lastName")
    )
    .all();

  return {
    ok: true as const,
    orders,
  };
};
