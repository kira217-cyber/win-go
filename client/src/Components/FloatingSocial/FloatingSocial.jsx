import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchFloatingLinks = async () => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/floating-social`
  );
  return data;
};

const FloatingSocial = () => {
  const { data: links = [], isLoading } = useQuery({
    queryKey: ["floating-social"],
    queryFn: fetchFloatingLinks,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading || links.length === 0) return null;

  return (
    <div className="
      fixed w-full md:w-[60%] lg:w-[40%] xl:w-[30%] 
      bottom-20 sm:bottom-24 md:bottom-28 lg:bottom-32 
      -right-76 md:right-40 
      z-50 
      flex flex-col gap-2 sm:gap-3 md:gap-4
    ">
      {links.map((item) => (
        <a
          key={item._id}
          href={item.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={item.name}
          className="
            w-14 h-14              
            md:w-12 md:h-12         
            lg:w-14 lg:h-14      
            flex items-center justify-center 
            rounded-full 
            shadow-lg 
            transition-transform 
            hover:scale-110 
            active:scale-95
            cursor-pointer 
            overflow-hidden
            bg-white/10          
            backdrop-blur-sm        
          "
        >
          <img
            src={`${import.meta.env.VITE_API_URL}${item.imageUrl}`}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "/fallback-icon.png"; // optional fallback
              e.target.alt = "Icon not available";
            }}
          />
        </a>
      ))}
    </div>
  );
};

export default FloatingSocial;