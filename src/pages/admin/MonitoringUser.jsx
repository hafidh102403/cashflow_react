import { useMemo, useState } from "react";
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  PiggyBank,
  HandCoins,
  X,
  Eye,
} from "lucide-react";

import {
  getUsers,
  getUserData,
} from "../../utils/storage";

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function MonitoringUser() {
  const [selectedUser, setSelectedUser] =
    useState(null);

  const users = getUsers();

  /* =====================================================
     HANYA USER BIASA
  ===================================================== */

  const regularUsers = users.filter(
    (user) => user.role === "user"
  );

  /* =====================================================
     USER FINANCIAL DATA
  ===================================================== */

  const userData = useMemo(() => {
    return regularUsers.map((user) => {
      const income = getUserData(
        "income",
        user.id
      );

      const expense = getUserData(
        "expense",
        user.id
      );

      const savings = getUserData(
        "savings",
        user.id
      );

      const debt = getUserData(
        "debt",
        user.id
      );

      const totalIncome = income.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

      const totalExpense = expense.reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

      const totalSavings = savings.reduce(
        (total, item) =>
          total +
          Number(
            item.currentAmount ??
              item.amount ??
              item.nominal ??
              0
          ),
        0
      );

      const totalDebt = debt
        .filter(
          (item) =>
            item.type === "utang" ||
            item.type === "debt"
        )
        .reduce(
          (total, item) =>
            total +
            Number(
              item.amount ??
                item.total ??
                0
            ),
          0
        );

      const totalReceivable = debt
        .filter(
          (item) =>
            item.type === "piutang" ||
            item.type === "receivable"
        )
        .reduce(
          (total, item) =>
            total +
            Number(
              item.amount ??
                item.total ??
                0
            ),
          0
        );

      const balance =
        totalIncome - totalExpense;

      return {
        ...user,
        totalIncome,
        totalExpense,
        totalSavings,
        totalDebt,
        totalReceivable,
        balance,
        incomeCount: income.length,
        expenseCount: expense.length,
      };
    });
  }, [regularUsers]);

  /* =====================================================
     SUMMARY
  ===================================================== */

  const summary = useMemo(() => {
    return {
      users: regularUsers.length,

      balance: userData.reduce(
        (total, user) =>
          total + user.balance,
        0
      ),

      income: userData.reduce(
        (total, user) =>
          total + user.totalIncome,
        0
      ),

      expense: userData.reduce(
        (total, user) =>
          total + user.totalExpense,
        0
      ),

      savings: userData.reduce(
        (total, user) =>
          total + user.totalSavings,
        0
      ),

      debt: userData.reduce(
        (total, user) =>
          total + user.totalDebt,
        0
      ),
    };
  }, [regularUsers, userData]);

  return (
    <div className="transaction-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="transaction-page-header">

        <div>
          <h1>
            Monitoring User
          </h1>

          <p>
            Pantau aktivitas keuangan seluruh user.
          </p>
        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="transaction-summary-grid">

        {/* USER */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon">
            <Users size={18} />
          </div>

          <div>
            <span>
              Total User
            </span>

            <strong>
              {summary.users}
            </strong>
          </div>

        </div>


        {/* SALDO */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon neutral-icon">
            <Wallet size={18} />
          </div>

          <div>
            <span>
              Total Saldo
            </span>

            <strong>
              {formatRupiah(
                summary.balance
              )}
            </strong>
          </div>

        </div>


        {/* PEMASUKAN */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon">
            <ArrowDownLeft size={18} />
          </div>

          <div>
            <span>
              Total Pemasukan
            </span>

            <strong>
              {formatRupiah(
                summary.income
              )}
            </strong>
          </div>

        </div>


        {/* PENGELUARAN */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon">
            <ArrowUpRight size={18} />
          </div>

          <div>
            <span>
              Total Pengeluaran
            </span>

            <strong>
              {formatRupiah(
                summary.expense
              )}
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          USER TABLE
      ================================================= */}

      <div className="transaction-card">

        <div className="transaction-toolbar">

          <div>
            <strong>
              Daftar User
            </strong>
          </div>

        </div>


        <div className="transaction-table-wrapper">

          <table className="transaction-table">

            <thead>

              <tr>
                <th>USER</th>
                <th>EMAIL</th>
                <th>PEMASUKAN</th>
                <th>PENGELUARAN</th>
                <th>SALDO</th>
                <th>AKSI</th>
              </tr>

            </thead>

            <tbody>

              {userData.length > 0 ? (

                userData.map((user) => (

                  <tr key={user.id}>

                    {/* USER */}

                    <td>

                      <strong>
                        {user.name}
                      </strong>

                    </td>


                    {/* EMAIL */}

                    <td>
                      {user.email}
                    </td>


                    {/* INCOME */}

                    <td>

                      <strong>
                        {formatRupiah(
                          user.totalIncome
                        )}
                      </strong>

                    </td>


                    {/* EXPENSE */}

                    <td>

                      <strong className="expense-value">
                        {formatRupiah(
                          user.totalExpense
                        )}
                      </strong>

                    </td>


                    {/* BALANCE */}

                    <td>

                      <strong>
                        {formatRupiah(
                          user.balance
                        )}
                      </strong>

                    </td>


                    {/* ACTION */}

                    <td>

                      <button
                        className="transaction-edit-button"
                        title="Lihat Detail"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                      >
                        <Eye size={13} />
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="transaction-empty"
                  >

                    <Users size={25} />

                    <strong>
                      Belum ada user
                    </strong>

                    <span>
                      Silakan tambahkan user melalui
                      menu Input User.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          DETAIL MODAL
      ================================================= */}

      {selectedUser && (

        <div className="transaction-modal-overlay">

          <div className="transaction-modal">

            {/* HEADER */}

            <div className="transaction-modal-header">

              <div>

                <h2>
                  Detail User
                </h2>

                <p>
                  Informasi keuangan{" "}
                  {selectedUser.name}
                </p>

              </div>

              <button
                className="transaction-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                <X size={17} />
              </button>

            </div>


            {/* DETAIL */}

            <div className="transaction-form-grid">

              {/* USER */}

              <div className="transaction-form-group">

                <label>
                  Nama User
                </label>

                <div className="monitoring-detail-value">
                  {selectedUser.name}
                </div>

              </div>


              {/* EMAIL */}

              <div className="transaction-form-group">

                <label>
                  Email
                </label>

                <div className="monitoring-detail-value">
                  {selectedUser.email}
                </div>

              </div>


              {/* PEMASUKAN */}

              <div className="transaction-form-group">

                <label>
                  Total Pemasukan
                </label>

                <div className="monitoring-detail-value">
                  {formatRupiah(
                    selectedUser.totalIncome
                  )}
                </div>

              </div>


              {/* PENGELUARAN */}

              <div className="transaction-form-group">

                <label>
                  Total Pengeluaran
                </label>

                <div className="monitoring-detail-value">
                  {formatRupiah(
                    selectedUser.totalExpense
                  )}
                </div>

              </div>


              {/* SALDO */}

              <div className="transaction-form-group">

                <label>
                  Sisa Saldo
                </label>

                <div className="monitoring-detail-value">
                  {formatRupiah(
                    selectedUser.balance
                  )}
                </div>

              </div>


              {/* TABUNGAN */}

              <div className="transaction-form-group">

                <label>
                  Total Tabungan
                </label>

                <div className="monitoring-detail-value">
                  {formatRupiah(
                    selectedUser.totalSavings
                  )}
                </div>

              </div>


              {/* UTANG */}

              <div className="transaction-form-group">

                <label>
                  Total Utang
                </label>

                <div className="monitoring-detail-value">
                  {formatRupiah(
                    selectedUser.totalDebt
                  )}
                </div>

              </div>


              {/* PIUTANG */}

              <div className="transaction-form-group">

                <label>
                  Total Piutang
                </label>

                <div className="monitoring-detail-value">
                  {formatRupiah(
                    selectedUser.totalReceivable
                  )}
                </div>

              </div>

            </div>


            {/* FOOTER */}

            <div className="transaction-modal-footer">

              <button
                type="button"
                className="transaction-cancel-button"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                Tutup
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default MonitoringUser;