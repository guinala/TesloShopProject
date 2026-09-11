'use client';

import { Swiper, SwiperSlide } from 'swiper/react'

interface Props {
    images: string[];
    title: string;
    className?: string;
}

export const ProductSlideshow = ({ images, title, className }: Props) => {
  return (
    <div className={className}>
        <Swiper
        spaceBetween={50}
        slidesPerView={3}
        onSlideChange={() => console.log("slide change")}
        onSwiper={(swiper) => console.log("swiper")}
        >
            <SwiperSlide></SwiperSlide>

        </Swiper>
    </div>
  )
}
