
"use server";

import { auth } from "@/auth.config";
import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config(process.env.CLOUDINARY_URL ?? "");

const productSchema = z.object({
  id: z.string().uuid().optional().nullable(),
  title: z.string().min(3).max(255),
  slug: z.string().min(3).max(255),
  description: z.string(),
  price: z.coerce.number().min(0)
    .transform((val) => Number(val.toFixed(2))),
  inStock: z.coerce.number().int().min(0),
  categoryId: z.string().uuid(),

  sizes: z.coerce.string()
    .transform((val) =>
      val.split(",").map((size) => size.trim()).filter(Boolean)
    )
    .pipe(z.array(z.nativeEnum(db.enums.public.Size.members))),

  tags: z.string(),
  gender: z.nativeEnum(db.enums.public.Gender.members),
});

type UploadedImage = {
  url: string;
  publicId: string;
};

export const createUpdateProduct = async (formData: FormData) => {
  const session = await auth();

  if (session?.user.role !== "admin") {
    return {
      ok: false,
      message: "Debe ser administrador",
    };
  }

  const data = Object.fromEntries(formData);
  const productParsed = productSchema.safeParse(data);

  if (!productParsed.success) {
    console.log(productParsed.error);
    return { ok: false };
  }

  const { id, ...rest } = productParsed.data;

  const slug = rest.slug.toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const tagsArray = rest.tags
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  const productData = {
    ...rest,
    slug,
    sizes: rest.sizes,
    tags: tagsArray,
  };

  const imageFiles = formData.getAll("images")
    .filter(
      (image): image is File =>
        image instanceof File && image.size > 0
    );

  let uploadedImages: UploadedImage[] = [];

  try {
    // Subir imágenes antes de abrir la transacción
    uploadedImages = await uploadImages(imageFiles);

    // Transacción de Prisma 8
    const product = await db.transaction(async (tx) => {
      let savedProduct;

      if (id) {
        // Actualizar producto
        savedProduct = await tx.orm.public.Product
          .where({ id })
          .update(productData);

        if (!savedProduct) {
          throw new Error("No se encontró el producto");
        }
      } else {
        // Crear producto
        savedProduct = await tx.orm.public.Product
          .create(productData);
      }

      // Registrar las imágenes en la base de datos
      if (uploadedImages.length > 0) {
        await tx.orm.public.ProductImage.createAll(
          uploadedImages.map((image) => ({
            url: image.url,
            productId: savedProduct.id,
          }))
        );
      }

      return savedProduct;
    });

    // Revalidar rutas
    revalidatePath("/admin/products");
    revalidatePath(`/admin/product/${product.slug}`);
    revalidatePath(`/product/${product.slug}`);

    return {
      ok: true,
      product,
    };
  } catch (error) {
    console.log(error);

    // Eliminar las imágenes recién subidas si falla
    // la operación de base de datos
    await Promise.allSettled(
      uploadedImages.map((image) =>
        cloudinary.uploader.destroy(image.publicId)
      )
    );

    return {
      ok: false,
      message: "No se pudo crear o actualizar el producto",
    };
  }
};

const uploadImages = async (
  images: File[]
): Promise<UploadedImage[]> => {
  const results = await Promise.allSettled(
    images.map(async (image) => {
      const buffer = await image.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");

      const response = await cloudinary.uploader.upload(
        `data:${image.type || "image/png"};base64,${base64Image}`
      );

      return {
        url: response.secure_url,
        publicId: response.public_id,
      };
    })
  );

  const uploaded = results
    .filter(
      (result): result is PromiseFulfilledResult<UploadedImage> =>
        result.status === "fulfilled"
    )
    .map((result) => result.value);

  if (results.some((result) => result.status === "rejected")) {
    await Promise.allSettled(
      uploaded.map((image) =>
        cloudinary.uploader.destroy(image.publicId)
      )
    );

    throw new Error("No se pudieron subir todas las imágenes");
  }

  return uploaded;
};
