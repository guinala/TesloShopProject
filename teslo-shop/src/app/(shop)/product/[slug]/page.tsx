import { initialData } from "@/seed/seed";
import notFound from "../not-found";
import { titleFont } from "@/config/fonts";
import { ProductMobileSlideshow, ProductSlideshow, QuantitySelector, SizeSelector } from "@/components";

interface Props {
  params: {
    slug: string;
  }
}

export default function({ params }: Props) {
  
  const { slug } = params;
  const product = initialData.products.find( product => product.slug === slug) ?? {title: '', images: [], price: 0, sizes: [], description: ''};

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
        <h1 className={ `${ titleFont.className } antialiased font-bold text-xl` }>{product?.title}</h1>
        <p className="text-lg mb-5">{ product?.price} </p>

        <SizeSelector selectedSize={product.sizes[0]} availableSizes={product.sizes} />
        <QuantitySelector quantity={ 2 }/>
        <button className="btn-primary my-5">Agregar al carrito</button>

        <h3 className="font-bold text-sm">Descripcion</h3>
        <p className="font-light">{ product?.description }</p>
      </div>
    </div>
  );
}