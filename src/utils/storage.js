// =========================================================
// USER STORAGE
// =========================================================

const USER_STORAGE_KEY = "cashflow_users";
const CURRENT_USER_STORAGE_KEY = "cashflow_current_user";

// =========================================================
// DEFAULT USERS
// =========================================================

const DEFAULT_USERS = [
  {
    id: 1,
    name: "Admin",
    email: "admin@gmail.com",
    password: "123456",
    role: "admin",
  },
  {
    id: 2,
    name: "Hafidh",
    email: "hafidhsya@gmail.com",
    password: "123456",
    role: "user",
  },
  {
    id: 3,
    name: "Budi",
    email: "budi@gmail.com",
    password: "123456",
    role: "user",
  },
  {
    id: 4,
    name: "Andi",
    email: "andi@gmail.com",
    password: "123456",
    role: "user",
  },
];

// =========================================================
// GET USERS
// =========================================================

export function getUsers() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);

    if (!saved) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(DEFAULT_USERS)
      );

      return DEFAULT_USERS;
    }

    const users = JSON.parse(saved);

    if (!Array.isArray(users)) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(DEFAULT_USERS)
      );

      return DEFAULT_USERS;
    }

    return users;
  } catch (error) {
    console.error("Gagal mengambil users:", error);
    return DEFAULT_USERS;
  }
}

// =========================================================
// SAVE USERS
// =========================================================

export function saveUsers(users) {
  if (!Array.isArray(users)) return;

  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(users)
  );
}

// =========================================================
// GET CURRENT USER
// =========================================================

export function getCurrentUser() {
  try {
    const saved = localStorage.getItem(
      CURRENT_USER_STORAGE_KEY
    );

    if (!saved) return null;

    const currentUser = JSON.parse(saved);

    if (!currentUser || currentUser.id == null) {
      return null;
    }

    // Ambil data user terbaru dari daftar users
    const users = getUsers();

    const freshUser = users.find(
      (user) => String(user.id) === String(currentUser.id)
    );

    if (!freshUser) {
      localStorage.removeItem(
        CURRENT_USER_STORAGE_KEY
      );

      return null;
    }

    return {
      id: freshUser.id,
      name: freshUser.name,
      email: freshUser.email,
      role: freshUser.role,
    };
  } catch (error) {
    console.error("Gagal mengambil current user:", error);
    return null;
  }
}

// =========================================================
// SET CURRENT USER
// =========================================================

export function setCurrentUser(user) {
  if (!user || user.id == null) return;

  const currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  localStorage.setItem(
    CURRENT_USER_STORAGE_KEY,
    JSON.stringify(currentUser)
  );

  // Pastikan storage user tersedia
  initializeUserData(user.id);
}

// =========================================================
// LOGOUT
// =========================================================

export function logoutUser() {
  localStorage.removeItem(
    CURRENT_USER_STORAGE_KEY
  );
}

// =========================================================
// USER STORAGE KEY
// =========================================================

export function getUserStorageKey(type, userId) {
  return `cashflow_${type}_user_${userId}`;
}

// =========================================================
// GET USER DATA
// =========================================================

export function getUserData(type, userId) {
  if (userId == null) return [];

  try {
    const key = getUserStorageKey(type, userId);

    const saved = localStorage.getItem(key);

    if (!saved) return [];

    const data = JSON.parse(saved);

    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(
      `Gagal mengambil data ${type} user ${userId}:`,
      error
    );

    return [];
  }
}

// =========================================================
// SAVE USER DATA
// =========================================================

export function saveUserData(type, userId, data) {
  if (userId == null) return;

  if (!Array.isArray(data)) return;

  try {
    const key = getUserStorageKey(type, userId);

    localStorage.setItem(
      key,
      JSON.stringify(data)
    );
  } catch (error) {
    console.error(
      `Gagal menyimpan data ${type} user ${userId}:`,
      error
    );
  }
}

// =========================================================
// INITIALIZE USER DATA
// =========================================================

export function initializeUserData(userId) {
  if (userId == null) return;

  const types = [
    "income",
    "expense",
    "savings",
    "debt",
  ];

  types.forEach((type) => {
    const key = getUserStorageKey(type, userId);

    if (localStorage.getItem(key) === null) {
      localStorage.setItem(
        key,
        JSON.stringify([])
      );
    }
  });
}

// =========================================================
// RESET USER DATA
// =========================================================

export function resetUserData(userId) {
  if (userId == null) return;

  const types = [
    "income",
    "expense",
    "savings",
    "debt",
  ];

  types.forEach((type) => {
    const key = getUserStorageKey(type, userId);

    localStorage.setItem(
      key,
      JSON.stringify([])
    );
  });
}

// =========================================================
// DELETE USER DATA
// =========================================================

export function deleteUserData(userId) {
  if (userId == null) return;

  const types = [
    "income",
    "expense",
    "savings",
    "debt",
  ];

  types.forEach((type) => {
    const key = getUserStorageKey(type, userId);

    localStorage.removeItem(key);
  });
}

// =========================================================
// DELETE OLD GLOBAL STORAGE
// =========================================================

export function deleteLegacyData() {
  localStorage.removeItem("cashflow_income");
  localStorage.removeItem("cashflow_expense");
}

// =========================================================
// EXPORT
// =========================================================

export { DEFAULT_USERS };