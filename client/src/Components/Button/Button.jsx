import { FaPlusCircle } from "react-icons/fa";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { Link } from "react-router";
import useAuth from "../../hook/useAuth";
import { useLanguage } from "../../context/LanguageProvider";

const Button = () => {
  const { user } = useAuth();
  const { isBangla } = useLanguage();

  if (!user) return null;

  return (
    <div className="flex justify-center gap-2 mb-3 py-4">
      {/* Deposit Button */}
      <Link
        to="/deposit"
        className="flex items-center gap-4
                   bg-[#08c5a2]
                   border border-[#094848]
                   rounded-xl
                   px-4 py-2.5 md:px-16 md:py-4
                   text-lg font-bold
                   text-[#000000]
                   shadow-[0_2px_0_0_rgba(0,38,40,1)]
                   active:scale-95
                   transition-transform"
      >
        <FaPlusCircle className="text-[#000000] text-xl" />
        {isBangla ? "ডিপজিট" : "Deposit"}
      </Link>

      {/* Withdraw Button */}
      <Link
        to="/withdraw"
        className="flex items-center gap-4
                   bg-[#ce2507]
                   border border-[#094848]
                   rounded-xl
                   px-4 py-2.5 md:px-16 md:py-4
                   text-lg font-bold
                   text-[#ffffff]
                   shadow-[0_2px_0_0_rgba(0,38,40,1)]
                   active:scale-95
                   transition-transform"
      >
        <FaMoneyBillTransfer className="text-[#ffffff] text-xl" />
        {isBangla ? "উত্তোলন" : "Withdraw"}
      </Link>
    </div>
  );
};

export default Button;
