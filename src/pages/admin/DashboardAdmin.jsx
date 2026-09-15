```jsx
import { useMemo } from "react";
import {
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
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

import {
  getUsers,
  getUserData,
} from "../../utils/storage";


// =========================================================
// FORMAT RUPIAH
// =========================================================

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}


// =========================================================
// FORMAT ANGKA
// =========================================================

function formatNumber(value) {
  return new Intl.NumberFormat("id-ID").format(
    Number(value || 0)
  );
}


// =========================================================
// DASHBOARD ADMIN
// =========================================================

export default function DashboardAdmin() {

  // =======================================================
  // USERS
  // =======================================================

  const users = useMemo(() => {
    return getUsers();
  }, []);


  // =======================================================
  // USER BIASA SAJA
  // =======================================================

  const regularUsers = useMemo(() => {
    return users.filter(
      (user) => user.role === "user"
    );
  }, [users]);


  // =======================================================
  // GABUNGKAN SEMUA DATA USER
  // =======================================================

  const allIncome = useMemo(() => {

    return regularUsers.flatMap((user) => {

      const income = getUserData(
        "income",
        user.id
      );

      return income.map((item) => ({
        ...item,
        userId: user.id,
        userName: user.name,
      }));

    });

  }, [regularUsers]);


  const allExpense = useMemo(() => {

    return regularUsers.flatMap((user) => {

      const expense = getUserData(
        "expense",
        user.id
      );

      return expense.map((item) => ({
        ...item,
        userId: user.id,
        userName: user.name,
      }));

    });

  }, [regularUsers]);


  // =======================================================
  // TOTAL PEMASUKAN
  // =======================================================

  const totalIncome = useMemo(() => {

    return allIncome.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  }, [allIncome]);


  // =======================================================
  // TOTAL PENGELUARAN
  // =======================================================

  const totalExpense = useMemo(() => {

    return allExpense.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

  }, [allExpense]);


  // =======================================================
  // TOTAL SALDO
  // =======================================================

  const totalBalance = totalIncome - totalExpense;


  // =======================================================
  // TOTAL TRANSAKSI
  // =======================================================

  const totalTransactions =
    allIncome.length + allExpense.length;


  // =======================================================
  // DATA PER USER
  // =======================================================

  const userSummary = useMemo(() => {

    return regularUsers.map((user) => {

      const income = getUserData(
        "income",
        user.id
      );

      const expense = getUserData(
        "expense",
        user.id
      );

      const totalUserIncome =
        income.reduce(
          (total, item) =>
            total + Number(item.amount || 0),
          0
        );

      const totalUserExpense =
        expense.reduce(
          (total, item) =>
            total + Number(item.amount || 0),
          0
        );

      return {
        ...user,
        income: totalUserIncome,
        expense: totalUserExpense,
        balance:
          totalUserIncome - totalUserExpense,
        transactions:
          income.length + expense.length,
      };

    });

  }, [regularUsers]);


  // =======================================================
  // DATA GRAFIK
  // =======================================================

  const chartData = useMemo(() => {

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "Mei",
      "Jun",
      "Jul",
      "Agu",
      "Sep",
      "Okt",
      "Nov",
      "Des",
    ];

    return months.map((month, index) => {

      const monthNumber =
        String(index + 1).padStart(2, "0");

      const income = allIncome.reduce(
        (total, item) => {

          const date =
            item.date ||
            item.createdAt ||
            "";

          if (
            typeof date === "string" &&
            date.startsWith(
              `2026-${monthNumber}`
            )
          ) {
            return (
              total +
              Number(item.amount || 0)
            );
          }

          return total;

        },
        0
      );

      const expense = allExpense.reduce(
        (total, item) => {

          const date =
            item.date ||
            item.createdAt ||
            "";

          if (
            typeof date === "string" &&
            date.startsWith(
              `2026-${monthNumber}`
            )
          ) {
            return (
              total +
              Number(item.amount || 0)
            );
          }

          return total;

        },
        0
      );

      return {
        month,
        income,
        expense,
      };

    });

  }, [allIncome, allExpense]);


  // =======================================================
  // TRANSAKSI TERBARU
  // =======================================================

  const latestTransactions = useMemo(() => {

    const income = allIncome.map((item) => ({
      ...item,
      transactionType: "income",
    }));

    const expense = allExpense.map((item) => ({
      ...item,
      transactionType: "expense",
    }));

    return [
      ...income,
      ...expense,
    ]
      .sort((a, b) => {

        const dateA =
          new Date(
            a.date ||
            a.createdAt ||
            0
          ).getTime();

        const dateB =
          new Date(
            b.date ||
            b.createdAt ||
            0
          ).getTime();

        return dateB - dateA;

      })
      .slice(0, 8);

  }, [allIncome, allExpense]);


  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="min-h-full bg-slate-100 p-4 md:p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <h1 className="text-2xl font-bold text-slate-900">
          Dashboard Admin
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Ringkasan aktivitas keuangan seluruh pengguna.
        </p>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        {/* TOTAL USER */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Total User
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-900">
                {regularUsers.length}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Pengguna aktif
              </p>

            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Users
                size={21}
                className="text-blue-600"
              />
            </div>

          </div>

        </div>


        {/* PEMASUKAN */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="min-w-0">

              <p className="text-sm font-medium text-slate-500">
                Total Pemasukan
              </p>

              <h2 className="mt-2 truncate text-xl font-bold text-emerald-600">
                {formatRupiah(totalIncome)}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Seluruh pengguna
              </p>

            </div>

            <div className="rounded-xl bg-emerald-50 p-3">
              <ArrowDownLeft
                size={21}
                className="text-emerald-600"
              />
            </div>

          </div>

        </div>


        {/* PENGELUARAN */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="min-w-0">

              <p className="text-sm font-medium text-slate-500">
                Total Pengeluaran
              </p>

              <h2 className="mt-2 truncate text-xl font-bold text-red-600">
                {formatRupiah(totalExpense)}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Seluruh pengguna
              </p>

            </div>

            <div className="rounded-xl bg-red-50 p-3">
              <ArrowUpRight
                size={21}
                className="text-red-600"
              />
            </div>

          </div>

        </div>


        {/* SALDO */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-start justify-between">

            <div className="min-w-0">

              <p className="text-sm font-medium text-slate-500">
                Total Saldo
              </p>

              <h2
                className={`mt-2 truncate text-xl font-bold ${
                  totalBalance >= 0
                    ? "text-blue-600"
                    : "text-red-600"
                }`}
              >
                {formatRupiah(totalBalance)}
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Pemasukan - Pengeluaran
              </p>

            </div>

            <div className="rounded-xl bg-blue-50 p-3">
              <Wallet
                size={21}
                className="text-blue-600"
              />
            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">


        {/* =================================================
            CHART
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-base font-bold text-slate-900">
                Cash Flow
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Pemasukan dan pengeluaran seluruh pengguna
              </p>

            </div>

            <TrendingUp
              size={20}
              className="text-blue-600"
            />

          </div>


          <div className="h-[300px] w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="adminIncomeGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopOpacity={0.25}
                    />

                    <stop
                      offset="95%"
                      stopOpacity={0}
                    />

                  </linearGradient>


                  <linearGradient
                    id="adminExpenseGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="95%"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>


                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  tickFormatter={(value) => {

                    if (value >= 1000000) {
                      return `${(
                        value / 1000000
                      ).toFixed(0)}jt`;
                    }

                    if (value >= 1000) {
                      return `${(
                        value / 1000
                      ).toFixed(0)}rb`;
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
                  strokeWidth={2}
                  fill="url(#adminIncomeGradient)"
                  stroke="#10b981"
                />

                <Area
                  type="monotone"
                  dataKey="expense"
                  name="Pengeluaran"
                  strokeWidth={2}
                  fill="url(#adminExpenseGradient)"
                  stroke="#ef4444"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>


        {/* =================================================
            TRANSACTION INFO
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h2 className="text-base font-bold text-slate-900">
                Aktivitas
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Ringkasan transaksi
              </p>

            </div>

            <ReceiptText
              size={20}
              className="text-blue-600"
            />

          </div>


          <div className="space-y-4">

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-emerald-50 p-2">

                  <ArrowDownLeft
                    size={17}
                    className="text-emerald-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-slate-700">
                    Transaksi Pemasukan
                  </p>

                  <p className="text-xs text-slate-400">
                    Semua user
                  </p>

                </div>

              </div>

              <span className="font-bold text-slate-900">
                {formatNumber(allIncome.length)}
              </span>

            </div>


            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-red-50 p-2">

                  <ArrowUpRight
                    size={17}
                    className="text-red-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-slate-700">
                    Transaksi Pengeluaran
                  </p>

                  <p className="text-xs text-slate-400">
                    Semua user
                  </p>

                </div>

              </div>

              <span className="font-bold text-slate-900">
                {formatNumber(allExpense.length)}
              </span>

            </div>


            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-blue-50 p-2">

                  <ReceiptText
                    size={17}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <p className="text-sm font-medium text-slate-700">
                    Total Transaksi
                  </p>

                  <p className="text-xs text-slate-400">
                    Semua user
                  </p>

                </div>

              </div>

              <span className="font-bold text-slate-900">
                {formatNumber(totalTransactions)}
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          USER SUMMARY
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-5">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-base font-bold text-slate-900">
                Ringkasan User
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Kondisi keuangan masing-masing pengguna
              </p>

            </div>

            <Users
              size={20}
              className="text-blue-600"
            />

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pemasukan
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Pengeluaran
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Saldo
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Transaksi
                </th>

              </tr>

            </thead>


            <tbody>

              {userSummary.length > 0 ? (

                userSummary.map((user) => (

                  <tr
                    key={user.id}
                    className="border-b border-slate-100 last:border-0"
                  >

                    <td className="px-5 py-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">

                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase() || "U"}

                        </div>

                        <div>

                          <p className="text-sm font-semibold text-slate-800">
                            {user.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {user.email}
                          </p>

                        </div>

                      </div>

                    </td>


                    <td className="px-5 py-4 text-right text-sm font-semibold text-emerald-600">
                      {formatRupiah(user.income)}
                    </td>


                    <td className="px-5 py-4 text-right text-sm font-semibold text-red-600">
                      {formatRupiah(user.expense)}
                    </td>


                    <td
                      className={`px-5 py-4 text-right text-sm font-bold ${
                        user.balance >= 0
                          ? "text-blue-600"
                          : "text-red-600"
                      }`}
                    >
                      {formatRupiah(user.balance)}
                    </td>


                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-600">
                      {formatNumber(
                        user.transactions
                      )}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center"
                  >

                    <Users
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-500">
                      Belum ada user
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Tambahkan user terlebih dahulu melalui Input User.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          LATEST TRANSACTIONS
      ================================================= */}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 p-5">

          <div>

            <h2 className="text-base font-bold text-slate-900">
              Transaksi Terbaru
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Aktivitas transaksi terbaru seluruh pengguna
            </p>

          </div>

        </div>


        <div className="overflow-x-auto">

          <table className="w-full min-w-[700px]">

            <thead>

              <tr className="border-b border-slate-200 bg-slate-50">

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Transaksi
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Kategori
                </th>

                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tanggal
                </th>

                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Nominal
                </th>

              </tr>

            </thead>


            <tbody>

              {latestTransactions.length > 0 ? (

                latestTransactions.map((item, index) => (

                  <tr
                    key={`${item.userId}-${item.id || index}`}
                    className="border-b border-slate-100 last:border-0"
                  >

                    <td className="px-5 py-4">

                      <span className="text-sm font-semibold text-slate-700">
                        {item.userName}
                      </span>

                    </td>


                    <td className="px-5 py-4">

                      <div className="flex items-center gap-2">

                        <div
                          className={`rounded-lg p-2 ${
                            item.transactionType === "income"
                              ? "bg-emerald-50"
                              : "bg-red-50"
                          }`}
                        >

                          {item.transactionType === "income" ? (

                            <ArrowDownLeft
                              size={15}
                              className="text-emerald-600"
                            />

                          ) : (

                            <ArrowUpRight
                              size={15}
                              className="text-red-600"
                            />

                          )}

                        </div>

                        <span className="text-sm text-slate-700">
                          {item.title ||
                            item.name ||
                            item.description ||
                            "Transaksi"}
                        </span>

                      </div>

                    </td>


                    <td className="px-5 py-4 text-sm text-slate-500">
                      {item.category || "-"}
                    </td>


                    <td className="px-5 py-4 text-sm text-slate-500">
                      {item.date || "-"}
                    </td>


                    <td
                      className={`px-5 py-4 text-right text-sm font-bold ${
                        item.transactionType === "income"
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {item.transactionType === "income"
                        ? "+"
                        : "-"}{" "}
                      {formatRupiah(item.amount)}
                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="5"
                    className="px-5 py-12 text-center"
                  >

                    <ReceiptText
                      size={32}
                      className="mx-auto mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-500">
                      Belum ada transaksi
                    </p>

                    <p className="mt-1 text-
```
