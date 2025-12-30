/**
 * UserDropdown.tsx
 * User profile dropdown menu with avatar, user info, and actions.
 * Features:
 * - Animated dropdown with Framer Motion
 * - Click-outside detection to close menu
 * - Avatar upload modal integration
 * - Password change modal integration
 * - Quick access to library, orders, and logout
 * - Admin Panel access (visible only for admin users)
 */

import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserCircle,
  FaCamera,
  FaBook,
  FaSignOutAlt,
  FaLock,
  FaUser,
  FaChevronDown,
  FaChevronUp,
  FaUserEdit,
  FaList,
  FaCog,
} from "react-icons/fa";
import { useAuth } from "../../features/auth/AuthContext";
import { AvatarUploadModal } from "../../features/profile/components/AvatarUploadModal";
import { ChangePasswordModal } from "../../features/profile/components/ChangePasswordModal";
import { EditProfileModal } from "../../features/profile/components/EditProfileModal";
import styles from "./UserDropdown.module.css";
import { clsx } from "clsx";

/**
 * UserDropdown component
 * Displays user avatar and dropdown menu with profile actions.
 * Automatically closes when clicking outside the dropdown.
 *
 * @returns {JSX.Element | null} User dropdown menu or null if not authenticated
 */

export const UserDropdown = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Close dropdown when clicking outside
   * Uses event listener to detect clicks outside the dropdown element
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleAvatarClick = () => {
    setIsOpen(!isOpen);
  };

  const handleChangeAvatar = () => {
    setIsOpen(false);
    setIsAvatarModalOpen(true);
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    setIsPasswordModalOpen(true);
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  if (!user) return null;

  return (
    <>
      <div className={styles.container} ref={dropdownRef}>
        {/* Avatar Button */}
        <button
          className={styles.avatarButton}
          onClick={handleAvatarClick}
          aria-label="User menu"
        >
          <div className={styles.avatar}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} />
            ) : (
              <FaUserCircle size={32} />
            )}
          </div>
          <span className={styles.username}>{user.username}</span>
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={styles.dropdown}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              {/* User Info */}
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <FaUserCircle size={40} />
                  )}
                </div>
                <div className={styles.userDetails}>
                  <p className={styles.userName}>{user.username}</p>
                  <p className={styles.userEmail}>{user.email}</p>
                </div>
              </div>

              <div className={styles.divider} />

              {/* Menu Items */}

              {/* My Profile Toggle */}
              <button
                className={`${styles.menuItem} ${styles.menuItemBetween}`}
                onClick={() => setIsProfileExpanded(!isProfileExpanded)}
              >
                <div className={styles.menuItemContent}>
                  <FaUser />
                  <span>My Profile</span>
                </div>
                {isProfileExpanded ? (
                  <FaChevronUp size={12} />
                ) : (
                  <FaChevronDown size={12} />
                )}
              </button>

              <AnimatePresence>
                {isProfileExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={styles.subMenuContainer}
                  >
                    <button
                      className={clsx(styles.menuItem, styles.subMenuItem)}
                      onClick={() => {
                        setIsOpen(false);
                        setIsEditProfileModalOpen(true);
                      }}
                    >
                      <FaUserEdit />
                      <span>Edit Profile</span>
                    </button>

                    <button
                      className={clsx(styles.menuItem, styles.subMenuItem)}
                      onClick={handleChangeAvatar}
                    >
                      <FaCamera />
                      <span>Change Avatar</span>
                    </button>

                    <button
                      className={clsx(styles.menuItem, styles.subMenuItem)}
                      onClick={handleChangePassword}
                    >
                      <FaLock />
                      <span>Change Password</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <Link
                to="/library"
                className={styles.menuItem}
                onClick={() => setIsOpen(false)}
              >
                <FaBook />
                <span>My Library</span>
              </Link>

              <Link
                to="/orders"
                className={styles.menuItem}
                onClick={() => setIsOpen(false)}
              >
                <FaList />
                <span>My Orders</span>
              </Link>

              {/* Admin Panel - Only visible for admins */}
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className={styles.menuItem}
                  onClick={() => setIsOpen(false)}
                >
                  <FaCog />
                  <span>Admin Panel</span>
                </Link>
              )}

              <div className={styles.divider} />

              <button
                className={`${styles.menuItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatar={user.avatar}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
      />
    </>
  );
};
