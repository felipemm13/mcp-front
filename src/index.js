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
    path: "plays-view",
    element: <PlaysView />,
  },{path:"list-of-plays",element:<ListOfPlays/>},
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
