/**
 * LoginPage.tsx
 * User login page with form validation using react-hook-form and Zod.
 * Features:
 * - Email and password validation
 * - Error handling and display
 * - Loading state during authentication
 * - Link to registration page
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../AuthContext";
import { loginSchema, type LoginSchemaType } from "../schemas";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import styles from "./LoginPage.module.css";

/**
 * LoginPage component
 * Displays login form with validation and error handling.
 * Redirects to home page on successful login.
 *
 * @returns {JSX.Element} Login page with form
 */
const LoginPage = () => {
  const { t } = useTranslation();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  // Initialize react-hook-form with Zod schema validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * Handle form submission
   * Attempts login and navigates to home on success.
   * Displays error message on failure.
   * @param {LoginSchemaType} data - Form data (email, password)
   */
  const onSubmit = async (data: LoginSchemaType) => {
    try {
      await login(data);
      navigate("/"); // Redirect to home on success
    } catch (error) {
      console.error(error); // Log for debugging
      setError("root", {
        message: t("auth.invalidCredentials"), // User-friendly error
      });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Card padding="lg" className={styles.loginCard}>
        <h1 className={`text-gradient ${styles.title}`}>{t("nav.login")}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label={t("auth.email")}
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label={t("auth.password")}
            type="password"
            placeholder="••••••"
            {...register("password")}
            error={errors.password?.message}
          />

          {errors.root && (
            <div className={styles.errorMessage}>{errors.root.message}</div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            className={styles.submitButton}
          >
            {t("nav.login")}
          </Button>

          <div className={styles.footer}>
            {t("auth.dontHaveAccount")}{" "}
            <Link to="/register" className={styles.link}>
              {t("nav.register")}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
