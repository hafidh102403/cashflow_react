import { useMemo } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  HandCoins,
  TrendingDown,
  CalendarDays,
  ReceiptText,
  Users,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import {
  getCurrentUser,
  getUsers,
  getUserData,
  initializeUserData,
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
   FORMAT DATE
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}


/* =========================================================
   ADMIN DASHBOARD
========================================================= */

function AdminDashboard({ users }) {

  /* =======================================================
     ONLY NORMAL USERS
  ======================================================= */

  const normalUsers = useMemo(() => {
    return users.filter(
      (user) => user.role === "user"
    );
  }, [users]);


  /* =======================================================
     FINANCIAL DATA EACH USER
  ======================================================= */

  const usersFinancialData = useMemo(() => {

    return normalUsers.map((user) => {

      const incomeTransactions =
        getUserData(
          "income",
          user.id
        );

      const expenseTransactions =
        getUserData(
          "expense",
          user.id
        );

      const savingsTransactions =
        getUserData(
          "savings",
          user.id
        );

      const debtTransactions =
        getUserData(
          "debt",
          user.id
        );


      /* ===============================================
         INCOME
      =============================================== */

      const totalIncome =
        incomeTransactions.reduce(
          (total, item) =>
            total +
            Number(item.amount || 0),
          0
        );


      /* ===============================================
         EXPENSE
      =============================================== */

      const totalExpense =
        expenseTransactions.reduce(
          (total, item) =>
            total +
            Number(item.amount || 0),
          0
        );


      /* ===============================================
         SAVINGS
      =============================================== */

      const totalSavings =
        savingsTransactions.reduce(
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


      /* ===============================================
         DEBT
      =============================================== */

      const totalDebt =
        debtTransactions
          .filter((item) => {

            const type =
              String(
                item.type || ""
              ).toLowerCase();

            return (
              type === "utang" ||
              type === "debt"
            );

          })
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


      /* ===============================================
         BALANCE
      =============================================== */

      const balance =
        totalIncome -
        totalExpense;


      return {
        ...user,

        incomeTransactions,
        expenseTransactions,
        savingsTransactions,
        debtTransactions,

        totalIncome,
        totalExpense,
        totalSavings,
        totalDebt,
        balance,
      };

    });

  }, [normalUsers]);


  /* =======================================================
     TOTAL INCOME ALL USERS
  ======================================================= */

  const totalIncomeAllUsers =
    useMemo(() => {

      return usersFinancialData.reduce(
        (total, user) =>
          total +
          user.totalIncome,
        0
      );

    }, [usersFinancialData]);


  /* =======================================================
     TOTAL EXPENSE ALL USERS
  ======================================================= */

  const totalExpenseAllUsers =
    useMemo(() => {

      return usersFinancialData.reduce(
        (total, user) =>
          total +
          user.totalExpense,
        0
      );

    }, [usersFinancialData]);


  /* =======================================================
     TOTAL BALANCE ALL USERS
  ======================================================= */

  const totalBalanceAllUsers =
    totalIncomeAllUsers -
    totalExpenseAllUsers;


  /* =======================================================
     TOTAL TRANSACTIONS
  ======================================================= */

  const totalTransactions =
    useMemo(() => {

      return usersFinancialData.reduce(
        (total, user) =>
          total +
          user.incomeTransactions.length +
          user.expenseTransactions.length,
        0
      );

    }, [usersFinancialData]);


  /* =======================================================
     AVERAGE BALANCE
  ======================================================= */

  const averageBalance =
    normalUsers.length > 0
      ? totalBalanceAllUsers /
        normalUsers.length
      : 0;


  /* =======================================================
     RENDER ADMIN
  ======================================================= */

  return (

    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <h1>
            Dashboard Admin
          </h1>

          <p>
            Ringkasan kondisi keuangan seluruh user.
          </p>

        </div>

        <div className="dashboard-date">

          <CalendarDays size={14} />

          <span>
            {new Intl.DateTimeFormat(
              "id-ID",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            ).format(new Date())}
          </span>

        </div>

      </div>


      {/* =================================================
          ADMIN SUMMARY
      ================================================= */}

      <div className="dashboard-summary-grid">

        {/* TOTAL USER */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon balance-icon">

            <Users size={18} />

          </div>

          <div>

            <span>
              Total User
            </span>

            <strong>
              {normalUsers.length}
            </strong>

            <small>
              User terdaftar
            </small>

          </div>

        </div>


        {/* TOTAL PEMASUKAN */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon income-icon">

            <ArrowDownLeft size={18} />

          </div>

          <div>

            <span>
              Total Pemasukan
            </span>

            <strong>
              {formatRupiah(
                totalIncomeAllUsers
              )}
            </strong>

            <small>
              Semua user
            </small>

          </div>

        </div>


        {/* TOTAL PENGELUARAN */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon expense-icon">

            <ArrowUpRight size={18} />

          </div>

          <div>

            <span>
              Total Pengeluaran
            </span>

            <strong>
              {formatRupiah(
                totalExpenseAllUsers
              )}
            </strong>

            <small>
              Semua user
            </small>

          </div>

        </div>


        {/* TOTAL SALDO */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon savings-icon">

            <Wallet size={18} />

          </div>

          <div>

            <span>
              Total Saldo
            </span>

            <strong>
              {formatRupiah(
                totalBalanceAllUsers
              )}
            </strong>

            <small>
              Saldo seluruh user
            </small>

          </div>

        </div>


        {/* TOTAL TRANSAKSI */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon debt-icon">

            <ReceiptText size={18} />

          </div>

          <div>

            <span>
              Total Transaksi
            </span>

            <strong>
              {totalTransactions}
            </strong>

            <small>
              Semua transaksi
            </small>

          </div>

        </div>


        {/* RATA RATA SALDO */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon ratio-icon">

            <TrendingDown size={18} />

          </div>

          <div>

            <span>
              Rata-rata Saldo
            </span>

            <strong>
              {formatRupiah(
                averageBalance
              )}
            </strong>

            <small>
              Per user
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          RINGKASAN USER
      ================================================= */}

      <div className="dashboard-panel">

        <div className="dashboard-panel-header">

          <div>

            <h2>
              Ringkasan Keuangan User
            </h2>

            <p>
              Pemasukan, pengeluaran, dan saldo setiap user.
            </p>

          </div>

        </div>


        <div
          className="dashboard-user-summary-list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
          }}
        >

          {usersFinancialData.length > 0 ? (

            usersFinancialData.map(
              (user) => {

                const expenseRatio =
                  user.totalIncome > 0
                    ? Math.round(
                        (user.totalExpense /
                          user.totalIncome) *
                          100
                      )
                    : 0;


                return (

                  <div
                    key={user.id}
                    className="dashboard-user-summary"
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "minmax(110px, 1.2fr) repeat(3, minmax(100px, 1fr))",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 10px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      background: "#ffffff",
                    }}
                  >

                    {/* =================================
                        USER
                    ================================= */}

                    <div>

                      <strong
                        style={{
                          display: "block",
                          fontSize: "10px",
                          fontWeight: "600",
                          lineHeight: "1.2",
                        }}
                      >
                        {user.name}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "1px",
                          fontSize: "8px",
                          lineHeight: "1.2",
                          color: "#64748b",
                        }}
                      >
                        {user.email}
                      </span>

                      <small
                        style={{
                          display: "block",
                          marginTop: "2px",
                          fontSize: "7px",
                          lineHeight: "1.2",
                          color: "#94a3b8",
                        }}
                      >
                        Rasio pengeluaran{" "}
                        {expenseRatio}%
                      </small>

                    </div>


                    {/* =================================
                        PEMASUKAN
                    ================================= */}

                    <div>

                      <span
                        style={{
                          display: "block",
                          fontSize: "7px",
                          lineHeight: "1.2",
                          color: "#64748b",
                        }}
                      >
                        Pemasukan
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "2px",
                          fontSize: "9px",
                          fontWeight: "600",
                          lineHeight: "1.2",
                          color: "#059669",
                        }}
                      >
                        {formatRupiah(
                          user.totalIncome
                        )}
                      </strong>

                    </div>


                    {/* =================================
                        PENGELUARAN
                    ================================= */}

                    <div>

                      <span
                        style={{
                          display: "block",
                          fontSize: "7px",
                          lineHeight: "1.2",
                          color: "#64748b",
                        }}
                      >
                        Pengeluaran
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "2px",
                          fontSize: "9px",
                          fontWeight: "600",
                          lineHeight: "1.2",
                          color: "#dc2626",
                        }}
                      >
                        {formatRupiah(
                          user.totalExpense
                        )}
                      </strong>

                    </div>


                    {/* =================================
                        SALDO
                    ================================= */}

                    <div>

                      <span
                        style={{
                          display: "block",
                          fontSize: "7px",
                          lineHeight: "1.2",
                          color: "#64748b",
                        }}
                      >
                        Saldo
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "2px",
                          fontSize: "9px",
                          fontWeight: "600",
                          lineHeight: "1.2",
                          color:
                            user.balance >= 0
                              ? "#2563eb"
                              : "#dc2626",
                        }}
                      >
                        {formatRupiah(
                          user.balance
                        )}
                      </strong>

                    </div>

                  </div>

                );

              }
            )

          ) : (

            <div className="dashboard-empty">

              <Users size={24} />

              <strong>
                Belum ada user
              </strong>

              <span>
                Tambahkan user terlebih dahulu.
              </span>

            </div>

          )}

        </div>

      </div>


      {/* =================================================
          TABUNGAN & UTANG
      ================================================= */}

      <div className="dashboard-lower-grid">

        {/* TABUNGAN */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Total Tabungan User
              </h2>

              <p>
                Total dana tabungan seluruh user.
              </p>

            </div>

          </div>

          <div className="dashboard-financial-summary">

            {usersFinancialData.map(
              (user) => (

                <div
                  className="dashboard-financial-row"
                  key={user.id}
                >

                  <div>

                    <span className="financial-row-icon income">

                      <PiggyBank size={13} />

                    </span>

                    <span>
                      {user.name}
                    </span>

                  </div>

                  <strong className="positive">

                    {formatRupiah(
                      user.totalSavings
                    )}

                  </strong>

                </div>

              )
            )}

          </div>

        </div>


        {/* UTANG */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Total Utang User
              </h2>

              <p>
                Total utang yang tercatat.
              </p>

            </div>

          </div>

          <div className="dashboard-financial-summary">

            {usersFinancialData.map(
              (user) => (

                <div
                  className="dashboard-financial-row"
                  key={user.id}
                >

                  <div>

                    <span className="financial-row-icon expense">

                      <HandCoins size={13} />

                    </span>

                    <span>
                      {user.name}
                    </span>

                  </div>

                  <strong className="negative">

                    {formatRupiah(
                      user.totalDebt
                    )}

                  </strong>

                </div>

              )
            )}

          </div>

        </div>

      </div>

    </div>

  );
}


