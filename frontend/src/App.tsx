import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Helmet } from "react-helmet-async";

function App() {
  return (
    <ErrorBoundary>
      <Helmet>
        <title>GameManager</title>
        <link rel="icon" href="/game_manager_icon.png" />
      </Helmet>
      {/* Application routing system with error protection */}
      <AppRoutes />

      {/* Global toast notifications with glassmorphism styling */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--bg-glass)",
            color: "var(--text-primary)",
            border: "1px solid var(--glass-border)",
            backdropFilter: "blur(16px)",
          },
          success: {
            iconTheme: {
              primary: "var(--accent-primary)",
              secondary: "white",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444",
              secondary: "white",
            },
          },
        }}
      />
    </ErrorBoundary>
  );
}

export default App;
