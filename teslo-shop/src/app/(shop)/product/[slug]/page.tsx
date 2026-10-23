export const revalidate = 604800; // 7 días

import { notFound } from "next/navigation";
import { titleFont } from "@/config/fonts";
import { ProductMobileSlideshow, ProductSlideshow, StockLabel } from "@/components";
import { getProductBySlug } from "@/actions";
import type { Metadata } from "next";
import { AddToCart } from "./ui/AddToCart";

interface Props {
  params: Promise<{
    slug: string;
  }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const slug = (await params).slug
 
  // fetch data
  const product = await getProductBySlug(slug);
 
  return {
    title: product?.title ?? 'No encontrado',
    description: product?.description ?? 'No encontrado',
    openGraph: {
      title: product?.title ?? 'No encontrado',
      description: product?.description ?? 'No encontrado',
      images: product?.images[0] ? [`/products/${product.images[0]}`] : []
    }
  }
}

export default async function ProductSlugPage({ params }: Props) {
  
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if ( !product ) {
    notFound();
  }

  return (
    <div className="mt-5 mb-20 grid md:grid-cols-3 gap-3 mb-10">
      <div className="col-span-1 md:col-span-2">
        <ProductMobileSlideshow title={product.title} images={product.images} className="block md:hidden"/>
        <ProductSlideshow title={product.title} images={product.images} className="hidden md:block"/>
      </div>
      <div className="col-span-1 px-5">
        <StockLabel slug={product.slug}/>
        <h1 className={ `${ titleFont.className } antialiased font-bold text-xl` }>{product?.title}</h1>
        <p className="text-lg mb-5">{ product?.price} </p>

        <AddToCart product={product}/>

        <h3 className="font-bold text-sm">Descripcion</h3>
        <p className="font-light">{ product?.description }</p>
      </div>
    </div>
  );
}
