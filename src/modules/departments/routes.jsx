import { lazy, Suspense } from "react";
import { Route } from "react-router";
import { PermissionRoute } from "../../shared/auth/PermissionRoute.jsx";
import { PageLoading } from "../../shared/ui/PageLoading.jsx";

const DepartmentsPage = lazy(() => import("./DepartmentsPage.jsx").then((module) => ({ default: module.DepartmentsPage })));

export const departmentsRoute = <Route path="departments" element={<Suspense fallback={<PageLoading />}><PermissionRoute permission="core.department.view"><DepartmentsPage /></PermissionRoute></Suspense>} />;
