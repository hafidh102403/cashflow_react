import { useMemo } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  HandCoins,
  TrendingUp,
  TrendingDown,
  CalendarDays,
  ReceiptText,
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


/* =========================================================
   STORAGE KEY
========================================================= */

const INCOME_STORAGE_KEY = "cashflow_income";
const EXPENSE_STORAGE_KEY = "cashflow_expense";


/* =========================================================
   DATA DEFAULT
   HANYA DIGUNAKAN JIKA LOCAL STORAGE KOSONG
========================================================= */

const defaultIncome = [
  {
    id: 1,
    title: "Gaji Bulanan",
    category: "Gaji",
    date: "2026-09-01",
    amount: 8500000,
    description: "Gaji bulanan",
  },
  {
    id: 2,
    title: "Freelance Website",
    category: "Freelance",
    date: "2026-09-03",
    amount: 2500000,
    description: "Project website",
  },
  {
    id: 3,
    title: "Bonus",
    category: "Bonus",
    date: "2026-09-07",
    amount: 1500000,
    description: "Bonus pekerjaan",
  },
  {
    id: 4,
    title: "Penjualan",
    category: "Penjualan",
    date: "2026-09-11",
    amount: 750000,
    description: "Hasil penjualan",
  },
];


const defaultExpense = [
  {
    id: 1,
    title: "Belanja Bulanan",
    category: "Kebutuhan",
    date: "2026-09-04",
    amount: 1250000,
    description: "Belanja kebutuhan bulanan",
  },
  {
    id: 2,
    title: "Transportasi",
    category: "Transportasi",
    date: "2026-09-05",
    amount: 450000,
    description: "Transportasi harian",
  },
  {
    id: 3,
    title: "Makan & Minum",
    category: "Makanan",
    date: "2026-09-08",
    amount: 320000,
    description: "Makan dan minum",
  },
  {
    id: 4,
    title: "Hiburan",
    category: "Hiburan",
    date: "2026-09-10",
    amount: 700000,
    description: "Kebutuhan hiburan",
  },
  {
    id: 5,
    title: "Keperluan Lain",
    category: "Lainnya",
    date: "2026-09-12",
    amount: 500000,
    description: "Keperluan lainnya",
  },
];


/* =========================================================
   FORMAT RUPIAH
========================================================= */

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}


/* =========================================================
   FORMAT TANGGAL
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
   BACA LOCAL STORAGE
========================================================= */

function getStorageData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);

    if (!saved) {
      return fallback;
    }

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : fallback;

  } catch {
    return fallback;
  }
}


