import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Small skeleton placeholder that matches your h-32 style
const SkeletonSlide = () => (
  <div className="w-full h-32 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded" />
);

const fetchSliderTwo = async () => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/slider/two`);
  // Assuming your backend returns array like: [{ _id, imageUrl, ... }]
  // Adjust mapping if your response structure is different (e.g. data.sliders)
  return response.data.map(slide => `${import.meta.env.VITE_API_URL}${slide.imageUrl}`);
};

const Slider2 = () => {
  const { data: slides = [], isLoading, isError } = useQuery({
    queryKey: ["slider-two"],               // unique key so it doesn't conflict with other sliders
    queryFn: fetchSliderTwo,
    staleTime: 5 * 60 * 1000,               // 5 minutes - adjust as needed
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // ──────────────────────────────────────────────
  // 1. Loading state → nice skeleton in swiper
  // ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="w-full p-2">
        <Swiper
          modules={[Pagination, Autoplay]}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          className="w-full h-32 rounded-lg overflow-hidden border-4 border-green-500"
        >
          <SwiperSlide><SkeletonSlide /></SwiperSlide>
          <SwiperSlide><SkeletonSlide /></SwiperSlide>
        </Swiper>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 2. Error or no images → clean fallback message
  // ──────────────────────────────────────────────
  if (isError || slides.length === 0) {
    return (
      <div className="w-full p-2">
        <div className="w-full h-32 rounded-lg overflow-hidden border-4 border-green-500 bg-black/40 flex items-center justify-center text-orange-300/80 text-sm font-medium">
          No secondary banners available
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // 3. Success → render fetched images
  // ──────────────────────────────────────────────
  return (
    <div className="w-full p-2">
      <Swiper
        modules={[Pagination, Autoplay]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="w-full h-32 rounded-lg overflow-hidden border-4 border-green-500"
      >
        {slides.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`secondary slide ${index + 1}`}
              className="w-full h-32 object-cover"
              loading="lazy"           // performance boost
              decoding="async"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider2;