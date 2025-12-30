/**
 * EditProfileModal.tsx
 * Modal for editing user profile (Username and Email).
 * Uses backend endpoint PUT /users/update.
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUserEdit } from "react-icons/fa";
import { z } from "zod";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import styles from "./EditProfileModal.module.css";
import toast from "react-hot-toast";
import { authService } from "../../../services/auth.service";

/**
 * Validation schema for Edit Profile
 */
const editProfileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
});

type EditProfileSchemaType = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({
  isOpen,
  onClose,
}: EditProfileModalProps) => {
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditProfileSchemaType>({
    resolver: zodResolver(editProfileSchema),
  });

  // Pre-fill form with current user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setValue("username", user.username);
      setValue("email", user.email);
    }
  }, [isOpen, user, setValue]);

  const onSubmit = async (data: EditProfileSchemaType) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);

      await authService.updateProfile(formData);

      // Refresh user context to show new name immediately
      await refreshUser();

      toast.success("Profile updated successfully!");
      onClose();
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      // Backend error (e.g., "Username already taken") will be shown here
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
          >
            <div className={styles.header}>
              <div className={styles.titleContainer}>
                <FaUserEdit className={styles.icon} />
                <h2>Edit Profile</h2>
              </div>
              <button className={styles.closeButton} onClick={handleClose}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
              <Input
                label="Username"
                placeholder="Enter username"
                {...register("username")}
                error={errors.username?.message}
              />
              <Input
                label="Email"
                type="email"
                placeholder="Enter email"
                {...register("email")}
                error={errors.email?.message}
              />

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
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
