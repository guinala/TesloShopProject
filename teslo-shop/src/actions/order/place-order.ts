
"use server";

import { db } from "@/prisma/db";
import { auth } from "@/auth.config";
import type { Address, Size } from "@/interfaces";

interface ProductToOrder {
  productId: string;
  quantity: number;
  size: Size;
}

export const placeOrder = async (
  productIds: ProductToOrder[],
  address: Address
) => {
  const session = await auth();
  const userId = session?.user?.id;

  // 1. Verificar sesión
  if (!userId) {
    return {
      ok: false as const,
      message: "No hay sesión de usuario",
    };
  }

  // Validar cantidades
  if (
    productIds.length === 0 ||
    productIds.some(
      (p) => !Number.isInteger(p.quantity) || p.quantity <= 0
    )
  ) {
    return {
      ok: false as const,
      message: "Los productos deben tener cantidades válidas",
    };
  }

  try {
    // 2. Obtener productos de la BD
    const uniqueIds = [...new Set(
      productIds.map((p) => p.productId)
    )];

    const products = await db.orm.public.Product
      .where((p) => p.id.in(uniqueIds))
      .all();

    // Verificar que existan todos los productos
    if (products.length !== uniqueIds.length) {
      throw new Error("Uno o varios productos no existen");
    }

    const productsById = new Map(
      products.map((p) => [p.id, p])
    );

    const orderItems = productIds.map((item) => {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error(`${item.productId} no existe`);
      }

      if (!product.sizes.includes(item.size)) {
        throw new Error(`La talla ${item.size} no está disponible para ${product.title}`);
      }

      return {
        productId: product.id,
        quantity: item.quantity,
        size: item.size,
        price: product.price,
      };
    });

    // Agrupar cantidades por producto
    const quantities = new Map<string, number>();

    for (const item of productIds) {
      quantities.set(
        item.productId,
        (quantities.get(item.productId) ?? 0) + item.quantity
      );
    }

    // 3. Calcular los importes
    const itemsInOrder = productIds.reduce(
      (count, p) => count + p.quantity,
      0
    );

    const { subTotal, tax, total } = orderItems.reduce(
      (totals, item) => {
        const itemSubTotal = item.price * item.quantity;

        totals.subTotal += itemSubTotal;
        totals.tax += itemSubTotal * 0.15;
        totals.total += itemSubTotal * 1.15;

        return totals;
      },
      { subTotal: 0, tax: 0, total: 0 }
    );

    // 4. Transacción de Prisma 8
    const order = await db.transaction(async (tx) => {

      // 4.1. Descontar stock de forma atómica
      for (const [productId, quantity] of quantities) {

        const plan = tx.sql.public.product
          .update((p, fns) => ({
            inStock: fns.raw`
              ${p.inStock} - ${quantity}
            `.returns("pg/int4@1"),
          }))
          .where((p, fns) =>
            fns.and(
              fns.eq(p.id, productId),
              fns.gte(p.inStock, quantity)
            )
          )
          .returning("id")
          .build();

        const updated = await tx.query(plan);

        if (updated.length !== 1) {
          const product = productsById.get(productId);

          throw new Error(
            `${product?.title ?? productId} no tiene inventario suficiente`
          );
        }
      }

      // 4.2. Crear encabezado de la orden
      const order = await tx.orm.public.Order.create({
        userId,
        itemsInOrder,
        subTotal,
        tax,
        total,
        isPaid: false,
      });

      // 4.3. Crear los detalles de la orden
      await tx.orm.public.OrderItem.createAll(
        orderItems.map((item) => ({
          ...item,
          orderId: order.id,
        }))
      );

      // 4.4. Crear dirección de la orden
      const { country, ...restAddress } = address;

      await tx.orm.public.OrderAddress.create({
          ...restAddress,
          countryId: country,
          orderId: order.id,
        });

      return { id: order.id };
    });

    return {
      ok: true as const,
      order,
    };

  } catch (error: unknown) {
    return {
      ok: false as const,
      message:
        error instanceof Error
          ? error.message
          : "Error al crear la orden",
    };
  }
};
