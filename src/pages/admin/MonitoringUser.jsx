import { useMemo, useState } from "react";
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Eye,
} from "lucide-react";

import {
  getUsers,
  getUserData,
} from "../../utils/storage";

/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

/* =========================================================
   GET JSON STORAGE
========================================================= */

function getStorageArray(key) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* =========================================================
   GET USER DATA
========================================================= */

function getFinancialData(type, userId) {
  /*
   * PRIORITAS 1:
   * Data yang memang sudah disimpan per user.
   */

  const userData = getUserData(type, userId);

  if (
    Array.isArray(userData) &&
    userData.length > 0
  ) {
    return userData;
  }

  /*
   * PRIORITAS 2:
   * Data lama sebelum sistem per-user.
   *
   * Data lama dianggap milik Hafidh
   * (user ID 2).
   */

  if (String(userId) === "2") {
    const legacyKey =
      type === "income"
        ? "cashflow_income"
        : type === "expense"
        ? "cashflow_expense"
        : null;

    if (legacyKey) {
      return getStorageArray(legacyKey);
    }
  }

  return [];
}

/* =========================================================
   MONITORING USER
========================================================= */

function MonitoringUser() {
  const [selectedUser, setSelectedUser] =
    useState(null);

  const [refreshKey, setRefreshKey] =
    useState(0);

  /* =======================================================
     USERS
  ======================================================= */

  const users = getUsers();

  /* =======================================================
     HANYA USER BIASA
  ======================================================= */

  const regularUsers = users.filter(
    (user) => user.role === "user"
  );

  /* =======================================================
     DATA KEUANGAN USER
  ======================================================= */

  const userData = useMemo(() => {
    return regularUsers.map((user) => {
      /* ===================================================
         PEMASUKAN
      =================================================== */

      const income = getFinancialData(
        "income",
        user.id
      );

      /* ===================================================
         PENGELUARAN
      =================================================== */

      const expense = getFinancialData(
        "expense",
        user.id
      );

      /* ===================================================
         TABUNGAN
      =================================================== */

      const savings = getFinancialData(
        "savings",
        user.id
      );

      /* ===================================================
         UTANG / PIUTANG
      =================================================== */

      const debt = getFinancialData(
        "debt",
        user.id
      );

      /* ===================================================
         TOTAL PEMASUKAN
      =================================================== */

      const totalIncome = income.reduce(
        (total, item) => {
          return (
            total +
            Number(
              item.amount ??
                item.nominal ??
                item.total ??
                0
            )
          );
        },
        0
      );

      /* ===================================================
         TOTAL PENGELUARAN
      =================================================== */

      const totalExpense = expense.reduce(
        (total, item) => {
          return (
            total +
            Number(
              item.amount ??
                item.nominal ??
                item.total ??
                0
            )
          );
        },
        0
      );

      /* ===================================================
         TOTAL TABUNGAN
      =================================================== */

      const totalSavings = savings.reduce(
        (total, item) => {
          return (
            total +
            Number(
              item.currentAmount ??
                item.amount ??
                item.nominal ??
                item.total ??
                0
            )
          );
        },
        0
      );

      /* ===================================================
         TOTAL UTANG
      =================================================== */

      const totalDebt = debt
        .filter((item) => {
          const type = String(
            item.type || ""
          ).toLowerCase();

          return (
            type === "utang" ||
            type === "debt"
          );
        })
        .reduce((total, item) => {
          return (
            total +
            Number(
              item.amount ??
                item.nominal ??
                item.total ??
                0
            )
          );
        }, 0);

      /* ===================================================
         TOTAL PIUTANG
      =================================================== */

      const totalReceivable = debt
        .filter((item) => {
          const type = String(
            item.type || ""
          ).toLowerCase();

          return (
            type === "piutang" ||
            type === "receivable"
          );
        })
        .reduce((total, item) => {
          return (
            total +
            Number(
              item.amount ??
                item.nominal ??
                item.total ??
                0
            )
          );
        }, 0);

      /* ===================================================
         SALDO
      =================================================== */

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
  }, [regularUsers, refreshKey]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const summary = useMemo(() => {
    return {
      users: userData.length,

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
    };
  }, [userData]);

  /* =========================================================
     REFRESH
  ========================================================= */

  function refreshMonitoring() {
    setSelectedUser(null);

    setRefreshKey(
      (value) => value + 1
    );
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="transaction-page"
      style={{
        width: "100%",
        fontSize: "9px",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="transaction-page-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              lineHeight: "1.2",
              fontWeight: 700,
            }}
          >
            Monitoring User
          </h1>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: "10px",
              lineHeight: "1.3",
              color: "#64748b",
            }}
          >
            Pantau aktivitas keuangan seluruh user.
          </p>
        </div>

        <button
          type="button"
          className="transaction-add-button"
          onClick={refreshMonitoring}
          style={{
            height: "30px",
            padding: "0 10px",
            border: "none",
            borderRadius: "5px",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Refresh
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div
        className="transaction-summary-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        {/* TOTAL USER */}

        <div
          className="transaction-summary-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
          }}
        >
          <div
            className="transaction-summary-icon"
            style={{
              width: "30px",
              height: "30px",
              minWidth: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: "#eff6ff",
              color: "#2563eb",
            }}
          >
            <Users size={14} />
          </div>

          <div>
            <span
              style={{
                display: "block",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              Total User
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "14px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              {summary.users}
            </strong>
          </div>
        </div>

        {/* TOTAL SALDO */}

        <div
          className="transaction-summary-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
          }}
        >
          <div
            className="transaction-summary-icon neutral-icon"
            style={{
              width: "30px",
              height: "30px",
              minWidth: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: "#f8fafc",
              color: "#475569",
            }}
          >
            <Wallet size={14} />
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              Total Saldo
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {formatRupiah(summary.balance)}
            </strong>
          </div>
        </div>

        {/* TOTAL PEMASUKAN */}

        <div
          className="transaction-summary-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
          }}
        >
          <div
            className="transaction-summary-icon"
            style={{
              width: "30px",
              height: "30px",
              minWidth: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: "#ecfdf5",
              color: "#059669",
            }}
          >
            <ArrowDownLeft size={14} />
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              Total Pemasukan
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {formatRupiah(summary.income)}
            </strong>
          </div>
        </div>

        {/* TOTAL PENGELUARAN */}

        <div
          className="transaction-summary-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
          }}
        >
          <div
            className="transaction-summary-icon"
            style={{
              width: "30px",
              height: "30px",
              minWidth: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: "#fef2f2",
              color: "#dc2626",
            }}
          >
            <ArrowUpRight size={14} />
          </div>

          <div
            style={{
              minWidth: 0,
            }}
          >
            <span
              style={{
                display: "block",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              Total Pengeluaran
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "12px",
                lineHeight: "1.1",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {formatRupiah(summary.expense)}
            </strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          USER TABLE
      ===================================================== */}

      <div
        className="transaction-card"
        style={{
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          background: "#ffffff",
        }}
      >
        {/* TOOLBAR */}

        <div
          className="transaction-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "39px",
            padding: "8px 10px",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <strong
            style={{
              fontSize: "13px",
              lineHeight: "1.2",
              fontWeight: 700,
            }}
          >
            Daftar User
          </strong>
        </div>

        {/* TABLE */}

        <div
          className="transaction-table-wrapper"
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            className="transaction-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "17%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  USER
                </th>

                <th
                  style={{
                    width: "23%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  EMAIL
                </th>

                <th
                  style={{
                    width: "17%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  PEMASUKAN
                </th>

                <th
                  style={{
                    width: "17%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  PENGELUARAN
                </th>

                <th
                  style={{
                    width: "16%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  SALDO
                </th>

                <th
                  style={{
                    width: "10%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody>
              {userData.length > 0 ? (
                userData.map((user) => (
                  <tr key={user.id}>
                    {/* USER */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: "9px",
                          lineHeight: "1.2",
                          fontWeight: 600,
                          color: "#1e293b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.name}
                      </strong>
                    </td>

                    {/* EMAIL */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          fontSize: "8px",
                          lineHeight: "1.2",
                          color: "#64748b",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {user.email}
                      </span>
                    </td>

                    {/* PEMASUKAN */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "8px",
                          lineHeight: "1.2",
                          fontWeight: 600,
                          color: "#059669",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRupiah(
                          user.totalIncome
                        )}
                      </strong>
                    </td>

                    {/* PENGELUARAN */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <strong
                        className="expense-value"
                        style={{
                          fontSize: "8px",
                          lineHeight: "1.2",
                          fontWeight: 600,
                          color: "#dc2626",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRupiah(
                          user.totalExpense
                        )}
                      </strong>
                    </td>

                    {/* SALDO */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "8px",
                          lineHeight: "1.2",
                          fontWeight: 600,
                          color:
                            user.balance >= 0
                              ? "#2563eb"
                              : "#dc2626",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatRupiah(
                          user.balance
                        )}
                      </strong>
                    </td>

                    {/* AKSI */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <button
                        type="button"
                        className="transaction-edit-button"
                        title="Lihat Detail"
                        onClick={() =>
                          setSelectedUser(user)
                        }
                        style={{
                          width: "25px",
                          height: "25px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border:
                            "1px solid #dbeafe",
                          borderRadius: "4px",
                          background: "#eff6ff",
                          color: "#2563eb",
                          cursor: "pointer",
                        }}
                      >
                        <Eye size={11} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      padding: "30px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className="transaction-empty"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        color: "#94a3b8",
                      }}
                    >
                      <Users size={24} />

                      <strong
                        style={{
                          fontSize: "9px",
                          color: "#64748b",
                        }}
                      >
                        Belum ada user
                      </strong>

                      <span
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Silakan tambahkan user
                        melalui menu Input User.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          DETAIL MODAL
      ===================================================== */}

      {selectedUser && (
        <div
          className="transaction-modal-overlay"
          onClick={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedUser(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
            background:
              "rgba(15, 23, 42, 0.45)",
          }}
        >
          <div
            className="transaction-modal"
            style={{
              width: "100%",
              maxWidth: "430px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "7px",
              background: "#ffffff",
              boxShadow:
                "0 20px 45px rgba(15, 23, 42, 0.18)",
            }}
          >
            {/* HEADER */}

            <div
              className="transaction-modal-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: "1.2",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  Detail User
                </h2>

                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "8px",
                    lineHeight: "1.2",
                    color: "#64748b",
                  }}
                >
                  Informasi keuangan{" "}
                  {selectedUser.name}
                </p>
              </div>

              <button
                type="button"
                className="transaction-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
                style={{
                  width: "26px",
                  height: "26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  borderRadius: "4px",
                  background: "#f8fafc",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* DETAIL */}

            <div
              className="transaction-form-grid"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "8px",
                padding: "11px 12px",
              }}
            >
              {/* NAMA */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Nama User
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: "#334155",
                    background: "#f8fafc",
                  }}
                >
                  {selectedUser.name}
                </div>
              </div>

              {/* EMAIL */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Email
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: "#334155",
                    background: "#f8fafc",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectedUser.email}
                </div>
              </div>

              {/* PEMASUKAN */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Total Pemasukan
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: "#059669",
                    fontWeight: 600,
                    background: "#f8fafc",
                  }}
                >
                  {formatRupiah(
                    selectedUser.totalIncome
                  )}
                </div>
              </div>

              {/* PENGELUARAN */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Total Pengeluaran
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: "#dc2626",
                    fontWeight: 600,
                    background: "#f8fafc",
                  }}
                >
                  {formatRupiah(
                    selectedUser.totalExpense
                  )}
                </div>
              </div>

              {/* SALDO */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Sisa Saldo
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color:
                      selectedUser.balance >= 0
                        ? "#2563eb"
                        : "#dc2626",
                    fontWeight: 600,
                    background: "#f8fafc",
                  }}
                >
                  {formatRupiah(
                    selectedUser.balance
                  )}
                </div>
              </div>

              {/* TABUNGAN */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Total Tabungan
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: "#7c3aed",
                    fontWeight: 600,
                    background: "#f8fafc",
                  }}
                >
                  {formatRupiah(
                    selectedUser.totalSavings
                  )}
                </div>
              </div>

              {/* UTANG */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Total Utang
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: "#dc2626",
                    fontWeight: 600,
                    background: "#f8fafc",
                  }}
                >
                  {formatRupiah(
                    selectedUser.totalDebt
                  )}
                </div>
              </div>

              {/* PIUTANG */}

              <div
                className="transaction-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Total Piutang
                </label>

                <div
                  className="monitoring-detail-value"
                  style={{
                    minHeight: "30px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 8px",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: "4px",
                    fontSize: "8px",
                    color: "#059669",
                    fontWeight: 600,
                    background: "#f8fafc",
                  }}
                >
                  {formatRupiah(
                    selectedUser.totalReceivable
                  )}
                </div>
              </div>
            </div>

            {/* FOOTER */}

            <div
              className="transaction-modal-footer"
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "9px 12px",
                borderTop:
                  "1px solid #f1f5f9",
              }}
            >
              <button
                type="button"
                className="transaction-cancel-button"
                onClick={() =>
                  setSelectedUser(null)
                }
                style={{
                  height: "28px",
                  padding: "0 10px",
                  border:
                    "1px solid #dbe1e8",
                  borderRadius: "4px",
                  background: "#ffffff",
                  color: "#475569",
                  fontSize: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
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