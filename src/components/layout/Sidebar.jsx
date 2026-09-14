import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ArrowDownToLine,
  ArrowUpFromLine,
  PiggyBank,
  HandCoins,
  FileText,
  Settings,
  X,
  CircleDollarSign,
} from "lucide-react";

const menuGroups = [
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

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>

      {/* LOGO */}
      <div className="sidebar-header">

        <div className="brand">

          <div className="brand-logo">
            <CircleDollarSign size={21} />
          </div>

          <div className="brand-content">
            <h2>CASH FLOW</h2>
            <span>Financial Management System</span>
          </div>

        </div>

        <button
          className="sidebar-close"
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <X size={19} />
        </button>

      </div>


      {/* MENU */}
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
                      `menu-link ${isActive ? "active" : ""}`
                    }
                  >

                    <Icon
                      size={16}
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


      {/* FOOTER */}
      <div className="sidebar-footer">

        <div className="sidebar-account">

          <div className="account-avatar">
            H
          </div>

          <div className="account-info">
            <strong>Hafidh</strong>
            <span>Personal Account</span>
          </div>

        </div>

      </div>

    </aside>
  );
}

export default Sidebar;