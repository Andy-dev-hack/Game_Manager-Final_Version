/**
 * RegisterPage.tsx
 * User registration page with form validation using react-hook-form and Zod.
 * Features:
 * - Username, email, and password validation
 * - Password confirmation matching
 * - Error handling and display
 * - Loading state during registration
 * - Link to login page
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../AuthContext";
import { registerSchema, type RegisterSchemaType } from "../schemas";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Card } from "../../../components/ui/Card";
import styles from "./RegisterPage.module.css";

/**
 * RegisterPage component
 * Displays registration form with validation and error handling.
 * Redirects to home page on successful registration.
 *
 * @returns {JSX.Element} Registration page with form
 */
const RegisterPage = () => {
  const { t } = useTranslation();
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();

  // Initialize react-hook-form with Zod schema validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  /**
   * Handle form submission
   * Attempts registration and navigates to home on success.
   * Displays error message on failure.
   * @param {RegisterSchemaType} data - Form data (username, email, password, confirmPassword)
   */
  const onSubmit = async (data: RegisterSchemaType) => {
    try {
      await registerUser(data);
      navigate("/"); // Redirect to home on success
    } catch (error) {
      console.error(error);
      setError("root", {
        message: t("auth.registrationFailed"),
      });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <Card padding="lg" className={styles.registerCard}>
        <h1 className={`text-gradient ${styles.title}`}>{t("nav.register")}</h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <Input
            label={t("auth.username")}
            placeholder="Gamer123"
            {...register("username")}
            error={errors.username?.message}
          />

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

          <Input
            label={t("auth.confirmPassword")}
            type="password"
            placeholder="••••••"
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          {errors.root && (
            <div className={styles.errorMessage}>{errors.root.message}</div>
          )}

          <Button
            type="submit"
            isLoading={isLoading}
            className={styles.submitButton}
          >
            {t("nav.register")}
          </Button>

          <div className={styles.footer}>
            {t("auth.alreadyHaveAccount")}{" "}
            <Link to="/login" className={styles.link}>
              {t("nav.login")}
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegisterPage;
