"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";
import { v2 as cloudinary } from "cloudinary";
import { revalidatePath } from "next/cache";

cloudinary.config(process.env.CLOUDINARY_URL ?? "");

export const deleteProductImage = async (
  imageId: number,
  imageUrl: string
) => {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return {
      ok: false,
      message: "Debe ser administrador",
    };
  }

  try {
    // Buscar imagen y obtener el slug del producto
    const image = await db.orm.public.ProductImage
      .where({ id: imageId })
      .include("product", (product) =>
        product.select("slug")
      )
      .first();

    if (!image) {
      return {
        ok: false,
        message: "No se encontró la imagen",
      };
    }

    if (image.url !== imageUrl) {
      return {
        ok: false,
        message: "La URL no coincide con la imagen",
      };
    }

    if (!image.url.startsWith("http")) {
      return {
        ok: false,
        message: "No se pueden borrar imágenes de FS",
      };
    }

    // Obtener el identificador de Cloudinary
    const imageName = getCloudinaryPublicId(image.url);

    if (!imageName) {
      return {
        ok: false,
        message: "URL de Cloudinary no válida",
      };
    }

    // Eliminar en Cloudinary
    const result = await cloudinary.uploader.destroy(imageName);

    if (result.result !== "ok" && result.result !== "not found") {
      throw new Error("No se pudo borrar en Cloudinary");
    }

    // Eliminar registro de Prisma 8
    const deletedImage = await db.orm.public.ProductImage
      .where({ id: imageId })
      .delete();

    if (!deletedImage) {
      throw new Error("No se encontró el registro para eliminar");
    }

    // Revalidar rutas
    revalidatePath("/admin/products");
    revalidatePath(`/admin/product/${image.product.slug}`);
    revalidatePath(`/product/${image.product.slug}`);

    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);

    return {
      ok: false,
      message: "No se pudo eliminar la imagen",
    };
  }
};

// Obtiene el public_id a partir de una URL estándar
// de entrega de imágenes de Cloudinary.
const getCloudinaryPublicId = (imageUrl: string): string | null => {
  try {
    const url = new URL(imageUrl);

    if (url.hostname !== "res.cloudinary.com") {
      return null;
    }

    const uploadPath = url.pathname.split("/upload/")[1];

    if (!uploadPath) return null;

    const publicId = uploadPath
      .replace(/^v\d+\//, "")
      .replace(/\.[^/.]+$/, "");

    return publicId || null;
  } catch {
    return null;
  }
};
