'use server';

import { db } from "@/prisma/db";

type Gender = (typeof db.enums.public.Gender.values)[number];

interface PaginationOptions {
    page?: number;
    take?: number;
    gender?: Gender;
}

export const getPaginatedProductsWithImages = async ({
    page = 1,
    take = 12,
    gender,
}: PaginationOptions) => {

    if (isNaN(Number(page))) page = 1;
    if (page < 1) page = 1;

    try {
        // Filtro opcional por género
        const whereGender = gender !== undefined
            ? { gender }
            : {};

        // 1. Obtener los productos
        const products = await db.orm.public.Product
            .where(whereGender)
            .include(
                "images",
                (images) => images
                    .select("url")
                    .limit(2)
            )
            .limit(take)
            .offset((page - 1) * take)
            .all();

        // 2. Obtener el número total de productos
        const { total: totalCount } = await db.orm.public.Product
            .where(whereGender)
            .aggregate((a) => ({
                total: a.count(),
            }));

        const totalPages = Math.ceil(totalCount / take);

        return {
            currentPage: page,
            totalPages,
            products: products.map((product) => ({
                ...product,

                sizes: [...product.sizes],
                tags: [...product.tags],

                images: product.images.map((image) => image.url),
            })),
        };

    } catch (err) {
        console.error(err);
        throw new Error("No se pudieron cargar los productos");
    }
};