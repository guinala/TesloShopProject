'use server';

import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";
import { TbRulerMeasure } from "react-icons/tb";

export const registerUser = async( name: string, email: string, password: string ) => {
  try {

    const user = await db.orm.public.User.create({name: name, email: email.toLowerCase(), password: bcrypt.hashSync(password)})

    return { ok: true, user: user, message: 'Usuario encontrado' };

  } catch (error) {

        return {
            ok: 'false',
            message: 'No se pudo crear el usuario',
        }
  }
}
