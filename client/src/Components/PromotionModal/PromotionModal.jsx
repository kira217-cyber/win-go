import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { X } from "lucide-react";
import { Link } from "react-router";
import axios from "axios";

import "swiper/css";
import "swiper/css/navigation";

const PromotionModal = () => {
  const [open, setOpen] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const swiperRef = useRef(null);

  // Check if device is mobile (screen width < 768px)
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // Show modal only once every 24 hours — but only on mobile
  useEffect(() => {
    // Skip everything if not mobile
    if (!isMobile) return;

    const lastShown = localStorage.getItem("promo_modal_time");
    const now = Date.now();

    if (!lastShown || now - lastShown > 24 * 60 * 60 * 1000) {
      setOpen(true);
      localStorage.setItem("promo_modal_time", now.toString());
    }
  }, [isMobile]);

  // Fetch promotions only when modal is open and it's mobile
  useEffect(() => {
    if (!open || !isMobile) return;

    const fetchPromotions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/promotions`
        );

        const data = response.data || [];
        setPromotions(data);
      } catch (err) {
        console.error("Failed to load promotions:", err);
        setError("প্রমোশন লোড করতে সমস্যা হয়েছে।");
      } finally {
        setLoading(false);
      }
    };

    fetchPromotions();
  }, [open, isMobile]);

  // Important: Do NOT render anything if not mobile
  if (!isMobile) return null;

  // Only mobile reaches here
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="md:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.8, y: 40 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.3 }}
          className="relative w-[320px] md:w-[500px] rounded-2xl bg-gradient-to-b from-teal-500 to-emerald-600 p-4 shadow-2xl"
        >
          {/* Header Image */}
          <img
            className="absolute right-0 -top-12 md:-top-30"
            src="https://i.ibb.co.com/p65CFhp8/popup-header.webp"
            alt="Popup Header"
          />

          {/* Close Button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute right-3 cursor-pointer -top-16 md:-top-36 rounded-full bg-yellow-400 p-1 hover:scale-110 transition"
          >
            <X size={20} className="text-black" />
          </button>

          {/* Content Area */}
          {loading ? (
            <div className="mt-8 text-center text-white">
              লোড হচ্ছে...
            </div>
          ) : error ? (
            <div className="mt-8 text-center text-red-300">
              {error}
            </div>
          ) : promotions.length === 0 ? (
            <div className="mt-8 text-center text-white">
              কোনো প্রমোশন পাওয়া যায়নি
            </div>
          ) : (
            <>
              {/* Slider with real images */}
              <Swiper
                modules={[Navigation]}
                loop={promotions.length > 1}
                navigation={{
                  prevEl: ".custom-prev",
                  nextEl: ".custom-next",
                }}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                className="rounded-sm overflow-hidden mt-8"
              >
                {promotions.map((promo) => (
                  <SwiperSlide key={promo._id}>
                    <Link to={`/promotion/${promo._id}`}>
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${promo.image}`}
                        alt={promo.titleEn || promo.titleBn || "Promotion"}
                        className="w-full h-[160px] md:h-[220px] object-cover cursor-pointer"
                      />
                    </Link>
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Previous / Next Buttons */}
              {promotions.length > 1 && (
                <div className="flex justify-between items-center gap-2 mt-4">
                  <button className="custom-prev px-6 py-2 bg-amber-400 text-xl w-full rounded-2xl font-bold text-amber-900 cursor-pointer hover:bg-amber-300 transition">
                    Previous
                  </button>
                  <button className="custom-next px-6 py-2 bg-amber-400 text-xl w-full rounded-2xl font-bold text-amber-900 cursor-pointer hover:bg-amber-300 transition">
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Hide default Swiper arrows */}
          <style jsx>{`
            .swiper-button-prev,
            .swiper-button-next {
              display: none !important;
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PromotionModal;