import { lazy, Suspense } from "react";
import { Route } from "react-router";
import { PageLoading } from "../../shared/ui/PageLoading.jsx";

const DashboardPage = lazy(() => import("./DashboardPage.jsx").then((module) => ({ default: module.DashboardPage })));

export const dashboardRoute = <Route index element={<Suspense fallback={<PageLoading />}><DashboardPage /></Suspense>} />;
