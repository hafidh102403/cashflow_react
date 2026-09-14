import { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Wallet,
  Lock,
  Mail,
  AlertCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getUsers,
  setCurrentUser,
  initializeUserData,
} from "../../utils/storage";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  /* =====================================================
     AUTO HIDE ERROR
  ===================================================== */

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
    }, 4000);

    return () => clearTimeout(timer);
  }, [error]);

  /* =====================================================
     LOGIN
  ===================================================== */

  function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError(
        "Silakan masukkan email dan password terlebih dahulu."
      );

      return;
    }

    setLoading(true);

    const users = getUsers();

    const user = users.find(
      (item) =>
        item.email?.toLowerCase() ===
          email.trim().toLowerCase() &&
        item.password === password
    );

    /* ===================================================
       LOGIN GAGAL
    =================================================== */

    if (!user) {
      setError(
        "Email atau password yang kamu masukkan salah."
      );

      setLoading(false);

      return;
    }

    /* ===================================================
       SIMPAN USER LOGIN
    =================================================== */

    setCurrentUser(user);

    /* ===================================================
       INITIALIZE DATA USER
    =================================================== */

    initializeUserData(user.id);

    /* ===================================================
       MASUK DASHBOARD
    =================================================== */

    navigate("/dashboard", {
      replace: true,
    });

    setLoading(false);
  }

  /* =====================================================
     CLOSE ERROR
  ===================================================== */

  function closeError() {
    setError("");
  }

  return (
    <div className="login-page">

      {/* =================================================
          ERROR TOAST
      ================================================= */}

      {error && (
        <div className="login-toast-container">

          <div className="login-toast">

            <div className="login-toast-icon">
              <AlertCircle size={18} />
            </div>

            <div className="login-toast-content">

              <strong>
                Login Gagal
              </strong>

              <span>
                {error}
              </span>

            </div>

            <button
              type="button"
              className="login-toast-close"
              onClick={closeError}
              aria-label="Tutup pesan"
            >
              <X size={16} />
            </button>

          </div>

        </div>
      )}


      {/* =================================================
          LOGIN CARD
      ================================================= */}

      <div className="login-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">

          <div className="login-logo-icon">
            <Wallet size={24} />
          </div>

          <div>

            <h1>
              Cash Flow
            </h1>

            <p>
              Financial Management System
            </p>

          </div>

        </div>


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="login-header">

          <h2>
            Selamat Datang
          </h2>

          <p>
            Silakan masuk ke akun kamu.
          </p>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="login-form-group">

            <label>
              Email
            </label>

            <div className="login-input-wrapper">

              <Mail size={17} />

              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
              />

            </div>

          </div>


          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="login-form-group">

            <label>
              Password
            </label>

            <div className="login-input-wrapper">

              <Lock size={17} />

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
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() =>
                  setShowPassword(
                    (prev) => !prev
                  )
                }
                aria-label={
                  showPassword
                    ? "Sembunyikan password"
                    : "Tampilkan password"
                }
              >
                {showPassword ? (
                  <EyeOff size={17} />
                ) : (
                  <Eye size={17} />
                )}
              </button>

            </div>

          </div>


          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            className="login-submit-button"
            disabled={loading}
          >
            {loading
              ? "Memproses..."
              : "Masuk"}
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;