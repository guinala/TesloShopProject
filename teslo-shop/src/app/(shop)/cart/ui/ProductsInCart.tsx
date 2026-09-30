import Image from 'next/image';
import { useCartStore } from '../../../../store/cart/cart-store';
import { QuantitySelector } from '@/components';
import { useEffect, useState } from 'react';
import Link from 'next/link';
'use client';

export const ProductsInCart = () => {

    const removeProduct = useCartStore(state => state.removeProduct);
    const updateProductQuantity = useCartStore(state => state.updateProductQuantity);
    const productsInCart = useCartStore(state => state.cart);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    if ( !loaded ) {
        return <p>Loading...</p>
    }

  return (
    <>
        {
            productsInCart.map( product => (
            <div key={`${product.slug}-${product.size}` } className="flex mb-5">
                <Image src={`/products/${product.image}`} width={100} height={100} alt={product.title} style={{width: '100px', height: '100px'}} className="mr-5 rounded"/>
                <div>
                    <Link className="hover:underline cursor-pointer" href={`/product/${product.slug}`}>{product.size} - {product.title}</Link>
                    <p>${product.price}</p>
                    <QuantitySelector quantity={product.quantity} onQuantityChanged={value => updateProductQuantity(product, value)}/>

                    <button onClick={() => removeProduct(product)} className="underline mt-3">Eliminar</button>
                </div>
            </div>
            ))
        }
    </>
  )
}
