// src/pages/Promotion.jsx (or wherever you place it)
import React from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { FaImage } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageProvider";

const fetchPromotions = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/promotions`);
  return data;
};

const Promotion = () => {
  const { isBangla, isEnglish } = useLanguage();

  const { data: promotions = [], isLoading, error } = useQuery({
    queryKey: ["promotions"],
    queryFn: fetchPromotions,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-orange-500 border-orange-200 rounded-full"
        />
        <span className="ml-6 text-xl text-orange-200">
          {isBangla ? "লোড হচ্ছে..." : "Loading..."}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex items-center justify-center text-red-300 text-xl">
        {isBangla
          ? "প্রমোশন লোড করতে সমস্যা হয়েছে।"
          : "Failed to load promotions."}
      </div>
    );
  }

  if (promotions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex flex-col items-center justify-center text-orange-200 text-xl">
        <FaImage className="text-8xl mb-6 opacity-50" />
        {isBangla
          ? "কোনো প্রমোশন পাওয়া যায়নি"
          : "No promotions available"}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-100 py-10 px-4 md:px-8 lg:px-12">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-orange-200 tracking-wide">
          {isBangla ? "সকল প্রমোশন" : "All Promotions"}
        </h1>
        <p className="mt-3 text-orange-300/80 text-lg">
          {isBangla
            ? "আমাদের সর্বশেষ অফার ও প্রমোশন দেখুন"
            : "Discover our latest offers and promotions"}
        </p>
      </div>

      {/* Promotion Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-7xl mx-auto">
        {promotions.map((promo) => (
          <motion.div
            key={promo._id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
            className="bg-gradient-to-b from-orange-900/50 via-red-900/40 to-black/60 border border-red-800/50 rounded-md overflow-hidden shadow-2xl shadow-red-900/30 hover:shadow-orange-900/40 transition-all duration-300"
          >
            <Link to={`/promotion/${promo._id}`} className="block h-full">
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                {promo.image ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}/${promo.image}`}
                    alt={isBangla ? promo.titleBn : promo.titleEn}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/fallback-promo.jpg"; // optional fallback
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black/60">
                    <FaImage className="text-6xl text-orange-400/50" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-xl font-semibold text-orange-100 mb-2 line-clamp-2">
                  {isBangla ? promo.titleBn : promo.titleEn}
                </h3>

                {/* Optional short description preview */}
                <p className="text-sm text-gray-300 line-clamp-2 mb-4">
                  {isBangla ? promo.descBn?.substring(0, 120) + "..." : promo.descEn?.substring(0, 120) + "..."}
                </p>

                {/* Optional badge or date */}
                <div className="flex justify-between items-center text-xs text-orange-300/80">
                  <span>
                    {new Date(promo.createdAt).toLocaleDateString(
                      isBangla ? "bn-BD" : "en-US"
                    )}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Promotion;