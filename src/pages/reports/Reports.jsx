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
   DATA LAPORAN
========================================================= */

const reportData = [
  {
    id: 1,
    type: "income",
    title: "Gaji Bulanan",
    category: "Gaji",
    amount: 8500000,
    date: "2026-09-01",
  },

  {
    id: 2,
    type: "income",
    title: "Freelance Website",
    category: "Freelance",
    amount: 2500000,
    date: "2026-09-03",
  },

  {
    id: 3,
    type: "expense",
    title: "Belanja Bulanan",
    category: "Kebutuhan",
    amount: 1250000,
    date: "2026-09-04",
  },

  {
    id: 4,
    type: "expense",
    title: "Transportasi",
    category: "Transportasi",
    amount: 450000,
    date: "2026-09-05",
  },

  {
    id: 5,
    type: "income",
    title: "Bonus",
    category: "Bonus",
    amount: 1500000,
    date: "2026-09-07",
  },

  {
    id: 6,
    type: "expense",
    title: "Makan & Minum",
    category: "Makanan",
    amount: 320000,
    date: "2026-09-08",
  },

  {
    id: 7,
    type: "expense",
    title: "Hiburan",
    category: "Hiburan",
    amount: 700000,
    date: "2026-09-10",
  },

  {
    id: 8,
    type: "income",
    title: "Penjualan",
    category: "Penjualan",
    amount: 750000,
    date: "2026-09-11",
  },

  {
    id: 9,
    type: "expense",
    title: "Keperluan Lain",
    category: "Lainnya",
    amount: 500000,
    date: "2026-09-12",
  },

  {
    id: 10,
    type: "income",
    title: "Project Website",
    category: "Freelance",
    amount: 1800000,
    date: "2026-09-13",
  },

  {
    id: 11,
    type: "expense",
    title: "Tagihan Internet",
    category: "Tagihan",
    amount: 350000,
    date: "2026-08-20",
  },

  {
    id: 12,
    type: "income",
    title: "Freelance Design",
    category: "Freelance",
    amount: 1200000,
    date: "2026-08-25",
  },
];


/* =========================================================
   DATA TABUNGAN
========================================================= */

const savingsData = [
  {
    id: 1,
    name: "Dana Darurat",
    amount: 8500000,
    date: "2026-09-14",
  },

  {
    id: 2,
    name: "Tabungan Liburan",
    amount: 6200000,
    date: "2026-09-10",
  },

  {
    id: 3,
    name: "Laptop Baru",
    amount: 9200000,
    date: "2026-09-05",
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
  }).format(
    new Date(`${date}T00:00:00`)
  );
}


/* =========================================================
   REPORT
========================================================= */

