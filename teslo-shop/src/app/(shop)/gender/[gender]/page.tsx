export const revalidate = 60;

import { getPaginatedProductsWithImages } from "@/actions";
import { Pagination, ProductGrid, Title } from "@/components";
import { Category } from "@/interfaces";
import { db } from "@/prisma/db";
import { redirect } from "next/navigation";

type Gender = (typeof db.enums.public.Gender.values)[number];

interface Props {
  params: {
    gender: Category;
  },
  searchParams: {
    page?: string;
  }
}

export default async function GenderIdPage({ params, searchParams }: Props) {

  const { gender } = params;

  const page = searchParams.page ? parseInt( searchParams.page ) : 1; 

  const { products, currentPage, totalPages } = await getPaginatedProductsWithImages({ page, gender: gender as Gender });

  if ( products.length === 0 ) {
    redirect(`/gender/${ gender }`);
  }

  const labels: Record<string, string> = { 'men': 'para hombres', 'women': 'para mujeres', 'kid': 'para niños', 'unisex': 'para todos'}

  // if ( id === 'kids' ) {
  //   notFound();
  // }

  return (
    <>
      <Title 
        title={`Artículos ${ labels[gender] }`}
        subtitle="Todos los productos"
        className="mb-2"
      />

      <ProductGrid 
        products={products}
      />

      <Pagination totalPages={totalPages} />
    </>
  );
}