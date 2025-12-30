/**
 * useUpdateProfile.ts
 * Custom hook for updating user profile including avatar upload.
 * Handles profile update mutation with automatic user context refresh.
 * Shows success/error toasts for user feedback.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../../../services/auth.service";
import { useAuth } from "../../auth/AuthContext";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../../utils/error.util";

/**
 * useUpdateProfile Hook
 * React Query mutation for updating user profile (avatar, password, etc.)
 * Automatically refreshes user data and shows toast notifications
 *
 * @returns Mutation object with mutate/mutateAsync functions
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();

  return useMutation({
    mutationFn: (formData: FormData) => authService.updateProfile(formData),
    onSuccess: async () => {
      // Refresh user data in context
      await refreshUser();

      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ["user"] });

      toast.success("Profile updated successfully!");
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error, "Failed to update profile");
      toast.error(message);
    },
  });
};

// Exported to AvatarUploadModal and profile pages for profile updates
