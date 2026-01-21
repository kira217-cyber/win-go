import React from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5007";

// ── Fetch function ────────────────────────────────────────────────
const fetchNavbarSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE}/api/navbar`);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404) return null; // → use defaults
    throw err;
  }
};

// ── Save/Update function ──────────────────────────────────────────
const saveNavbarSettings = async (data) => {
  const response = await axios.post(`${API_BASE}/api/navbar`, data);
  return response.data;
};

const NavbarController = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["navbar-settings"],
    queryFn: fetchNavbarSettings,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Default values — aligned with your sidebar's orange-red-black vibe
  const defaultFormValues = {
    gradientFrom: "#f97316", // orange-500
    gradientVia: "#dc2626", // red-600
    gradientTo: "#7f1d1d", // red-900
    textColor: "#ffffff",
    withdrawBg: "#f97316", // orange-500
    withdrawText: "#ffffff",
    depositBg: "#ef4444", // red-500
    depositText: "#ffffff",
  };

  const formValues = data || defaultFormValues;

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: formValues,
  });

  // Watch values for live preview & color picker sync
  const gradientFrom = useWatch({ control, name: "gradientFrom" });
  const gradientVia = useWatch({ control, name: "gradientVia" });
  const gradientTo = useWatch({ control, name: "gradientTo" });
  const textColor = useWatch({ control, name: "textColor" });
  const withdrawBg = useWatch({ control, name: "withdrawBg" });
  const withdrawText = useWatch({ control, name: "withdrawText" });
  const depositBg = useWatch({ control, name: "depositBg" });
  const depositText = useWatch({ control, name: "depositText" });

  // Reset form when server data arrives
  React.useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const mutation = useMutation({
    mutationFn: saveNavbarSettings,
    onSuccess: (response) => {
      toast.success("Navbar settings saved successfully!", {
        position: "top-right",
        autoClose: 4000,
      });
      queryClient.setQueryData(["navbar-settings"], response.data || response);
      queryClient.invalidateQueries({ queryKey: ["navbar-settings"] });
    },
    onError: (err) => {
      const errMsg =
        err.response?.data?.message || "Failed to save navbar settings";
      toast.error(errMsg, { position: "top-right", autoClose: 6000 });
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xl text-orange-300">
        Loading current navbar settings...
      </div>
    );
  }

  if (isError && error?.response?.status !== 404) {
    return (
      <div className="p-8 text-center bg-gray-900 rounded-xl border border-red-800/40">
        <h2 className="text-2xl font-bold text-red-400 mb-4">
          Error loading settings
        </h2>
        <p className="text-gray-300">{error?.message || "Unknown error"}</p>
        <p className="text-sm text-gray-500 mt-3">
          Using default values. You can still save new colors.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-gradient-to-br from-gray-950 via-gray-900 to-black rounded-2xl border border-red-900/30 shadow-2xl">
      <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-orange-400 via-red-400 to-red-600 bg-clip-text text-transparent">
        Navbar Color Controller
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: "gradientFrom",
              label: "Gradient From",
              color: gradientFrom,
            },
            { name: "gradientVia", label: "Gradient Via", color: gradientVia },
            { name: "gradientTo", label: "Gradient To", color: gradientTo },
            { name: "textColor", label: "Main Text Color", color: textColor },
            {
              name: "withdrawBg",
              label: "Withdraw Button BG",
              color: withdrawBg,
            },
            {
              name: "withdrawText",
              label: "Withdraw Button Text",
              color: withdrawText,
            },
            { name: "depositBg", label: "Deposit Button BG", color: depositBg },
            {
              name: "depositText",
              label: "Deposit Button Text",
              color: depositText,
            },
          ].map((field) => (
            <div key={field.name} className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                {field.label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={field.color || "#000000"}
                  onChange={(e) =>
                    setValue(field.name, e.target.value, { shouldDirty: true })
                  }
                  className="w-14 h-14 rounded-lg cursor-pointer border-2 border-gray-700 shadow-sm hover:scale-105 transition-transform"
                />
                <input
                  type="text"
                  {...register(field.name, {
                    pattern: /^#[0-9A-Fa-f]{6}$/i,
                    required: true,
                  })}
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/40 transition-all"
                  placeholder="#rrggbb"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-red-900/40">
          <button
            type="submit"
            disabled={mutation.isPending || isSubmitting}
            className="w-full cursor-pointer bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all duration-300 shadow-lg shadow-red-900/40 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
          >
            {mutation.isPending || isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Save Navbar Colors"
            )}
          </button>
        </div>
      </form>

      {/* Live Preview Section */}
      <div className="mt-12 pt-8 border-t border-gray-800">
        <h3 className="text-xl font-semibold mb-5 text-center text-orange-300">
          Current Form Values (Live Preview)
        </h3>
        <div className="bg-black/60 p-6 rounded-xl border border-red-900/30 font-mono text-sm overflow-x-auto">
          <pre className="text-green-300 whitespace-pre-wrap">
            {JSON.stringify(
              {
                gradientFrom,
                gradientVia,
                gradientTo,
                textColor,
                withdrawBg,
                withdrawText,
                depositBg,
                depositText,
              },
              null,
              2,
            )}
          </pre>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          All colors are stored as HEX (#rrggbb) in the database.
        </p>
      </div>
    </div>
  );
};

export default NavbarController;
