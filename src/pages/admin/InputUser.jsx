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
    const savedUsers = localStorage.getItem(USER_STORAGE_KEY);

    if (!savedUsers) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(defaultUsers)
      );

      return defaultUsers;
    }

    const parsedUsers = JSON.parse(savedUsers);

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
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const [error, setError] = useState("");

  /* =========================================================
     LOAD USERS
  ========================================================= */

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
     ADD USER
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
     EDIT USER
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
     FORM CHANGE
  ========================================================= */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (!name) {
      setError("Nama wajib diisi.");
      return;
    }

    if (!email) {
      setError("Email wajib diisi.");
      return;
    }

    if (!email.includes("@")) {
      setError("Format email tidak valid.");
      return;
    }

    const emailExists = users.some(
      (user) =>
        user.email.toLowerCase() === email &&
        user.id !== editingUser?.id
    );

    if (emailExists) {
      setError("Email sudah digunakan.");
      return;
    }

    if (!editingUser && !form.password) {
      setError("Password wajib diisi.");
      return;
    }

    if (form.password && form.password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    /* =======================================================
       EDIT
    ======================================================= */

    if (editingUser) {
      const updatedUsers = users.map((user) =>
        user.id === editingUser.id
          ? {
              ...user,
              name,
              email,
              role: form.role,
              ...(form.password
                ? { password: form.password }
                : {}),
            }
          : user
      );

      saveUsers(updatedUsers);

      closeModal();

      return;
    }

    /* =======================================================
       ADD
    ======================================================= */

    const newUser = {
      id: Date.now(),
      name,
      email,
      role: form.role,
      password: form.password,
    };

    saveUsers([
      ...users,
      newUser,
    ]);

    closeModal();
  }

  /* =========================================================
     DELETE
  ========================================================= */

  function handleDelete(user) {
    if (user.role === "admin") {
      const adminCount = users.filter(
        (item) => item.role === "admin"
      ).length;

      if (adminCount <= 1) {
        alert("Minimal harus ada satu akun admin.");
        return;
      }
    }

    const confirmed = window.confirm(
      `Hapus user "${user.name}"?`
    );

    if (!confirmed) {
      return;
    }

    const updatedUsers = users.filter(
      (item) => item.id !== user.id
    );

    saveUsers(updatedUsers);
  }

  /* =========================================================
     SEARCH
  ========================================================= */

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return users;
    }

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.role.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  /* =========================================================
     SUMMARY
  ========================================================= */

  const totalUsers = users.length;

  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

  const totalRegularUsers = users.filter(
    (user) => user.role === "user"
  ).length;

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="user-page"
      style={{
        width: "100%",
        fontSize: "9px",
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        className="user-page-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "18px",
              lineHeight: "1.2",
              fontWeight: 700,
            }}
          >
            Input User
          </h1>

          <p
            style={{
              margin: "3px 0 0",
              fontSize: "10px",
              lineHeight: "1.3",
              color: "#64748b",
            }}
          >
            Kelola akun pengguna Cash Flow.
          </p>
        </div>

        <button
          className="user-add-button"
          onClick={openAddModal}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "5px",
            height: "30px",
            padding: "0 10px",
            border: "none",
            borderRadius: "5px",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: "9px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <UserPlus size={13} />
          <span>Tambah User</span>
        </button>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div
        className="user-summary-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(3, minmax(0, 1fr))",
          gap: "8px",
          marginBottom: "10px",
        }}
      >
        {/* TOTAL USER */}

        <div
          className="user-summary-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
          }}
        >
          <div
            className="user-summary-icon user-blue"
            style={{
              width: "30px",
              height: "30px",
              minWidth: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: "#eff6ff",
              color: "#2563eb",
            }}
          >
            <Users size={14} />
          </div>

          <div>
            <span
              style={{
                display: "block",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              Total User
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "14px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              {totalUsers}
            </strong>
          </div>
        </div>

        {/* ADMIN */}

        <div
          className="user-summary-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
          }}
        >
          <div
            className="user-summary-icon user-purple"
            style={{
              width: "30px",
              height: "30px",
              minWidth: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: "#f5f3ff",
              color: "#7c3aed",
            }}
          >
            <ShieldCheck size={14} />
          </div>

          <div>
            <span
              style={{
                display: "block",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              Admin
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "14px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              {totalAdmins}
            </strong>
          </div>
        </div>

        {/* USER */}

        <div
          className="user-summary-card"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            minHeight: "52px",
            padding: "8px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: "6px",
            background: "#ffffff",
          }}
        >
          <div
            className="user-summary-icon user-green"
            style={{
              width: "30px",
              height: "30px",
              minWidth: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              background: "#ecfdf5",
              color: "#059669",
            }}
          >
            <UserRound size={14} />
          </div>

          <div>
            <span
              style={{
                display: "block",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              User
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "2px",
                fontSize: "14px",
                lineHeight: "1.1",
                fontWeight: 700,
              }}
            >
              {totalRegularUsers}
            </strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE CARD
      ===================================================== */}

      <div
        className="user-table-card"
        style={{
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          background: "#ffffff",
        }}
      >
        {/* TOOLBAR */}

        <div
          className="user-toolbar"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            padding: "9px 10px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: "1.2",
                fontWeight: 700,
              }}
            >
              Daftar User
            </h2>

            <p
              style={{
                margin: "2px 0 0",
                fontSize: "8px",
                lineHeight: "1.2",
                color: "#64748b",
              }}
            >
              Daftar akun yang terdaftar.
            </p>
          </div>

          <div
            className="user-search"
            style={{
              width: "190px",
              height: "27px",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "0 8px",
              border: "1px solid #dbe1e8",
              borderRadius: "5px",
              background: "#ffffff",
              color: "#94a3b8",
            }}
          >
            <Search size={12} />

            <input
              type="text"
              placeholder="Cari user..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              style={{
                width: "100%",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "8px",
                color: "#334155",
              }}
            />
          </div>
        </div>

        {/* TABLE */}

        <div
          className="user-table-wrapper"
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <table
            className="user-table"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              tableLayout: "fixed",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    width: "28%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  USER
                </th>

                <th
                  style={{
                    width: "32%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  EMAIL
                </th>

                <th
                  style={{
                    width: "20%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  ROLE
                </th>

                <th
                  style={{
                    width: "20%",
                    padding: "7px 10px",
                    textAlign: "left",
                    fontSize: "7px",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderBottom:
                      "1px solid #e5e7eb",
                  }}
                >
                  AKSI
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    {/* USER */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        className="user-name-cell"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "7px",
                        }}
                      >
                        <div
                          className="user-avatar"
                          style={{
                            width: "26px",
                            height: "26px",
                            minWidth: "26px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "50%",
                            background: "#eff6ff",
                            color: "#2563eb",
                            fontSize: "9px",
                            fontWeight: 700,
                          }}
                        >
                          {user.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div
                          style={{
                            minWidth: 0,
                          }}
                        >
                          <strong
                            style={{
                              display: "block",
                              fontSize: "9px",
                              lineHeight: "1.2",
                              fontWeight: 600,
                              color: "#1e293b",
                            }}
                          >
                            {user.name}
                          </strong>

                          <span
                            style={{
                              display: "block",
                              marginTop: "2px",
                              fontSize: "7px",
                              lineHeight: "1.2",
                              color: "#94a3b8",
                            }}
                          >
                            ID #{user.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* EMAIL */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        className="user-email-cell"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          minWidth: 0,
                          color: "#64748b",
                        }}
                      >
                        <Mail size={11} />

                        <span
                          style={{
                            fontSize: "8px",
                            lineHeight: "1.2",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {user.email}
                        </span>
                      </div>
                    </td>

                    {/* ROLE */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <span
                        className={
                          user.role === "admin"
                            ? "user-role-badge admin-role"
                            : "user-role-badge regular-role"
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "3px 6px",
                          borderRadius: "4px",
                          fontSize: "7px",
                          lineHeight: "1.2",
                          fontWeight: 600,
                          background:
                            user.role === "admin"
                              ? "#f5f3ff"
                              : "#ecfdf5",
                          color:
                            user.role === "admin"
                              ? "#7c3aed"
                              : "#059669",
                        }}
                      >
                        {user.role === "admin" ? (
                          <>
                            <ShieldCheck size={9} />
                            Admin
                          </>
                        ) : (
                          <>
                            <UserRound size={9} />
                            User
                          </>
                        )}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td
                      style={{
                        padding: "7px 10px",
                        borderBottom:
                          "1px solid #f1f5f9",
                        verticalAlign: "middle",
                      }}
                    >
                      <div
                        className="user-action-buttons"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <button
                          className="user-edit-button"
                          onClick={() =>
                            openEditModal(user)
                          }
                          title="Edit User"
                          style={{
                            width: "25px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #dbeafe",
                            borderRadius: "4px",
                            background: "#eff6ff",
                            color: "#2563eb",
                            cursor: "pointer",
                          }}
                        >
                          <Pencil size={11} />
                        </button>

                        <button
                          className="user-delete-button"
                          onClick={() =>
                            handleDelete(user)
                          }
                          title="Hapus User"
                          style={{
                            width: "25px",
                            height: "25px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #fee2e2",
                            borderRadius: "4px",
                            background: "#fef2f2",
                            color: "#dc2626",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      padding: "30px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div
                      className="user-empty"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        color: "#94a3b8",
                      }}
                    >
                      <Users size={24} />

                      <strong
                        style={{
                          fontSize: "9px",
                          color: "#64748b",
                        }}
                      >
                        User tidak ditemukan
                      </strong>

                      <span
                        style={{
                          fontSize: "8px",
                        }}
                      >
                        Tidak ada user yang sesuai
                        dengan pencarian.
                      </span>
                    </div>
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
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "15px",
            background:
              "rgba(15, 23, 42, 0.45)",
          }}
        >
          <div
            className="user-modal"
            style={{
              width: "100%",
              maxWidth: "390px",
              maxHeight: "90vh",
              overflowY: "auto",
              borderRadius: "7px",
              background: "#ffffff",
              boxShadow:
                "0 20px 45px rgba(15, 23, 42, 0.18)",
            }}
          >
            {/* MODAL HEADER */}

            <div
              className="user-modal-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 12px",
                borderBottom:
                  "1px solid #e5e7eb",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "14px",
                    lineHeight: "1.2",
                    fontWeight: 700,
                    color: "#0f172a",
                  }}
                >
                  {editingUser
                    ? "Edit User"
                    : "Tambah User"}
                </h2>

                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: "8px",
                    lineHeight: "1.2",
                    color: "#64748b",
                  }}
                >
                  {editingUser
                    ? "Perbarui informasi akun user."
                    : "Buat akun user baru."}
                </p>
              </div>

              <button
                className="user-modal-close"
                onClick={closeModal}
                style={{
                  width: "26px",
                  height: "26px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "none",
                  borderRadius: "4px",
                  background: "#f8fafc",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                <X size={13} />
              </button>
            </div>

            {/* ERROR */}

            {error && (
              <div
                className="user-form-error"
                style={{
                  margin: "9px 12px 0",
                  padding: "7px 8px",
                  borderRadius: "4px",
                  background: "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  color: "#dc2626",
                  fontSize: "8px",
                  lineHeight: "1.3",
                }}
              >
                {error}
              </div>
            )}

            {/* FORM */}

            <form
              className="user-form"
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "9px",
                padding: "11px 12px 12px",
              }}
            >
              {/* NAMA */}

              <div
                className="user-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Nama
                </label>

                <div
                  className="user-input-wrapper"
                  style={{
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 8px",
                    border:
                      "1px solid #dbe1e8",
                    borderRadius: "4px",
                    color: "#94a3b8",
                  }}
                >
                  <UserRound size={12} />

                  <input
                    type="text"
                    name="name"
                    placeholder="Masukkan nama user"
                    value={form.name}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: "8px",
                      color: "#334155",
                      background:
                        "transparent",
                    }}
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div
                className="user-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Email
                </label>

                <div
                  className="user-input-wrapper"
                  style={{
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 8px",
                    border:
                      "1px solid #dbe1e8",
                    borderRadius: "4px",
                    color: "#94a3b8",
                  }}
                >
                  <Mail size={12} />

                  <input
                    type="email"
                    name="email"
                    placeholder="contoh@email.com"
                    value={form.email}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: "8px",
                      color: "#334155",
                      background:
                        "transparent",
                    }}
                  />
                </div>
              </div>

              {/* ROLE */}

              <div
                className="user-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Role
                </label>

                <div
                  className="user-input-wrapper"
                  style={{
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 8px",
                    border:
                      "1px solid #dbe1e8",
                    borderRadius: "4px",
                    color: "#94a3b8",
                  }}
                >
                  <ShieldCheck size={12} />

                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: "8px",
                      color: "#334155",
                      background:
                        "transparent",
                    }}
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

              <div
                className="user-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Password

                  {editingUser && (
                    <small
                      style={{
                        fontSize: "7px",
                        color: "#94a3b8",
                      }}
                    >
                      {" "}
                      — kosongkan jika tidak diubah
                    </small>
                  )}
                </label>

                <div
                  className="user-input-wrapper"
                  style={{
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 8px",
                    border:
                      "1px solid #dbe1e8",
                    borderRadius: "4px",
                    color: "#94a3b8",
                  }}
                >
                  <Lock size={12} />

                  <input
                    type="password"
                    name="password"
                    placeholder={
                      editingUser
                        ? "Password baru"
                        : "Minimal 6 karakter"
                    }
                    value={form.password}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: "8px",
                      color: "#334155",
                      background:
                        "transparent",
                    }}
                  />
                </div>
              </div>

              {/* CONFIRM PASSWORD */}

              <div
                className="user-form-group"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                }}
              >
                <label
                  style={{
                    fontSize: "8px",
                    lineHeight: "1.2",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  Konfirmasi Password
                </label>

                <div
                  className="user-input-wrapper"
                  style={{
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "0 8px",
                    border:
                      "1px solid #dbe1e8",
                    borderRadius: "4px",
                    color: "#94a3b8",
                  }}
                >
                  <KeyRound size={12} />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Ulangi password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      border: "none",
                      outline: "none",
                      fontSize: "8px",
                      color: "#334155",
                      background:
                        "transparent",
                    }}
                  />
                </div>
              </div>

              {/* ACTION */}

              <div
                className="user-form-actions"
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "6px",
                  marginTop: "2px",
                  paddingTop: "9px",
                  borderTop:
                    "1px solid #f1f5f9",
                }}
              >
                <button
                  type="button"
                  className="user-cancel-button"
                  onClick={closeModal}
                  style={{
                    height: "28px",
                    padding: "0 10px",
                    border:
                      "1px solid #dbe1e8",
                    borderRadius: "4px",
                    background: "#ffffff",
                    color: "#475569",
                    fontSize: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="user-save-button"
                  style={{
                    height: "28px",
                    padding: "0 10px",
                    border: "none",
                    borderRadius: "4px",
                    background: "#2563eb",
                    color: "#ffffff",
                    fontSize: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
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