import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import Settings from "./pages/Settings.jsx";
import LogSpace from "./pages/LogSpace.jsx";
import TasksSpace from "./pages/TasksSpace.jsx";
import CalendarSpace from "./pages/CalendarSpace.jsx";
// import RepeatsSpace from "./pages/RepeatsSpace.jsx";
import Store from "./pages/Store.jsx";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "tasks", element: <TasksSpace /> },
      // { path: "repeats", element: <RepeatsSpace /> },
      { path: "calendar", element: <CalendarSpace /> },
      { path: "log", element: <LogSpace /> },
      { path: "store", element: <Store /> },
      { path: "settings", element: <Settings /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
