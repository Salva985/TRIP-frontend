import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./ui/App.jsx";

import RequireAuth from "./auth/RequireAuth.jsx";
import Landing from "./ui/pages/Landing.jsx";
import Home from "./ui/pages/Home.jsx";

// Trips
import TripsList from "./ui/trips/TripsList.jsx";
import TripDetails from "./ui/trips/TripDetails.jsx";
import TripCreatePage from "./ui/trips/TripCreatePage.jsx";

// Activities
import ActivitiesList from "./ui/activities/ActivitiesList.jsx";
import ActivityDetail from "./ui/activities/ActivityDetail.jsx";
import ActivityForm from "./ui/activities/ActivityForm.jsx";

// Auth
import { AuthProvider } from "./auth/AuthContext.jsx";
import Login from "./auth/Login.jsx";
import Register from "./auth/Register.jsx";

import "./index.css";

const router = createBrowserRouter([
  // Public “preview” entry
  { path: "/welcome", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },

  // Protected application under App layout
  {
    path: "/",
    element: (
      <RequireAuth>
        <App />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Home /> },

      // trips
      { path: "trips", element: <TripsList /> },
      { path: "trips/new", element: <TripCreatePage /> },
      { path: "trips/:id", element: <TripDetails /> },

      // activities
      { path: "activities", element: <ActivitiesList /> },
      { path: "activities/new", element: <ActivityForm /> },
      { path: "activities/:id", element: <ActivityDetail /> },
      { path: "activities/:id/edit", element: <ActivityForm edit /> },
    ],
  },

  // Fallback
  { path: "*", element: <Landing /> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);