import React, { useEffect, useRef } from "react";
import Connect from "../connection/Connect";

const Context = React.createContext();

const ProviderContext = ({ children }) => {
  const tercios = [1 / 3, 2 / 3, 3 / 3];
  const userContext = useRef(null);
  const videoCurrentSession = useRef(null);
  const infoSession = useRef({});
  const currentFPS = useRef(null);
  const CrudApi = new Connect();
  const listOfPlayers = useRef([]);
  const currentSession = useRef(null);
  const S3_BUCKET = "mcp-wildsense";
  const REGION = "us-east-2";
  const AWS_ACCESS_KEY_ID = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
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
    "assets/teams/team-Red.jpg",
    "assets/teams/team-Yellow.jpg",
    "assets/player-zone.png",
  ];
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve(img);
      };
      img.onerror = img.onabort = () => {
        reject(src);
      };
      img.src = src;
    });
  };

  const preloadImages = (list) => {
    list.forEach((image) => {
      preloadImage(image);
    });
  };

  useEffect(() => {
    preloadImages(listOfImages);
  }, []);

  return (
    <Context.Provider
      value={{
        userContext,
        videoCurrentSession,
        infoSession,
        currentFPS,
        CrudApi,
        listOfPlayers,
        currentSession,
        S3_BUCKET,
        REGION,
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        preloadImages,
        tercios,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { Context, ProviderContext };
