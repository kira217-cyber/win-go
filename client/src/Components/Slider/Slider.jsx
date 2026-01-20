import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

// Small inline skeleton slide (matching your original height & style)
const SkeletonSlide = () => (
  <div className="w-full h-44 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 animate-pulse rounded-lg" />
);

const fetchSliders = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/slider`,
  );
  // Expecting array of objects: [{ _id, imageUrl, createdAt, ... }]
  return data.map(
    (slide) => `${import.meta.env.VITE_API_URL}${slide.imageUrl}`,
  );
};

const Slider = () => {
  const {
    data: slides = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sliders"],
    queryFn: fetchSliders,
    staleTime: 4 * 60 * 1000, // 4 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
    retry: 2,
  });

  // ──────────────────────────────────────────────
  // Loading state → show 1–2 skeleton slides
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
          className="w-full h-44 rounded-lg overflow-hidden border-4 border-green-500"
        >
          <SwiperSlide>
            <SkeletonSlide />
          </SwiperSlide>
          <SwiperSlide>
            <SkeletonSlide />
          </SwiperSlide>
        </Swiper>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Error state → minimal fallback (you can customize)
  // ──────────────────────────────────────────────
  if (isError || slides.length === 0) {
    return (
      <div className="w-full p-2">
        <div className="w-full h-44 rounded-lg overflow-hidden border-4 border-green-500 bg-black/40 flex items-center justify-center text-orange-300 text-sm">
          No slider images available
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────
  // Success → real images
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
        className="w-full h-44 rounded-lg overflow-hidden border-4 border-green-500"
      >
        {slides.map((img, index) => (
          <SwiperSlide key={index}>
            <img
              src={img}
              alt={`slide ${index + 1}`}
              className="w-full h-44"
              // Optional: better loading experience
              loading="lazy"
              decoding="async"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Slider;
