import React, { useEffect, useRef, useState } from "react";
import Connect from "../connection/Connect";

const Context = React.createContext();

const ProviderContext = ({ children }) => {
  const userContext = useRef(null);
  const videoCurrentSession = useRef(null);
  const infoSession = useRef({});
  const currentFPS = useRef(null);
  const CrudApi = new Connect();
  const listOfImages = [
    "assets/calibrations/calibration-example.png",
    "assets/calibrations/calibration-mark-1.png",
    "assets/calibrations/calibration-mark-2.png",
    "assets/calibrations/calibration-mark-3.png",
    "assets/calibrations/calibration-mark-4.png",
    "assets/calibrations/calibration-mark-5.png",
    "assets/calibrations/calibration-mark-6.png",
    "assets/reactions/reaction-black.jpg",
    "assets/reactions/reaction-blue.jpg",
    "assets/reactions/reaction-brown.jpg",
    "assets/reactions/reaction-gray.jpg",
    "assets/reactions/reaction-green.jpg",
    "assets/reactions/reaction-red.jpg",
    "assets/reactions/reaction-white.jpg",
    "assets/reactions/reaction-yellow.jpg",
    "assets/teams/team-red.jpg",
    "assets/teams/team-yellow.jpg",
    "assets/player-zone.png",
  ];

  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = img.onabort = function () {
        reject(src);
      };
      img.src = src;
    });
  };

  const preLoadImages = () => {
    listOfImages.map((image) => {
      preloadImage(image);
    });
  };

  useEffect(() => {
    preLoadImages();
  }, []);

  return (
    <Context.Provider
      value={{
        userContext,
        videoCurrentSession,
        infoSession,
        currentFPS,
        CrudApi,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { Context, ProviderContext };
