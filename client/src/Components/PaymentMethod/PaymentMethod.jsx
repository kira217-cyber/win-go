import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { motion } from "framer-motion";
import "swiper/css";
import "swiper/css/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLanguage } from "../../context/LanguageProvider";




const fetchPaymentMethods = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/payment-methods`,
  );
  return data;
};

const PaymentMethod = () => {
  const { isBangla } = useLanguage(); // LanguageContext থেকে ভাষা নেয়া

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ["payment-methods"],
    queryFn: fetchPaymentMethods,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // ভাষা অনুযায়ী টেক্সট
  const headerText = isBangla ? "লেনদেন ফাইন্যান্স" : "Payment Methods"; // অথবা "Transaction Finance" / "Deposit & Withdraw"

  const autoPaymentText = isBangla ? "অটো পেমেন্ট O-Pay" : "Auto Payment O-Pay";

  if (isLoading) {
    return (
      <div className="w-full py-6 px-4 rounded-lg animate-pulse">
        <div className="h-10 bg-gray-700 rounded mb-4 w-48" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-12 w-20 bg-gray-700 rounded-md flex-shrink-0"
            />
          ))}
        </div>
      </div>
    );
  }

  if (methods.length === 0) return null;

  return (
    <div className="w-full py-6 px-4 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="inline-block bg-gradient-to-r from-orange-500 to-red-600 text-white text-md font-bold px-2 py-1 rounded">
          {headerText}
        </h2>
        <div className="flex gap-2 items-center">
          <h2 className="inline-block gradient-animate text-white text-md font-bold px-2 py-1 rounded">
            {autoPaymentText}
          </h2>
        </div>
      </div>

      {/* Swiper */}
      <Swiper
        modules={[Navigation, Autoplay]}
        navigation={{
          prevEl: ".payment-prev",
          nextEl: ".payment-next",
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
        {methods.map((method) => (
          <SwiperSlide key={method._id}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
              className="h-12 rounded-md flex items-center justify-center shadow-md cursor-pointer overflow-hidden"
            >
              <img
                src={`${import.meta.env.VITE_API_URL}${method.imageUrl}`}
                alt={
                  method.name || (isBangla ? "পেমেন্ট মেথড" : "Payment Method")
                }
                className="w-full h-full object-contain"
              />
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default PaymentMethod;
