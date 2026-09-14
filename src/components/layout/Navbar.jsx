import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  UserRound,
  LogOut,
  AlertCircle,
  X,
} from "lucide-react";

import {
  getCurrentUser,
  logoutUser,
} from "../../utils/storage";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [logoutConfirm, setLogoutConfirm] =
    useState(false);

  /* =====================================================
     CURRENT USER
  ===================================================== */

  const currentUser = getCurrentUser();

  const isAdmin =
    currentUser?.role === "admin";

  const userName =
    currentUser?.name || "User";

  const userRole = isAdmin
    ? "Administrator"
    : "Personal";

  const avatar =
    userName.charAt(0).toUpperCase();

  /* =====================================================
     EDIT PROFILE
  ===================================================== */

  function handleEditProfile() {
    setProfileOpen(false);

    navigate("/settings");
  }

  /* =====================================================
     OPEN LOGOUT CONFIRMATION
  ===================================================== */

  function handleLogoutClick() {
    setProfileOpen(false);
    setLogoutConfirm(true);
  }

  /* =====================================================
     CANCEL LOGOUT
  ===================================================== */

  function handleCancelLogout() {
    setLogoutConfirm(false);
  }

  /* =====================================================
     CONFIRM LOGOUT
  ===================================================== */

  function handleConfirmLogout() {
    logoutUser();

    setLogoutConfirm(false);

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <header className="navbar">

      {/* =================================================
          LOGOUT CONFIRMATION
      ================================================= */}

      {logoutConfirm && (
        <div className="logout-toast-wrapper">

          <div className="logout-toast">

            {/* ICON */}

            <div className="logout-toast-icon">
              <AlertCircle size={19} />
            </div>


            {/* CONTENT */}

            <div className="logout-toast-content">

              <strong>
                Keluar dari akun?
              </strong>

              <span>
                Sesi kamu akan diakhiri.
              </span>

            </div>


            {/* ACTION */}

            <div className="logout-toast-actions">

              <button
                type="button"
                className="logout-toast-cancel"
                onClick={
                  handleCancelLogout
                }
              >
                Batal
              </button>

              <button
                type="button"
                className="logout-toast-confirm"
                onClick={
                  handleConfirmLogout
                }
              >
                Logout
              </button>

            </div>


            {/* CLOSE */}

            <button
              type="button"
              className="logout-toast-close"
              onClick={
                handleCancelLogout
              }
              aria-label="Tutup"
            >
              <X size={15} />
            </button>

          </div>

        </div>
      )}


      {/* =================================================
          LEFT
      ================================================= */}

      <div className="navbar-left">

        {/* MOBILE MENU */}

        <button
          className="mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={21} />
        </button>


        {/* PAGE TITLE */}

        <div className="navbar-title">
          <span>
            Financial Management
          </span>
        </div>

      </div>


      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="navbar-right">

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="navbar-search">

          <Search size={16} />

          <input
            type="text"
            placeholder="Cari transaksi..."
          />

        </div>


        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <button
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span className="notification-dot"></span>

        </button>


        {/* =================================================
            DIVIDER
        ================================================= */}

        <div className="navbar-divider"></div>


        {/* =================================================
            PROFILE
        ================================================= */}

        <div className="navbar-profile-wrapper">

          {/* PROFILE BUTTON */}

          <button
            className={`navbar-user ${
              profileOpen
                ? "profile-active"
                : ""
            }`}
            onClick={() =>
              setProfileOpen(
                (prev) => !prev
              )
            }
          >

            {/* AVATAR */}

            <div className="navbar-avatar">
              {avatar}
            </div>


            {/* USER INFO */}

            <div className="navbar-user-info">

              <strong>
                {userName}
              </strong>

              <span>
                {userRole}
              </span>

            </div>


            {/* CHEVRON */}

            <ChevronDown
              size={14}
              className={`profile-chevron ${
                profileOpen
                  ? "rotate"
                  : ""
              }`}
            />

          </button>


          {/* =================================================
              DROPDOWN
          ================================================= */}

          {profileOpen && (

            <div className="profile-dropdown">

              {/* PROFILE HEADER */}

              <div className="profile-dropdown-header">

                <div className="profile-dropdown-avatar">
                  {avatar}
                </div>

                <div>

                  <strong>
                    {userName}
                  </strong>

                  <span>
                    {isAdmin
                      ? "Administrator Account"
                      : "Personal Account"}
                  </span>

                </div>

              </div>


              {/* DIVIDER */}

              <div className="profile-dropdown-divider"></div>


              {/* EDIT PROFILE */}

              <button
                className="profile-dropdown-item"
                onClick={
                  handleEditProfile
                }
              >

                <UserRound size={15} />

                <span>
                  Edit Profil
                </span>

              </button>


              {/* LOGOUT */}

              <button
                className="profile-dropdown-item logout-item"
                onClick={
                  handleLogoutClick
                }
              >

                <LogOut size={15} />

                <span>
                  Logout
                </span>

              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  );
}

export default Navbar;