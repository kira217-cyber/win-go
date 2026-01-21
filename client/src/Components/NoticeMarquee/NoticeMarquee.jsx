import React from "react";
import Marquee from "react-fast-marquee";
import { FaBullhorn } from "react-icons/fa";
import { FaMicrophoneLines } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLanguage } from "../../context/LanguageProvider";

const API_BASE = import.meta.env.VITE_API_URL;

/* ================= API ================= */
const fetchNotice = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/api/notice`);
    return data;
  } catch {
    return {
      banglaText: "প্রতিদিন বোনাস আছে — এখনই ক্লেইম করুন!",
      englishText: "Daily bonus available!",
    };
  }
};

const fetchTheme = async () => {
  try {
    const { data } = await axios.get(`${API_BASE}/api/theme-settings`);
    return data.data || data;
  } catch {
    return {
      gradientFrom: "#f97316",
      gradientVia: "#dc2626",
      gradientTo: "#7f1d1d",
      textColor: "#ffffff",
    };
  }
};

/* ================= Component ================= */
const NoticeMarquee = () => {
  const { isBangla } = useLanguage();

  const { data: noticeData, isLoading: noticeLoading } = useQuery({
    queryKey: ["notice"],
    queryFn: fetchNotice,
    staleTime: 5 * 60 * 1000,
  });

  const { data: themeData, isLoading: themeLoading } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: fetchTheme,
    staleTime: 10 * 60 * 1000,
  });

  const isLoading = noticeLoading || themeLoading;

  const noticeText = isLoading
    ? isBangla
      ? "নোটিশ লোড হচ্ছে..."
      : "Loading notice..."
    : isBangla
      ? noticeData?.banglaText || "প্রতিদিন বোনাস আছে — এখনই ক্লেইম করুন!"
      : noticeData?.englishText || "Daily bonus available — Claim now!";

  const theme = themeData || {
    gradientFrom: "#f97316",
    gradientVia: "#dc2626",
    gradientTo: "#7f1d1d",
    textColor: "#ffffff",
  };

  return (
    <div
      className="relative py-2 pl-11 overflow-hidden m-2 rounded-md shadow-lg"
      style={{
        background: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
      }}
    >
      <Marquee
        speed={45}
        gradient={false}
        pauseOnHover
        className="text-sm font-medium"
        style={{ color: theme.textColor }}
      >
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 font-bold text-xl cursor-pointer">
            <FaBullhorn className="text-yellow-300" />
            {noticeText}
          </span>
        </div>
      </Marquee>

      <div className="absolute h-16 bottom-0 left-0 bg-white p-2">
        <FaMicrophoneLines color="orange" size={24} className="mt-6" />
      </div>
    </div>
  );
};

export default NoticeMarquee;
