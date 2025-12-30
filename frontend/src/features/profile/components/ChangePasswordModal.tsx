/**
 * ChangePasswordModal.tsx
 * Modal for changing user password.
 * Uses existing backend endpoint PUT /users/update with password field.
 * Note: Backend doesn't validate current password (security limitation).
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaLock } from "react-icons/fa";
import { useAuth } from "../../auth/AuthContext";
import {
  changePasswordSchema,
  type ChangePasswordSchemaType,
} from "../../auth/schemas";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import styles from "./ChangePasswordModal.module.css";
import toast from "react-hot-toast";
import { authService } from "../../../services/auth.service";

/**
 * ChangePasswordModal component props
 */
interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ChangePasswordModal component
 * Displays modal with form to change user password.
 * Uses react-hook-form + Zod for validation.
 *
 * @param {ChangePasswordModalProps} props - Component props
 * @returns {JSX.Element} Change password modal
 */
export const ChangePasswordModal = ({
  isOpen,
  onClose,
}: ChangePasswordModalProps) => {
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordSchemaType>({
    resolver: zodResolver(changePasswordSchema),
  });

  /**
   * Handle form submission
   * Sends new password to backend using updateProfile service
   */
  const onSubmit = async (data: ChangePasswordSchemaType) => {
    try {
      setIsLoading(true);

      // Create FormData with only password field
      const formData = new FormData();
      formData.append("password", data.newPassword);

      await authService.updateProfile(formData);

      // Refresh user data
      await refreshUser();

      toast.success("Password changed successfully!");
      reset();
      onClose();
    } catch (error: unknown) {
      console.error("Error changing password:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle modal close
   * Resets form and closes modal
   */
  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.titleContainer}>
                <FaLock className={styles.icon} />
                <h2>Change Password</h2>
              </div>
              <button
                className={styles.closeButton}
                onClick={handleClose}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                label="New Password"
                type="password"
                placeholder="Enter new password"
                {...register("newPassword")}
                error={errors.newPassword?.message}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="Confirm new password"
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              {/* Warning message */}
              <div className={styles.warning}>
                <p>⚠️ Note: This will change your password immediately.</p>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Change Password
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Exported to UserDropdown for password change functionality
