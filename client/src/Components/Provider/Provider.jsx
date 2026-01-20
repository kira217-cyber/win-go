import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight, FaHandshake } from "react-icons/fa";
import "swiper/css";
import "swiper/css/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLanguage } from "../../context/LanguageProvider";



const fetchProviders = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/providers`,
  );
  return data;
};

const Provider = () => {
  const { isBangla } = useLanguage(); // LanguageContext থেকে ভাষা নেয়া

  const { data: providers = [], isLoading } = useQuery({
    queryKey: ["providers"],
    queryFn: fetchProviders,
  });

  // ভাষা অনুযায়ী হেডার টেক্সট
  const headerText = isBangla ? "পার্টনার প্রোভাইডার" : "Partner Providers";

  // Optional: Show skeleton or placeholder while loading
  if (isLoading) {
    return (
      <div className="w-full py-6 px-4 rounded-lg animate-pulse">
        <div className="h-12 bg-gray-800 rounded mb-4" />
        <div className="h-12 bg-gray-800 rounded" />
      </div>
    );
  }

  return (
    <div className="w-full py-6 px-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold px-4 py-2 rounded">
          <FaHandshake color="white" size={24} />
          {headerText}
        </h2>
        {/* Custom Navigation */}
        <div className="flex gap-2">
          <button className="provider-prev w-8 h-8 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:bg-red-600 transition cursor-pointer">
            <FaChevronLeft />
          </button>
          <button className="provider-next w-8 h-8 flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full hover:bg-red-600 transition cursor-pointer">
            <FaChevronRight />
          </button>
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          prevEl: ".provider-prev",
          nextEl: ".provider-next",
        }}
        autoplay={{
          delay: 2000,
          disableOnInteraction: false,
        }}
        loop={true}
        spaceBetween={16}
        slidesPerView={3}
        breakpoints={{
          640: { slidesPerView: 4 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 4 },
        }}
      >
        {providers.map((provider) => (
          <SwiperSlide key={provider._id}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="h-12 rounded-lg flex items-center justify-center shadow-md cursor-pointer overflow-hidden border-2 border-green-500/30"
            >
              <img
                src={`${import.meta.env.VITE_API_URL}${provider.imageUrl}`}
                alt="provider"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Provider;
