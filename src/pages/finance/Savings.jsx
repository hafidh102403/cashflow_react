import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  PiggyBank,
  X,
  CalendarDays,
  Target,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

/* =========================================================
   DATA AWAL
========================================================= */

const initialSavingsData = [
  {
    id: 1,
    name: "Dana Darurat",
    target: 15000000,
    current: 8500000,
    date: "2026-09-14",
    description: "Dana cadangan untuk kebutuhan darurat",
  },
  {
    id: 2,
    name: "Tabungan Liburan",
    target: 10000000,
    current: 6200000,
    date: "2026-09-10",
    description: "Persiapan liburan akhir tahun",
  },
  {
    id: 3,
    name: "Laptop Baru",
    target: 15000000,
    current: 9200000,
    date: "2026-09-05",
    description: "Menabung untuk membeli laptop baru",
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
   SAVINGS
========================================================= */

function Savings() {
  /* =======================================================
     STATE
  ======================================================= */

  const [savingsData, setSavingsData] = useState(
    initialSavingsData
  );

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    target: "",
    current: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
  });

  /* =======================================================
     TOTAL TABUNGAN
  ======================================================= */

  const totalSavings = useMemo(() => {
    return savingsData.reduce(
      (total, item) => total + Number(item.current),
      0
    );
  }, [savingsData]);

  /* =======================================================
     TOTAL TARGET
  ======================================================= */

  const totalTarget = useMemo(() => {
    return savingsData.reduce(
      (total, item) => total + Number(item.target),
      0
    );
  }, [savingsData]);

  /* =======================================================
     PERSENTASE KESELURUHAN
  ======================================================= */

  const totalPercentage =
    totalTarget > 0
      ? Math.min(
          Math.round((totalSavings / totalTarget) * 100),
          100
        )
      : 0;

  /* =======================================================
     FILTER SEARCH
  ======================================================= */

  const filteredData = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    if (!keyword) {
      return savingsData;
    }

    return savingsData.filter((item) => {
      return (
        item.name.toLowerCase().includes(keyword) ||
        item.description.toLowerCase().includes(keyword)
      );
    });
  }, [savingsData, search]);

  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {
    setForm({
      name: "",
      target: "",
      current: "",
      date: new Date().toISOString().split("T")[0],
      description: "",
    });

    setEditingId(null);
  }

  /* =======================================================
     OPEN ADD MODAL
  ======================================================= */

  function openAddModal() {
    resetForm();
    setShowModal(true);
  }

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  function openEditModal(item) {
    setEditingId(item.id);

    setForm({
      name: item.name,
      target: item.target,
      current: item.current,
      date: item.date,
      description: item.description,
    });

    setShowModal(true);
  }

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  function closeModal() {
    setShowModal(false);
    resetForm();
  }

  /* =======================================================
     HANDLE CHANGE
  ======================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* =======================================================
     SUBMIT FORM
  ======================================================= */

  function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.name.trim() ||
      !form.target ||
      Number(form.target) <= 0 ||
      form.current === "" ||
      Number(form.current) < 0 ||
      !form.date
    ) {
      alert("Silakan lengkapi data tabungan.");
      return;
    }

    if (Number(form.current) > Number(form.target)) {
      alert(
        "Jumlah tabungan saat ini tidak boleh lebih besar dari target."
      );
      return;
    }

    const newData = {
      id: editingId || Date.now(),

      name: form.name.trim(),

      target: Number(form.target),

      current: Number(form.current),

      date: form.date,

      description: form.description.trim(),
    };

    /* =====================================================
       EDIT
    ===================================================== */

    if (editingId) {
      setSavingsData((previous) =>
        previous.map((item) =>
          item.id === editingId
            ? newData
            : item
        )
      );
    }

    /* =====================================================
       TAMBAH
    ===================================================== */

    else {
      setSavingsData((previous) => [
        newData,
        ...previous,
      ]);
    }

    closeModal();
  }

  /* =======================================================
     DELETE
  ======================================================= */

  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Apakah kamu yakin ingin menghapus tabungan ini?"
    );

    if (!confirmDelete) {
      return;
    }

    setSavingsData((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="transaction-page savings-page">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="transaction-page-header">

        <div>
          <h1>Tabungan</h1>

          <p>
            Kelola target dan perkembangan tabungan kamu.
          </p>
        </div>

        <button
          className="transaction-add-button savings-add-button"
          onClick={openAddModal}
        >
          <Plus size={15} />

          <span>
            Tambah Tabungan
          </span>
        </button>

      </div>


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="transaction-summary-grid">

        {/* TOTAL TABUNGAN */}

        <div className="transaction-summary-card savings-summary">

          <div className="transaction-summary-icon">

            <PiggyBank size={18} />

          </div>

          <div>

            <span>
              Total Tabungan
            </span>

            <strong>
              {formatRupiah(totalSavings)}
            </strong>

          </div>

        </div>


        {/* TOTAL TARGET */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon blue-summary">

            <Target size={18} />

          </div>

          <div>

            <span>
              Total Target
            </span>

            <strong>
              {formatRupiah(totalTarget)}
            </strong>

          </div>

        </div>


        {/* PROGRESS */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon green-summary">

            <Wallet size={18} />

          </div>

          <div>

            <span>
              Progress Tabungan
            </span>

            <strong>
              {totalPercentage}%
            </strong>

          </div>

        </div>

      </div>


      {/* ===================================================
          TABLE CARD
      =================================================== */}

      <div className="transaction-table-card">

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <div className="transaction-toolbar">

          <div className="transaction-toolbar-title">

            <div>

              <h2>
                Daftar Tabungan
              </h2>

              <p>
                Target dan perkembangan tabungan kamu
              </p>

            </div>

          </div>


          <div className="transaction-toolbar-actions">

            <div className="transaction-search">

              <Search size={15} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari tabungan..."
              />

            </div>

          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="transaction-list-wrapper">

          <table className="transaction-list-table">

            <thead>

              <tr>

                <th>
                  TABUNGAN
                </th>

                <th>
                  TARGET
                </th>

                <th>
                  TERKUMPUL
                </th>

                <th>
                  PROGRESS
                </th>

                <th>
                  TANGGAL
                </th>

                <th className="transaction-action-head">
                  AKSI
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredData.length > 0 ? (

                filteredData.map((item) => {

                  const percentage =
                    item.target > 0
                      ? Math.min(
                          Math.round(
                            (item.current /
                              item.target) *
                              100
                          ),
                          100
                        )
                      : 0;

                  return (

                    <tr key={item.id}>

                      {/* TABUNGAN */}

                      <td>

                        <div className="transaction-main-info">

                          <div className="transaction-row-icon savings-row-icon">

                            <PiggyBank size={14} />

                          </div>

                          <div>

                            <strong>
                              {item.name}
                            </strong>

                            <span>
                              {item.description ||
                                "Tidak ada keterangan"}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* TARGET */}

                      <td>

                        <strong className="savings-target-value">

                          {formatRupiah(
                            item.target
                          )}

                        </strong>

                      </td>


                      {/* TERKUMPUL */}

                      <td>

                        <strong className="savings-current-value">

                          {formatRupiah(
                            item.current
                          )}

                        </strong>

                      </td>


                      {/* PROGRESS */}

                      <td>

                        <div className="savings-progress-wrapper">

                          <div className="savings-progress-info">

                            <span>
                              {percentage}%
                            </span>

                          </div>

                          <div className="savings-progress">

                            <div
                              className="savings-progress-bar"
                              style={{
                                width:
                                  `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                      </td>


                      {/* TANGGAL */}

                      <td>

                        <div className="transaction-date">

                          <CalendarDays size={12} />

                          <span>
                            {formatDate(item.date)}
                          </span>

                        </div>

                      </td>


                      {/* AKSI */}

                      <td>

                        <div className="transaction-action-buttons">

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

                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan="6"
                    className="transaction-empty"
                  >

                    <CircleDollarSign size={30} />

                    <strong>
                      Tidak ada tabungan
                    </strong>

                    <span>
                      Data tabungan yang kamu cari
                      tidak ditemukan.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* ===================================================
          MODAL
      =================================================== */}

      {showModal && (

        <div
          className="transaction-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }

          }}
        >

          <div className="transaction-modal">

            {/* =================================================
                MODAL HEADER
            ================================================= */}

            <div className="transaction-modal-header">

              <div>

                <h2>

                  {editingId
                    ? "Edit Tabungan"
                    : "Tambah Tabungan"}

                </h2>

                <p>
                  Masukkan detail target tabungan.
                </p>

              </div>


              <button
                className="transaction-modal-close"
                onClick={closeModal}
                type="button"
              >

                <X size={18} />

              </button>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              className="transaction-form"
              onSubmit={handleSubmit}
            >

              {/* NAMA TABUNGAN */}

              <div className="transaction-form-group">

                <label>
                  Nama Tabungan
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Contoh: Dana Darurat"
                />

              </div>


              {/* TARGET + TERKUMPUL */}

              <div className="transaction-form-row">

                {/* TARGET */}

                <div className="transaction-form-group">

                  <label>
                    Target Tabungan
                  </label>

                  <div className="transaction-input-money">

                    <span>
                      Rp
                    </span>

                    <input
                      type="number"
                      name="target"
                      value={form.target}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />

                  </div>

                </div>


                {/* TERKUMPUL */}

                <div className="transaction-form-group">

                  <label>
                    Jumlah Terkumpul
                  </label>

                  <div className="transaction-input-money">

                    <span>
                      Rp
                    </span>

                    <input
                      type="number"
                      name="current"
                      value={form.current}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />

                  </div>

                </div>

              </div>


              {/* TANGGAL */}

              <div className="transaction-form-group">

                <label>
                  Tanggal
                </label>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                />

              </div>


              {/* KETERANGAN */}

              <div className="transaction-form-group">

                <label>

                  Keterangan

                  <span>
                    Opsional
                  </span>

                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tambahkan keterangan tabungan..."
                  rows="3"
                />

              </div>


              {/* FOOTER */}

              <div className="transaction-form-footer">

                <button
                  type="button"
                  className="transaction-cancel-button"
                  onClick={closeModal}
                >
                  Batal
                </button>


                <button
                  type="submit"
                  className="transaction-save-button savings-save-button"
                >

                  {editingId
                    ? "Simpan Perubahan"
                    : "Simpan Tabungan"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default Savings;