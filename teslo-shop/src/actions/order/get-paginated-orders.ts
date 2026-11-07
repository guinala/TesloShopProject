
"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";

export const getPaginatedOrders = async () => {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return {
      ok: false,
      message: "Debe de estar autenticado",
    };
  }

  const orders = await db.orm.public.Order
    .orderBy((order) => order.createdAt.desc())
    .include("OrderAddress", (address) =>
      address.select("firstName", "lastName")
    )
    .all();

  return {
    ok: true,
    orders,
  };
};
