'use server';

import { db } from "@/prisma/db";

export const getCountries = async() => {
    try {

        const countries = await db.orm.public.Country
            .orderBy((country) => country.name.asc())
            .all();

        return countries;
    } catch (error) {
        return [];
    }
}