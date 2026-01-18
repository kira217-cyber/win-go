// src/components/Provider.jsx
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import bkash from "../../assets/payment/bkash.png";
import nagad from "../../assets/payment/nagad.png";
import rocket from "../../assets/payment/rocket.png";   
import upay from "../../assets/payment/upay.png";
import tap from "../../assets/payment/tap.png";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import "swiper/css";
import "swiper/css/navigation";

const providers = [
  {
    id: 1,
    img: bkash, // SPRIBE
  },
  {
    id: 2,
    img: nagad, // Evolution
  },
  {
    id: 3,
    img: rocket, // PRAGMATIC
  },
  {
    id: 4,
    img: upay, // PRAGMATIC
  },
  {
    id: 5,
    img: tap, // PLAY'N GO
  },
];

const PaymentMethod = () => {
  return (
    <div className="w-full py-6 px-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white text-md font-bold px-2 py-1 rounded">
          লেনদেন ফাইন্যান্স
        </h2>

        {/* Custom Navigation */}
        <div className="flex gap-2">
          <h2 className="inline-block gradient-animate text-white text-md font-bold px-2 py-1 rounded">
            Auto Payment O-Pay
          </h2>
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
        spaceBetween={8}
        slidesPerView={5}
        breakpoints={{
          640: { slidesPerView: 5 },
          768: { slidesPerView: 5 },
          1024: { slidesPerView: 5 },
        }}
      >
        {providers.map((provider) => (
          <SwiperSlide key={provider.id}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="h-20 rounded-lg flex items-center justify-center
              bg-gradient-to-r from-red-700 to-red-500
              shadow-md cursor-pointer overflow-hidden"
            >
              <img
                src={provider.img}
                alt="provider"
                className="w-full h-full "
              />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PaymentMethod;
