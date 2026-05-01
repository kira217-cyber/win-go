import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BadgePercent,
  Check,
  Copy,
  Gift,
  Wallet,
  Coins,
  RefreshCw,
  History,
  Calculator,
  X,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";

import { useLanguage } from "../../context/LanguageProvider";
import useAuth from "../../hook/useAuth";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5007";

const money = (n) => {
  const num = Number(n || 0);
  if (!Number.isFinite(num)) return "৳ 0.00";

  return `৳ ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ReedemWallet = () => {
  const navigate = useNavigate();
  const { isBangla } = useLanguage();

  const { user: authUser, userId, refreshBalance, balanceData } = useAuth();

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [info, setInfo] = useState(null);
  const [histories, setHistories] = useState([]);
  const [redeemAmount, setRedeemAmount] = useState("");

  const user = info?.user || authUser || {};
  const setting = info?.setting || {};
  const calculation = info?.calculation || {};

  const referralCode = user?.referCode || user?.referralCode || "";

  const clientBase =
    import.meta.env.VITE_CLIENT_URL ||
    import.meta.env.VITE_APP_URL ||
    window.location.origin;

  const referralLink = referralCode
    ? `${clientBase}/register?ref=${referralCode}`
    : "";

  const t = useMemo(
    () => ({
      title: isBangla ? "রিডিম ওয়ালেট" : "Redeem Wallet",
      subtitle: isBangla
        ? "রেফার ব্যালেন্স রিডিম করে মেইন ব্যালেন্সে নিন"
        : "Redeem your referral balance into main wallet",
      linkLabel: isBangla ? "আপনার রেফার লিংক" : "Your Referral Link",
      copy: isBangla ? "কপি" : "Copy",
      copied: isBangla ? "কপি হয়েছে" : "Copied",
      noCode: isBangla ? "রেফার কোড পাওয়া যায়নি" : "Referral code not found",
      copyFailed: isBangla ? "কপি করা যায়নি" : "Copy failed",
      referBalance: isBangla ? "রেফার ব্যালেন্স" : "Refer Balance",
      estimated: isBangla ? "সম্ভাব্য টাকা" : "Estimated Money",
      mainBalance: isBangla ? "মেইন ব্যালেন্স" : "Main Balance",
      redeem: isBangla ? "রিডিম করুন" : "Redeem",
      redeemNow: isBangla ? "এখন রিডিম করুন" : "Redeem Now",
      redeemSummary: isBangla ? "রিডিম সামারি" : "Redeem Summary",
      redeemAmount: isBangla ? "রিডিম এমাউন্ট" : "Redeem Amount",
      requiredPoints: isBangla ? "লাগবে ব্যালেন্স" : "Required Balance",
      afterRedeem: isBangla ? "রিডিমের পরে ব্যালেন্স" : "Balance After Redeem",
      history: isBangla ? "রিডিম হিস্টোরি" : "Redeem History",
      noHistory: isBangla ? "এখনো কোনো হিস্টোরি নেই" : "No redeem history yet",
      active: isBangla ? "অ্যাক্টিভ" : "Active",
      inactive: isBangla ? "ইনঅ্যাক্টিভ" : "Inactive",
      minimum: isBangla ? "মিনিমাম" : "Minimum",
      maximum: isBangla ? "ম্যাক্সিমাম" : "Maximum",
      noLimit: isBangla ? "লিমিট নেই" : "No limit",
      loading: isBangla ? "লোড হচ্ছে..." : "Loading...",
      loginRequired: isBangla ? "প্রথমে লগইন করুন" : "Please login first",
      turnoverNote: isBangla
        ? "রিডিম করলে এমাউন্ট মেইন ব্যালেন্সে যোগ হবে এবং একই এমাউন্টের turnover তৈরি হবে।"
        : "Redeemed amount will be added to main balance and same amount turnover will be created.",
    }),
    [isBangla],
  );

  const points = Number(user?.referAmountBalance || 0);
  const mainBalance = Number(
    balanceData?.balance ?? user?.balance ?? authUser?.balance ?? 0,
  );

  const estimatedRedeemAmount = Number(calculation?.estimatedRedeemAmount || 0);

  const redeemPoint = Number(setting?.redeemPoint || 0);
  const redeemMoney = Number(setting?.redeemMoney || 0);
  const enteredAmount = Number(redeemAmount || 0);

  const requiredPoints =
    enteredAmount > 0 && redeemPoint > 0 && redeemMoney > 0
      ? (enteredAmount / redeemMoney) * redeemPoint
      : 0;

  const pointsAfterRedeem = points - requiredPoints;

  const minAmount = Number(setting?.minimumRedeemAmount || 0);
  const maxAmount = Number(setting?.maximumRedeemAmount || 0);

  const canRedeem =
    !!userId &&
    setting?.isActive &&
    enteredAmount > 0 &&
    requiredPoints > 0 &&
    points >= requiredPoints &&
    enteredAmount >= minAmount &&
    (maxAmount <= 0 || enteredAmount <= maxAmount);

  const fetchAll = async () => {
    if (!userId) {
      return;
    }

    try {
      setLoading(true);

      const [infoRes, historyRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/user/refer-redeem/info`, {
          params: { userId },
        }),
        axios.get(`${BASE_URL}/api/user/refer-redeem/histories`, {
          params: { userId },
        }),
      ]);

      setInfo(infoRes?.data?.data || null);
      setHistories(
        Array.isArray(historyRes?.data?.data) ? historyRes.data.data : [],
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (isBangla ? "ডাটা লোড করা যায়নি" : "Failed to load redeem data"),
        { theme: "dark" },
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCopy = async () => {
    if (!referralLink) {
      toast.error(t.noCode, { theme: "dark" });
      return;
    }

    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);

      toast.success(
        isBangla ? "রেফার লিংক কপি হয়েছে" : "Referral link copied",
        { theme: "dark" },
      );

      setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error(t.copyFailed, { theme: "dark" });
    }
  };

  const openRedeemModal = () => {
    if (!userId) {
      toast.error(t.loginRequired, { theme: "dark" });
      return;
    }

    setRedeemAmount(minAmount > 0 ? String(minAmount) : "");
    setModalOpen(true);
  };

  const handleRedeem = async () => {
    if (!userId) {
      toast.error(t.loginRequired, { theme: "dark" });
      return;
    }

    if (!canRedeem) {
      toast.error(
        isBangla
          ? "রিডিম করার জন্য সঠিক এমাউন্ট দিন"
          : "Please enter a valid redeem amount",
        { theme: "dark" },
      );
      return;
    }

    try {
      setRedeeming(true);

      const { data } = await axios.post(
        `${BASE_URL}/api/user/refer-redeem/redeem`,
        {
          userId,
          redeemAmount: enteredAmount,
        },
      );

      toast.success(
        data?.message || (isBangla ? "রিডিম সফল হয়েছে" : "Redeem successful"),
        { theme: "dark" },
      );

      setModalOpen(false);
      setRedeemAmount("");

      await fetchAll();
      refreshBalance?.();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          (isBangla ? "রিডিম ব্যর্থ হয়েছে" : "Redeem failed"),
        { theme: "dark" },
      );
    } finally {
      setRedeeming(false);
    }
  };

  return (
    <div className="min-h-screen text-gray-100 py-6 px-4 mb-20">
      <div className="max-w-4xl bg-gray-50/20 mx-auto rounded-xl">
        <div className="rounded-2xl shadow-2xl shadow-red-900/40 p-5 md:p-8">
          <div className="mb-6 overflow-hidden rounded-2xl border border-red-800/40 bg-black/40 p-1">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-red-900/40 text-orange-200 transition hover:bg-red-800/60"
              >
                <ArrowLeft size={22} />
              </button>

              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-orange-700 to-red-700 text-white shadow-lg shadow-red-900/30">
                <Wallet size={28} />
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-3xl md:text-4xl font-bold text-orange-200 leading-tight">
                  {t.title}
                </h2>
                <p className="mt-1 text-sm font-semibold leading-6 text-orange-100/75">
                  {t.subtitle}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchAll}
                disabled={loading || !userId}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-orange-700/25 text-orange-200 transition hover:bg-orange-700/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            <p className="mt-5 rounded-xl border border-orange-700/30 bg-black/35 px-4 py-3 text-sm font-medium leading-6 text-orange-100/85">
              {t.turnoverNote}
            </p>
          </div>

          {!userId && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-900/40 p-4 text-center text-sm font-bold text-red-200">
              {t.loginRequired}
            </div>
          )}

          <div className="mb-6 rounded-xl border border-orange-700/40 bg-black/40 p-5">
            <div className="mb-3 flex items-center gap-2 text-orange-300">
              <BadgePercent size={18} />
              <span className="text-sm font-extrabold">{t.linkLabel}</span>
            </div>

            <div className="rounded-xl border border-red-800/40 bg-black/40 px-3 py-3">
              <p className="break-all text-sm font-bold leading-5 text-gray-200">
                {referralLink || "N/A"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!referralLink}
              className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-700 to-red-700 text-base font-bold text-white transition hover:from-orange-600 hover:to-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
              {copied ? t.copied : t.copy}
            </button>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<Coins size={24} />}
              label={t.referBalance}
              value={points.toLocaleString("en-US")}
              colorClass="text-orange-400"
            />

            <StatCard
              icon={<Gift size={24} />}
              label={t.estimated}
              value={money(estimatedRedeemAmount)}
              colorClass="text-orange-300"
            />

            <StatCard
              icon={<Wallet size={24} />}
              label={t.mainBalance}
              value={money(mainBalance)}
              colorClass="text-green-400"
            />
          </div>

          <div className="mb-6 rounded-xl border border-red-800/40 bg-black/40 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator size={20} className="text-orange-400" />
                  <h3 className="text-xl font-semibold text-orange-100">
                    {t.redeemSummary}
                  </h3>
                </div>

                <p className="mt-1 text-xs font-bold text-orange-200/70">
                  {Number(setting?.redeemPoint || 0).toLocaleString("en-US")}{" "}
                  Balance = {money(setting?.redeemMoney)}
                </p>
              </div>

              <span
                className={`rounded-full px-4 py-1.5 text-xs font-black ${
                  setting?.isActive
                    ? "bg-green-700/40 text-green-300 border border-green-600/50"
                    : "bg-red-700/40 text-red-300 border border-red-600/50"
                }`}
              >
                {setting?.isActive ? t.active : t.inactive}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl border border-red-800/30 bg-black/35 p-4">
                <p className="text-xs font-bold text-orange-200/70">
                  {t.minimum}
                </p>
                <p className="mt-1 text-lg font-black text-orange-100">
                  {money(setting?.minimumRedeemAmount)}
                </p>
              </div>

              <div className="rounded-xl border border-red-800/30 bg-black/35 p-4">
                <p className="text-xs font-bold text-orange-200/70">
                  {t.maximum}
                </p>
                <p className="mt-1 text-lg font-black text-orange-100">
                  {maxAmount > 0 ? money(maxAmount) : t.noLimit}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openRedeemModal}
              disabled={!userId || !setting?.isActive || points <= 0 || loading}
              className="mt-5 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-700 to-red-700 text-base font-bold text-white transition hover:from-orange-600 hover:to-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Gift size={18} />
              {t.redeem}
            </button>
          </div>

          <div className="rounded-xl border border-red-800/40 bg-black/40 p-5">
            <div className="mb-4 flex items-center gap-2">
              <History size={20} className="text-orange-400" />
              <h3 className="text-xl font-semibold text-orange-100">
                {t.history}
              </h3>
            </div>

            <div className="space-y-3">
              {loading ? (
                <p className="rounded-xl bg-black/35 p-4 text-center text-sm font-bold text-orange-200/70">
                  {t.loading}
                </p>
              ) : histories.length === 0 ? (
                <p className="rounded-xl bg-black/35 p-4 text-center text-sm font-bold text-orange-200/70">
                  {t.noHistory}
                </p>
              ) : (
                histories.slice(0, 20).map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-red-800/30 bg-black/35 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-base font-black text-orange-100">
                          {money(item.redeemAmount)}
                        </p>
                        <p className="text-xs font-bold text-orange-200/60">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          item.status === "success"
                            ? "bg-green-700/40 text-green-300 border border-green-600/50"
                            : item.status === "failed"
                              ? "bg-red-700/40 text-red-300 border border-red-600/50"
                              : "bg-yellow-700/40 text-yellow-300 border border-yellow-600/50"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-bold text-orange-200/65">
                      <p>
                        Used: {Number(item.pointsUsed || 0).toLocaleString()}
                      </p>
                      <p>
                        After: {Number(item.pointsAfter || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/70 px-3 pb-3 backdrop-blur-sm sm:items-center sm:pb-0">
          <div className="w-full max-w-[460px] rounded-t-[30px] border border-red-800/40 bg-gradient-to-br from-red-950 via-black to-orange-950 p-5 shadow-2xl sm:rounded-[30px]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-orange-100">
                  {t.redeemNow}
                </h3>
                <p className="text-xs font-bold text-orange-200/70">
                  {Number(setting?.redeemPoint || 0).toLocaleString("en-US")}{" "}
                  Balance = {money(setting?.redeemMoney)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-red-900/40 text-orange-200 transition hover:bg-red-800/60"
              >
                <X size={22} />
              </button>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-black text-orange-200">
                {t.redeemAmount}
              </span>

              <input
                type="number"
                min="0"
                value={redeemAmount}
                onChange={(e) => setRedeemAmount(e.target.value)}
                className="h-12 w-full rounded-xl border border-red-800/60 bg-black/50 px-4 text-lg font-black text-orange-100 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/30"
                placeholder="100"
              />
            </label>

            <div className="mb-4 space-y-2 rounded-xl border border-red-800/30 bg-black/35 p-4">
              <SummaryRow
                label={t.referBalance}
                value={points.toLocaleString("en-US")}
              />

              <SummaryRow
                label={t.requiredPoints}
                value={requiredPoints.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
              />

              <SummaryRow
                label={t.afterRedeem}
                value={pointsAfterRedeem.toLocaleString("en-US", {
                  maximumFractionDigits: 2,
                })}
                danger={pointsAfterRedeem < 0}
              />

              <SummaryRow label={t.redeemAmount} value={money(enteredAmount)} />
            </div>

            {!canRedeem && enteredAmount > 0 && (
              <p className="mb-3 rounded-xl border border-red-500/30 bg-red-900/40 px-4 py-3 text-sm font-bold text-red-200">
                {isBangla
                  ? "আপনার রেফার ব্যালেন্স, মিনিমাম/ম্যাক্সিমাম অথবা এমাউন্ট সঠিক নয়।"
                  : "Your refer balance, minimum/maximum limit, or amount is not valid."}
              </p>
            )}

            <button
              type="button"
              onClick={handleRedeem}
              disabled={!canRedeem || redeeming}
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-700 to-red-700 text-base font-black text-white transition hover:from-orange-600 hover:to-red-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Wallet size={18} />
              {redeeming
                ? isBangla
                  ? "রিডিম হচ্ছে..."
                  : "Redeeming..."
                : t.redeemNow}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, colorClass }) => {
  return (
    <div className="rounded-xl border border-red-800/40 bg-black/40 p-5 text-center shadow-lg shadow-red-900/20">
      <div className={`mx-auto mb-3 flex justify-center ${colorClass}`}>
        {icon}
      </div>
      <p className="text-lg font-black text-gray-100">{value}</p>
      <p className="mt-1 text-xs font-bold text-orange-200/70">{label}</p>
    </div>
  );
};

const SummaryRow = ({ label, value, danger }) => {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="font-bold text-orange-200/70">{label}</span>
      <span
        className={`font-black ${danger ? "text-red-300" : "text-orange-100"}`}
      >
        {value}
      </span>
    </div>
  );
};

export default ReedemWallet;
