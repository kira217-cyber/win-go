import React from "react";
import Marquee from "react-fast-marquee";
import { FaBullhorn } from "react-icons/fa";
import { FaMicrophoneLines } from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLanguage } from "../../Context/LanguageProvider";

const fetchNotice = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/notice`,
    );
    return data;
  } catch (error) {
    // return default fallback in case of error
    return {
      banglaText:
        "প্রতিদিন বোনাস আছে — এখনই ক্লেইম করুন!",
      englishText:
        "Daily bonus available!",
    };
  }
};

const NoticeMarquee = () => {
  const { isBangla } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ["notice"],
    queryFn: fetchNotice,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  // Choose text based on language
  // show loading text while fetching
  const noticeText = isLoading
    ? isBangla
      ? "নোটিশ লোড হচ্ছে..."
      : "Loading notice..."
    : isBangla
      ? data?.textBn ||
        "প্রতিদিন বোনাস আছে — এখনই ক্লেইম করুন!"
      : data?.textEn ||
        "Daily bonus available — Claim now!";

  return (
    <div className="relative bg-gradient-to-r from-orange-500 via-red-600 to-red-900 py-2 pl-11 overflow-hidden m-2 rounded-md shadow-lg">
      <Marquee
        speed={45}
        gradient={false}
        pauseOnHover={true}
        className="text-white text-sm font-medium"
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
