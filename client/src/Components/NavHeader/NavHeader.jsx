import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const fetchSiteConfig = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/site-config`,
  );
  return data; // expects { siteTitle, faviconUrl, downloadLink, isActive, ... }
};

const NavHeader = () => {
  const [visible, setVisible] = useState(true);

  const {
    data: config,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["site-config"],
    queryFn: fetchSiteConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes – config doesn't change often
    retry: 1,
  });

  // Extract download link safely
  const downloadLink = config?.downloadLink?.trim() || "";

  const handleDownloadClick = () => {
    if (downloadLink) {
      // Opens in new tab / new window (most browsers treat _blank as new tab)
      window.open(downloadLink, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full h-14 bg-[#0f3d3d] px-4 flex items-center justify-between"
        >
          {/* LEFT SECTION */}
          <div className="flex items-center gap-2 cursor-pointer">
            <h2 className="text-yellow-400 font-extrabold text-xl tracking-wide">
              Win-go
            </h2>
          </div>

          {/* MIDDLE SECTION */}
          <div className="flex flex-col items-center cursor-pointer">
            <span className="text-yellow-400 text-sm font-semibold">
              APP UP TO 18
            </span>
            <div className="flex gap-[2px] text-green-400">
              <FaStar size={12} />
              <FaStar size={12} />
              <FaStar size={12} />
              <FaStar size={12} />
              <FaStar size={12} />
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center gap-3">
            {/* DOWNLOAD BUTTON */}
            <motion.button
              whileHover={{ scale: downloadLink ? 1.05 : 1 }}
              whileTap={{ scale: downloadLink ? 0.95 : 1 }}
              onClick={handleDownloadClick}
              disabled={!downloadLink || isLoading || isError}
              className={`font-bold text-sm px-4 py-1.5 rounded-lg shadow-md transition-colors cursor-pointer
                ${
                  downloadLink && !isLoading && !isError
                    ? "bg-yellow-400 hover:bg-yellow-300 text-black"
                    : "bg-yellow-400/50 text-black/60 cursor-not-allowed"
                }`}
            >
              {isLoading ? "Loading..." : "Download"}
            </motion.button>

            {/* CLOSE ICON */}
            <motion.button
              whileHover={{ rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setVisible(false)}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/40 cursor-pointer"
            >
              <IoClose size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavHeader;
