import { Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Login from "../pages/auth/Login";

import Dashboard from "../pages/dashboard/Dashboard";

import Income from "../pages/transactions/Income";
import Expense from "../pages/transactions/Expense";

import Savings from "../pages/finance/Savings";
import DebtReceivable from "../pages/finance/DebtReceivable";

import Report from "../pages/reports/Report";

import InputUser from "../pages/admin/InputUser";


function SimplePage({ title, description }) {
  return (
    <div className="simple-page">
      <h1>{title}</h1>

      <p>{description}</p>
    </div>
  );
}


function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          LOGIN
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* =====================================================
          DASHBOARD LAYOUT
      ===================================================== */}

      <Route element={<DashboardLayout />}>

        {/* ROOT */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* =================================================
            DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />


        {/* =================================================
            TRANSAKSI
        ================================================= */}

        <Route
          path="/pemasukan"
          element={<Income />}
        />

        <Route
          path="/pengeluaran"
          element={<Expense />}
        />


        {/* =================================================
            KEUANGAN
        ================================================= */}

        <Route
          path="/tabungan"
          element={<Savings />}
        />

        <Route
          path="/utang-piutang"
          element={<DebtReceivable />}
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          path="/input-user"
          element={<InputUser />}
        />


        {/* =================================================
            BUDGET
        ================================================= */}

        <Route
          path="/budget"
          element={
            <SimplePage
              title="Budget"
              description="Atur anggaran keuangan."
            />
          }
        />


        {/* =================================================
            FINANCIAL GOALS
        ================================================= */}

        <Route
          path="/goals"
          element={
            <SimplePage
              title="Financial Goals"
              description="Pantau target keuangan."
            />
          }
        />


        {/* =================================================
            LAPORAN
        ================================================= */}

        <Route
          path="/laporan"
          element={<Report />}
        />


        {/* =================================================
            SETTINGS
        ================================================= */}

        <Route
          path="/settings"
          element={
            <SimplePage
              title="Settings"
              description="Pengaturan aplikasi."
            />
          }
        />


        {/* =================================================
            404
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Route>

    </Routes>
  );
}

export default AppRoutes;