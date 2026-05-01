import React, { useEffect, useMemo, useState } from "react";
import {
  FaGift,
  FaSave,
  FaSyncAlt,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

const defaultForm = {
  referAmountForAllUsers: 20,
  minimumRedeemAmount: 100,
  maximumRedeemAmount: 1000,
  redeemPoint: 1000,
  redeemMoney: 100,
  isActive: true,
};

const ReferAndReedemUser = () => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token =
    localStorage.getItem("token") || localStorage.getItem("accessToken") || "";

  const headers = useMemo(
    () => ({
      Authorization: token ? `Bearer ${token}` : "",
    }),
    [token],
  );

  const getSetting = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/api/refer-redeem`);

      if (data?.data) {
        setForm({
          referAmountForAllUsers: Number(data.data.referAmountForAllUsers || 0),
          minimumRedeemAmount: Number(data.data.minimumRedeemAmount || 0),
          maximumRedeemAmount: Number(data.data.maximumRedeemAmount || 0),
          redeemPoint: Number(data.data.redeemPoint || 0),
          redeemMoney: Number(data.data.redeemMoney || 0),
          isActive: Boolean(data.data.isActive),
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load refer setting",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSetting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: key === "isActive" ? value : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.maximumRedeemAmount > 0 &&
      form.maximumRedeemAmount < form.minimumRedeemAmount
    ) {
      toast.error("Maximum redeem amount minimum amount থেকে কম হতে পারবে না");
      return;
    }

    try {
      setSaving(true);

      const { data } = await axios.put(`${BASE_URL}/api/refer-redeem`, form);

      toast.success(data?.message || "Refer setting updated successfully");
      if (data?.data) {
        setForm({
          referAmountForAllUsers: Number(data.data.referAmountForAllUsers || 0),
          minimumRedeemAmount: Number(data.data.minimumRedeemAmount || 0),
          maximumRedeemAmount: Number(data.data.maximumRedeemAmount || 0),
          redeemPoint: Number(data.data.redeemPoint || 0),
          redeemMoney: Number(data.data.redeemMoney || 0),
          isActive: Boolean(data.data.isActive),
        });
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to update refer setting",
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-red-800/60 bg-black/45 px-4 py-3 text-orange-50 placeholder-orange-300/50 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all";

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-950 via-red-950 to-black p-4 md:p-8 text-orange-50">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-600 to-red-700 shadow-lg shadow-red-950/50">
                <FaGift className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  Refer And Redeem User
                </h1>
                <p className="text-sm text-orange-200/75">
                  Manage referral amount and redeem conversion setting
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={getSetting}
            disabled={loading || saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-600/15 px-5 py-3 text-sm font-semibold text-orange-100 hover:bg-orange-600/25 disabled:opacity-60 cursor-pointer"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="rounded-3xl border border-red-800/50 bg-black/35 p-5 shadow-2xl shadow-black/30 backdrop-blur lg:col-span-1">
            <p className="text-sm text-orange-200/80">Current Status</p>

            <div className="mt-4 rounded-2xl border border-red-800/40 bg-gradient-to-br from-orange-900/30 to-red-950/40 p-5">
              <div className="flex items-center justify-between">
                <span className="text-orange-100">System</span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    form.isActive
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                      : "bg-red-500/15 text-red-300 border border-red-400/30"
                  }`}
                >
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <InfoRow
                  label="Refer Amount"
                  value={`৳ ${form.referAmountForAllUsers}`}
                />
                <InfoRow
                  label="Min Redeem"
                  value={`৳ ${form.minimumRedeemAmount}`}
                />
                <InfoRow
                  label="Max Redeem"
                  value={`৳ ${form.maximumRedeemAmount}`}
                />
                <InfoRow
                  label="Conversion"
                  value={`${form.redeemPoint} Point = ৳ ${form.redeemMoney}`}
                />
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 text-sm leading-6 text-orange-100/85">
              Admin এখানে Refer Amount set করলে সব user এর <b>referAmount</b>{" "}
              update হবে। এরপর কেউ refer code দিয়ে register করলে referrer এর{" "}
              <b>referAmountBalance</b> এ amount add হবে।
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-red-800/50 bg-black/35 p-5 md:p-7 shadow-2xl shadow-black/30 backdrop-blur lg:col-span-2"
          >
            {loading ? (
              <div className="flex min-h-[360px] items-center justify-center">
                <div className="text-center">
                  <FaSyncAlt className="mx-auto mb-3 animate-spin text-3xl text-orange-300" />
                  <p className="text-orange-200">Loading setting...</p>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between rounded-2xl border border-red-800/40 bg-red-950/25 p-4">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Refer & Redeem Setting
                    </h2>
                    <p className="text-sm text-orange-200/70">
                      Update global referral and redeem configuration
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleChange("isActive", !form.isActive)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all cursor-pointer ${
                      form.isActive
                        ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
                        : "bg-red-500/15 text-red-300 border border-red-400/30"
                    }`}
                  >
                    {form.isActive ? <FaToggleOn /> : <FaToggleOff />}
                    {form.isActive ? "Active" : "Inactive"}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field
                    label="Refer Amount For All Users"
                    value={form.referAmountForAllUsers}
                    onChange={(v) => handleChange("referAmountForAllUsers", v)}
                    inputClass={inputClass}
                    hint="সব user এর referAmount এ এই value set হবে"
                  />

                  <Field
                    label="Minimum Redeem Amount"
                    value={form.minimumRedeemAmount}
                    onChange={(v) => handleChange("minimumRedeemAmount", v)}
                    inputClass={inputClass}
                    hint="User minimum কত টাকা redeem করতে পারবে"
                  />

                  <Field
                    label="Maximum Redeem Amount"
                    value={form.maximumRedeemAmount}
                    onChange={(v) => handleChange("maximumRedeemAmount", v)}
                    inputClass={inputClass}
                    hint="0 দিলে unlimited হিসেবে ধরতে পারবেন"
                  />

                  <Field
                    label="Redeem Point"
                    value={form.redeemPoint}
                    onChange={(v) => handleChange("redeemPoint", v)}
                    inputClass={inputClass}
                    hint="যেমন: 1000 point"
                  />

                  <Field
                    label="Redeem Money"
                    value={form.redeemMoney}
                    onChange={(v) => handleChange("redeemMoney", v)}
                    inputClass={inputClass}
                    hint="যেমন: 100 টাকা"
                  />
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setForm(defaultForm)}
                    disabled={saving}
                    className="rounded-xl border border-red-700/50 bg-red-950/30 px-6 py-3 font-semibold text-orange-100 hover:bg-red-900/40 disabled:opacity-60 cursor-pointer"
                  >
                    Reset Default
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-700 to-red-700 px-7 py-3 font-bold text-white shadow-lg shadow-red-950/50 hover:from-orange-600 hover:to-red-600 disabled:opacity-60 cursor-pointer"
                  >
                    <FaSave />
                    {saving ? "Saving..." : "Save Setting"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, inputClass, hint }) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-orange-100">
        {label}
      </label>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
      />
      {hint && <p className="mt-2 text-xs text-orange-200/60">{hint}</p>}
    </div>
  );
};

const InfoRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-red-800/30 pb-3 last:border-b-0 last:pb-0">
      <span className="text-sm text-orange-200/70">{label}</span>
      <span className="text-sm font-bold text-white">{value}</span>
    </div>
  );
};

export default ReferAndReedemUser;
