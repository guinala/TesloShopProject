'use server';

import { db } from "@/prisma/db";
import { sleep } from "@/utils";

export const getStockBySlug = async( slug: string): Promise<number> => {
  
    try {
       await sleep(3);
       const stock = await db.orm.public.Product
        .where({ slug })
        .select("inStock")
        .first();


       return stock?.inStock ?? 0;

    } catch (error) {
        return 0;
    }
}