function Report() {

  /* =======================================================
     STATE
  ======================================================= */

  const [period, setPeriod] =
    useState("bulan");

  const [transactionType, setTransactionType] =
    useState("semua");


  /* =======================================================
     FILTER TRANSACTIONS
  ======================================================= */

  const filteredTransactions =
    useMemo(() => {

      const today =
        new Date(
          "2026-09-14T00:00:00"
        );

      return reportData.filter(
        (item) => {

          const itemDate =
            new Date(
              `${item.date}T00:00:00`
            );


          /* ===============================================
             FILTER PERIODE
          =============================================== */

          let matchesPeriod = true;

          if (period === "bulan") {

            matchesPeriod =
              itemDate.getFullYear() ===
                today.getFullYear() &&
              itemDate.getMonth() ===
                today.getMonth();

          }

          if (period === "3bulan") {

            const threeMonthsAgo =
              new Date(today);

            threeMonthsAgo.setMonth(
              today.getMonth() - 3
            );

            matchesPeriod =
              itemDate >=
              threeMonthsAgo;

          }

          if (period === "tahun") {

            matchesPeriod =
              itemDate.getFullYear() ===
              today.getFullYear();

          }


          /* ===============================================
             FILTER JENIS
          =============================================== */

          const matchesType =
            transactionType === "semua" ||
            item.type === transactionType;


          return (
            matchesPeriod &&
            matchesType
          );

        }
      );

    }, [
      period,
      transactionType,
    ]);


  /* =======================================================
     TOTAL PEMASUKAN
  ======================================================= */

  const totalIncome =
    useMemo(() => {

      return filteredTransactions
        .filter(
          (item) =>
            item.type === "income"
        )
        .reduce(
          (total, item) =>
            total + item.amount,
          0
        );

    }, [filteredTransactions]);


  /* =======================================================
     TOTAL PENGELUARAN
  ======================================================= */

  const totalExpense =
    useMemo(() => {

      return filteredTransactions
        .filter(
          (item) =>
            item.type === "expense"
        )
        .reduce(
          (total, item) =>
            total + item.amount,
          0
        );

    }, [filteredTransactions]);


  /* =======================================================
     SALDO BERSIH
  ======================================================= */

  const netBalance =
    totalIncome -
    totalExpense;


  /* =======================================================
     TOTAL TABUNGAN
  ======================================================= */

  const totalSavings =
    useMemo(() => {

      return savingsData.reduce(
        (total, item) =>
          total + item.amount,
        0
      );

    }, []);


  /* =======================================================
     PERSENTASE PENGELUARAN
  ======================================================= */

  const expensePercentage =
    totalIncome > 0
      ? Math.round(
          (totalExpense /
            totalIncome) *
            100
        )
      : 0;


  /* =======================================================
     KATEGORI PENGELUARAN
  ======================================================= */

  const expenseCategories =
    useMemo(() => {

      const categoryMap = {};

      filteredTransactions
        .filter(
          (item) =>
            item.type === "expense"
        )
        .forEach((item) => {

          if (
            !categoryMap[
              item.category
            ]
          ) {

            categoryMap[
              item.category
            ] = 0;

          }

          categoryMap[
            item.category
          ] += item.amount;

        });


      return Object.entries(
        categoryMap
      )
        .map(
          ([
            category,
            amount,
          ]) => ({

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


    const csv = [
      header,
      ...rows,
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(
                  value
                ).replaceAll(
                  '"',
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");


    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `laporan-keuangan-${period}.csv`;

    link.click();


    URL.revokeObjectURL(
      url
    );

  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="report-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="report-page-header">

        <div>

          <h1>
            Laporan
          </h1>

          <p>
            Ringkasan dan analisis kondisi keuangan kamu.
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


      {/* =================================================
          FILTER
      ================================================= */}

      <div className="report-filter-card">

        <div className="report-filter-left">

          <CalendarDays
            size={15}
          />

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


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="report-summary-grid">


        {/* PEMASUKAN */}

        <div className="report-summary-card income-report">

          <div className="report-summary-icon">

            <ArrowDownLeft
              size={18}
            />

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
              {filteredTransactions.filter(
                (item) =>
                  item.type === "income"
              ).length}{" "}
              transaksi
            </small>

          </div>

        </div>


        {/* PENGELUARAN */}

        <div className="report-summary-card expense-report">

          <div className="report-summary-icon">

            <ArrowUpRight
              size={18}
            />

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
              {expensePercentage}% dari pemasukan
            </small>

          </div>

        </div>


        {/* SALDO */}

        <div className="report-summary-card balance-report">

          <div className="report-summary-icon">

            <Wallet
              size={18}
            />

          </div>

          <div>

            <span>
              Saldo Bersih
            </span>

            <strong>
              {formatRupiah(
                netBalance
              )}
            </strong>

            <small>
              Pemasukan - Pengeluaran
            </small>

          </div>

        </div>


        {/* TABUNGAN */}

        <div className="report-summary-card savings-report">

          <div className="report-summary-icon">

            <PiggyBank
              size={18}
            />

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

      </div>


      {/* =================================================
          ANALYTICS
      ================================================= */}

      <div className="report-analytics-grid">


        {/* ===============================================
            CASHFLOW
        =============================================== */}

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

            <TrendingUp
              size={18}
            />

          </div>


          <div className="report-cashflow">


            <div className="cashflow-item">

              <div className="cashflow-label">

                <span className="cashflow-dot income-dot" />

                <span>
                  Pemasukan
                </span>

                <strong>
                  {formatRupiah(
                    totalIncome
                  )}
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


            <div className="cashflow-item">

              <div className="cashflow-label">

                <span className="cashflow-dot expense-dot" />

                <span>
                  Pengeluaran
                </span>

                <strong>
                  {formatRupiah(
                    totalExpense
                  )}
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


            <div className="cashflow-net">

              <div>

                {netBalance >= 0 ? (
                  <TrendingUp
                    size={16}
                  />
                ) : (
                  <TrendingDown
                    size={16}
                  />
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


        {/* ===============================================
            KATEGORI PENGELUARAN
        =============================================== */}

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

            <ReceiptText
              size={18}
            />

          </div>


          <div className="report-category-list">

            {expenseCategories.length > 0 ? (

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


      {/* =================================================
          TRANSACTION TABLE
      ================================================= */}

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

          <ReceiptText
            size={18}
          />

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

              {filteredTransactions.length > 0 ? (

                filteredTransactions.map(
                  (item) => (

                    <tr key={item.id}>

                      <td>

                        <div className="report-date">

                          <CalendarDays
                            size={12}
                          />

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
                            item.type ===
                            "income"
                              ? "report-type income-type"
                              : "report-type expense-type"
                          }
                        >

                          {item.type ===
                          "income" ? (
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
                            item.type ===
                            "income"
                              ? "report-income-value"
                              : "report-expense-value"
                          }
                        >

                          {item.type ===
                          "income"
                            ? "+"
                            : "-"}{" "}

                          {formatRupiah(
                            item.amount
                          )}

                        </strong>

                      </td>

                    </tr>

                  )

                )

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


export default Report;a