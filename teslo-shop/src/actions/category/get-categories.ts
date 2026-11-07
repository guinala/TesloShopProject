"use server";

import { db } from "@/prisma/db";

export const getCategories = async () => {
  try {
    const categories = await db.orm.public.Category
      .orderBy((category) => category.name.asc())
      .all();

    return categories;
  } catch (error) {
    console.log(error);
    return [];
  }
};