/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {

  /* =======================================================
     AMBIL DATA TERBARU DARI LOCAL STORAGE
  ======================================================= */

  const incomeTransactions = useMemo(() => {
    return getStorageData(
      INCOME_STORAGE_KEY,
      defaultIncome
    );
  }, []);


  const expenseTransactions = useMemo(() => {
    return getStorageData(
      EXPENSE_STORAGE_KEY,
      defaultExpense
    );
  }, []);


  /* =======================================================
     TOTAL PEMASUKAN
  ======================================================= */

  const totalIncome = useMemo(() => {
    return incomeTransactions.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );
  }, [incomeTransactions]);


  /* =======================================================
     TOTAL PENGELUARAN
  ======================================================= */

  const totalExpense = useMemo(() => {
    return expenseTransactions.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );
  }, [expenseTransactions]);


  /* =======================================================
     SALDO
  ======================================================= */

  const balance = totalIncome - totalExpense;


  /* =======================================================
     TOTAL TABUNGAN
  ======================================================= */

  const totalSavings = 23900000;


  /* =======================================================
     TOTAL UTANG
  ======================================================= */

  const totalDebt = 8000000;


  /* =======================================================
     RASIO PENGELUARAN
  ======================================================= */

  const expenseRatio =
    totalIncome > 0
      ? Math.round(
          (totalExpense / totalIncome) * 100
        )
      : 0;


  /* =======================================================
     SEMUA TRANSAKSI
  ======================================================= */

  const allTransactions = useMemo(() => {

    const incomes = incomeTransactions.map((item) => ({
      ...item,
      type: "income",
    }));

    const expenses = expenseTransactions.map((item) => ({
      ...item,
      type: "expense",
    }));

    return [
      ...incomes,
      ...expenses,
    ].sort(
      (a, b) =>
        new Date(`${b.date}T00:00:00`) -
        new Date(`${a.date}T00:00:00`)
    );

  }, [
    incomeTransactions,
    expenseTransactions,
  ]);


  /* =======================================================
     TRANSAKSI TERBARU
  ======================================================= */

  const latestTransactions =
    allTransactions.slice(0, 6);


  /* =======================================================
     CHART DATA
  ======================================================= */

  const chartData = useMemo(() => {

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
            const date = new Date(
              `${item.date}T00:00:00`
            );

            return (
              String(
                date.getDate()
              ).padStart(2, "0") === day
            );
          })
          .reduce(
            (total, item) =>
              total + Number(item.amount || 0),
            0
          );


      const expenseForDay =
        expenseTransactions
          .filter((item) => {
            const date = new Date(
              `${item.date}T00:00:00`
            );

            return (
              String(
                date.getDate()
              ).padStart(2, "0") === day
            );
          })
          .reduce(
            (total, item) =>
              total + Number(item.amount || 0),
            0
          );


      return {
        day,
        income: incomeForDay,
        expense: expenseForDay,
        balance:
          incomeForDay - expenseForDay,
      };

    });

  }, [
    incomeTransactions,
    expenseTransactions,
  ]);


  /* =======================================================
     EXPENSE CATEGORY
  ======================================================= */

  const expenseCategories = useMemo(() => {

    const categoryMap = {};

    expenseTransactions.forEach((item) => {

      const category =
        item.category || "Lainnya";

      if (!categoryMap[category]) {
        categoryMap[category] = 0;
      }

      categoryMap[category] +=
        Number(item.amount || 0);

    });


    return Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage:
          totalExpense > 0
            ? Math.round(
                (amount / totalExpense) * 100
              )
            : 0,
      }))
      .sort(
        (a, b) => b.amount - a.amount
      );

  }, [
    expenseTransactions,
    totalExpense,
  ]);


  return (

    <div className="dashboard-page">

      {/* ===================================================
          HEADER
      =================================================== */}

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
            14 September 2026
          </span>

        </div>

      </div>


      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

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
              {formatRupiah(balance)}
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
              {formatRupiah(totalIncome)}
            </strong>

            <small>
              {incomeTransactions.length} transaksi
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
              {formatRupiah(totalExpense)}
            </strong>

            <small>
              {expenseTransactions.length} transaksi
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
              {formatRupiah(totalSavings)}
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
              {formatRupiah(totalDebt)}
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


      {/* ===================================================
          MAIN GRID
      =================================================== */}

      <div className="dashboard-main-grid">


        {/* =================================================
            CASH FLOW
        ================================================= */}

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

                    if (value >= 1000000) {
                      return `${(
                        value / 1000000
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


          {/* LEGEND */}

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


        {/* =================================================
            EXPENSE CATEGORY
        ================================================= */}

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
                {formatRupiah(totalExpense)}
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


      {/* ===================================================
          LOWER GRID
      =================================================== */}

      <div className="dashboard-lower-grid">


        {/* =================================================
            LATEST TRANSACTIONS
        ================================================= */}

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

              latestTransactions.map((item) => {

                const isIncome =
                  item.type === "income";

                return (

                  <div
                    className="dashboard-transaction"
                    key={`${item.type}-${item.id}`}
                  >

                    {/* ICON */}

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


                    {/* CONTENT */}

                    <div className="dashboard-transaction-info">

                      <strong>
                        {item.title}
                      </strong>

                      <span>
                        {formatDate(item.date)}
                        {" · "}
                        {item.category}
                      </span>

                    </div>


                    {/* AMOUNT */}

                    <strong
                      className={
                        isIncome
                          ? "dashboard-income-value"
                          : "dashboard-expense-value"
                      }
                    >

                      {isIncome ? "+" : "-"}

                      {" "}

                      {formatRupiah(
                        Number(item.amount || 0)
                      )}

                    </strong>

                  </div>

                );

              })

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


        {/* =================================================
            FINANCIAL SUMMARY
        ================================================= */}

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


            {/* PEMASUKAN */}

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
                {formatRupiah(totalIncome)}
              </strong>

            </div>


            {/* PENGELUARAN */}

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
                {formatRupiah(totalExpense)}
              </strong>

            </div>


            {/* SALDO */}

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
                {formatRupiah(balance)}
              </strong>

            </div>


            {/* RASIO */}

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

export default Dashboard;