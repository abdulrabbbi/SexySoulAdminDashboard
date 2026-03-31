import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../layouts/SiteLayout";
import AuthLayout from "../layouts/AuthLayout";

const DashboardContent = lazy(() => import("../Pages/MainDashboard"));
const UsersPage = lazy(() => import("../Pages/UsersPage"));
const ContentPage = lazy(() => import("../Pages/ContentPage"));
const LiveEventsPage = lazy(() => import("../Pages/LiveEventsPage"));
const LiveStudio = lazy(() => import("../Pages/LiveStudio"));
const DealsPartnersPage = lazy(() => import("../Pages/DealsPartnersPage"));
const BrokersReferralsPage = lazy(() => import("../Pages/BrokersReferralsPage"));
const MessagingCommunityPage = lazy(() => import("../Pages/MessagingCommunityPage"));
const SupportMediaSettingsPage = lazy(() => import("../Pages/SupportMediaSettingsPage"));
const LoginPage = lazy(() => import("../Pages/Auth/Login"));

function LazyPage({ children }) {
  return <Suspense fallback={<div />}>{children}</Suspense>;
}

const Router = createBrowserRouter([
  {
    path: "/",
    element: <DashboardLayout />,
    children: [
      { index: true, element: <LazyPage><DashboardContent /></LazyPage> },
      { path: "users-memberships", element: <LazyPage><UsersPage /></LazyPage> },
      { path: "content", element: <LazyPage><ContentPage /></LazyPage> },
      { path: "live-events", element: <LazyPage><LiveEventsPage /></LazyPage> },
      { path: "/live-studio", element: <LazyPage><LiveStudio /></LazyPage> },
      { path: "deals", element: <LazyPage><DealsPartnersPage /></LazyPage> },
      { path: "brokers", element: <LazyPage><BrokersReferralsPage /></LazyPage> },
      { path: "messaging", element: <LazyPage><MessagingCommunityPage /></LazyPage> },
      { path: "support-settings", element: <LazyPage><SupportMediaSettingsPage /></LazyPage> },
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [{ path: "login", element: <LazyPage><LoginPage /></LazyPage> }],
  },
]);

export default Router;