/* =========================================================
   USER DASHBOARD
========================================================= */

function UserDashboard({ currentUser }) {

  /* =======================================================
     INITIALIZE
  ======================================================= */

  initializeUserData(
    currentUser.id
  );


  /* =======================================================
     DATA
  ======================================================= */

  const incomeTransactions =
    useMemo(() => {

      return getUserData(
        "income",
        currentUser.id
      );

    }, [currentUser.id]);


  const expenseTransactions =
    useMemo(() => {

      return getUserData(
        "expense",
        currentUser.id
      );

    }, [currentUser.id]);


  const savingsTransactions =
    useMemo(() => {

      return getUserData(
        "savings",
        currentUser.id
      );

    }, [currentUser.id]);


  const debtTransactions =
    useMemo(() => {

      return getUserData(
        "debt",
        currentUser.id
      );

    }, [currentUser.id]);


  /* =======================================================
     TOTAL INCOME
  ======================================================= */

  const totalIncome =
    useMemo(() => {

      return incomeTransactions.reduce(
        (total, item) =>
          total +
          Number(item.amount || 0),
        0
      );

    }, [incomeTransactions]);


  /* =======================================================
     TOTAL EXPENSE
  ======================================================= */

  const totalExpense =
    useMemo(() => {

      return expenseTransactions.reduce(
        (total, item) =>
          total +
          Number(item.amount || 0),
        0
      );

    }, [expenseTransactions]);


  /* =======================================================
     BALANCE
  ======================================================= */

  const balance =
    totalIncome -
    totalExpense;


  /* =======================================================
     SAVINGS
  ======================================================= */

  const totalSavings =
    useMemo(() => {

      return savingsTransactions.reduce(
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

    }, [savingsTransactions]);


  /* =======================================================
     DEBT
  ======================================================= */

  const totalDebt =
    useMemo(() => {

      return debtTransactions
        .filter((item) => {

          const type =
            String(
              item.type || ""
            ).toLowerCase();

          return (
            type === "utang" ||
            type === "debt"
          );

        })
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

    }, [debtTransactions]);


  /* =======================================================
     EXPENSE RATIO
  ======================================================= */

  const expenseRatio =
    totalIncome > 0
      ? Math.round(
          (totalExpense /
            totalIncome) *
            100
        )
      : 0;


  /* =======================================================
     ALL TRANSACTIONS
  ======================================================= */

  const allTransactions =
    useMemo(() => {

      const incomes =
        incomeTransactions.map(
          (item) => ({
            ...item,
            type: "income",
          })
        );

      const expenses =
        expenseTransactions.map(
          (item) => ({
            ...item,
            type: "expense",
          })
        );

      return [
        ...incomes,
        ...expenses,
      ].sort(
        (a, b) =>
          new Date(
            `${b.date}T00:00:00`
          ) -
          new Date(
            `${a.date}T00:00:00`
          )
      );

    }, [
      incomeTransactions,
      expenseTransactions,
    ]);


  /* =======================================================
     LATEST TRANSACTIONS
  ======================================================= */

  const latestTransactions =
    allTransactions.slice(
      0,
      6
    );


  /* =======================================================
     CHART
  ======================================================= */

  const chartData =
    useMemo(() => {

      const days = [
        "01",
        "04",
        "07",
        "10",
        "13",
        "16",
        "19",
        "22",
        "25",
        "28",
        "31",
      ];

      return days.map((day) => {

        const incomeForDay =
          incomeTransactions
            .filter((item) => {

              const date =
                new Date(
                  `${item.date}T00:00:00`
                );

              return (
                String(
                  date.getDate()
                ).padStart(2, "0") ===
                day
              );

            })
            .reduce(
              (total, item) =>
                total +
                Number(
                  item.amount || 0
                ),
              0
            );


        const expenseForDay =
          expenseTransactions
            .filter((item) => {

              const date =
                new Date(
                  `${item.date}T00:00:00`
                );

              return (
                String(
                  date.getDate()
                ).padStart(2, "0") ===
                day
              );

            })
            .reduce(
              (total, item) =>
                total +
                Number(
                  item.amount || 0
                ),
              0
            );


        return {
          day,
          income: incomeForDay,
          expense: expenseForDay,
          balance:
            incomeForDay -
            expenseForDay,
        };

      });

    }, [
      incomeTransactions,
      expenseTransactions,
    ]);


  /* =======================================================
     EXPENSE CATEGORIES
  ======================================================= */

  const expenseCategories =
    useMemo(() => {

      const categoryMap = {};

      expenseTransactions.forEach(
        (item) => {

          const category =
            item.category ||
            "Lainnya";

          if (
            !categoryMap[category]
          ) {
            categoryMap[category] = 0;
          }

          categoryMap[category] +=
            Number(
              item.amount || 0
            );

        }
      );

      return Object.entries(
        categoryMap
      )
        .map(
          ([category, amount]) => ({
            category,
            amount,
            percentage:
              totalExpense > 0
                ? Math.round(
                    (amount /
                      totalExpense) *
                      100
                  )
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.amount -
            a.amount
        );

    }, [
      expenseTransactions,
      totalExpense,
    ]);


  /* =======================================================
     RENDER USER
  ======================================================= */

  return (

    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="dashboard-header">

        <div>

          <h1>
            Dashboard
          </h1>

          <p>
            Ringkasan kondisi keuangan kamu.
          </p>

        </div>

        <div className="dashboard-date">

          <CalendarDays size={14} />

          <span>
            {new Intl.DateTimeFormat(
              "id-ID",
              {
                day: "2-digit",
                month: "long",
                year: "numeric",
              }
            ).format(new Date())}
          </span>

        </div>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="dashboard-summary-grid">

        {/* SALDO */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon balance-icon">

            <Wallet size={18} />

          </div>

          <div>

            <span>
              Saldo Saat Ini
            </span>

            <strong>
              {formatRupiah(
                balance
              )}
            </strong>

            <small>
              Total saldo bersih
            </small>

          </div>

        </div>


        {/* PEMASUKAN */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon income-icon">

            <ArrowDownLeft size={18} />

          </div>

          <div>

            <span>
              Total Pemasukan
            </span>

            <strong>
              {formatRupiah(
                totalIncome
              )}
            </strong>

            <small>
              {incomeTransactions.length}{" "}
              transaksi
            </small>

          </div>

        </div>


        {/* PENGELUARAN */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon expense-icon">

            <ArrowUpRight size={18} />

          </div>

          <div>

            <span>
              Total Pengeluaran
            </span>

            <strong>
              {formatRupiah(
                totalExpense
              )}
            </strong>

            <small>
              {expenseTransactions.length}{" "}
              transaksi
            </small>

          </div>

        </div>


        {/* TABUNGAN */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon savings-icon">

            <PiggyBank size={18} />

          </div>

          <div>

            <span>
              Total Tabungan
            </span>

            <strong>
              {formatRupiah(
                totalSavings
              )}
            </strong>

            <small>
              Total dana tersimpan
            </small>

          </div>

        </div>


        {/* UTANG */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon debt-icon">

            <HandCoins size={18} />

          </div>

          <div>

            <span>
              Total Utang
            </span>

            <strong>
              {formatRupiah(
                totalDebt
              )}
            </strong>

            <small>
              Utang tercatat
            </small>

          </div>

        </div>


        {/* RASIO */}

        <div className="dashboard-summary-card">

          <div className="dashboard-summary-icon ratio-icon">

            <TrendingDown size={18} />

          </div>

          <div>

            <span>
              Rasio Pengeluaran
            </span>

            <strong>
              {expenseRatio}%
            </strong>

            <small>
              Dari total pemasukan
            </small>

          </div>

        </div>

      </div>


      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="dashboard-main-grid">

        {/* CASH FLOW */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Arus Kas
              </h2>

              <p>
                Perbandingan pemasukan dan pengeluaran
              </p>

            </div>

            <span className="dashboard-panel-badge">
              September 2026
            </span>

          </div>


          <div className="dashboard-chart">

            <ResponsiveContainer
              width="100%"
              height={230}
            >

              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 5,
                  left: 5,
                  bottom: 0,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="day"
                  tick={{
                    fontSize: 8,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 8,
                  }}
                  tickFormatter={(value) => {

                    if (
                      value >= 1000000
                    ) {
                      return `${(
                        value /
                        1000000
                      ).toFixed(0)}M`;
                    }

                    return value;

                  }}
                />

                <Tooltip
                  formatter={(value) =>
                    formatRupiah(value)
                  }
                />

                <Area
                  type="monotone"
                  dataKey="income"
                  name="Pemasukan"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.08}
                />

                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.06}
                />

                <Area
                  type="monotone"
                  dataKey="balance"
                  name="Saldo"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.05}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>


          <div className="dashboard-chart-legend">

            <span>
              <i className="legend-income"></i>
              Pemasukan
            </span>

            <span>
              <i className="legend-expense"></i>
              Pengeluaran
            </span>

            <span>
              <i className="legend-balance"></i>
              Saldo
            </span>

          </div>

        </div>


        {/* CATEGORY */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Pengeluaran Berdasarkan Kategori
              </h2>

              <p>
                Distribusi pengeluaran
              </p>

            </div>

          </div>


          <div className="dashboard-category-content">

            <div className="dashboard-category-total">

              <span>
                Total
              </span>

              <strong>
                {formatRupiah(
                  totalExpense
                )}
              </strong>

            </div>


            <div className="dashboard-category-list">

              {expenseCategories.length > 0 ? (

                expenseCategories.map(
                  (item, index) => (

                    <div
                      className="dashboard-category-item"
                      key={item.category}
                    >

                      <div className="dashboard-category-name">

                        <span
                          className={`category-dot category-dot-${index % 5}`}
                        />

                        <span>
                          {item.category}
                        </span>

                      </div>


                      <div className="dashboard-category-value">

                        <strong>
                          {formatRupiah(
                            item.amount
                          )}
                        </strong>

                        <small>
                          {item.percentage}%
                        </small>

                      </div>

                    </div>

                  )
                )

              ) : (

                <div className="dashboard-empty">

                  Belum ada pengeluaran.

                </div>

              )}

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          LOWER GRID
      ================================================= */}

      <div className="dashboard-lower-grid">

        {/* TRANSAKSI */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Transaksi Terakhir
              </h2>

              <p>
                Aktivitas transaksi terbaru
              </p>

            </div>

          </div>


          <div className="dashboard-transactions">

            {latestTransactions.length > 0 ? (

              latestTransactions.map(
                (item) => {

                  const isIncome =
                    item.type ===
                    "income";

                  return (

                    <div
                      className="dashboard-transaction"
                      key={`${item.type}-${item.id}`}
                    >

                      <div
                        className={`dashboard-transaction-icon ${
                          isIncome
                            ? "dashboard-income"
                            : "dashboard-expense"
                        }`}
                      >

                        {isIncome ? (
                          <ArrowDownLeft size={14} />
                        ) : (
                          <ArrowUpRight size={14} />
                        )}

                      </div>


                      <div className="dashboard-transaction-info">

                        <strong>
                          {item.title}
                        </strong>

                        <span>
                          {formatDate(
                            item.date
                          )}
                          {" · "}
                          {item.category}
                        </span>

                      </div>


                      <strong
                        className={
                          isIncome
                            ? "dashboard-income-value"
                            : "dashboard-expense-value"
                        }
                      >

                        {isIncome
                          ? "+"
                          : "-"}

                        {" "}

                        {formatRupiah(
                          Number(
                            item.amount ||
                              0
                          )
                        )}

                      </strong>

                    </div>

                  );

                }
              )

            ) : (

              <div className="dashboard-empty">

                <ReceiptText size={24} />

                <strong>
                  Belum ada transaksi
                </strong>

                <span>
                  Tambahkan transaksi terlebih dahulu.
                </span>

              </div>

            )}

          </div>

        </div>


        {/* RINGKASAN KEUANGAN */}

        <div className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>

              <h2>
                Ringkasan Keuangan
              </h2>

              <p>
                Kondisi keuangan saat ini
              </p>

            </div>

          </div>


          <div className="dashboard-financial-summary">

            <div className="dashboard-financial-row">

              <div>

                <span className="financial-row-icon income">

                  <ArrowDownLeft size={13} />

                </span>

                <span>
                  Total Pemasukan
                </span>

              </div>

              <strong className="positive">

                {formatRupiah(
                  totalIncome
                )}

              </strong>

            </div>


            <div className="dashboard-financial-row">

              <div>

                <span className="financial-row-icon expense">

                  <ArrowUpRight size={13} />

                </span>

                <span>
                  Total Pengeluaran
                </span>

              </div>

              <strong className="negative">

                {formatRupiah(
                  totalExpense
                )}

              </strong>

            </div>


            <div className="dashboard-financial-row total-row">

              <div>

                <span className="financial-row-icon balance">

                  <Wallet size={13} />

                </span>

                <span>
                  Saldo Bersih
                </span>

              </div>

              <strong
                className={
                  balance >= 0
                    ? "positive"
                    : "negative"
                }
              >

                {formatRupiah(
                  balance
                )}

              </strong>

            </div>


            <div className="dashboard-ratio">

              <div className="dashboard-ratio-header">

                <span>
                  Rasio Pengeluaran
                </span>

                <strong>
                  {expenseRatio}%
                </strong>

              </div>


              <div className="dashboard-ratio-track">

                <div
                  className="dashboard-ratio-bar"
                  style={{
                    width: `${Math.min(
                      expenseRatio,
                      100
                    )}%`,
                  }}
                />

              </div>


              <small>
                Pengeluaran dibandingkan total pemasukan
              </small>

            </div>

          </div>

        </div>

      </div>

    </div>

  );
}


/* =========================================================
   MAIN DASHBOARD
========================================================= */

function Dashboard() {

  const currentUser =
    getCurrentUser();


  /* =======================================================
     BELUM LOGIN
  ======================================================= */

  if (!currentUser) {
    return null;
  }


  /* =======================================================
     ADMIN
     
     HANYA ADMIN YANG MELIHAT DATA
     SELURUH USER
  ======================================================= */

  if (
    currentUser.role ===
    "admin"
  ) {

    const users =
      getUsers();

    users
      .filter(
        (user) =>
          user.role ===
          "user"
      )
      .forEach(
        (user) =>
          initializeUserData(
            user.id
          )
      );

    return (
      <AdminDashboard
        users={users}
      />
    );

  }


  /* =======================================================
     USER
     
     HANYA DATA USER YANG LOGIN
  ======================================================= */

  return (
    <UserDashboard
      currentUser={
        currentUser
      }
    />
  );
}


export default Dashboard;