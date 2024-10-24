import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/index.css";
import Webapp from "./layouts/Webapp";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import FootballSession from "./layouts/FootballSession";
import FootballSessionView from "./components/FootballSessionView";
import OtherSessions from "./layouts/OtherSessions";
import AnalizeSession from "./layouts/AnalizeSession";
import { ProviderContext } from "./services/Context";
import PlaysView from "./layouts/PlaysView";
import ListOfPlays from "./layouts/ListOfPlays";

// src/index.js
if (process.env.NODE_ENV === 'production') {
  if (typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined') {
    for (let [key, value] of Object.entries(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)) {
      window.__REACT_DEVTOOLS_GLOBAL_HOOK__[key] = typeof value == "function" ? () => {} : null;
    }
  }
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Webapp />,
    errorElement: <ErrorPage />,
  },
  {
    path: "football-session",
    element: <FootballSession />,
  },
  {
    path: "player-view",
    element: <FootballSessionView />,
  },
  {
    path: "plays-view/:play",
    element: <PlaysView />,
  },
  { path: "list-of-plays", element: <ListOfPlays /> },
  {
    path: "other-sessions",
    element: <OtherSessions />,
  },
  {
    path: "analize-session/:session",
    element: <AnalizeSession />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ProviderContext>
    <RouterProvider router={router} />
  </ProviderContext>
);
