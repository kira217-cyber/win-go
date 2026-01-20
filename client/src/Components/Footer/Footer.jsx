import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useLanguage } from "../../Context/LanguageProvider";

const fetchFooterData = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/footer`,
    );
    return data;
  } catch (error) {
    console.error("Footer fetch error:", error);
    // Fallback data if API fails
    return {
      logoUrl: "https://i.ibb.co.com/ZRxgPqjZ/images.jpg",
      banglaTitle: "দক্ষিণ এশিয়ার বিশ্বস্ত অনলাইন ক্যাসিনো",
      englishTitle: "South Asia's Trusted Online Casino",
      banglaDescription:
        "wingo.com হল একটি অনলাইন বেটিং কোম্পানি, যা বিশ্বস্ত পরিষেবার বাজি এবং ক্যাসিনো বিকল্পগুলি অফার করে",
      englishDescription:
        "wingo.com is an online betting company offering trusted betting services and casino options",
      banglaSocialTitle: "আমাদের অনলাইন সম্পর্কিত",
      englishSocialTitle: "Connect with us online",
      socialLinks: [], // fallback empty
    };
  }
};

const Footer = () => {
  const { isBangla } = useLanguage();

  const { data: footer = {}, isLoading } = useQuery({
    queryKey: ["footer"],
    queryFn: fetchFooterData,
    staleTime: 1000 * 60 * 30, // 30 minutes cache
  });

  // Loading state
  if (isLoading) {
    return (
      <footer className="w-full py-6 px-4 bg-black/40 animate-pulse">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="h-16 w-32 bg-gray-700 rounded mx-auto" />
          <div className="h-6 w-64 bg-gray-700 rounded mx-auto" />
          <div className="h-4 w-96 bg-gray-700 rounded mx-auto" />
        </div>
      </footer>
    );
  }

  const titleText = isBangla ? footer.banglaTitle : footer.englishTitle;
  const descriptionText = isBangla
    ? footer.banglaDescription
    : footer.englishDescription;
  const socialTitleText = isBangla
    ? footer.banglaSocialTitle
    : footer.englishSocialTitle;

  return (
    <footer className="w-full py-6 px-4">
      <div className="max-w-4xl mx-auto text-center space-y-6">
        {/* LOGO */}
        <div className="flex justify-center items-center gap-2">
          <img
            src={`${import.meta.env.VITE_API_URL}${footer.logoUrl}`}
            alt="Footer Logo"
            className="w-22 h-16 object-contain"
            onError={(e) => {
              e.target.src = "https://i.ibb.co.com/ZRxgPqjZ/images.jpg"; // fallback image
            }}
          />
        </div>

        {/* TITLE */}
        <h2 className="text-green-600 font-bold text-lg">{titleText}</h2>

        {/* DESCRIPTION */}
        <p className="text-gray-100 text-sm leading-relaxed max-w-2xl mx-auto">
          {descriptionText}
        </p>

        {/* DIVIDER */}
        <div className="w-full h-1 bg-green-600 rounded-full"></div>

        {/* SOCIAL TITLE */}
        <p className="text-gray-200 font-semibold">{socialTitleText}</p>

        {/* SOCIAL ICONS (now dynamic images + links) */}
        <div className="flex justify-center gap-4 flex-wrap">
          {footer.socialLinks?.length > 0 ? (
            footer.socialLinks.map((social, index) => (
              <a
                key={index}
                href={social.linkUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:scale-110 transition cursor-pointer overflow-hidden"
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}${social.imageUrl}`}
                  alt="Social icon"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none"; // hide broken image
                  }}
                />
              </a>
            ))
          ) : (
            // Fallback icons if no social links in DB (your original ones)
            <>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:scale-110 transition cursor-pointer"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-400 text-white hover:scale-110 transition cursor-pointer"
              >
                <BsYoutube />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white hover:scale-110 transition cursor-pointer"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-500 text-white hover:scale-110 transition cursor-pointer"
              >
                <FaXTwitter />
              </a>
              <a
                href="#"
                className="w-10 h-10 flex items-center justify-center rounded-full bg-sky-500 text-white hover:scale-110 transition cursor-pointer"
              >
                <FaTelegramPlane />
              </a>
            </>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
