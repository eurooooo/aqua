import { createBrowserRouter } from "react-router";

import AppLayout from "@/layout/AppLayout";
import HomePage from "@/pages/HomePage";
import ProfilePage from "@/pages/ProfilePage";
import RecommendPage from "@/pages/RecommendPage";
import RecordPage from "@/pages/RecordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "record",
        element: <RecordPage />,
      },
      {
        path: "recommend",
        element: <RecommendPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
    ],
  },
]);

