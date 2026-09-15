import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import * as XLSX from "xlsx-js-style";

import {
  RefreshCw,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Wallet,
  ReceiptText,
  ArrowUpRight,
  ArrowDownLeft,
  PiggyBank,
} from "lucide-react";

import {
  getCurrentUser,
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
   FORMAT DATE
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

/* =========================================================
   REPORT
========================================================= */

function Report() {
  const currentUser = getCurrentUser();

  /* =======================================================
     STATE
  ======================================================= */

  const [incomeData, setIncomeData] = useState([]);
  const [expenseData, setExpenseData] = useState([]);
  const [savingsData, setSavingsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("all");

  const [transactionType, setTransactionType] =
    useState("all");

  /* =======================================================
     PERIOD
  ======================================================= */

  const periods = [
    {
      value: "all",
      label: "Semua",
    },
    {
      value: "today",
      label: "Hari Ini",
    },
    {
      value: "week",
      label: "7 Hari",
    },
    {
      value: "month",
      label: "Bulan Ini",
    },
    {
      value: "year",
      label: "Tahun Ini",
    },
  ];

  /* =======================================================
     LOAD DATA
  ======================================================= */

  const loadReportData = useCallback(() => {
    if (!currentUser) {
      setIncomeData([]);
      setExpenseData([]);
      setSavingsData([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const allUsers = getUsers();

    /* =====================================================
       ADMIN
       ADMIN MELIHAT DATA SEMUA USER
    ===================================================== */

    if (currentUser.role === "admin") {
      const normalUsers = Array.isArray(allUsers)
        ? allUsers.filter(
            (user) => user.role === "user"
          )
        : [];

      let allIncome = [];
      let allExpense = [];
      let allSavings = [];

      normalUsers.forEach((user) => {
        const userIncome = getUserData(
          "income",
          user.id
        );

        const userExpense = getUserData(
          "expense",
          user.id
        );

        const userSavings = getUserData(
          "savings",
          user.id
        );

        if (Array.isArray(userIncome)) {
          allIncome = [
            ...allIncome,
            ...userIncome.map((item) => ({
              ...item,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
            })),
          ];
        }

        if (Array.isArray(userExpense)) {
          allExpense = [
            ...allExpense,
            ...userExpense.map((item) => ({
              ...item,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
            })),
          ];
        }

        if (Array.isArray(userSavings)) {
          allSavings = [
            ...allSavings,
            ...userSavings.map((item) => ({
              ...item,
              userId: user.id,
              userName: user.name,
              userEmail: user.email,
            })),
          ];
        }
      });

      setIncomeData(allIncome);
      setExpenseData(allExpense);
      setSavingsData(allSavings);
    }

    /* =====================================================
       USER
       USER HANYA MELIHAT DATA SENDIRI
    ===================================================== */

    else {
      setIncomeData(
        getUserData(
          "income",
          currentUser.id
        )
      );

      setExpenseData(
        getUserData(
          "expense",
          currentUser.id
        )
      );

      setSavingsData(
        getUserData(
          "savings",
          currentUser.id
        )
      );
    }

    setLoading(false);
  }, [
    currentUser?.id,
    currentUser?.role,
  ]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  /* =======================================================
     REFRESH DATA
  ======================================================= */

  useEffect(() => {
    const handleFocus = () => {
      loadReportData();
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );
    };
  }, [loadReportData]);

  /* =======================================================
     COMBINE TRANSACTIONS
  ======================================================= */

  const transactions = useMemo(() => {
    const income = incomeData.map(
      (item, index) => ({
        id:
          item?.id ??
          `income-${index}`,

        userId:
          item?.userId ??
          currentUser?.id,

        userName:
          item?.userName ??
          currentUser?.name ??
          "-",

        userEmail:
          item?.userEmail ??
          currentUser?.email ??
          "-",

        date:
          item?.date ?? "",

        title:
          item?.title ??
          item?.name ??
          "-",

        category:
          item?.category ??
          "Lainnya",

        description:
          item?.description ??
          "",

        type: "Pemasukan",

        amount:
          Number(
            item?.amount || 0
          ),
      })
    );

    const expense = expenseData.map(
      (item, index) => ({
        id:
          item?.id ??
          `expense-${index}`,

        userId:
          item?.userId ??
          currentUser?.id,

        userName:
          item?.userName ??
          currentUser?.name ??
          "-",

        userEmail:
          item?.userEmail ??
          currentUser?.email ??
          "-",

        date:
          item?.date ?? "",

        title:
          item?.title ??
          item?.name ??
          "-",

        category:
          item?.category ??
          "Lainnya",

        description:
          item?.description ??
          "",

        type: "Pengeluaran",

        amount:
          Number(
            item?.amount || 0
          ),
      })
    );

    return [
      ...income,
      ...expense,
    ];
  }, [
    incomeData,
    expenseData,
    currentUser,
  ]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    /* FILTER JENIS */

    if (transactionType !== "all") {
      data = data.filter(
        (item) =>
          item.type ===
          transactionType
      );
    }

    /* FILTER PERIODE */

    if (period !== "all") {
      const now = new Date();

      let startDate = new Date(now);

      if (period === "today") {
        startDate.setHours(
          0,
          0,
          0,
          0
        );
      }

      if (period === "week") {
        startDate.setDate(
          now.getDate() - 7
        );
      }

      if (period === "month") {
        startDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
      }

      if (period === "year") {
        startDate = new Date(
          now.getFullYear(),
          0,
          1
        );
      }

      data = data.filter((item) => {
        if (!item.date) {
          return false;
        }

        const itemDate =
          new Date(
            `${item.date}T00:00:00`
          );

        return (
          !Number.isNaN(
            itemDate.getTime()
          ) &&
          itemDate >= startDate
        );
      });
    }

    return data.sort((a, b) => {
      const dateA = new Date(
        `${a.date}T00:00:00`
      );

      const dateB = new Date(
        `${b.date}T00:00:00`
      );

      return dateB - dateA;
    });
  }, [
    transactions,
    period,
    transactionType,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const income =
      filteredTransactions
        .filter(
          (item) =>
            item.type ===
            "Pemasukan"
        )
        .reduce(
          (total, item) =>
            total +
            Number(
              item.amount || 0
            ),
          0
        );

    const expense =
      filteredTransactions
        .filter(
          (item) =>
            item.type ===
            "Pengeluaran"
        )
        .reduce(
          (total, item) =>
            total +
            Number(
              item.amount || 0
            ),
          0
        );

    const savings =
      savingsData.reduce(
        (total, item) =>
          total +
          Number(
            item?.currentAmount ??
              item?.amount ??
              0
          ),
        0
      );

    return {
      income,
      expense,
      balance:
        income - expense,
      savings,
    };
  }, [
    filteredTransactions,
    savingsData,
  ]);

  /* =======================================================
     EXPENSE CATEGORY
  ======================================================= */

  const expenseCategories = useMemo(() => {
    const result = {};

    filteredTransactions
      .filter(
        (item) =>
          item.type ===
          "Pengeluaran"
      )
      .forEach((item) => {
        const category =
          item.category ||
          "Lainnya";

        if (!result[category]) {
          result[category] = 0;
        }

        result[category] +=
          Number(
            item.amount || 0
          );
      });

    return Object.entries(result)
      .map(
        ([name, amount]) => ({
          name,
          amount,
        })
      )
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );
  }, [filteredTransactions]);

  /* =======================================================
     COUNT
  ======================================================= */

  const incomeCount =
    filteredTransactions.filter(
      (item) =>
        item.type ===
        "Pemasukan"
    ).length;

  const expenseCount =
    filteredTransactions.filter(
      (item) =>
        item.type ===
        "Pengeluaran"
    ).length;

  /* =======================================================
     EXPORT EXCEL
  ======================================================= */

  function exportExcel() {
    if (
      filteredTransactions.length ===
      0
    ) {
      alert(
        "Tidak ada data transaksi untuk diekspor."
      );

      return;
    }

    /* =====================================================
       WORKBOOK
    ===================================================== */

    const workbook =
      XLSX.utils.book_new();

    /* =====================================================
       WARNA CASH FLOW
    ===================================================== */

    const COLORS = {
      navy: "0F172A",
      blue: "1D4ED8",
      blueLight: "DBEAFE",

      green: "16A34A",
      greenLight: "DCFCE7",

      red: "DC2626",
      redLight: "FEE2E2",

      yellow: "D97706",
      yellowLight: "FEF3C7",

      slate: "475569",
      slateLight: "F1F5F9",

      white: "FFFFFF",

      border: "CBD5E1",

      text: "1E293B",
    };

    /* =====================================================
       BORDER
    ===================================================== */

    const border = {
      top: {
        style: "thin",
        color: {
          rgb: COLORS.border,
        },
      },

      bottom: {
        style: "thin",
        color: {
          rgb: COLORS.border,
        },
      },

      left: {
        style: "thin",
        color: {
          rgb: COLORS.border,
        },
      },

      right: {
        style: "thin",
        color: {
          rgb: COLORS.border,
        },
      },
    };

    /* =====================================================
       STYLE TITLE
    ===================================================== */

    const titleStyle = {
      font: {
        bold: true,
        sz: 20,
        color: {
          rgb: COLORS.white,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.navy,
        },
      },

      alignment: {
        horizontal: "left",
        vertical: "center",
      },

      border,
    };

    /* =====================================================
       STYLE SUBTITLE
    ===================================================== */

    const subtitleStyle = {
      font: {
        bold: true,
        sz: 10,
        color: {
          rgb: "64748B",
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.slateLight,
        },
      },

      alignment: {
        horizontal: "left",
        vertical: "center",
      },

      border,
    };

    /* =====================================================
       BLUE HEADER
    ===================================================== */

    const blueHeader = {
      font: {
        bold: true,
        sz: 10,
        color: {
          rgb: COLORS.white,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.blue,
        },
      },

      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },

      border,
    };

    /* =====================================================
       RED HEADER
    ===================================================== */

    const redHeader = {
      font: {
        bold: true,
        sz: 10,
        color: {
          rgb: COLORS.white,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.red,
        },
      },

      alignment: {
        horizontal: "center",
        vertical: "center",
        wrapText: true,
      },

      border,
    };

    /* =====================================================
       LABEL
    ===================================================== */

    const labelStyle = {
      font: {
        bold: true,
        color: {
          rgb: COLORS.slate,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.slateLight,
        },
      },

      alignment: {
        vertical: "center",
      },

      border,
    };

    /* =====================================================
       VALUE
    ===================================================== */

    const valueStyle = {
      font: {
        color: {
          rgb: COLORS.text,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.white,
        },
      },

      alignment: {
        vertical: "center",
      },

      border,
    };

    /* =====================================================
       MONEY
    ===================================================== */

    const moneyStyle = {
      font: {
        bold: true,
        color: {
          rgb: COLORS.text,
        },
      },

      alignment: {
        horizontal: "right",
        vertical: "center",
      },

      border,
    };

    /* =====================================================
       SHEET 1
       RINGKASAN
    ===================================================== */

    const summaryData = [
      [
        "CASH FLOW",
        "",
        "",
        "",
      ],

      [
        "FINANCIAL MANAGEMENT SYSTEM",
        "",
        "",
        "",
      ],

      [],

      [
        "RINGKASAN KEUANGAN",
        "",
        "",
        "",
      ],

      [
        "Total Pemasukan",
        summary.income,
        "",
        "",
      ],

      [
        "Total Pengeluaran",
        summary.expense,
        "",
        "",
      ],

      [
        "Saldo Bersih",
        summary.balance,
        "",
        "",
      ],

      [
        "Total Tabungan",
        summary.savings,
        "",
        "",
      ],

      [],

      [
        "INFORMASI LAPORAN",
        "",
        "",
        "",
      ],

      [
        "Pengguna",
        currentUser?.role === "admin"
          ? "Seluruh User"
          : currentUser?.name ||
            "-",
        "",
        "",
      ],

      [
        "Email",
        currentUser?.role === "admin"
          ? "-"
          : currentUser?.email ||
            "-",
        "",
        "",
      ],

      [
        "Periode",
        periods.find(
          (item) =>
            item.value ===
            period
        )?.label ||
          "Semua",
        "",
        "",
      ],

      [
        "Jenis Transaksi",
        transactionType ===
        "all"
          ? "Semua Transaksi"
          : transactionType,
        "",
        "",
      ],

      [
        "Jumlah Transaksi",
        filteredTransactions.length,
        "",
        "",
      ],

      [
        "Jumlah Pemasukan",
        incomeCount,
        "",
        "",
      ],

      [
        "Jumlah Pengeluaran",
        expenseCount,
        "",
        "",
      ],
    ];

    const summarySheet =
      XLSX.utils.aoa_to_sheet(
        summaryData
      );

    /* MERGE TITLE */

    summarySheet["!merges"] = [
      {
        s: {
          r: 0,
          c: 0,
        },
        e: {
          r: 0,
          c: 3,
        },
      },

      {
        s: {
          r: 1,
          c: 0,
        },
        e: {
          r: 1,
          c: 3,
        },
      },

      {
        s: {
          r: 3,
          c: 0,
        },
        e: {
          r: 3,
          c: 3,
        },
      },

      {
        s: {
          r: 9,
          c: 0,
        },
        e: {
          r: 9,
          c: 3,
        },
      },
    ];

    /* TITLE */

    summarySheet["A1"].s =
      titleStyle;

    summarySheet["A2"].s =
      subtitleStyle;

    /* =====================================================
       RINGKASAN HEADER
    ===================================================== */

    for (let col = 0; col < 4; col++) {
      const cell =
        XLSX.utils.encode_cell({
          r: 3,
          c: col,
        });

      summarySheet[cell].s =
        blueHeader;
    }

    /* =====================================================
       PEMASUKAN
    ===================================================== */

    summarySheet["A5"].s = {
      ...labelStyle,

      font: {
        bold: true,
        color: {
          rgb: COLORS.green,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.greenLight,
        },
      },
    };

    summarySheet["B5"].s = {
      ...moneyStyle,

      font: {
        bold: true,
        sz: 12,
        color: {
          rgb: COLORS.green,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.greenLight,
        },
      },
    };

    summarySheet["B5"].z =
      '"Rp" #,##0';

    /* =====================================================
       PENGELUARAN
    ===================================================== */

    summarySheet["A6"].s = {
      ...labelStyle,

      font: {
        bold: true,
        color: {
          rgb: COLORS.red,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.redLight,
        },
      },
    };

    summarySheet["B6"].s = {
      ...moneyStyle,

      font: {
        bold: true,
        sz: 12,
        color: {
          rgb: COLORS.red,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.redLight,
        },
      },
    };

    summarySheet["B6"].z =
      '"Rp" #,##0';

    /* =====================================================
       SALDO
    ===================================================== */

    const balanceColor =
      summary.balance >= 0
        ? COLORS.blue
        : COLORS.red;

    const balanceBackground =
      summary.balance >= 0
        ? COLORS.blueLight
        : COLORS.redLight;

    summarySheet["A7"].s = {
      ...labelStyle,

      font: {
        bold: true,
        color: {
          rgb: balanceColor,
        },
      },

      fill: {
        fgColor: {
          rgb: balanceBackground,
        },
      },
    };

    summarySheet["B7"].s = {
      ...moneyStyle,

      font: {
        bold: true,
        sz: 13,
        color: {
          rgb: balanceColor,
        },
      },

      fill: {
        fgColor: {
          rgb: balanceBackground,
        },
      },
    };

    summarySheet["B7"].z =
      '"Rp" #,##0';

    /* =====================================================
       TABUNGAN
    ===================================================== */

    summarySheet["A8"].s = {
      ...labelStyle,

      font: {
        bold: true,
        color: {
          rgb: COLORS.yellow,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.yellowLight,
        },
      },
    };

    summarySheet["B8"].s = {
      ...moneyStyle,

      font: {
        bold: true,
        sz: 12,
        color: {
          rgb: COLORS.yellow,
        },
      },

      fill: {
        fgColor: {
          rgb: COLORS.yellowLight,
        },
      },
    };

    summarySheet["B8"].z =
      '"Rp" #,##0';

    /* =====================================================
       INFORMASI HEADER
    ===================================================== */

    for (let col = 0; col < 4; col++) {
      const cell =
        XLSX.utils.encode_cell({
          r: 9,
          c: col,
        });

      summarySheet[cell].s =
        blueHeader;
    }

    /* =====================================================
       INFORMASI
    ===================================================== */

    for (
      let row = 10;
      row <= 16;
      row++
    ) {
      summarySheet[
        `A${row + 1}`
      ].s = labelStyle;

      summarySheet[
        `B${row + 1}`
      ].s = valueStyle;
    }

    /* WIDTH */

    summarySheet["!cols"] = [
      {
        wch: 28,
      },

      {
        wch: 38,
      },

      {
        wch: 5,
      },

      {
        wch: 5,
      },
    ];

    /* HEIGHT */

    summarySheet["!rows"] = [
      {
        hpt: 36,
      },

      {
        hpt: 22,
      },

      {
        hpt: 8,
      },

      {
        hpt: 25,
      },

      {
        hpt: 28,
      },

      {
        hpt: 28,
      },

      {
        hpt: 30,
      },

      {
        hpt: 28,
      },
    ];

    XLSX.utils.book_append_sheet(
      workbook,
      summarySheet,
      "Ringkasan"
    );

    /* =====================================================
       SHEET 2
       TRANSAKSI
    ===================================================== */

    const transactionHeader =
      currentUser?.role === "admin"
        ? [
            "No",
            "User",
            "Email",
            "Tanggal",
            "Transaksi",
            "Kategori",
            "Deskripsi",
            "Jenis",
            "Nominal",
          ]
        : [
            "No",
            "Tanggal",
            "Transaksi",
            "Kategori",
            "Deskripsi",
            "Jenis",
            "Nominal",
          ];

    const transactionRows =
      filteredTransactions.map(
        (item, index) => {
          if (
            currentUser?.role ===
            "admin"
          ) {
            return [
              index + 1,

              item.userName ||
                "-",

              item.userEmail ||
                "-",

              item.date || "-",

              item.title || "-",

              item.category ||
                "Lainnya",

              item.description ||
                "-",

              item.type,

              Number(
                item.amount || 0
              ),
            ];
          }

          return [
            index + 1,

            item.date || "-",

            item.title || "-",

            item.category ||
              "Lainnya",

            item.description ||
              "-",

            item.type,

            Number(
              item.amount || 0
            ),
          ];
        }
      );

    const transactionSheet =
      XLSX.utils.aoa_to_sheet([
        transactionHeader,

        ...transactionRows,
      ]);

    /* =====================================================
       HEADER TRANSAKSI
    ===================================================== */

    for (
      let col = 0;
      col <
      transactionHeader.length;
      col++
    ) {
      const cell =
        XLSX.utils.encode_cell({
          r: 0,
          c: col,
        });

      transactionSheet[cell].s =
        blueHeader;
    }

    /* =====================================================
       BODY TRANSAKSI
    ===================================================== */

    for (
      let row = 1;
      row <= transactionRows.length;
      row++
    ) {
      for (
        let col = 0;
        col <
        transactionHeader.length;
        col++
      ) {
        const cell =
          XLSX.utils.encode_cell({
            r: row,
            c: col,
          });

        if (
          transactionSheet[cell]
        ) {
          transactionSheet[cell].s =
            {
              ...valueStyle,

              alignment: {
                vertical: "center",
                wrapText: true,
              },
            };
        }
      }

      /* =================================================
         NOMINAL
      ================================================= */

      const nominalCol =
        transactionHeader.indexOf(
          "Nominal"
        );

      const nominalCell =
        XLSX.utils.encode_cell({
          r: row,
          c: nominalCol,
        });

      const typeCol =
        transactionHeader.indexOf(
          "Jenis"
        );

      const typeCell =
        XLSX.utils.encode_cell({
          r: row,
          c: typeCol,
        });

      const type =
        transactionSheet[
          typeCell
        ]?.v;

      if (
        transactionSheet[
          nominalCell
        ]
      ) {
        transactionSheet[
          nominalCell
        ].z = '"Rp" #,##0';

        transactionSheet[
          nominalCell
        ].s = {
          ...moneyStyle,

          font: {
            bold: true,

            color: {
              rgb:
                type ===
                "Pemasukan"
                  ? COLORS.green
                  : COLORS.red,
            },
          },
        };
      }

      /* =================================================
         JENIS
      ================================================= */

      if (
        transactionSheet[
          typeCell
        ]
      ) {
        const isIncome =
          type ===
          "Pemasukan";

        transactionSheet[
          typeCell
        ].s = {
          font: {
            bold: true,

            color: {
              rgb: isIncome
                ? COLORS.green
                : COLORS.red,
            },
          },

          fill: {
            fgColor: {
              rgb: isIncome
                ? COLORS.greenLight
                : COLORS.redLight,
            },
          },

          alignment: {
            horizontal:
              "center",

            vertical:
              "center",
          },

          border,
        };
      }
    }

    /* =====================================================
       WIDTH
    ===================================================== */

    if (
      currentUser?.role ===
      "admin"
    ) {
      transactionSheet["!cols"] = [
        {
          wch: 6,
        },

        {
          wch: 20,
        },

        {
          wch: 28,
        },

        {
          wch: 15,
        },

        {
          wch: 28,
        },

        {
          wch: 20,
        },

        {
          wch: 35,
        },

        {
          wch: 17,
        },

        {
          wch: 23,
        },
      ];
    } else {
      transactionSheet["!cols"] = [
        {
          wch: 6,
        },

        {
          wch: 15,
        },

        {
          wch: 28,
        },

        {
          wch: 20,
        },

        {
          wch: 35,
        },

        {
          wch: 17,
        },

        {
          wch: 23,
        },
      ];
    }

    /* =====================================================
       HEADER HEIGHT
    ===================================================== */

    transactionSheet["!rows"] = [
      {
        hpt: 28,
      },
    ];

    /* =====================================================
       FREEZE HEADER
    ===================================================== */

    transactionSheet["!freeze"] = {
      xSplit: 0,
      ySplit: 1,
    };

    /* =====================================================
       FILTER
    ===================================================== */

    transactionSheet[
      "!autofilter"
    ] = {
      ref: `A1:${XLSX.utils.encode_col(
        transactionHeader.length - 1
      )}${
        transactionRows.length + 1
      }`,
    };

    XLSX.utils.book_append_sheet(
      workbook,
      transactionSheet,
      "Transaksi"
    );

    /* =====================================================
       SHEET 3
       KATEGORI
    ===================================================== */

    if (
      expenseCategories.length >
      0
    ) {
      const categoryRows =
        expenseCategories.map(
          (item, index) => {
            const percentage =
              summary.expense > 0
                ? (
                    (item.amount /
                      summary.expense) *
                    100
                  ).toFixed(1)
                : 0;

            return [
              index + 1,

              item.name,

              Number(
                item.amount || 0
              ),

              `${percentage}%`,
            ];
          }
        );

      const categorySheet =
        XLSX.utils.aoa_to_sheet([
          [
            "No",
            "Kategori",
            "Total Pengeluaran",
            "Persentase",
          ],

          ...categoryRows,
        ]);

      /* HEADER */

      for (let col = 0; col < 4; col++) {
        const cell =
          XLSX.utils.encode_cell({
            r: 0,
            c: col,
          });

        categorySheet[cell].s =
          redHeader;
      }

      /* BODY */

      for (
        let row = 1;
        row <= categoryRows.length;
        row++
      ) {
        for (
          let col = 0;
          col < 4;
          col++
        ) {
          const cell =
            XLSX.utils.encode_cell({
              r: row,
              c: col,
            });

          if (
            categorySheet[cell]
          ) {
            categorySheet[cell].s =
              {
                ...valueStyle,

                alignment: {
                  vertical:
                    "center",
                },
              };
          }
        }

        /* AMOUNT */

        const amountCell =
          `C${row + 1}`;

        if (
          categorySheet[
            amountCell
          ]
        ) {
          categorySheet[
            amountCell
          ].z =
            '"Rp" #,##0';

          categorySheet[
            amountCell
          ].s = {
            ...moneyStyle,

            font: {
              bold: true,

              color: {
                rgb: COLORS.red,
              },
            },
          };
        }

        /* PERCENTAGE */

        const percentageCell =
          `D${row + 1}`;

        if (
          categorySheet[
            percentageCell
          ]
        ) {
          categorySheet[
            percentageCell
          ].s = {
            ...valueStyle,

            font: {
              bold: true,

              color: {
                rgb: COLORS.red,
              },
            },

            alignment: {
              horizontal:
                "center",

              vertical:
                "center",
            },
          };
        }
      }

      /* =================================================
         TOTAL KATEGORI
      ================================================= */

      const totalRow =
        categoryRows.length +
        2;

      categorySheet[
        `A${totalRow}`
      ] = {
        v: "",

        s: {
          fill: {
            fgColor: {
              rgb: COLORS.red,
            },
          },

          border,
        },
      };

      categorySheet[
        `B${totalRow}`
      ] = {
        v: "TOTAL",

        s: {
          font: {
            bold: true,

            color: {
              rgb: COLORS.white,
            },
          },

          fill: {
            fgColor: {
              rgb: COLORS.red,
            },
          },

          border,
        },
      };

      categorySheet[
        `C${totalRow}`
      ] = {
        v: summary.expense,

        z: '"Rp" #,##0',

        s: {
          font: {
            bold: true,

            color: {
              rgb: COLORS.white,
            },
          },

          fill: {
            fgColor: {
              rgb: COLORS.red,
            },
          },

          alignment: {
            horizontal:
              "right",
          },

          border,
        },
      };

      categorySheet[
        `D${totalRow}`
      ] = {
        v: "100%",

        s: {
          font: {
            bold: true,

            color: {
              rgb: COLORS.white,
            },
          },

          fill: {
            fgColor: {
              rgb: COLORS.red,
            },
          },

          alignment: {
            horizontal:
              "center",
          },

          border,
        },
      };

      /* WIDTH */

      categorySheet["!cols"] = [
        {
          wch: 6,
        },

        {
          wch: 28,
        },

        {
          wch: 25,
        },

        {
          wch: 15,
        },
      ];

      /* HEIGHT */

      categorySheet["!rows"] = [
        {
          hpt: 28,
        },
      ];

      /* FREEZE */

      categorySheet["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
      };

      /* FILTER */

      categorySheet[
        "!autofilter"
      ] = {
        ref: `A1:D${
          categoryRows.length + 1
        }`,
      };

      XLSX.utils.book_append_sheet(
        workbook,
        categorySheet,
        "Kategori"
      );
    }

    /* =====================================================
       NAMA FILE
    ===================================================== */

    const periodName = {
      all: "Semua-Periode",
      today: "Hari-Ini",
      week: "7-Hari",
      month: "Bulan-Ini",
      year: "Tahun-Ini",
    };

    const typeName = {
      all: "Semua",
      Pemasukan: "Pemasukan",
      Pengeluaran:
        "Pengeluaran",
    };

    const fileName =
      `Laporan-Keuangan-${periodName[period]}-${typeName[transactionType]}.xlsx`;

    /* =====================================================
       DOWNLOAD
    ===================================================== */

    XLSX.writeFile(
      workbook,
      fileName
    );
  }

  /* =======================================================
     RENDER
     TAMPILAN REPORT TETAP
  ======================================================= */

  return (
    <div
      className="report-page"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        fontSize: "9px",
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          marginBottom: "12px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Laporan Keuangan
          </h1>

          <p
            style={{
              margin:
                "3px 0 0",
              fontSize: "10px",
              color: "#64748b",
            }}
          >
            {currentUser?.role ===
            "admin"
              ? "Laporan seluruh transaksi pengguna."
              : "Ringkasan dan analisis transaksi keuangan kamu."}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "6px",
          }}
        >
          <button
            type="button"
            onClick={
              loadReportData
            }
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "5px",
              border:
                "1px solid #e5e7eb",
              borderRadius: "5px",
              background:
                "#ffffff",
              color: "#475569",
              padding:
                "7px 10px",
              fontSize: "9px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <RefreshCw
              size={12}
            />

            Refresh
          </button>

          <button
            type="button"
            onClick={
              exportExcel
            }
            style={{
              display: "flex",
              alignItems:
                "center",
              gap: "5px",
              border: "none",
              borderRadius: "5px",
              background:
                "#16a34a",
              color: "#ffffff",
              padding:
                "7px 11px",
              fontSize: "9px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <FileSpreadsheet
              size={13}
            />

            Export Excel
          </button>
        </div>
      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          gap: "10px",
          padding:
            "8px 10px",
          marginBottom:
            "10px",
          background:
            "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius:
            "6px",
        }}
      >
        <div
          style={{
            display:
              "flex",
            gap: "4px",
          }}
        >
          {periods.map(
            (button) => {
              const active =
                period ===
                button.value;

              return (
                <button
                  key={
                    button.value
                  }
                  type="button"
                  onClick={() =>
                    setPeriod(
                      button.value
                    )
                  }
                  style={{
                    border: active
                      ? "1px solid #2563eb"
                      : "1px solid #e5e7eb",

                    background:
                      active
                        ? "#2563eb"
                        : "#ffffff",

                    color: active
                      ? "#ffffff"
                      : "#475569",

                    borderRadius:
                      "4px",

                    padding:
                      "5px 8px",

                    fontSize:
                      "8px",

                    fontWeight:
                      600,

                    cursor:
                      "pointer",
                  }}
                >
                  {
                    button.label
                  }
                </button>
              );
            }
          )}
        </div>

        <select
          value={
            transactionType
          }
          onChange={(event) =>
            setTransactionType(
              event.target.value
            )
          }
          style={{
            height: "27px",
            border:
              "1px solid #e5e7eb",
            borderRadius:
              "4px",
            padding:
              "0 8px",
            fontSize:
              "8px",
            color:
              "#475569",
            background:
              "#ffffff",
          }}
        >
          <option value="all">
            Semua Transaksi
          </option>

          <option value="Pemasukan">
            Pemasukan
          </option>

          <option value="Pengeluaran">
            Pengeluaran
          </option>
        </select>
      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "repeat(4, minmax(0, 1fr))",
          gap: "8px",
          marginBottom:
            "10px",
        }}
      >
        {/* PEMASUKAN */}

        <div
          style={{
            padding:
              "9px 10px",
            border:
              "1px solid #dcfce7",
            borderRadius:
              "6px",
            background:
              "#f0fdf4",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
            }}
          >
            <div>
              <span
                style={{
                  display:
                    "block",
                  fontSize:
                    "8px",
                  color:
                    "#64748b",
                }}
              >
                Total Pemasukan
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "4px",
                  fontSize:
                    "13px",
                  color:
                    "#15803d",
                }}
              >
                {formatRupiah(
                  summary.income
                )}
              </strong>
            </div>

            <div
              style={{
                width:
                  "27px",
                height:
                  "27px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius:
                  "6px",
                background:
                  "#dcfce7",
                color:
                  "#16a34a",
              }}
            >
              <TrendingUp
                size={13}
              />
            </div>
          </div>

          <span
            style={{
              display:
                "block",
              marginTop:
                "5px",
              fontSize:
                "7px",
              color:
                "#64748b",
            }}
          >
            {incomeCount} transaksi
          </span>
        </div>

        {/* PENGELUARAN */}

        <div
          style={{
            padding:
              "9px 10px",
            border:
              "1px solid #fee2e2",
            borderRadius:
              "6px",
            background:
              "#fef2f2",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
            }}
          >
            <div>
              <span
                style={{
                  display:
                    "block",
                  fontSize:
                    "8px",
                  color:
                    "#64748b",
                }}
              >
                Total Pengeluaran
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "4px",
                  fontSize:
                    "13px",
                  color:
                    "#dc2626",
                }}
              >
                {formatRupiah(
                  summary.expense
                )}
              </strong>
            </div>

            <div
              style={{
                width:
                  "27px",
                height:
                  "27px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius:
                  "6px",
                background:
                  "#fee2e2",
                color:
                  "#dc2626",
              }}
            >
              <TrendingDown
                size={13}
              />
            </div>
          </div>

          <span
            style={{
              display:
                "block",
              marginTop:
                "5px",
              fontSize:
                "7px",
              color:
                "#64748b",
            }}
          >
            {expenseCount} transaksi
          </span>
        </div>

        {/* SALDO */}

        <div
          style={{
            padding:
              "9px 10px",
            border:
              "1px solid #dbeafe",
            borderRadius:
              "6px",
            background:
              "#eff6ff",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
            }}
          >
            <div>
              <span
                style={{
                  display:
                    "block",
                  fontSize:
                    "8px",
                  color:
                    "#64748b",
                }}
              >
                Saldo Bersih
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "4px",
                  fontSize:
                    "13px",
                  color:
                    summary.balance >=
                    0
                      ? "#2563eb"
                      : "#dc2626",
                }}
              >
                {formatRupiah(
                  summary.balance
                )}
              </strong>
            </div>

            <div
              style={{
                width:
                  "27px",
                height:
                  "27px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius:
                  "6px",
                background:
                  "#dbeafe",
                color:
                  "#2563eb",
              }}
            >
              <Wallet
                size={13}
              />
            </div>
          </div>

          <span
            style={{
              display:
                "block",
              marginTop:
                "5px",
              fontSize:
                "7px",
              color:
                "#64748b",
            }}
          >
            Pemasukan -
            Pengeluaran
          </span>
        </div>

        {/* TRANSAKSI */}

        <div
          style={{
            padding:
              "9px 10px",
            border:
              "1px solid #fef3c7",
            borderRadius:
              "6px",
            background:
              "#fffbeb",
          }}
        >
          <div
            style={{
              display:
                "flex",
              justifyContent:
                "space-between",
            }}
          >
            <div>
              <span
                style={{
                  display:
                    "block",
                  fontSize:
                    "8px",
                  color:
                    "#64748b",
                }}
              >
                Jumlah Transaksi
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "4px",
                  fontSize:
                    "13px",
                  color:
                    "#d97706",
                }}
              >
                {
                  filteredTransactions.length
                }
              </strong>
            </div>

            <div
              style={{
                width:
                  "27px",
                height:
                  "27px",
                display:
                  "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                borderRadius:
                  "6px",
                background:
                  "#fef3c7",
                color:
                  "#d97706",
              }}
            >
              <ReceiptText
                size={13}
              />
            </div>
          </div>

          <span
            style={{
              display:
                "block",
              marginTop:
                "5px",
              fontSize:
                "7px",
              color:
                "#64748b",
            }}
          >
            Sesuai filter
          </span>
        </div>
      </div>

      {/* =================================================
          ANALYTICS
      ================================================= */}

      <div
        style={{
          display:
            "grid",
          gridTemplateColumns:
            "1fr 1fr",
          gap: "8px",
          marginBottom:
            "10px",
        }}
      >
        {/* CATEGORY */}

        <div
          style={{
            padding:
              "9px 10px",
            background:
              "#ffffff",
            border:
              "1px solid #e5e7eb",
            borderRadius:
              "6px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              justifyContent:
                "space-between",
              marginBottom:
                "7px",
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize:
                    "11px",
                  color:
                    "#111827",
                }}
              >
                Pengeluaran per
                Kategori
              </h3>

              <p
                style={{
                  margin:
                    "2px 0 0",
                  fontSize:
                    "7px",
                  color:
                    "#94a3b8",
                }}
              >
                Distribusi pengeluaran
              </p>
            </div>

            <PiggyBank
              size={14}
              color="#ef4444"
            />
          </div>

          {expenseCategories.length ===
          0 ? (
            <div
              style={{
                padding:
                  "12px",
                textAlign:
                  "center",
                fontSize:
                  "8px",
                color:
                  "#94a3b8",
              }}
            >
              Belum ada
              pengeluaran.
            </div>
          ) : (
            expenseCategories
              .slice(0, 5)
              .map(
                (item) => {
                  const percentage =
                    summary.expense >
                    0
                      ? Math.round(
                          (item.amount /
                            summary.expense) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={
                        item.name
                      }
                      style={{
                        marginBottom:
                          "6px",
                      }}
                    >
                      <div
                        style={{
                          display:
                            "flex",
                          justifyContent:
                            "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize:
                              "8px",
                          }}
                        >
                          {
                            item.name
                          }
                        </span>

                        <strong
                          style={{
                            fontSize:
                              "8px",
                          }}
                        >
                          {formatRupiah(
                            item.amount
                          )}
                        </strong>
                      </div>

                      <div
                        style={{
                          height:
                            "4px",
                          marginTop:
                            "3px",
                          background:
                            "#f1f5f9",
                          borderRadius:
                            "20px",
                          overflow:
                            "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`,
                            height:
                              "100%",
                            background:
                              "#ef4444",
                            borderRadius:
                              "20px",
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
          )}
        </div>

        {/* FINANCIAL SUMMARY */}

        <div
          style={{
            padding:
              "9px 10px",
            background:
              "#ffffff",
            border:
              "1px solid #e5e7eb",
            borderRadius:
              "6px",
          }}
        >
          <div
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "7px",
              marginBottom:
                "7px",
            }}
          >
            <Wallet
              size={14}
              color="#2563eb"
            />

            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize:
                    "11px",
                  color:
                    "#111827",
                }}
              >
                Ringkasan Keuangan
              </h3>

              <p
                style={{
                  margin:
                    "2px 0 0",
                  fontSize:
                    "7px",
                  color:
                    "#94a3b8",
                }}
              >
                Kondisi keuangan
              </p>
            </div>
          </div>

          <div
            style={{
              display:
                "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "5px",
            }}
          >
            <div
              style={{
                padding:
                  "7px",
                borderRadius:
                  "5px",
                background:
                  "#f0fdf4",
              }}
            >
              <span
                style={{
                  fontSize:
                    "7px",
                  color:
                    "#64748b",
                }}
              >
                Pemasukan
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "2px",
                  fontSize:
                    "9px",
                  color:
                    "#15803d",
                }}
              >
                {formatRupiah(
                  summary.income
                )}
              </strong>
            </div>

            <div
              style={{
                padding:
                  "7px",
                borderRadius:
                  "5px",
                background:
                  "#fef2f2",
              }}
            >
              <span
                style={{
                  fontSize:
                    "7px",
                  color:
                    "#64748b",
                }}
              >
                Pengeluaran
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "2px",
                  fontSize:
                    "9px",
                  color:
                    "#dc2626",
                }}
              >
                {formatRupiah(
                  summary.expense
                )}
              </strong>
            </div>

            <div
              style={{
                padding:
                  "7px",
                borderRadius:
                  "5px",
                background:
                  "#eff6ff",
              }}
            >
              <span
                style={{
                  fontSize:
                    "7px",
                  color:
                    "#64748b",
                }}
              >
                Saldo
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "2px",
                  fontSize:
                    "9px",
                  color:
                    "#2563eb",
                }}
              >
                {formatRupiah(
                  summary.balance
                )}
              </strong>
            </div>

            <div
              style={{
                padding:
                  "7px",
                borderRadius:
                  "5px",
                background:
                  "#fffbeb",
              }}
            >
              <span
                style={{
                  fontSize:
                    "7px",
                  color:
                    "#64748b",
                }}
              >
                Tabungan
              </span>

              <strong
                style={{
                  display:
                    "block",
                  marginTop:
                    "2px",
                  fontSize:
                    "9px",
                  color:
                    "#d97706",
                }}
              >
                {formatRupiah(
                  summary.savings
                )}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div
        style={{
          background:
            "#ffffff",
          border:
            "1px solid #e5e7eb",
          borderRadius:
            "6px",
          overflow:
            "hidden",
        }}
      >
        <div
          style={{
            padding:
              "8px 10px",
            borderBottom:
              "1px solid #e5e7eb",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize:
                "12px",
              color:
                "#111827",
            }}
          >
            Riwayat Transaksi
          </h3>

          <p
            style={{
              margin:
                "2px 0 0",
              fontSize:
                "7px",
              color:
                "#94a3b8",
            }}
          >
            {filteredTransactions.length}{" "}
            transaksi ditemukan
          </p>
        </div>

        <div
          style={{
            maxHeight:
              "calc(100vh - 450px)",
            overflowY:
              "auto",
          }}
        >
          <table
            style={{
              width:
                "100%",
              borderCollapse:
                "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background:
                    "#f8fafc",
                }}
              >
                {currentUser?.role ===
                  "admin" && (
                  <th
                    style={{
                      padding:
                        "6px 10px",
                      textAlign:
                        "left",
                      fontSize:
                        "7px",
                      color:
                        "#64748b",
                    }}
                  >
                    USER
                  </th>
                )}

                <th
                  style={{
                    padding:
                      "6px 10px",
                    textAlign:
                      "left",
                    fontSize:
                      "7px",
                    color:
                      "#64748b",
                  }}
                >
                  TANGGAL
                </th>

                <th
                  style={{
                    padding:
                      "6px 10px",
                    textAlign:
                      "left",
                    fontSize:
                      "7px",
                    color:
                      "#64748b",
                  }}
                >
                  TRANSAKSI
                </th>

                <th
                  style={{
                    padding:
                      "6px 10px",
                    textAlign:
                      "left",
                    fontSize:
                      "7px",
                    color:
                      "#64748b",
                  }}
                >
                  KATEGORI
                </th>

                <th
                  style={{
                    padding:
                      "6px 10px",
                    textAlign:
                      "left",
                    fontSize:
                      "7px",
                    color:
                      "#64748b",
                  }}
                >
                  JENIS
                </th>

                <th
                  style={{
                    padding:
                      "6px 10px",
                    textAlign:
                      "right",
                    fontSize:
                      "7px",
                    color:
                      "#64748b",
                  }}
                >
                  NOMINAL
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      currentUser?.role ===
                      "admin"
                        ? 6
                        : 5
                    }
                    style={{
                      padding:
                        "25px",
                      textAlign:
                        "center",
                      fontSize:
                        "8px",
                      color:
                        "#94a3b8",
                    }}
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : filteredTransactions.length ===
                0 ? (
                <tr>
                  <td
                    colSpan={
                      currentUser?.role ===
                      "admin"
                        ? 6
                        : 5
                    }
                    style={{
                      padding:
                        "25px",
                      textAlign:
                        "center",
                      fontSize:
                        "8px",
                      color:
                        "#94a3b8",
                    }}
                  >
                    <ReceiptText
                      size={25}
                      style={{
                        margin:
                          "0 auto 5px",
                      }}
                    />

                    Tidak ada
                    transaksi.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(
                  (item) => (
                    <tr
                      key={`${item.type}-${item.id}-${item.userId}`}
                      style={{
                        borderBottom:
                          "1px solid #f1f5f9",
                      }}
                    >
                      {currentUser?.role ===
                        "admin" && (
                        <td
                          style={{
                            padding:
                              "7px 10px",
                            fontSize:
                              "8px",
                            fontWeight:
                              600,
                            color:
                              "#334155",
                          }}
                        >
                          {
                            item.userName
                          }
                        </td>
                      )}

                      <td
                        style={{
                          padding:
                            "7px 10px",
                          fontSize:
                            "8px",
                          color:
                            "#64748b",
                        }}
                      >
                        {formatDate(
                          item.date
                        )}
                      </td>

                      <td
                        style={{
                          padding:
                            "7px 10px",
                          fontSize:
                            "8px",
                          fontWeight:
                            600,
                          color:
                            "#334155",
                        }}
                      >
                        {
                          item.title
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "7px 10px",
                          fontSize:
                            "8px",
                          color:
                            "#64748b",
                        }}
                      >
                        {
                          item.category
                        }
                      </td>

                      <td
                        style={{
                          padding:
                            "7px 10px",
                        }}
                      >
                        <span
                          style={{
                            display:
                              "inline-flex",
                            alignItems:
                              "center",
                            gap: "3px",
                            padding:
                              "3px 6px",
                            borderRadius:
                              "4px",
                            background:
                              item.type ===
                              "Pemasukan"
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              item.type ===
                              "Pemasukan"
                                ? "#15803d"
                                : "#dc2626",
                            fontSize:
                              "7px",
                            fontWeight:
                              600,
                          }}
                        >
                          {item.type ===
                          "Pemasukan" ? (
                            <ArrowDownLeft
                              size={9}
                            />
                          ) : (
                            <ArrowUpRight
                              size={9}
                            />
                          )}

                          {
                            item.type
                          }
                        </span>
                      </td>

                      <td
                        style={{
                          padding:
                            "7px 10px",
                          textAlign:
                            "right",
                          fontSize:
                            "8px",
                          fontWeight:
                            700,
                          color:
                            item.type ===
                            "Pemasukan"
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {item.type ===
                        "Pemasukan"
                          ? "+ "
                          : "- "}

                        {formatRupiah(
                          item.amount
                        )}
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Report;