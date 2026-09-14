import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  HandCoins,
  FileText,
  UserPlus,
  Users,
  X,
  CircleDollarSign,
} from "lucide-react";

import { getCurrentUser } from "../../utils/storage";

/* =========================================================
   USER MENU
========================================================= */

const userMenuGroups = [
  {
    title: "MENU UTAMA",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "TRANSAKSI",
    items: [
      {
        label: "Pemasukan",
        path: "/pemasukan",
        icon: ArrowDownToLine,
      },
      {
        label: "Pengeluaran",
        path: "/pengeluaran",
        icon: ArrowUpFromLine,
      },
    ],
  },

  {
    title: "KEUANGAN",
    items: [
      {
        label: "Tabungan",
        path: "/tabungan",
        icon: PiggyBank,
      },
      {
        label: "Utang Piutang",
        path: "/utang-piutang",
        icon: HandCoins,
      },
    ],
  },

  {
    title: "LAPORAN",
    items: [
      {
        label: "Laporan",
        path: "/laporan",
        icon: FileText,
      },
    ],
  },
];

/* =========================================================
   ADMIN MENU
========================================================= */

const adminMenuGroups = [
  {
    title: "MENU UTAMA",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    title: "ADMIN",
    items: [
      {
        label: "Monitoring User",
        path: "/monitoring-user",
        icon: Users,
      },

      {
        label: "Input User",
        path: "/input-user",
        icon: UserPlus,
      },
    ],
  },

  {
    title: "LAPORAN",
    items: [
      {
        label: "Laporan",
        path: "/laporan",
        icon: FileText,
      },
    ],
  },
];

function Sidebar({
  isOpen,
  onClose,
}) {
  const currentUser = getCurrentUser();

  const isAdmin = currentUser?.role === "admin";

  const menuGroups = isAdmin
    ? adminMenuGroups
    : userMenuGroups;

  const userName = currentUser?.name || "User";

  const roleName = isAdmin
    ? "Administrator"
    : "Personal Account";

  return (
    <aside
      className={`sidebar ${
        isOpen ? "sidebar-open" : ""
      }`}
    >

      {/* =====================================================
          SIDEBAR HEADER
          TINGGI SAMA DENGAN NAVBAR
      ===================================================== */}

      <div className="sidebar-header">

        <div className="brand">

          <div className="brand-logo">
            <CircleDollarSign
              size={20}
              strokeWidth={2}
            />
          </div>

          <div className="brand-content">

            <h2>
              CASH FLOW
            </h2>

            <span>
              Financial Management System
            </span>

          </div>

        </div>

        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>

      </div>

      {/* =====================================================
          MENU
      ===================================================== */}

      <div className="sidebar-menu">

        {menuGroups.map((group) => (
          <div
            className="menu-group"
            key={group.title}
          >

            <div className="menu-title">
              {group.title}
            </div>

            <div className="menu-list">

              {group.items.map((item) => {

                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `menu-link ${
                        isActive ? "active" : ""
                      }`
                    }
                  >

                    <Icon
                      size={15}
                      strokeWidth={2}
                    />

                    <span>
                      {item.label}
                    </span>

                  </NavLink>
                );
              })}

            </div>

          </div>
        ))}

      </div>

      {/* =====================================================
          SIDEBAR FOOTER
      ===================================================== */}

      <div className="sidebar-footer">

        <div className="sidebar-account">

          <div className="account-avatar">
            {userName.charAt(0).toUpperCase()}
          </div>

          <div className="account-info">

            <strong>
              {userName}
            </strong>

            <span>
              {roleName}
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;