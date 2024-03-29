/* eslint-disable */
import React, { useEffect, useRef, useState } from "react";
import Connect from "../connection/Connect";

const Context = React.createContext();

const ProviderContext = ({ children }) => {
  const urlVision = process.env.REACT_APP_VISIONMCP;
  const tercios = [1 / 3, 2 / 3, 3 / 3];
  const userContext = useRef(null);
  const videoCurrentSession = useRef(null);
  const infoSession = useRef(null);
  const infoSavedSession = useRef(null);
  const currentFPS = useRef(null);
  const CrudApi = new Connect();
  const listOfPlayers = useRef([]);
  const currentSession = useRef(null);
  const currentPlay = useRef(null)
  const isSaveCurrentSession = useRef(false)
  const currentDevice = useRef(null)
  const [customsUser,setCustomsUser] = useState(null)
  const currentCalibration = useRef(null)
  const calibrationBackground = useRef(null)
  const S3_BUCKET = "mcp-wildsense";
  const REGION = "us-east-2";
  const AWS_ACCESS_KEY_ID = process.env.REACT_APP_AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY;
  const AWS_URL = process.env.REACT_APP_AWS_URL;
  const listOfImages = [
    "assets/calibrations/calibration-example.png",
    "assets/calibrations/calibration-mark-1.png",
    "assets/calibrations/calibration-mark-2.png",
    "assets/calibrations/calibration-mark-3.png",
    "assets/calibrations/calibration-mark-4.png",
    "assets/calibrations/calibration-mark-5.png",
    "assets/calibrations/calibration-mark-6.png",
  ];
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        resolve(img);
      };
      img.onerror = img.onabort = () => {
        reject(src);
      };
    });
  };
  const showSessionType = (type) => {
    switch (type) {
      case "reactive":
        return "Reactiva";
      case "discriminative":
        return "Discriminativa";
      case "applied":
        return "Aplicada";
      case 'evaluative':
        return 'Evaluativa'
      default:
        return "No type";
    }
  }

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
        urlVision,
        userContext,
        videoCurrentSession,
        isSaveCurrentSession,
        infoSession,
        infoSavedSession,
        currentFPS,
        currentDevice,
        CrudApi,
        listOfPlayers,
        currentSession,
        currentPlay,
        customsUser,
        currentCalibration,
        calibrationBackground,
        setCustomsUser,
        S3_BUCKET,
        REGION,
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_URL,
        preloadImages,
        showSessionType,
        tercios,
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { Context, ProviderContext };
