import React from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-black/40 backdrop-blur-sm border border-red-800/40 rounded-2xl shadow-2xl p-8 md:p-12 text-center"
      >
        {/* Big 404 */}
        <h1 className="text-8xl md:text-9xl font-black text-orange-500 tracking-tighter mb-4 drop-shadow-lg">
          404
        </h1>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Page Not Found
        </h2>

        {/* Message */}
        <p className="text-orange-300/90 text-lg md:text-xl mb-8">
          দুঃখিত! আপনি যে পেজটি খুঁজছেন তা পাওয়া যায়নি।
          <br />
          হয়তো লিঙ্কটি ভুল অথবা পেজটি সরিয়ে ফেলা হয়েছে।
        </p>

        {/* Back to Home Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className={`
            inline-flex items-center justify-center
            px-8 py-4 rounded-xl font-bold text-lg text-white
            bg-gradient-to-r from-orange-600 to-red-600
            hover:from-orange-500 hover:to-red-500
            focus:outline-none focus:ring-2 focus:ring-orange-500/40
            shadow-lg shadow-red-900/50
            transition-all duration-300
            cursor-pointer
          `}
        >
          হোম পেজে ফিরে যান
        </motion.button>

        {/* Optional subtle footer */}
        <p className="mt-10 text-sm text-orange-300/60">
          WiN GO Admin Panel
        </p>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;