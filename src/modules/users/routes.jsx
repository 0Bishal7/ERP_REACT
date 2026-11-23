import { lazy, Suspense } from "react";
import { Route } from "react-router";
import { PermissionRoute } from "../../shared/auth/PermissionRoute.jsx";
import { PageLoading } from "../../shared/ui/PageLoading.jsx";

const UsersPage = lazy(() => import("./UsersPage.jsx").then((module) => ({ default: module.UsersPage })));

export const usersRoute = <Route path="users" element={<Suspense fallback={<PageLoading />}><PermissionRoute permission="core.user.view"><UsersPage /></PermissionRoute></Suspense>} />;
