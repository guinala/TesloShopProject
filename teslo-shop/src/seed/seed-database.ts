import { db } from '../prisma/db.ts';
import { initialData } from './seed.ts';

const test = db.orm.public;
const productImage = db.orm.public.ProductImage;

async function main() {

  await db.transaction(async (tx) => {

    // 1. Borrar registros previos
    await tx.orm.public.ProductImage.where({}).deleteAll();
    await tx.orm.public.Product.where({}).deleteAll();
    await tx.orm.public.Category.where({}).deleteAll();

    const { categories, products } = initialData;

    // 2. Crear categorías
    const categoriesData = categories.map((name) => ({
      name,
    }));

    const categoriesDB =
      await tx.orm.public.Category.createAll(categoriesData);


    // 3. Mapa nombre categoría -> UUID
    const categoriesMap = categoriesDB.reduce(
      (map, category) => {

        map[category.name.toLowerCase()] = category.id;

        return map;
      },
      {} as Record<string, string>
    );


    // 4. Crear productos
    for (const product of products) {

      const {
        type,
        images,
        ...rest
      } = product;


      const categoryId =
        categoriesMap[type.toLowerCase()];


      if (!categoryId) {
        throw new Error(
          `No existe la categoría "${type}"`
        );
      }


      const dbProduct =
        await tx.orm.public.Product.create({
          ...rest,
          categoryId,
        });


      // 5. Crear imágenes
      if (images.length > 0) {

        const imagesData = images.map((image) => ({
          url: image,
          productId: dbProduct.id,
        }));


        await tx.orm.public.ProductImage.createAll(
          imagesData
        );
      }
    }

  });


  console.log('Seed ejecutado correctamente');
}


if (process.env.NODE_ENV !== 'production') {

  try {

    await main();

  } catch (error) {

    console.error('Error ejecutando el seed:');
    console.error(error);

    process.exitCode = 1;

  } finally {

    await db.runtime().close();

  }
}