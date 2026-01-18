import React from "react";
import Marquee from "react-fast-marquee";
import { FaBullhorn, FaGift, FaInfoCircle } from "react-icons/fa";

const NoticeMarquee = () => {
  return (
    <div className="bg-gradient-to-r from-orange-500 via-red-600 to-red-900 py-4 overflow-hidden m-2 rounded-full shadow-lg">
      <Marquee
        speed={45}
        gradient={false}
        pauseOnHover={true}
        className="text-white text-sm font-medium"
      >
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 font-bold text-xl cursor-pointer">
            <FaBullhorn className="text-yellow-300" />
            Welcome to WiN GO — Play smart & win big!
          </span>

          <span className="flex items-center gap-2 font-bold text-xl cursor-pointer">
            <FaGift className="text-green-300" />
            Daily bonus available — Claim now!
          </span>

          <span className="flex items-center gap-2 font-bold text-xl cursor-pointer">
            <FaInfoCircle className="text-blue-300" />
            Withdrawals are processed instantly.
          </span>
        </div>
      </Marquee>
    </div>
  );
};

export default NoticeMarquee;
