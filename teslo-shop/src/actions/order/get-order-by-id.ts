
"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";

export const getOrderById = async (id: string) => {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      message: "Debe de estar autenticado",
    };
  }

  try {
    const order = await db.orm.public.Order
      .where({ id })
      .include("OrderAddress")
      .include("OrderItem", (items) =>
        items
          .select("price", "quantity", "size")
          .include("product", (product) =>
            product
              .select("title", "slug")
              .include("ProductImage", (images) =>
                images
                  .select("url")
                  .limit(1)
              )
          )
      )
      .first();

    if (!order) {
      throw new Error(`${id} no existe`);
    }

    if (session.user.role === "user") {
      if (session.user.id !== order.userId) {
        throw new Error(`${id} no es de ese usuario`);
      }
    }

    return {
      ok: true,
      order,
    };

  } catch (error) {
    console.log(error);

    return {
      ok: false,
      message: "Orden no existe",
    };
  }
};
