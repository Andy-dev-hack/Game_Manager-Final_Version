import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FaUpload, FaTimes, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import { Button } from "../../../components/ui/Button";
import styles from "./AvatarUploadModal.module.css";

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export const AvatarUploadModal = ({
  isOpen,
  onClose,
  currentAvatar,
}: AvatarUploadModalProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useUpdateProfile();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only images are allowed (JPG, PNG, WebP, GIF)");
      return;
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      setError("Image cannot exceed 5MB");
      return;
    }

    setError(null);
    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      await updateProfile.mutateAsync(formData);
      handleClose();
    } catch {
      // Error is handled by the hook
    }
  };

  const handleClose = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={handleClose}>
        <motion.div
          className={styles.modal}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className={styles.header}>
            <h2>Change Profile Picture</h2>
            <button
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {/* Avatar Preview */}
            <div className={styles.previewContainer}>
              <div className={styles.avatarPreview}>
                {preview ? (
                  <img src={preview} alt="Preview" />
                ) : currentAvatar ? (
                  <img src={currentAvatar} alt="Current avatar" />
                ) : (
                  <FaUserCircle className={styles.placeholderIcon} />
                )}
              </div>
              <p className={styles.previewLabel}>Preview</p>
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`${styles.dropzone} ${
                isDragActive ? styles.dropzoneActive : ""
              }`}
            >
              <input {...getInputProps()} />
              <FaUpload className={styles.uploadIcon} />
              {isDragActive ? (
                <p>Drop the image here...</p>
              ) : (
                <>
                  <p>Drag an image here</p>
                  <p className={styles.dropzoneSubtext}>or click to select</p>
                </>
              )}
              <p className={styles.dropzoneHint}>
                JPG, PNG, WebP or GIF (max. 5MB)
              </p>
            </div>

            {/* Error Message */}
            {error && <div className={styles.error}>{error}</div>}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedFile || updateProfile.isPending}
              isLoading={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
