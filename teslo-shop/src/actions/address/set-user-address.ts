"use server";

import type { Address } from "@/interfaces";
import { db } from "@/prisma/db";

export const setUserAddress = async (address: Address, userId: string) => {
  try {

    const newAddress = await createOrReplaceAddress( address, userId );

    return {
      ok: true,
      address: newAddress,
    }

  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "No se pudo grabar la dirección",
    };
  }
};

const createOrReplaceAddress = async (address: Address, userId: string) => {
  try {

    console.log({ userId });

    const storedAddress = await db.orm.public.UserAddress.first({ userId });

    const addressToSave = {
      userId: userId,
      address: address.address,
      address2: address.address2 ?? "",
      countryId: address.country,
      city: address.city,
      firstName: address.firstName,
      lastName: address.lastName,
      phone: address.phone,
      postalCode: address.postalCode,
    };

    if (!storedAddress) {
        const newAddress = await db.orm.public.UserAddress.create(
            addressToSave
        );

        return newAddress;
    }

    const updatedAddress = await db.orm.public.UserAddress
    .where({ userId })
    .update(addressToSave);

    return updatedAddress;



  } catch (error) {
    console.log(error);
    throw new Error("No se pudo guardar la dirección");
  }
};
