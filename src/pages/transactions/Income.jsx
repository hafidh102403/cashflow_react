import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Wallet,
  ChevronDown,
} from "lucide-react";

import {
  getCurrentUser,
  getUserData,
  saveUserData,
  initializeUserData,
} from "../../utils/storage";

/* =========================================================
   KATEGORI PEMASUKAN
========================================================= */

const INCOME_CATEGORIES = [
  "Gaji",
  "Freelance",
  "Bonus",
  "Penjualan",
  "Investasi",
  "Hadiah",
  "Lainnya",
];

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
   INCOME
========================================================= */

function Income() {
  /* =======================================================
     CURRENT USER
  ======================================================= */

  const currentUser = getCurrentUser();

  /* =======================================================
     TRANSACTIONS

     DATA SEKARANG BERDASARKAN USER ID
  ======================================================= */

  const [transactions, setTransactions] = useState(() => {
    if (!currentUser) {
      return [];
    }

    initializeUserData(currentUser.id);

    return getUserData(
      "income",
      currentUser.id
    );
  });

  /* =======================================================
     SEARCH
  ======================================================= */

  const [search, setSearch] = useState("");

  /* =======================================================
     MODAL
  ======================================================= */

  const [modalOpen, setModalOpen] = useState(false);

  const [editingId, setEditingId] = useState(null);

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    amount: "",
    description: "",
  });

  /* =======================================================
     SIMPAN DATA PER USER
  ======================================================= */

  useEffect(() => {
    if (!currentUser) return;

    saveUserData(
      "income",
      currentUser.id,
      transactions
    );
  }, [transactions, currentUser]);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredTransactions = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return transactions;
    }

    return transactions.filter((item) =>
      [
        item.title,
        item.category,
        item.description,
        item.date,
      ]
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [transactions, search]);

  /* =======================================================
     TOTAL PEMASUKAN
  ======================================================= */

  const totalIncome = useMemo(() => {
    return transactions.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );
  }, [transactions]);

  /* =======================================================
     OPEN ADD MODAL
  ======================================================= */

  function openAddModal() {
    setEditingId(null);

    setForm({
      title: "",
      category: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      amount: "",
      description: "",
    });

    setModalOpen(true);
  }

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  function openEditModal(item) {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      category: item.category || "",
      date: item.date || "",
      amount: item.amount || "",
      description: item.description || "",
    });

    setModalOpen(true);
  }

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);

    setForm({
      title: "",
      category: "",
      date: "",
      amount: "",
      description: "",
    });
  }

  /* =======================================================
     HANDLE FORM
  ======================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  function handleSubmit(event) {
    event.preventDefault();

    if (!currentUser) {
      alert("User belum login.");
      return;
    }

    if (!form.title.trim()) {
      alert("Nama transaksi wajib diisi.");
      return;
    }

    if (!form.category) {
      alert("Kategori wajib dipilih.");
      return;
    }

    if (!form.date) {
      alert("Tanggal wajib diisi.");
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      alert("Nominal harus lebih dari 0.");
      return;
    }

    /* ===================================================
       EDIT
    =================================================== */

    if (editingId) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: form.title.trim(),
                category: form.category,
                date: form.date,
                amount: Number(form.amount),
                description:
                  form.description.trim(),
              }
            : item
        )
      );
    }

    /* ===================================================
       TAMBAH
    =================================================== */

    else {
      const newTransaction = {
        id: Date.now(),
        title: form.title.trim(),
        category: form.category,
        date: form.date,
        amount: Number(form.amount),
        description:
          form.description.trim(),
      };

      setTransactions((prev) => [
        newTransaction,
        ...prev,
      ]);
    }

    closeModal();
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) return;

    setTransactions((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="transaction-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="transaction-page-header">

        <div>
          <h1>Pemasukan</h1>

          <p>
            Kelola seluruh transaksi pemasukan kamu.
          </p>
        </div>

        <button
          type="button"
          className="transaction-add-button income-button"
          onClick={openAddModal}
        >
          <Plus size={15} />

          <span>
            Tambah Pemasukan
          </span>
        </button>

      </div>

      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="transaction-summary-grid">

        <div className="transaction-summary-card income-card">

          <div className="transaction-summary-icon">
            <ArrowDownLeft size={18} />
          </div>

          <div>
            <span>
              Total Pemasukan
            </span>

            <strong>
              {formatRupiah(totalIncome)}
            </strong>
          </div>

        </div>

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon neutral-icon">
            <Wallet size={18} />
          </div>

          <div>
            <span>
              Jumlah Transaksi
            </span>

            <strong>
              {transactions.length}
            </strong>
          </div>

        </div>

      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="transaction-card">

        <div className="transaction-toolbar">

          <div className="transaction-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Cari pemasukan..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>

        <div className="transaction-table-wrapper">

          <table className="transaction-table">

            <thead>
              <tr>
                <th>TANGGAL</th>
                <th>TRANSAKSI</th>
                <th>KATEGORI</th>
                <th>NOMINAL</th>
                <th>DESKRIPSI</th>
                <th>AKSI</th>
              </tr>
            </thead>

            <tbody>

              {filteredTransactions.length > 0 ? (

                filteredTransactions.map((item) => (

                  <tr key={item.id}>

                    <td>
                      <div className="transaction-date">
                        <CalendarDays size={12} />
                        {formatDate(item.date)}
                      </div>
                    </td>

                    <td>
                      <strong>
                        {item.title}
                      </strong>
                    </td>

                    <td>
                      <span className="transaction-category">
                        {item.category}
                      </span>
                    </td>

                    <td>
                      <strong className="income-value">
                        + {formatRupiah(item.amount)}
                      </strong>
                    </td>

                    <td>
                      {item.description || "-"}
                    </td>

                    <td>

                      <div className="transaction-actions">

                        <button
                          type="button"
                          className="transaction-edit-button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
                          type="button"
                          className="transaction-delete-button"
                          onClick={() =>
                            handleDelete(item.id)
                          }
                          title="Hapus"
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="transaction-empty"
                  >

                    <ArrowDownLeft size={25} />

                    <strong>
                      Tidak ada pemasukan
                    </strong>

                    <span>
                      Belum ada data yang sesuai.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* =================================================
          MODAL
      ================================================= */}

      {modalOpen && (

        <div className="income-modal-overlay">

          <div
            className="income-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="income-modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Pemasukan"
                    : "Tambah Pemasukan"}
                </h2>

                <p>
                  Masukkan informasi transaksi.
                </p>

              </div>

              <button
                type="button"
                className="income-modal-close"
                onClick={closeModal}
                aria-label="Tutup"
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="income-modal-form"
              onSubmit={handleSubmit}
            >

              <div className="income-form-grid">

                <div className="income-form-group">

                  <label htmlFor="income-title">
                    Nama Transaksi
                  </label>

                  <input
                    id="income-title"
                    name="title"
                    type="text"
                    placeholder="Contoh: Gaji Bulanan"
                    value={form.title}
                    onChange={handleChange}
                    autoComplete="off"
                  />

                </div>

                <div className="income-form-group">

                  <label htmlFor="income-category">
                    Kategori
                  </label>

                  <div className="income-select-wrapper">

                    <select
                      id="income-category"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                    >

                      <option value="">
                        Pilih Kategori
                      </option>

                      {INCOME_CATEGORIES.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        )
                      )}

                    </select>

                    <ChevronDown
                      size={16}
                      className="income-select-icon"
                    />

                  </div>

                </div>

                <div className="income-form-group">

                  <label htmlFor="income-date">
                    Tanggal
                  </label>

                  <div className="income-date-input">

                    <CalendarDays size={16} />

                    <input
                      id="income-date"
                      name="date"
                      type="date"
                      value={form.date}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                <div className="income-form-group">

                  <label htmlFor="income-amount">
                    Nominal
                  </label>

                  <div className="income-amount-input">

                    <span>Rp</span>

                    <input
                      id="income-amount"
                      name="amount"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="0"
                      value={form.amount}
                      onChange={handleChange}
                    />

                  </div>

                </div>

                <div className="income-form-group income-form-full">

                  <label htmlFor="income-description">
                    Deskripsi
                  </label>

                  <textarea
                    id="income-description"
                    name="description"
                    rows="3"
                    placeholder="Tambahkan deskripsi..."
                    value={form.description}
                    onChange={handleChange}
                  />

                </div>

              </div>

              <div className="income-modal-footer">

                <button
                  type="button"
                  className="income-cancel-button"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="income-save-button"
                >
                  {editingId
                    ? "Simpan Perubahan"
                    : "Simpan Pemasukan"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Income;