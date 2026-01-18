// src/components/Provider.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FaHandshake } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

const providers = [
  {
    id: 1,
    img: "https://i.ibb.co.com/5WqJdHGp/detailed-esports-gaming-logo-template-1029473-588861-ezgif-com-avif-to-jpg-converter.jpg", // SPRIBE
  },
  {
    id: 2,
    img: "https://i.ibb.co.com/1fbqT3T8/logo-design-technology-company-vector-illustration-1253202-6803-ezgif-com-avif-to-jpg-converter.jpg", // Evolution
  },
  {
    id: 3,
    img: "https://i.ibb.co.com/5WqJdHGp/detailed-esports-gaming-logo-template-1029473-588861-ezgif-com-avif-to-jpg-converter.jpg",
  },
  {
    id: 4,
    img: "https://i.ibb.co.com/0p2dyjyH/cyberpunk-assassins-neon-visage-862264-8569-ezgif-com-avif-to-jpg-converter.jpg", // PRAGMATIC
  },
  {
    id: 5,
    img: "https://i.ibb.co.com/ks9qBjBc/logo-design-technology-company-vector-illustration-1253202-4950-ezgif-com-avif-to-jpg-converter.jpg", // PLAY'N GO
  },
];

const Provider = () => {
  return (
    <div className="w-full py-6 px-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-lg font-bold px-4 py-2 rounded">
          <FaHandshake color="white" size={24} />
          পার্টনার প্রোভাইডার
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
          <SwiperSlide key={provider.id}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="h-12 rounded-lg flex items-center justify-center
              shadow-md cursor-pointer overflow-hidden border-2 border-green-500/30"
            >
              <img
                src={provider.img}
                alt="provider"
                className="w-full h-full object-cover "
              />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default Provider;
