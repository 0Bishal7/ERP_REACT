import { lazy, Suspense } from "react";
import { Route } from "react-router";
import { PermissionRoute } from "../../shared/auth/PermissionRoute.jsx";
import { PageLoading } from "../../shared/ui/PageLoading.jsx";

const OrganizationsPage = lazy(() => import("./OrganizationsPage.jsx").then((module) => ({ default: module.OrganizationsPage })));

export const organizationsRoute = <Route path="organizations" element={<Suspense fallback={<PageLoading />}><PermissionRoute permission="core.organization.manage"><OrganizationsPage /></PermissionRoute></Suspense>} />;
