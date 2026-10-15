'use server';

import { db } from "@/prisma/db";

export const getUserAddress = async( userId: string ) => {
    try {
        const address = await db.orm.public.UserAddress.where({ userId }).first();

        if ( !address ) return null;

        const {  countryId, address2, ...rest } = address;

        return {
        ...rest,
        country: countryId,
        address2: address2 ? address2 : '',
        };
        
    } catch (error) {
        console.log(error);
        return null;
    }
}