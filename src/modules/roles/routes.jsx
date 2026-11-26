import { lazy, Suspense } from "react";
import { Route } from "react-router";
import { PermissionRoute } from "../../shared/auth/PermissionRoute.jsx";
import { PageLoading } from "../../shared/ui/PageLoading.jsx";
const RolesPage = lazy(() => import("./RolesPage.jsx").then((module) => ({ default: module.RolesPage })));
export const rolesRoute = <Route path="roles" element={<Suspense fallback={<PageLoading />}><PermissionRoute permission="core.role.view"><RolesPage /></PermissionRoute></Suspense>} />;
