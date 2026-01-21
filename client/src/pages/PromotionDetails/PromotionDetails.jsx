import React from "react";
import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import { FaArrowLeft, FaImage, FaExclamationTriangle } from "react-icons/fa";
import { useLanguage } from "../../context/LanguageProvider";

const fetchPromotionById = async (id) => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/promotions/${id}`
  );
  return data;
};

const PromotionDetails = () => {
  const { id } = useParams();
  const { isBangla } = useLanguage();

  const { data: promotion, isLoading, error } = useQuery({
    queryKey: ["promotion", id],
    queryFn: () => fetchPromotionById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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

  if (error || !promotion) {
    return (
      <div className="min-h-screen  flex flex-col items-center justify-center text-orange-200 p-6">
        <FaExclamationTriangle className="text-8xl text-red-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">
          {isBangla ? "প্রমোশন পাওয়া যায়নি" : "Promotion Not Found"}
        </h2>
        <p className="text-lg text-orange-300/80 mb-8 text-center max-w-md">
          {isBangla
            ? "এই প্রমোশনটি হয়তো ডিলিট করা হয়েছে অথবা ভুল লিঙ্ক"
            : "This promotion may have been removed or the link is incorrect."}
        </p>
        <Link
          to="/promotion"
          className="flex items-center gap-2 px-2 py-1 bg-gradient-to-r from-orange-700 to-red-700 hover:from-orange-600 hover:to-red-600 rounded-xl text-white font-medium transition-all duration-300 shadow-lg shadow-red-900/50"
        >
          <FaArrowLeft />
          {isBangla ? "সকল প্রমোশনে ফিরে যান" : "Back to All Promotions"}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-gray-100 py-10 px-4 ">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Link
          to="/promotion"
          className="inline-flex items-center gap-2 text-orange-300 hover:text-orange-100 mb-8 transition-colors"
        >
          <FaArrowLeft />
          {isBangla ? "সকল প্রমোশনে ফিরে যান" : "Back to Promotions"}
        </Link>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-b from-orange-900/40 via-red-900/30 to-black/50 border border-red-800/40 rounded-2xl shadow-2xl shadow-red-900/40 overflow-hidden"
        >
          {/* Image Section */}
          <div className="relative">
            {promotion.image ? (
              <img
                src={`${import.meta.env.VITE_API_URL}/${promotion.image}`}
                alt={isBangla ? promotion.titleBn : promotion.titleEn}
                className="w-full h-auto max-h-[500px] object-cover"
                onError={(e) => {
                  e.target.src = "/fallback-promo-large.jpg";
                }}
              />
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-black/70">
                <FaImage className="text-9xl text-orange-400/30" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-10">
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-orange-100 mb-6 leading-tight">
              {isBangla ? promotion.titleBn : promotion.titleEn}
            </h1>

            {/* Description */}
            <div className="prose prose-invert max-w-none text-gray-200 text-lg leading-relaxed">
              {isBangla ? (
                <div
                  dangerouslySetInnerHTML={{ __html: promotion.descBn }}
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{ __html: promotion.descEn }}
                />
              )}
            </div>

            {/* Meta Info */}
            <div className="mt-10 pt-6 border-t border-red-800/40 text-sm text-orange-300/80 flex flex-wrap gap-6">
              <div>
                <span className="font-medium">
                  {isBangla ? "প্রকাশের তারিখ:" : "Posted on:"}
                </span>{" "}
                {new Date(promotion.createdAt).toLocaleDateString(
                  isBangla ? "bn-BD" : "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </div>
              {promotion.updatedAt && (
                <div>
                  <span className="font-medium">
                    {isBangla ? "আপডেট:" : "Updated:"}
                  </span>{" "}
                  {new Date(promotion.updatedAt).toLocaleDateString(
                    isBangla ? "bn-BD" : "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PromotionDetails;