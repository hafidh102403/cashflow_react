import { Navigate, Outlet } from "react-router-dom";

import {
  getCurrentUser,
} from "../utils/storage";

function ProtectedRoute({
  allowedRoles,
}) {
  const currentUser =
    getCurrentUser();

  /* =====================================================
     BELUM LOGIN
  ===================================================== */

  if (!currentUser) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =====================================================
     CEK ROLE
  ===================================================== */

  if (
    allowedRoles &&
    !allowedRoles.includes(
      currentUser.role
    )
  ) {
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  /* =====================================================
     IZINKAN AKSES
  ===================================================== */

  return <Outlet />;
}

export default ProtectedRoute;