'use server';

import { db } from "@/prisma/db";

export const getProductBySlug = async(slug: string) => {
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
        images: product.images.map( image => image.url )
    };

  } catch (error) {
    throw new Error('Error al obtener producto por slug');
  }
}
