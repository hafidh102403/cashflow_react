import { useMemo, useState } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  TrendingDown,
  Download,
  CalendarDays,
  ReceiptText,
} from "lucide-react";


/* =========================================================
   STORAGE
========================================================= */

const INCOME_STORAGE_KEY = "cashflow_income";
const EXPENSE_STORAGE_KEY = "cashflow_expense";


/* =========================================================
   DEFAULT DATA
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
   LOCAL STORAGE
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
   REPORT
========================================================= */

function Report() {

  const [period, setPeriod] = useState("bulan");

  const [transactionType, setTransactionType] =
    useState("semua");


  /* =======================================================
     DATA PEMASUKAN
  ======================================================= */

  const incomeTransactions = useMemo(() => {
    return getStorageData(
      INCOME_STORAGE_KEY,
      defaultIncome
    );
  }, []);


  /* =======================================================
     DATA PENGELUARAN
  ======================================================= */

  const expenseTransactions = useMemo(() => {
    return getStorageData(
      EXPENSE_STORAGE_KEY,
      defaultExpense
    );
  }, []);


  /* =======================================================
     GABUNGKAN DATA
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
    ];

  }, [
    incomeTransactions,
    expenseTransactions,
  ]);


  /* =======================================================
     FILTER TRANSAKSI
  ======================================================= */

  const filteredTransactions = useMemo(() => {

    const today =
      new Date("2026-09-14T00:00:00");


    return allTransactions.filter((item) => {

      const itemDate =
        new Date(`${item.date}T00:00:00`);


      let matchesPeriod = true;


      /* BULAN INI */

      if (period === "bulan") {

        matchesPeriod =
          itemDate.getFullYear() ===
            today.getFullYear() &&
          itemDate.getMonth() ===
            today.getMonth();

      }


      /* 3 BULAN */

      if (period === "3bulan") {

        const threeMonthsAgo =
          new Date(today);

        threeMonthsAgo.setMonth(
          today.getMonth() - 3
        );

        matchesPeriod =
          itemDate >= threeMonthsAgo;

      }


      /* TAHUN */

      if (period === "tahun") {

        matchesPeriod =
          itemDate.getFullYear() ===
          today.getFullYear();

      }


      /* TYPE */

      const matchesType =
        transactionType === "semua" ||
        item.type === transactionType;


      return (
        matchesPeriod &&
        matchesType
      );

    });

  }, [
    allTransactions,
    period,
    transactionType,
  ]);


  /* =======================================================
     TOTAL PEMASUKAN
  ======================================================= */

  const totalIncome = useMemo(() => {

    return filteredTransactions
      .filter(
        (item) =>
          item.type === "income"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

  }, [filteredTransactions]);


  /* =======================================================
     TOTAL PENGELUARAN
  ======================================================= */

  const totalExpense = useMemo(() => {

    return filteredTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount || 0),
        0
      );

  }, [filteredTransactions]);


  /* =======================================================
     SALDO BERSIH
  ======================================================= */

  const netBalance =
    totalIncome - totalExpense;


  /* =======================================================
     TABUNGAN
  ======================================================= */

  const totalSavings = 23900000;


  /* =======================================================
     PERSENTASE PENGELUARAN
  ======================================================= */

  const expensePercentage =
    totalIncome > 0
      ? Math.round(
          (totalExpense / totalIncome) *
            100
        )
      : 0;


  /* =======================================================
     KATEGORI PENGELUARAN
  ======================================================= */

  const expenseCategories = useMemo(() => {

    const categoryMap = {};


    filteredTransactions
      .filter(
        (item) =>
          item.type === "expense"
      )
      .forEach((item) => {

        const category =
          item.category || "Lainnya";


        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }


        categoryMap[category] +=
          Number(item.amount || 0);

      });


    return Object.entries(categoryMap)
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
          b.amount - a.amount
      );

  }, [
    filteredTransactions,
    totalExpense,
  ]);


  /* =======================================================
     EXPORT CSV
  ======================================================= */

  function exportCSV() {

    if (
      filteredTransactions.length === 0
    ) {

      alert(
        "Tidak ada data untuk diekspor."
      );

      return;
    }


    const header = [
      "Tanggal",
      "Jenis",
      "Transaksi",
      "Kategori",
      "Nominal",
    ];


    const rows =
      filteredTransactions.map(
        (item) => [
          item.date,
          item.type === "income"
            ? "Pemasukan"
            : "Pengeluaran",
          item.title,
          item.category,
          item.amount,
        ]
      );


    const csv =
      [header, ...rows]
        .map((row) =>
          row
            .map(
              (value) =>
                `"${String(value).replaceAll(
                  '"',
                  '""'
                )}"`
            )
            .join(",")
        )
        .join("\n");


    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );


    const url =
      URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;

    link.download =
      `laporan-keuangan-${period}.csv`;


    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);


    URL.revokeObjectURL(url);

  }


  return (

    <div className="report-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="report-page-header">

        <div>

          <h1>
            Laporan
          </h1>

          <p>
            Ringkasan dan laporan keuangan kamu.
          </p>

        </div>


        <button
          className="report-export-button"
          onClick={exportCSV}
        >

          <Download size={15} />

          <span>
            Export CSV
          </span>

        </button>

      </div>


      {/* ===================================================
          FILTER
      =================================================== */}

      <div className="report-filter-card">

        <div className="report-filter-left">

          <CalendarDays size={15} />

          <span>
            Periode
          </span>

        </div>


        <div className="report-period-buttons">

          <button
            className={
              period === "bulan"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("bulan")
            }
          >
            Bulan Ini
          </button>


          <button
            className={
              period === "3bulan"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("3bulan")
            }
          >
            3 Bulan
          </button>


          <button
            className={
              period === "tahun"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("tahun")
            }
          >
            Tahun Ini
          </button>


          <button
            className={
              period === "semua"
                ? "active"
                : ""
            }
            onClick={() =>
              setPeriod("semua")
            }
          >
            Semua
          </button>

        </div>


        <div className="report-type-select">

          <select
            value={transactionType}
            onChange={(event) =>
              setTransactionType(
                event.target.value
              )
            }
          >

            <option value="semua">
              Semua Transaksi
            </option>

            <option value="income">
              Pemasukan
            </option>

            <option value="expense">
              Pengeluaran
            </option>

          </select>

        </div>

      </div>


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="report-summary-grid">


        {/* PEMASUKAN */}

        <div className="report-summary-card income-report">

          <div className="report-summary-icon">

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
              {
                filteredTransactions.filter(
                  (item) =>
                    item.type ===
                    "income"
                ).length
              }{" "}
              transaksi
            </small>

          </div>

        </div>


        {/* PENGELUARAN */}

        <div className="report-summary-card expense-report">

          <div className="report-summary-icon">

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
              {expensePercentage}%
              {" "}dari pemasukan
            </small>

          </div>

        </div>


        {/* SALDO */}

        <div className="report-summary-card balance-report">

          <div className="report-summary-icon">

            <Wallet size={18} />

          </div>


          <div>

            <span>
              Saldo Bersih
            </span>

            <strong>
              {formatRupiah(netBalance)}
            </strong>

            <small>
              Pemasukan - Pengeluaran
            </small>

          </div>

        </div>


        {/* TABUNGAN */}

        <div className="report-summary-card savings-report">

          <div className="report-summary-icon">

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

      </div>


      {/* ===================================================
          ANALYTICS
      =================================================== */}

      <div className="report-analytics-grid">


        {/* CASH FLOW */}

        <div className="report-card">

          <div className="report-card-header">

            <div>

              <h2>
                Cash Flow
              </h2>

              <p>
                Perbandingan pemasukan dan pengeluaran
              </p>

            </div>

            <TrendingUp size={18} />

          </div>


          <div className="report-cashflow">


            {/* PEMASUKAN */}

            <div className="cashflow-item">

              <div className="cashflow-label">

                <span className="cashflow-dot income-dot" />

                <span>
                  Pemasukan
                </span>

                <strong>
                  {formatRupiah(totalIncome)}
                </strong>

              </div>


              <div className="cashflow-track">

                <div
                  className="cashflow-income-bar"
                  style={{
                    width:
                      totalIncome > 0
                        ? "100%"
                        : "0%",
                  }}
                />

              </div>

            </div>


            {/* PENGELUARAN */}

            <div className="cashflow-item">

              <div className="cashflow-label">

                <span className="cashflow-dot expense-dot" />

                <span>
                  Pengeluaran
                </span>

                <strong>
                  {formatRupiah(totalExpense)}
                </strong>

              </div>


              <div className="cashflow-track">

                <div
                  className="cashflow-expense-bar"
                  style={{
                    width:
                      totalIncome > 0
                        ? `${Math.min(
                            expensePercentage,
                            100
                          )}%`
                        : "0%",
                  }}
                />

              </div>

            </div>


            {/* NET */}

            <div className="cashflow-net">

              <div>

                {netBalance >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}

                <span>
                  Saldo Bersih
                </span>

              </div>


              <strong
                className={
                  netBalance >= 0
                    ? "positive-value"
                    : "negative-value"
                }
              >
                {formatRupiah(
                  netBalance
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* KATEGORI */}

        <div className="report-card">

          <div className="report-card-header">

            <div>

              <h2>
                Pengeluaran per Kategori
              </h2>

              <p>
                Distribusi pengeluaran kamu
              </p>

            </div>

            <ReceiptText size={18} />

          </div>


          <div className="report-category-list">

            {expenseCategories.length >
            0 ? (

              expenseCategories.map(
                (item) => (

                  <div
                    className="report-category-item"
                    key={item.category}
                  >

                    <div className="report-category-top">

                      <span>
                        {item.category}
                      </span>

                      <strong>
                        {formatRupiah(
                          item.amount
                        )}
                      </strong>

                    </div>


                    <div className="report-category-track">

                      <div
                        className="report-category-bar"
                        style={{
                          width:
                            `${item.percentage}%`,
                        }}
                      />

                    </div>


                    <small>
                      {item.percentage}%
                    </small>

                  </div>

                )
              )

            ) : (

              <div className="report-empty-small">

                Tidak ada data pengeluaran.

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ===================================================
          TRANSACTIONS
      =================================================== */}

      <div className="report-card report-transactions-card">

        <div className="report-card-header">

          <div>

            <h2>
              Ringkasan Transaksi
            </h2>

            <p>
              Data transaksi berdasarkan periode yang dipilih
            </p>

          </div>

          <ReceiptText size={18} />

        </div>


        <div className="report-table-wrapper">

          <table className="report-table">

            <thead>

              <tr>

                <th>
                  TANGGAL
                </th>

                <th>
                  TRANSAKSI
                </th>

                <th>
                  KATEGORI
                </th>

                <th>
                  JENIS
                </th>

                <th>
                  NOMINAL
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredTransactions.length >
              0 ? (

                filteredTransactions
                  .sort(
                    (a, b) =>
                      new Date(
                        `${b.date}T00:00:00`
                      ) -
                      new Date(
                        `${a.date}T00:00:00`
                      )
                  )
                  .map((item) => {

                    const isIncome =
                      item.type ===
                      "income";


                    return (

                      <tr
                        key={`${item.type}-${item.id}`}
                      >

                        <td>

                          <div className="report-date">

                            <CalendarDays size={12} />

                            {formatDate(
                              item.date
                            )}

                          </div>

                        </td>


                        <td>

                          <strong>
                            {item.title}
                          </strong>

                        </td>


                        <td>

                          <span className="report-category-badge">

                            {item.category}

                          </span>

                        </td>


                        <td>

                          <span
                            className={
                              isIncome
                                ? "report-type income-type"
                                : "report-type expense-type"
                            }
                          >

                            {isIncome ? (
                              <>
                                <ArrowDownLeft
                                  size={11}
                                />

                                Pemasukan
                              </>
                            ) : (
                              <>
                                <ArrowUpRight
                                  size={11}
                                />

                                Pengeluaran
                              </>
                            )}

                          </span>

                        </td>


                        <td>

                          <strong
                            className={
                              isIncome
                                ? "report-income-value"
                                : "report-expense-value"
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

                        </td>

                      </tr>

                    );

                  })

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="report-empty"
                  >

                    <ReceiptText
                      size={28}
                    />

                    <strong>
                      Tidak ada transaksi
                    </strong>

                    <span>
                      Tidak ada transaksi pada periode yang dipilih.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


export default Report;