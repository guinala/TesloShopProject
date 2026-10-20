
"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";

export const getOrdersByUser = async () => {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      message: "Debe de estar autenticado",
    };
  }

  const orders = await db.orm.public.Order
    .where({ userId: session.user.id })
    .include("OrderAddress", (address) =>
      address.select("firstName", "lastName")
    )
    .all();

  return {
    ok: true,
    orders,
  };
};
