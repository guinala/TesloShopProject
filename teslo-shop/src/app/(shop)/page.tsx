import { getPaginatedProductsWithImages } from "@/actions";
import { ProductGrid, Title } from "@/components";
import { initialData } from "@/seed/seed";

export default async function Home() {

  const {products} = await getPaginatedProductsWithImages();

  return (
    <>
      <Title title="Tienda" subtitle="Todos los productos" className="mb-2"/>

      <ProductGrid products={products}/>
    </>
  );
}
