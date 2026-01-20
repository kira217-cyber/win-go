import mongoose from "mongoose";

const footerConfigSchema = new mongoose.Schema(
  {
    logoUrl: {
      type: String,
      default: "/default-logo.png", // fallback image path
    },
    banglaTitle: {
      type: String,
      default: "দক্ষিণ এশিয়ার বিশ্বস্ত অনলাইন ক্যাসিনো",
    },
    englishTitle: {
      type: String,
      default: "South Asia's Trusted Online Casino",
    },
    banglaDescription: {
      type: String,
      default:
        "wingo.com হল একটি অনলাইন বেটিং কোম্পানি, যা বিশ্বস্ত পরিষেবার বাজি এবং ক্যাসিনো বিকল্পগুলি অফার করে",
    },
    englishDescription: {
      type: String,
      default:
        "wingo.com is an online betting company offering trusted betting services and casino options",
    },
    banglaSocialTitle: {
      type: String,
      default: "আমাদের অনলাইন সম্পর্কিত",
    },
    englishSocialTitle: {
      type: String,
      default: "Connect with us online",
    },
    socialLinks: [
      {
        imageUrl: { type: String },
        linkUrl: { type: String },
      },
    ],
  },
  { timestamps: true },
);

const FooterConfig = mongoose.model("FooterConfig", footerConfigSchema);
export default FooterConfig;
