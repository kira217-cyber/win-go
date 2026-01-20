// src/components/FaviconAndTitle.jsx
import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const fetchSiteConfig = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/site-config`);
  return data;
};

const FaviconAndTitle = () => {
  const { data: config, isLoading } = useQuery({
    queryKey: ['site-config'],
    queryFn: fetchSiteConfig,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  useEffect(() => {
    if (!config || isLoading) return;

    // Update document title
    document.title = config.siteTitle || 'WiN GO';

    // Update favicon
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = `${import.meta.env.VITE_API_URL}${config.faviconUrl}`;
  }, [config, isLoading]);

  // This component doesn't render anything visible
  return null;
};

export default FaviconAndTitle;