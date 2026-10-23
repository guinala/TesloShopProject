
"use server";

import { db } from "@/prisma/db";

export const setTransactionId = async (
  orderId: string,
  transactionId: string
) => {
  try {
    const order = await db.orm.public.Order
      .where({ id: orderId })
      .update({ transactionId });

    if (!order) {
      return {
        ok: false,
        message: `No se encontró una orden con el ${orderId}`,
      };
    }

    return { ok: true };
  } catch (error) {
    console.log(error);

    return {
      ok: false,
      message: "No se pudo actualizar el id de la transacción",
    };
  }
};
