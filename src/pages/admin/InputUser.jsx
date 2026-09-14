import { useEffect, useMemo, useState } from "react";

import {
  UserPlus,
  Search,
  Pencil,
  Trash2,
  X,
  Users,
  ShieldCheck,
  UserRound,
  Mail,
  Lock,
  KeyRound,
} from "lucide-react";

const USER_STORAGE_KEY = "cashflow_users";

const defaultUsers = [
  {
    id: 1,
    name: "Hafidh",
    email: "hafidhsya@gmail.com",
    password: "123456",
    role: "admin",
  },
  {
    id: 2,
    name: "Budi Santoso",
    email: "budi@gmail.com",
    password: "123456",
    role: "user",
  },
  {
    id: 3,
    name: "Andi Pratama",
    email: "andi@gmail.com",
    password: "123456",
    role: "user",
  },
];

function getUsers() {
  try {
    const savedUsers =
      localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUsers) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(defaultUsers)
      );

      return defaultUsers;
    }

    const parsedUsers =
      JSON.parse(savedUsers);

    if (Array.isArray(parsedUsers)) {
      return parsedUsers;
    }

    return defaultUsers;
  } catch {
    return defaultUsers;
  }
}

function InputUser() {
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    setUsers(getUsers());
  }, []);

  /* =========================================================
     SAVE USERS
  ========================================================= */

  function saveUsers(newUsers) {
    setUsers(newUsers);

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(newUsers)
    );
  }

  /* =========================================================
     OPEN ADD MODAL
  ========================================================= */

  function openAddModal() {
    setEditingUser(null);

    setForm({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });

    setError("");

    setShowModal(true);
  }

  /* =========================================================
     OPEN EDIT MODAL
  ========================================================= */

  function openEditModal(user) {
    setEditingUser(user);

    setForm({
      name: user.name,
      email: user.email,
      password: "",
      confirmPassword: "",
      role: user.role,
    });

    setError("");

    setShowModal(true);
  }

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  function closeModal() {
    setShowModal(false);

    setEditingUser(null);

    setError("");
  }

  /* =========================================================
     HANDLE INPUT
  ========================================================= */

  function handleChange(event) {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* =========================================================
     SUBMIT FORM
  ========================================================= */

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const name =
      form.name.trim();

    const email =
      form.email.trim().toLowerCase();

    /* -------------------------
       VALIDATION
    ------------------------- */

    if (!name) {
      setError(
        "Nama wajib diisi."
      );
      return;
    }

    if (!email) {
      setError(
        "Email wajib diisi."
      );
      return;
    }

    if (!email.includes("@")) {
      setError(
        "Format email tidak valid."
      );
      return;
    }

    const emailExists =
      users.some(
        (user) =>
          user.email.toLowerCase() ===
            email &&
          user.id !==
            editingUser?.id
      );

    if (emailExists) {
      setError(
        "Email sudah digunakan."
      );
      return;
    }

    /* -------------------------
       PASSWORD USER BARU
    ------------------------- */

    if (
      !editingUser &&
      !form.password
    ) {
      setError(
        "Password wajib diisi."
      );
      return;
    }

    if (
      form.password &&
      form.password.length < 6
    ) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Konfirmasi password tidak sama."
      );
      return;
    }

    /* -------------------------
       EDIT USER
    ------------------------- */

    if (editingUser) {
      const updatedUsers =
        users.map(
          (user) =>
            user.id ===
            editingUser.id
              ? {
                  ...user,
                  name,
                  email,
                  role: form.role,
                }
              : user
        );

      saveUsers(updatedUsers);

      closeModal();

      return;
    }

    /* -------------------------
       TAMBAH USER
    ------------------------- */

    const newUser = {
      id: Date.now(),
      name,
      email,
      role: form.role,

      // Password disimpan untuk demo
      // localStorage.
      password: form.password,
    };

    saveUsers([
      ...users,
      newUser,
    ]);

    closeModal();
  }

  /* =========================================================
     DELETE USER
  ========================================================= */

  function handleDelete(user) {
    /* Jangan sampai admin terakhir dihapus */

    if (user.role === "admin") {
      const adminCount =
        users.filter(
          (item) =>
            item.role === "admin"
        ).length;

      if (adminCount <= 1) {
        alert(
          "Minimal harus ada satu akun admin."
        );

        return;
      }
    }

    const confirmed =
      window.confirm(
        `Hapus user "${user.name}"?`
      );

    if (!confirmed) {
      return;
    }

    const updatedUsers =
      users.filter(
        (item) =>
          item.id !== user.id
      );

    saveUsers(updatedUsers);
  }

  /* =========================================================
     FILTER USER
  ========================================================= */

  const filteredUsers =
    useMemo(() => {
      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return users;
      }

      return users.filter(
        (user) =>
          user.name
            .toLowerCase()
            .includes(keyword) ||
          user.email
            .toLowerCase()
            .includes(keyword) ||
          user.role
            .toLowerCase()
            .includes(keyword)
      );
    }, [users, search]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalUsers =
    users.length;

  const totalAdmins =
    users.filter(
      (user) =>
        user.role === "admin"
    ).length;

  const totalRegularUsers =
    users.filter(
      (user) =>
        user.role === "user"
    ).length;

  return (
    <div className="user-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="user-page-header">

        <div>
          <h1>
            Input User
          </h1>

          <p>
            Kelola akun pengguna Cash Flow.
          </p>
        </div>

        <button
          className="user-add-button"
          onClick={openAddModal}
        >
          <UserPlus size={16} />

          <span>
            Tambah User
          </span>
        </button>

      </div>


      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="user-summary-grid">

        {/* TOTAL USER */}

        <div className="user-summary-card">

          <div className="user-summary-icon user-blue">
            <Users size={18} />
          </div>

          <div>
            <span>
              Total User
            </span>

            <strong>
              {totalUsers}
            </strong>
          </div>

        </div>


        {/* ADMIN */}

        <div className="user-summary-card">

          <div className="user-summary-icon user-purple">
            <ShieldCheck size={18} />
          </div>

          <div>
            <span>
              Admin
            </span>

            <strong>
              {totalAdmins}
            </strong>
          </div>

        </div>


        {/* USER */}

        <div className="user-summary-card">

          <div className="user-summary-icon user-green">
            <UserRound size={18} />
          </div>

          <div>
            <span>
              User
            </span>

            <strong>
              {totalRegularUsers}
            </strong>
          </div>

        </div>

      </div>


      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div className="user-table-card">

        {/* TOOLBAR */}

        <div className="user-toolbar">

          <div>
            <h2>
              Daftar User
            </h2>

            <p>
              Daftar akun yang terdaftar.
            </p>
          </div>


          {/* SEARCH */}

          <div className="user-search">

            <Search size={15} />

            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

        </div>


        {/* TABLE */}

        <div className="user-table-wrapper">

          <table className="user-table">

            <thead>

              <tr>

                <th>
                  USER
                </th>

                <th>
                  EMAIL
                </th>

                <th>
                  ROLE
                </th>

                <th>
                  AKSI
                </th>

              </tr>

            </thead>


            <tbody>

              {filteredUsers.length >
              0 ? (

                filteredUsers.map(
                  (user) => (
                    <tr
                      key={user.id}
                    >

                      {/* USER */}

                      <td>

                        <div className="user-name-cell">

                          <div className="user-avatar">
                            {user.name
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {user.name}
                            </strong>

                            <span>
                              ID #{user.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}

                      <td>

                        <div className="user-email-cell">

                          <Mail
                            size={14}
                          />

                          <span>
                            {user.email}
                          </span>

                        </div>

                      </td>


                      {/* ROLE */}

                      <td>

                        <span
                          className={
                            user.role ===
                            "admin"
                              ? "user-role-badge admin-role"
                              : "user-role-badge regular-role"
                          }
                        >

                          {user.role ===
                          "admin" ? (
                            <>
                              <ShieldCheck
                                size={12}
                              />

                              Admin
                            </>
                          ) : (
                            <>
                              <UserRound
                                size={12}
                              />

                              User
                            </>
                          )}

                        </span>

                      </td>


                      {/* ACTION */}

                      <td>

                        <div className="user-action-buttons">

                          <button
                            className="user-edit-button"
                            onClick={() =>
                              openEditModal(
                                user
                              )
                            }
                            title="Edit User"
                          >
                            <Pencil
                              size={14}
                            />
                          </button>

                          <button
                            className="user-delete-button"
                            onClick={() =>
                              handleDelete(
                                user
                              )
                            }
                            title="Hapus User"
                          >
                            <Trash2
                              size={14}
                            />
                          </button>

                        </div>

                      </td>

                    </tr>
                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan="4"
                    className="user-empty"
                  >

                    <Users
                      size={28}
                    />

                    <strong>
                      User tidak ditemukan
                    </strong>

                    <span>
                      Tidak ada user yang sesuai
                      dengan pencarian.
                    </span>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =====================================================
          MODAL
      ===================================================== */}

      {showModal && (

        <div
          className="user-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div className="user-modal">

            {/* MODAL HEADER */}

            <div className="user-modal-header">

              <div>

                <h2>
                  {editingUser
                    ? "Edit User"
                    : "Tambah User"}
                </h2>

                <p>
                  {editingUser
                    ? "Perbarui informasi akun user."
                    : "Buat akun user baru."}
                </p>

              </div>

              <button
                className="user-modal-close"
                onClick={closeModal}
              >
                <X size={18} />
              </button>

            </div>


            {/* ERROR */}

            {error && (

              <div className="user-form-error">
                {error}
              </div>

            )}


            {/* FORM */}

            <form
              className="user-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}

              <div className="user-form-group">

                <label>
                  Nama
                </label>

                <div className="user-input-wrapper">

                  <UserRound
                    size={15}
                  />

                  <input
                    type="text"
                    name="name"
                    placeholder="Masukkan nama user"
                    value={form.name}
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* EMAIL */}

              <div className="user-form-group">

                <label>
                  Email
                </label>

                <div className="user-input-wrapper">

                  <Mail
                    size={15}
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="contoh@email.com"
                    value={form.email}
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* ROLE */}

              <div className="user-form-group">

                <label>
                  Role
                </label>

                <div className="user-input-wrapper">

                  <ShieldCheck
                    size={15}
                  />

                  <select
                    name="role"
                    value={form.role}
                    onChange={
                      handleChange
                    }
                  >

                    <option value="user">
                      User
                    </option>

                    <option value="admin">
                      Admin
                    </option>

                  </select>

                </div>

              </div>


              {/* PASSWORD */}

              <div className="user-form-group">

                <label>
                  Password
                  {editingUser && (
                    <small>
                      {" "}
                      — kosongkan jika tidak diubah
                    </small>
                  )}
                </label>

                <div className="user-input-wrapper">

                  <Lock
                    size={15}
                  />

                  <input
                    type="password"
                    name="password"
                    placeholder={
                      editingUser
                        ? "Password baru"
                        : "Minimal 6 karakter"
                    }
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* CONFIRM PASSWORD */}

              <div className="user-form-group">

                <label>
                  Konfirmasi Password
                </label>

                <div className="user-input-wrapper">

                  <KeyRound
                    size={15}
                  />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Ulangi password"
                    value={
                      form.confirmPassword
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              {/* BUTTON */}

              <div className="user-form-actions">

                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={closeModal}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="user-save-button"
                >
                  {editingUser
                    ? "Simpan Perubahan"
                    : "Tambah User"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

export default InputUser;