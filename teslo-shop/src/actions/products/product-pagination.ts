'use server';

import { db } from "@/prisma/db";

export const getPaginatedProductsWithImages = async() => {
    try {
        const products = await db.orm.public.Product.findMany({
            include: {
                ProductImage: {
                    take: 2,
                    select: {
                        url: true
                    }
                }
            }
        })

        return {
            products: products.map( product => ({
                ...product,
                images: product.ProductImage.map(image => image.url)
            }))
        }

    } catch (err) {
        throw new Error("No se pudieron cargar los productos")
    }
}