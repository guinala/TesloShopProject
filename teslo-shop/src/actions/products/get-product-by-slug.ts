'use server';

import { db } from "@/prisma/db";
import type { Product } from "@/interfaces";

export const getProductBySlug = async(slug: string): Promise<Product | null> => {
  try {

    const product = await db.orm.public.Product
    .where({ slug })
    .include(
        "images",
        (images) => images.select("url")
    )
    .first();

    if ( !product ) return null;

    return {
        ...product,
        sizes: [...product.sizes],
        tags: [...product.tags],
        images: product.images.map( image => image.url )
    };

  } catch (error) {
    throw new Error('Error al obtener producto por slug');
  }
}
