import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Wallet,
} from "lucide-react";

const STORAGE_KEY = "cashflow_expense";

const initialData = [
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

function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(date) {
  if (!date) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

function Expense() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    date: "",
    amount: "",
    description: "",
  });

  /* =====================================================
     SALDO AWAL
  ===================================================== */

  const totalSaldoAwal = 42850000;

  /* =====================================================
     SIMPAN KE LOCAL STORAGE
  ===================================================== */

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(transactions)
    );
  }, [transactions]);

  /* =====================================================
     FILTER
  ===================================================== */

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

  /* =====================================================
     SUMMARY
  ===================================================== */

  const totalExpense = useMemo(() => {
    return transactions.reduce(
      (total, item) => total + Number(item.amount),
      0
    );
  }, [transactions]);

  const remainingBalance =
    totalSaldoAwal - totalExpense;

  /* =====================================================
     OPEN ADD MODAL
  ===================================================== */

  function openAddModal() {
    setEditingId(null);

    setForm({
      title: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
    });

    setModalOpen(true);
  }

  /* =====================================================
     OPEN EDIT MODAL
  ===================================================== */

  function openEditModal(item) {
    setEditingId(item.id);

    setForm({
      title: item.title,
      category: item.category,
      date: item.date,
      amount: item.amount,
      description: item.description || "",
    });

    setModalOpen(true);
  }

  /* =====================================================
     CLOSE MODAL
  ===================================================== */

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  /* =====================================================
     FORM CHANGE
  ===================================================== */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  /* =====================================================
     SAVE
  ===================================================== */

  function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Nama transaksi wajib diisi.");
      return;
    }

    if (!form.category.trim()) {
      alert("Kategori wajib diisi.");
      return;
    }

    if (!form.date) {
      alert("Tanggal wajib diisi.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Nominal harus lebih dari 0.");
      return;
    }

    if (editingId) {
      setTransactions((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                title: form.title.trim(),
                category: form.category.trim(),
                date: form.date,
                amount: Number(form.amount),
                description: form.description.trim(),
              }
            : item
        )
      );
    } else {
      const newTransaction = {
        id: Date.now(),
        title: form.title.trim(),
        category: form.category.trim(),
        date: form.date,
        amount: Number(form.amount),
        description: form.description.trim(),
      };

      setTransactions((prev) => [
        newTransaction,
        ...prev,
      ]);
    }

    closeModal();
  }

  /* =====================================================
     DELETE
  ===================================================== */

  function handleDelete(id) {
    const confirmed = window.confirm(
      "Apakah kamu yakin ingin menghapus transaksi ini?"
    );

    if (!confirmed) return;

    setTransactions((prev) =>
      prev.filter((item) => item.id !== id)
    );
  }

  return (
    <div className="transaction-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="transaction-page-header">

        <div>
          <h1>Pengeluaran</h1>

          <p>
            Kelola seluruh transaksi pengeluaran kamu.
          </p>
        </div>

        <button
          className="transaction-add-button expense-button"
          onClick={openAddModal}
        >
          <Plus size={15} />
          <span>Tambah Pengeluaran</span>
        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================= */}

      <div className="transaction-summary-grid">

        <div className="transaction-summary-card expense-card">

          <div className="transaction-summary-icon">
            <ArrowUpRight size={18} />
          </div>

          <div>
            <span>Total Pengeluaran</span>

            <strong>
              {formatRupiah(totalExpense)}
            </strong>
          </div>

        </div>


        <div className="transaction-summary-card">

          <div className="transaction-summary-icon neutral-icon">
            <Wallet size={18} />
          </div>

          <div>
            <span>Sisa Saldo</span>

            <strong>
              {formatRupiah(remainingBalance)}
            </strong>
          </div>

        </div>


        <div className="transaction-summary-card">

          <div className="transaction-summary-icon neutral-icon">
            <ArrowUpRight size={18} />
          </div>

          <div>
            <span>Jumlah Transaksi</span>

            <strong>
              {transactions.length}
            </strong>
          </div>

        </div>

      </div>


      {/* =================================================
          TABLE CARD
      ================================================= */}

      <div className="transaction-card">

        {/* TOOLBAR */}

        <div className="transaction-toolbar">

          <div className="transaction-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>

        </div>


        {/* TABLE */}

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

                      <strong className="expense-value">
                        - {formatRupiah(item.amount)}
                      </strong>

                    </td>

                    <td>
                      {item.description || "-"}
                    </td>

                    <td>

                      <div className="transaction-actions">

                        <button
                          className="transaction-edit-button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>

                        <button
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

                    <ArrowUpRight size={25} />

                    <strong>
                      Tidak ada pengeluaran
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

        <div className="transaction-modal-overlay">

          <div className="transaction-modal">

            <div className="transaction-modal-header">

              <div>

                <h2>
                  {editingId
                    ? "Edit Pengeluaran"
                    : "Tambah Pengeluaran"}
                </h2>

                <p>
                  Masukkan informasi transaksi.
                </p>

              </div>

              <button
                className="transaction-modal-close"
                onClick={closeModal}
              >
                <X size={17} />
              </button>

            </div>


            <form onSubmit={handleSubmit}>

              <div className="transaction-form-grid">

                <div className="transaction-form-group">

                  <label>
                    Nama Transaksi
                  </label>

                  <input
                    name="title"
                    type="text"
                    placeholder="Contoh: Belanja Bulanan"
                    value={form.title}
                    onChange={handleChange}
                  />

                </div>


                <div className="transaction-form-group">

                  <label>
                    Kategori
                  </label>

                  <input
                    name="category"
                    type="text"
                    placeholder="Contoh: Kebutuhan"
                    value={form.category}
                    onChange={handleChange}
                  />

                </div>


                <div className="transaction-form-group">

                  <label>
                    Tanggal
                  </label>

                  <input
                    name="date"
                    type="date"
                    value={form.date}
                    onChange={handleChange}
                  />

                </div>


                <div className="transaction-form-group">

                  <label>
                    Nominal
                  </label>

                  <input
                    name="amount"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={form.amount}
                    onChange={handleChange}
                  />

                </div>


                <div className="transaction-form-group full">

                  <label>
                    Deskripsi
                  </label>

                  <textarea
                    name="description"
                    rows="3"
                    placeholder="Tambahkan deskripsi..."
                    value={form.description}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="transaction-modal-footer">

                <button
                  type="button"
                  className="transaction-cancel-button"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="transaction-save-button expense-save-button"
                >
                  {editingId
                    ? "Simpan Perubahan"
                    : "Simpan Pengeluaran"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Expense;