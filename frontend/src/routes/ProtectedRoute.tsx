/**
 * ProtectedRoute.tsx
 * Wrapper component for routes that require authentication.
 * Redirects to login if user is not authenticated.
 * Shows access denied message if user lacks required role.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../features/auth/AuthContext";
import styles from "./ProtectedRoute.module.css";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "admin") {
    return (
      <div className={styles.accessDeniedContainer}>
        <h2 className={styles.accessDeniedText}>
          ⛔ {t("common.access_denied")}
        </h2>
        <p>{t("common.admin_only")}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
