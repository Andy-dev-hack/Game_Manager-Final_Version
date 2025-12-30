import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

import "./index.css";
import "./lib/i18n";
import { CartProvider } from "./features/cart/CartProvider";
import { WishlistProvider } from "./features/wishlist/WishlistProvider";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./features/auth/AuthProvider";
import App from "./App.tsx";
import ScrollToTop from "./components/common/ScrollToTop";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <BrowserRouter>
                <ScrollToTop />
                <App />
              </BrowserRouter>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
