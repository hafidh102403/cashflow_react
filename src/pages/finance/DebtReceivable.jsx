import { useMemo, useState } from "react";

import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  CalendarDays,
  Wallet,
  ReceiptText,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
} from "lucide-react";


/* =========================================================
   DATA AWAL
========================================================= */

const initialData = [
  {
    id: 1,
    type: "utang",
    person: "Andi",
    title: "Pinjaman Pribadi",
    amount: 3000000,
    paid: 1000000,
    date: "2026-09-05",
    dueDate: "2026-10-05",
    description: "Pinjaman untuk kebutuhan pribadi",
  },

  {
    id: 2,
    type: "piutang",
    person: "Budi",
    title: "Pinjaman Teman",
    amount: 2500000,
    paid: 1500000,
    date: "2026-09-02",
    dueDate: "2026-09-30",
    description: "Pinjaman sementara",
  },

  {
    id: 3,
    type: "utang",
    person: "Toko Laptop",
    title: "Cicilan Laptop",
    amount: 5000000,
    paid: 2500000,
    date: "2026-08-15",
    dueDate: "2026-12-15",
    description: "Cicilan pembelian laptop",
  },

  {
    id: 4,
    type: "piutang",
    person: "Rizky",
    title: "Pinjaman",
    amount: 1500000,
    paid: 0,
    date: "2026-08-20",
    dueDate: "2026-09-25",
    description: "Pinjaman teman",
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
   COMPONENT
========================================================= */

function DebtReceivable() {

  /* =======================================================
     STATE
  ======================================================= */

  const [data, setData] = useState(
    initialData
  );

  const [search, setSearch] = useState("");

  const [filterType, setFilterType] =
    useState("semua");

  const [showModal, setShowModal] =
    useState(false);

  const [editingId, setEditingId] =
    useState(null);

  const [form, setForm] = useState({
    type: "utang",
    person: "",
    title: "",
    amount: "",
    paid: "",
    date: new Date()
      .toISOString()
      .split("T")[0],
    dueDate: "",
    description: "",
  });


  /* =======================================================
     TOTAL UTANG
  ======================================================= */

  const totalDebt = useMemo(() => {

    return data
      .filter(
        (item) =>
          item.type === "utang"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount),
        0
      );

  }, [data]);


  /* =======================================================
     TOTAL PIUTANG
  ======================================================= */

  const totalReceivable = useMemo(() => {

    return data
      .filter(
        (item) =>
          item.type === "piutang"
      )
      .reduce(
        (total, item) =>
          total + Number(item.amount),
        0
      );

  }, [data]);


  /* =======================================================
     SISA UTANG
  ======================================================= */

  const remainingDebt = useMemo(() => {

    return data
      .filter(
        (item) =>
          item.type === "utang"
      )
      .reduce(
        (total, item) =>
          total +
          Math.max(
            Number(item.amount) -
              Number(item.paid),
            0
          ),
        0
      );

  }, [data]);


  /* =======================================================
     SISA PIUTANG
  ======================================================= */

  const remainingReceivable =
    useMemo(() => {

      return data
        .filter(
          (item) =>
            item.type === "piutang"
        )
        .reduce(
          (total, item) =>
            total +
            Math.max(
              Number(item.amount) -
                Number(item.paid),
              0
            ),
          0
        );

    }, [data]);


  /* =======================================================
     TOTAL LUNAS
  ======================================================= */

  const totalPaid = useMemo(() => {

    return data.reduce(
      (total, item) =>
        total + Number(item.paid),
      0
    );

  }, [data]);


  /* =======================================================
     FILTER DATA
  ======================================================= */

  const filteredData = useMemo(() => {

    const keyword =
      search
        .toLowerCase()
        .trim();

    return data.filter((item) => {

      const matchesSearch =
        !keyword ||
        item.person
          .toLowerCase()
          .includes(keyword) ||
        item.title
          .toLowerCase()
          .includes(keyword) ||
        item.description
          .toLowerCase()
          .includes(keyword);

      const matchesType =
        filterType === "semua" ||
        item.type === filterType;

      return (
        matchesSearch &&
        matchesType
      );

    });

  }, [
    data,
    search,
    filterType,
  ]);


  /* =======================================================
     RESET FORM
  ======================================================= */

  function resetForm() {

    setForm({
      type: "utang",
      person: "",
      title: "",
      amount: "",
      paid: "",
      date: new Date()
        .toISOString()
        .split("T")[0],
      dueDate: "",
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
      type: item.type,
      person: item.person,
      title: item.title,
      amount: item.amount,
      paid: item.paid,
      date: item.date,
      dueDate: item.dueDate,
      description:
        item.description,
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

    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }


  /* =======================================================
     SUBMIT
  ======================================================= */

  function handleSubmit(event) {

    event.preventDefault();

    if (
      !form.person.trim() ||
      !form.title.trim() ||
      !form.amount ||
      Number(form.amount) <= 0 ||
      form.paid === "" ||
      Number(form.paid) < 0 ||
      !form.date
    ) {

      alert(
        "Silakan lengkapi data utang/piutang."
      );

      return;
    }


    if (
      Number(form.paid) >
      Number(form.amount)
    ) {

      alert(
        "Jumlah yang sudah dibayar tidak boleh lebih besar dari total."
      );

      return;
    }


    const newData = {

      id:
        editingId ||
        Date.now(),

      type:
        form.type,

      person:
        form.person.trim(),

      title:
        form.title.trim(),

      amount:
        Number(form.amount),

      paid:
        Number(form.paid),

      date:
        form.date,

      dueDate:
        form.dueDate,

      description:
        form.description.trim(),
    };


    /* =====================================================
       EDIT
    ===================================================== */

    if (editingId) {

      setData((previous) =>

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

      setData((previous) => [
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

    const confirmDelete =
      window.confirm(
        "Apakah kamu yakin ingin menghapus data ini?"
      );

    if (!confirmDelete) {
      return;
    }

    setData((previous) =>
      previous.filter(
        (item) => item.id !== id
      )
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="transaction-page debt-page">


      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="transaction-page-header">

        <div>

          <h1>
            Utang Piutang
          </h1>

          <p>
            Kelola dan pantau seluruh utang dan piutang kamu.
          </p>

        </div>


        <button
          className="transaction-add-button debt-add-button"
          onClick={openAddModal}
        >

          <Plus size={15} />

          <span>
            Tambah Data
          </span>

        </button>

      </div>


      {/* ===================================================
          SUMMARY
      =================================================== */}

      <div className="transaction-summary-grid debt-summary-grid">


        {/* TOTAL UTANG */}

        <div className="transaction-summary-card debt-summary-card">

          <div className="transaction-summary-icon debt-icon">

            <ArrowUpRight size={18} />

          </div>

          <div>

            <span>
              Total Utang
            </span>

            <strong>
              {formatRupiah(totalDebt)}
            </strong>

          </div>

        </div>


        {/* SISA UTANG */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon expense-summary-icon">

            <Wallet size={18} />

          </div>

          <div>

            <span>
              Sisa Utang
            </span>

            <strong>
              {formatRupiah(
                remainingDebt
              )}
            </strong>

          </div>

        </div>


        {/* TOTAL PIUTANG */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon receivable-icon">

            <ArrowDownLeft size={18} />

          </div>

          <div>

            <span>
              Total Piutang
            </span>

            <strong>
              {formatRupiah(
                totalReceivable
              )}
            </strong>

          </div>

        </div>


        {/* SISA PIUTANG */}

        <div className="transaction-summary-card">

          <div className="transaction-summary-icon green-summary">

            <CircleDollarSign size={18} />

          </div>

          <div>

            <span>
              Sisa Piutang
            </span>

            <strong>
              {formatRupiah(
                remainingReceivable
              )}
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
                Daftar Utang Piutang
              </h2>

              <p>
                Kelola status dan pembayaran
              </p>

            </div>

          </div>


          <div className="transaction-toolbar-actions">


            {/* SEARCH */}

            <div className="transaction-search">

              <Search size={15} />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Cari data..."
              />

            </div>


            {/* FILTER */}

            <select
              className="debt-filter"
              value={filterType}
              onChange={(event) =>
                setFilterType(
                  event.target.value
                )
              }
            >

              <option value="semua">
                Semua
              </option>

              <option value="utang">
                Utang
              </option>

              <option value="piutang">
                Piutang
              </option>

            </select>

          </div>

        </div>


        {/* =================================================
            TABLE
        ================================================= */}

        <div className="transaction-list-wrapper">

          <table className="transaction-list-table debt-table">

            <thead>

              <tr>

                <th>
                  NAMA
                </th>

                <th>
                  JENIS
                </th>

                <th>
                  TOTAL
                </th>

                <th>
                  TERBAYAR
                </th>

                <th>
                  SISA
                </th>

                <th>
                  STATUS
                </th>

                <th>
                  JATUH TEMPO
                </th>

                <th className="transaction-action-head">
                  AKSI
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredData.length > 0 ? (

                filteredData.map(
                  (item) => {

                    const remaining =
                      Math.max(
                        Number(
                          item.amount
                        ) -
                          Number(
                            item.paid
                          ),
                        0
                      );

                    const percentage =
                      item.amount > 0
                        ? Math.min(
                            Math.round(
                              (item.paid /
                                item.amount) *
                                100
                            ),
                            100
                          )
                        : 0;

                    const isPaid =
                      remaining === 0;


                    return (

                      <tr key={item.id}>


                        {/* NAMA */}

                        <td>

                          <div className="transaction-main-info">

                            <div
                              className={
                                item.type ===
                                "utang"
                                  ? "transaction-row-icon expense-row-icon"
                                  : "transaction-row-icon income-row-icon"
                              }
                            >

                              {item.type ===
                              "utang" ? (
                                <ArrowUpRight
                                  size={14}
                                />
                              ) : (
                                <ArrowDownLeft
                                  size={14}
                                />
                              )}

                            </div>


                            <div>

                              <strong>
                                {item.person}
                              </strong>

                              <span>
                                {item.title}
                              </span>

                            </div>

                          </div>

                        </td>


                        {/* JENIS */}

                        <td>

                          <span
                            className={
                              item.type ===
                              "utang"
                                ? "debt-type debt-type-utang"
                                : "debt-type debt-type-piutang"
                            }
                          >

                            {item.type ===
                            "utang"
                              ? "Utang"
                              : "Piutang"}

                          </span>

                        </td>


                        {/* TOTAL */}

                        <td>

                          <strong className="debt-total-value">

                            {formatRupiah(
                              item.amount
                            )}

                          </strong>

                        </td>


                        {/* TERBAYAR */}

                        <td>

                          <div className="paid-wrapper">

                            <strong>
                              {formatRupiah(
                                item.paid
                              )}
                            </strong>

                            <div className="paid-progress">

                              <div
                                className="paid-progress-bar"
                                style={{
                                  width:
                                    `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>

                        </td>


                        {/* SISA */}

                        <td>

                          <strong
                            className={
                              isPaid
                                ? "debt-remaining-paid"
                                : "debt-remaining"
                            }
                          >

                            {formatRupiah(
                              remaining
                            )}

                          </strong>

                        </td>


                        {/* STATUS */}

                        <td>

                          <span
                            className={
                              isPaid
                                ? "debt-status debt-status-paid"
                                : "debt-status debt-status-unpaid"
                            }
                          >

                            {isPaid ? (
                              <>
                                <CheckCircle2
                                  size={11}
                                />
                                Lunas
                              </>
                            ) : (
                              <>
                                <Clock3
                                  size={11}
                                />
                                Belum Lunas
                              </>
                            )}

                          </span>

                        </td>


                        {/* JATUH TEMPO */}

                        <td>

                          <div className="transaction-date">

                            <CalendarDays
                              size={12}
                            />

                            <span>
                              {formatDate(
                                item.dueDate
                              )}
                            </span>

                          </div>

                        </td>


                        {/* AKSI */}

                        <td>

                          <div className="transaction-action-buttons">

                            <button
                              className="transaction-edit-button"
                              onClick={() =>
                                openEditModal(
                                  item
                                )
                              }
                              title="Edit"
                            >

                              <Pencil
                                size={13}
                              />

                            </button>


                            <button
                              className="transaction-delete-button"
                              onClick={() =>
                                handleDelete(
                                  item.id
                                )
                              }
                              title="Hapus"
                            >

                              <Trash2
                                size={13}
                              />

                            </button>

                          </div>

                        </td>

                      </tr>

                    );

                  }
                )

              ) : (

                <tr>

                  <td
                    colSpan="8"
                    className="transaction-empty"
                  >

                    <CircleDollarSign
                      size={30}
                    />

                    <strong>
                      Tidak ada data
                    </strong>

                    <span>
                      Data utang atau piutang
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
          FOOTER SUMMARY
      =================================================== */}

      <div className="debt-footer-summary">

        <div>

          <ReceiptText size={14} />

          <span>
            Total sudah dibayar
          </span>

          <strong>
            {formatRupiah(
              totalPaid
            )}
          </strong>

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
                    ? "Edit Utang Piutang"
                    : "Tambah Utang Piutang"}

                </h2>

                <p>
                  Masukkan detail utang atau piutang.
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


              {/* JENIS */}

              <div className="transaction-form-group">

                <label>
                  Jenis Transaksi
                </label>

                <div className="debt-type-selector">


                  <button
                    type="button"
                    className={
                      form.type ===
                      "utang"
                        ? "debt-type-option active-debt"
                        : "debt-type-option"
                    }
                    onClick={() =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          type: "utang",
                        })
                      )
                    }
                  >

                    <ArrowUpRight
                      size={15}
                    />

                    <div>

                      <strong>
                        Utang
                      </strong>

                      <span>
                        Uang yang harus kamu bayar
                      </span>

                    </div>

                  </button>


                  <button
                    type="button"
                    className={
                      form.type ===
                      "piutang"
                        ? "debt-type-option active-receivable"
                        : "debt-type-option"
                    }
                    onClick={() =>
                      setForm(
                        (previous) => ({
                          ...previous,
                          type: "piutang",
                        })
                      )
                    }
                  >

                    <ArrowDownLeft
                      size={15}
                    />

                    <div>

                      <strong>
                        Piutang
                      </strong>

                      <span>
                        Uang yang harus diterima
                      </span>

                    </div>

                  </button>

                </div>

              </div>


              {/* NAMA */}

              <div className="transaction-form-row">

                <div className="transaction-form-group">

                  <label>
                    Nama Orang / Pihak
                  </label>

                  <input
                    type="text"
                    name="person"
                    value={form.person}
                    onChange={handleChange}
                    placeholder="Contoh: Andi"
                  />

                </div>


                <div className="transaction-form-group">

                  <label>
                    Nama Transaksi
                  </label>

                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Contoh: Pinjaman"
                  />

                </div>

              </div>


              {/* NOMINAL */}

              <div className="transaction-form-row">

                <div className="transaction-form-group">

                  <label>
                    Total Nominal
                  </label>

                  <div className="transaction-input-money">

                    <span>
                      Rp
                    </span>

                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />

                  </div>

                </div>


                <div className="transaction-form-group">

                  <label>
                    Sudah Dibayar
                  </label>

                  <div className="transaction-input-money">

                    <span>
                      Rp
                    </span>

                    <input
                      type="number"
                      name="paid"
                      value={form.paid}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                    />

                  </div>

                </div>

              </div>


              {/* TANGGAL */}

              <div className="transaction-form-row">

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


                <div className="transaction-form-group">

                  <label>
                    Jatuh Tempo
                  </label>

                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleChange}
                  />

                </div>

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
                  placeholder="Tambahkan keterangan..."
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
                  className="transaction-save-button debt-save-button"
                >

                  {editingId
                    ? "Simpan Perubahan"
                    : "Simpan Data"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default DebtReceivable;