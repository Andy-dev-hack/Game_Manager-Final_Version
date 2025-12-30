import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { Loader } from "../components/ui/Loader";
import ProtectedRoute from "./ProtectedRoute";

// Lazy Load Pages
const HomePage = lazy(() => import("../pages/HomePage"));
const CatalogPage = lazy(() => import("../pages/CatalogPage"));
const LoginPage = lazy(() => import("../features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/auth/pages/RegisterPage"));
const StorePage = lazy(() => import("../pages/StorePage"));
const GameDetails = lazy(() => import("../pages/GameDetails"));

const LibraryPage = lazy(() => import("../pages/LibraryPage"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const WishlistPage = lazy(() => import("../pages/WishlistPage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("../pages/admin/UserManagement"));
const GameManagement = lazy(() => import("../pages/admin/GameManagement"));
const OrderManagement = lazy(() => import("../pages/admin/OrderManagement"));
const RAWGImport = lazy(() => import("../pages/admin/RAWGImport"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<MainLayout />}>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/game/:id" element={<GameDetails />} />

          {/* Protected User Routes */}
          <Route
            path="/library"
            element={
              <ProtectedRoute>
                <LibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout/:id"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/games"
            element={
              <ProtectedRoute requireAdmin>
                <GameManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/orders"
            element={
              <ProtectedRoute requireAdmin>
                <OrderManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/import"
            element={
              <ProtectedRoute requireAdmin>
                <RAWGImport />
              </ProtectedRoute>
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Fallback - redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
