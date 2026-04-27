import React, { useState } from "react";
import { IoGameController } from "react-icons/io5";
import { useLanguage } from "../../context/LanguageProvider";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import useAuth from "../../hook/useAuth";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import Loading from "../../components/Loading/Loading";

const API_URL = import.meta.env.VITE_API_URL;

const fetchActiveGames = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/games/active`);
    return Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error("Failed to fetch active games:", error);
    return [];
  }
};

const fetchTheme = async () => {
  try {
    const { data } = await axios.get(`${API_URL}/api/theme-settings`);
    return data;
  } catch {
    return {
      gradientFrom: "#f97316",
      gradientVia: "#ef4444",
      gradientTo: "#dc2626",
      textColor: "#ffffff",
    };
  }
};

const fetchProfile = async (userId) => {
  if (!userId) throw new Error("User not logged in");

  const { data } = await axios.get(`${API_URL}/api/user/${userId}`);
  return data?.data || data;
};

const getImageUrl = (image) => {
  if (!image) return "";
  if (String(image).startsWith("http")) return image;
  return `${API_URL}${image}`;
};

const Games = () => {
  const { isBangla } = useLanguage();
  const { userId } = useAuth();

  const [showMore, setShowMore] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [gameUrl, setGameUrl] = useState("");

  const { data: theme } = useQuery({
    queryKey: ["theme-settings"],
    queryFn: fetchTheme,
    staleTime: 10 * 60 * 1000,
  });

  const { data: games = [], isLoading: gamesLoading } = useQuery({
    queryKey: ["active-games"],
    queryFn: fetchActiveGames,
    staleTime: 5 * 60 * 1000,
  });

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => fetchProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  const playGameMutation = useMutation({
    mutationFn: async ({ gameID }) => {
      const { data } = await axios.post(`${API_URL}/api/games/playgame`, {
        gameID,
        username: user?.username || user?.userId,
        money: Number(user?.balance || 0),
      });

      return data;
    },

    onSuccess: (data) => {
      const url = data?.gameUrl || data?.url || data?.data?.gameUrl;

      if (!url) {
        toast.error(
          isBangla ? "Game URL পাওয়া যায়নি" : "No game URL received",
        );
        return;
      }

      setGameUrl(url);
      setShowGameModal(true);
    },

    onError: (err) => {
      toast.error(
        err?.response?.data?.message ||
          (isBangla ? "গেম চালু করা যায়নি" : "Failed to start game"),
      );
    },
  });

  const handleGameClick = (game) => {
    if (playGameMutation.isPending) return;

    if (!userId) {
      toast.error(isBangla ? "খেলতে লগইন করুন" : "Please login to play");
      return;
    }

    if (userLoading) {
      toast.info(isBangla ? "ইউজার তথ্য লোড হচ্ছে..." : "Loading user data...");
      return;
    }

    if (!user?.username && !user?.userId) {
      toast.error(
        isBangla ? "ব্যবহারকারী তথ্য পাওয়া যায়নি" : "User data not found",
      );
      return;
    }

    const gameID = game?.gameId || game?._id;

    if (!gameID) {
      toast.error(isBangla ? "Game ID পাওয়া যায়নি" : "Game ID not found");
      return;
    }

    playGameMutation.mutate({ gameID });
  };

  const closeGameModal = () => {
    setShowGameModal(false);
    setGameUrl("");
  };

  const sectionTitle = isBangla ? "সেরা গেমস খেলুন" : "Play the Best Games";
  const buttonText = isBangla ? "আরও দেখুন" : "See More";

  const gradientStyle = {
    background: `linear-gradient(to right, ${
      theme?.gradientFrom || "#f97316"
    }, ${theme?.gradientVia || "#ef4444"}, ${theme?.gradientTo || "#dc2626"})`,
    color: theme?.textColor || "#fff",
  };

  if (gamesLoading) {
    return (
      <Loading open text={isBangla ? "লোড হচ্ছে..." : "Loading games..."} />
    );
  }

  if (!games.length) {
    return (
      <div className="w-full px-3 py-6 text-center text-gray-500">
        {isBangla
          ? "কোনো সক্রিয় গেম পাওয়া যায়নি"
          : "No active games available"}
      </div>
    );
  }

  return (
    <div className="w-full px-3 py-2">
      <Loading
        open={playGameMutation.isPending}
        text={isBangla ? "গেম চালু হচ্ছে..." : "Starting game..."}
      />

      <style>{`
        .auto-shine {
          position: relative;
          overflow: hidden;
          border-radius: 12px;
        }

        .shine-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            120deg,
            transparent 30%,
            rgba(255,255,255,0.9) 50%,
            transparent 70%
          );
          transform: translateX(-150%);
          pointer-events: none;
        }

        .shine-animate .shine-layer {
          animation: shineSwipe 1.4s ease-out infinite;
        }

        @keyframes shineSwipe {
          0% {
            transform: translateX(-150%) skewX(-15deg);
          }
          100% {
            transform: translateX(150%) skewX(-15deg);
          }
        }
      `}</style>

      <div className="mb-3">
        <h2
          style={gradientStyle}
          className="flex w-2/3 items-center gap-2 rounded px-2 py-2 text-md font-bold md:w-1/2"
        >
          <IoGameController size={28} />
          {sectionTitle}
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {games.slice(0, showMore ? games.length : 6).map((game) => (
          <button
            type="button"
            key={game._id}
            onClick={() => handleGameClick(game)}
            disabled={playGameMutation.isPending}
            className="group relative auto-shine shine-animate cursor-pointer overflow-hidden border-2 border-white text-left shadow-lg disabled:cursor-not-allowed disabled:opacity-70"
          >
            <img
              src={getImageUrl(game.image)}
              alt={game.title || game.gameName || "Game"}
              className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-52"
            />

            <div className="shine-layer" />

            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="text-xl font-bold tracking-wide text-white drop-shadow-lg md:text-2xl">
                {isBangla ? "খেলুন" : "Play"}
              </span>
            </div>

            <div className="pointer-events-none absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent">
              <span className="pb-2 text-center text-sm font-bold text-white drop-shadow-md md:text-base">
                {game.title || game.gameName}
              </span>
            </div>
          </button>
        ))}
      </div>

      {games.length > 6 && !showMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowMore(true)}
            style={gradientStyle}
            className="cursor-pointer rounded-full px-6 py-2 font-semibold shadow-lg transition-transform active:scale-95"
          >
            {buttonText}
          </button>
        </div>
      )}

      {showGameModal && gameUrl && (
        <div className="fixed inset-0 z-[9999] bg-black">
          <button
            type="button"
            onClick={closeGameModal}
            className="fixed right-4 top-4 z-[10000] cursor-pointer rounded-full bg-red-600 p-3 text-white shadow-lg hover:bg-red-700"
          >
            <FaTimes size={22} />
          </button>

          <iframe
            src={gameUrl}
            title="Game"
            className="h-full w-full border-0"
            allow="fullscreen"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default Games;
