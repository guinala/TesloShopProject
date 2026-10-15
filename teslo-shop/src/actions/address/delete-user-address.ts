'use server';

import { db } from "@/prisma/db";

export const deleteUserAddress = async( userId: string ) => {
    try {
        const deleted = await db.orm.public.UserAddress.where({ userId }).delete();

        return { ok: true };
    } catch (error) {
        console.log(error);
  
        return {
        ok: false,
        message: 'No se pudo eliminar la direccion'
        }
    }
}