import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-500 via-red-600 to-red-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center"
      >
        {/* 404 Text */}
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-6xl font-extrabold text-red-600 mb-2"
        >
          404
        </motion.h1>

        <h2 className="text-xl font-bold text-gray-800 mb-2">Page Not Found</h2>

        <p className="text-gray-600 text-sm mb-6">
          Oops! The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Home Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="w-full bg-gradient-to-r cursor-pointer from-orange-500 to-red-600 text-white py-3 rounded-xl font-semibold shadow-lg cursor-pointer"
        >
          Go Back Home
        </motion.button>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
