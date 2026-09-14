import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";

import Dashboard from "../pages/dashboard/Dashboard";

import Income from "../pages/transactions/Income";
import Expense from "../pages/transactions/Expense";

import Savings from "../pages/finance/Savings";
import DebtReceivable from "../pages/finance/DebtReceivable";

import Report from "../pages/reports/Report";

import InputUser from "../pages/admin/InputUser";
import MonitoringUser from "../pages/admin/MonitoringUser";

import ProtectedRoute from "./ProtectedRoute";

/* =========================================================
   ROUTES
========================================================= */

function AppRoutes() {
  return (
    <Routes>

      {/* ===================================================
          LOGIN
      =================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ===================================================
          SEMUA USER YANG SUDAH LOGIN
      =================================================== */}

      <Route
        element={
          <ProtectedRoute />
        }
      >

        <Route
          element={
            <DashboardLayout />
          }
        >

          {/* ===============================================
              DASHBOARD
          =============================================== */}

          <Route
            path="/dashboard"
            element={
              <Dashboard />
            }
          />


          {/* ===============================================
              USER ONLY
              
              Admin tidak menggunakan halaman transaksi
              personal ini.
          =============================================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["user"]}
              />
            }
          >

            <Route
              path="/pemasukan"
              element={
                <Income />
              }
            />

            <Route
              path="/pengeluaran"
              element={
                <Expense />
              }
            />

            <Route
              path="/tabungan"
              element={
                <Savings />
              }
            />

            <Route
              path="/utang-piutang"
              element={
                <DebtReceivable />
              }
            />

          </Route>


          {/* ===============================================
              ADMIN ONLY
              
              HANYA ADMIN YANG BISA:
              - Monitoring User
              - Input User
          =============================================== */}

          <Route
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
              />
            }
          >

            <Route
              path="/monitoring-user"
              element={
                <MonitoringUser />
              }
            />

            <Route
              path="/input-user"
              element={
                <InputUser />
              }
            />

          </Route>


          {/* ===============================================
              LAPORAN
              
              Bisa dibuka Admin dan User.
          =============================================== */}

          <Route
            path="/laporan"
            element={
              <Report />
            }
          />


          {/* ===============================================
              SETTINGS
              
              Jika halaman Settings sudah dibuat.
          =============================================== */}

          {/* 
          <Route
            path="/settings"
            element={<Settings />}
          />
          */}


          {/* ===============================================
              DEFAULT
          =============================================== */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Route>

      </Route>


      {/* ===================================================
          URL TIDAK DITEMUKAN
      =================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}

export default AppRoutes;