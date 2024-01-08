import React, { useEffect, useRef, useState } from "react";

const Context = React.createContext();

const ProviderContext = ({ children }) => {
  const userContext = useRef(null);
  const videoCurrentSession = useRef(null);
  const infoSession = useRef({});
  const currentFPS = useRef(null)

  return (
    <Context.Provider
      value={{
        userContext,
        videoCurrentSession,
        infoSession,
        currentFPS
      }}
    >
      {children}
    </Context.Provider>
  );
};

export { Context, ProviderContext };
