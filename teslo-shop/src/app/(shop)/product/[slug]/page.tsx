export const revalidate = 604800; // 7 días

import notFound from "../not-found";
import { titleFont } from "@/config/fonts";
import { ProductMobileSlideshow, ProductSlideshow, QuantitySelector, SizeSelector, StockLabel } from "@/components";
import { getProductBySlug } from "@/actions";
import { Metadata, ResolvingMetadata } from "next";
import { AddToCart } from "./ui/AddToCart";

interface Props {
  params: {
    slug: string;
  }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
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
      images: [ `/products/${ product?.images[1] }` ]
    }
  }
}

export default async function ProductSlugPage({ params }: Props) {
  
  const { slug } = params;
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