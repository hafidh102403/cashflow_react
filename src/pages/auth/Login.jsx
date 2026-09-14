import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  Mail,
  Wallet,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

import {
  getUsers,
  setCurrentUser,
  initializeUserData,
} from "../../utils/storage";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const cleanEmail =
      email.trim().toLowerCase();

    const users = getUsers();

    const user = users.find(
      (item) =>
        item.email?.toLowerCase() ===
          cleanEmail &&
        item.password === password
    );

    if (!user) {
      setError(
        "Email atau password salah."
      );

      setLoading(false);

      return;
    }

    /*
      Simpan user yang sedang login
    */

    setCurrentUser(user);

    /*
      Pastikan user memiliki data
      keuangan sendiri.

      User baru otomatis:
      income    []
      expense   []
      savings   []
      debt      []
    */

    initializeUserData(user.id);

    setLoading(false);

    navigate("/dashboard", {
      replace: true,
    });
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">
          <Wallet size={22} />
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="login-header">

          <h1>
            Welcome Back
          </h1>

          <p>
            Login ke Cash Flow untuk
            mengelola keuangan kamu.
          </p>

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="login-error">

            <AlertCircle size={15} />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="login-field">

            <label>
              Email
            </label>

            <div className="login-input-wrapper">

              <Mail size={15} />

              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                autoComplete="email"
                required
              />

            </div>

          </div>

          {/* PASSWORD */}

          <div className="login-field">

            <label>
              Password
            </label>

            <div className="login-input-wrapper">

              <LockKeyhole size={15} />

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Masukkan password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (previous) =>
                      !previous
                  )
                }
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff size={15} />
                ) : (
                  <Eye size={15} />
                )}
              </button>

            </div>

          </div>

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : "Login"}
          </button>

        </form>

       

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="login-footer">
          Cash Flow · Financial Management System
        </div>

      </div>

    </div>
  );
}

export default Login;