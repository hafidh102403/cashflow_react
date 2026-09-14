import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Mail, Wallet } from "lucide-react";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(event) {
    event.preventDefault();

    // Login sementara untuk versi React
    navigate("/dashboard");
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

        <div className="login-header">
          <h1>Welcome Back</h1>

          <p>
            Login ke Cash Flow untuk mengelola keuangan kamu.
          </p>
        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleLogin}>

          {/* EMAIL */}

          <div className="login-field">

            <label>Email</label>

            <div className="login-input-wrapper">

              <Mail size={15} />

              <input
                type="email"
                placeholder="Masukkan email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

          </div>


          {/* PASSWORD */}

          <div className="login-field">

            <label>Password</label>

            <div className="login-input-wrapper">

              <LockKeyhole size={15} />

              <input
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>

          </div>


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
          >
            Login
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