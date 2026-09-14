import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Menu,
  Bell,
  Search,
  ChevronDown,
  UserRound,
  LogOut,
} from "lucide-react";

function Navbar({ onMenuClick }) {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  /* =====================================================
     EDIT PROFILE
  ===================================================== */

  function handleEditProfile() {
    setProfileOpen(false);

    // Sementara diarahkan ke halaman settings
    navigate("/settings");
  }

  /* =====================================================
     LOGOUT
  ===================================================== */

  function handleLogout() {
    setProfileOpen(false);

    const confirmed = window.confirm(
      "Apakah kamu yakin ingin logout?"
    );

    if (confirmed) {
      navigate("/login");
    }
  }

  return (
    <header className="navbar">

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
          <span>Financial Management</span>
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
            PROFILE WRAPPER
        ================================================= */}

        <div className="navbar-profile-wrapper">

          {/* PROFILE BUTTON */}

          <button
            className={`navbar-user ${
              profileOpen ? "profile-active" : ""
            }`}
            onClick={() =>
              setProfileOpen(!profileOpen)
            }
          >

            {/* AVATAR */}

            <div className="navbar-avatar">
              H
            </div>


            {/* USER INFO */}

            <div className="navbar-user-info">

              <strong>
                Hafidh
              </strong>

              <span>
                Personal
              </span>

            </div>


            {/* CHEVRON */}

            <ChevronDown
              size={14}
              className={`profile-chevron ${
                profileOpen ? "rotate" : ""
              }`}
            />

          </button>


          {/* =================================================
              PROFILE DROPDOWN
          ================================================= */}

          {profileOpen && (

            <div className="profile-dropdown">

              {/* PROFILE HEADER */}

              <div className="profile-dropdown-header">

                <div className="profile-dropdown-avatar">
                  H
                </div>

                <div>

                  <strong>
                    Hafidh
                  </strong>

                  <span>
                    Personal Account
                  </span>

                </div>

              </div>


              {/* DIVIDER */}

              <div className="profile-dropdown-divider"></div>


              {/* EDIT PROFILE */}

              <button
                className="profile-dropdown-item"
                onClick={handleEditProfile}
              >

                <UserRound size={15} />

                <span>
                  Edit Profil
                </span>

              </button>


              {/* LOGOUT */}

              <button
                className="profile-dropdown-item logout-item"
                onClick={handleLogout}
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