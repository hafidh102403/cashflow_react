/* =========================================================
   STORAGE CONFIGURATION
========================================================= */

const USER_STORAGE_KEY = "cashflow_users";
const CURRENT_USER_STORAGE_KEY = "cashflow_current_user";

/* =========================================================
   DEFAULT USERS
========================================================= */

const DEFAULT_USERS = [
  {
    id: 1,
    name: "Admin",
    email: "admin@cashflow.com",
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

/* =========================================================
   GET USERS
========================================================= */

export function getUsers() {
  try {
    const saved = localStorage.getItem(
      USER_STORAGE_KEY
    );

    /* =====================================================
       BELUM ADA DATA USER
    ===================================================== */

    if (!saved) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(DEFAULT_USERS)
      );

      return DEFAULT_USERS;
    }

    const parsedUsers = JSON.parse(saved);

    /* =====================================================
       DATA TIDAK VALID
    ===================================================== */

    if (!Array.isArray(parsedUsers)) {
      localStorage.setItem(
        USER_STORAGE_KEY,
        JSON.stringify(DEFAULT_USERS)
      );

      return DEFAULT_USERS;
    }

    let users = [...parsedUsers];

    /* =====================================================
       PASTIKAN ADMIN ADA
    ===================================================== */

    const adminIndex = users.findIndex(
      (user) =>
        user.email?.toLowerCase() ===
        "admin@cashflow.com"
    );

    if (adminIndex === -1) {
      users.unshift({
        id: 1,
        name: "Admin",
        email: "admin@cashflow.com",
        password: "123456",
        role: "admin",
      });
    } else {
      /*
       * Paksa akun admin tetap menjadi:
       * Admin / admin / admin@cashflow.com
       */

      users[adminIndex] = {
        ...users[adminIndex],
        id: 1,
        name: "Admin",
        email: "admin@cashflow.com",
        password:
          users[adminIndex].password ||
          "123456",
        role: "admin",
      };
    }

    /* =====================================================
       PASTIKAN HAFIDH USER
       
       Kalau sebelumnya Hafidh tersimpan sebagai admin,
       otomatis ubah menjadi user.
    ===================================================== */

    users = users.map((user) => {
      const email =
        user.email?.toLowerCase();

      if (
        email === "hafidhsya@gmail.com" ||
        email === "hafidh@gmail.com"
      ) {
        return {
          ...user,
          id: 2,
          name: "Hafidh",
          email: "hafidhsya@gmail.com",
          role: "user",
        };
      }

      return user;
    });

    /* =====================================================
       PASTIKAN USER DEFAULT ADA
    ===================================================== */

    DEFAULT_USERS.forEach(
      (defaultUser) => {
        const exists = users.some(
          (user) =>
            user.email?.toLowerCase() ===
            defaultUser.email.toLowerCase()
        );

        if (!exists) {
          users.push(defaultUser);
        }
      }
    );

    /* =====================================================
       HAPUS DUPLIKAT EMAIL
       
       Mencegah satu email muncul lebih dari sekali.
    ===================================================== */

    const uniqueUsers = [];

    users.forEach((user) => {
      const email =
        user.email?.toLowerCase();

      const alreadyExists =
        uniqueUsers.some(
          (item) =>
            item.email?.toLowerCase() ===
            email
        );

      if (!alreadyExists) {
        uniqueUsers.push(user);
      }
    });

    /* =====================================================
       SIMPAN DATA USER TERBARU
    ===================================================== */

    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(uniqueUsers)
    );

    return uniqueUsers;
  } catch {
    localStorage.setItem(
      USER_STORAGE_KEY,
      JSON.stringify(DEFAULT_USERS)
    );

    return DEFAULT_USERS;
  }
}

/* =========================================================
   SAVE USERS
========================================================= */

export function saveUsers(users) {
  if (!Array.isArray(users)) {
    return;
  }

  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(users)
  );
}

/* =========================================================
   GET CURRENT USER
========================================================= */

export function getCurrentUser() {
  try {
    const saved = localStorage.getItem(
      CURRENT_USER_STORAGE_KEY
    );

    /* =====================================================
       BELUM LOGIN
    ===================================================== */

    if (!saved) {
      return null;
    }

    const currentUser = JSON.parse(saved);

    if (!currentUser) {
      return null;
    }

    /* =====================================================
       AMBIL DATA USER TERBARU
    ===================================================== */

    const users = getUsers();

    /*
     * Cari berdasarkan ID terlebih dahulu.
     * Kalau tidak ditemukan, cari berdasarkan email.
     */

    let latestUser = users.find(
      (user) =>
        String(user.id) ===
        String(currentUser.id)
    );

    if (!latestUser) {
      latestUser = users.find(
        (user) =>
          user.email?.toLowerCase() ===
          currentUser.email?.toLowerCase()
      );
    }

    /* =====================================================
       USER SUDAH TIDAK ADA
    ===================================================== */

    if (!latestUser) {
      localStorage.removeItem(
        CURRENT_USER_STORAGE_KEY
      );

      return null;
    }

    /* =====================================================
       CURRENT USER SELALU MENGIKUTI DATA TERBARU
    ===================================================== */

    const updatedCurrentUser = {
      id: latestUser.id,
      name: latestUser.name,
      email: latestUser.email,
      role: latestUser.role,
    };

    localStorage.setItem(
      CURRENT_USER_STORAGE_KEY,
      JSON.stringify(updatedCurrentUser)
    );

    return updatedCurrentUser;
  } catch {
    localStorage.removeItem(
      CURRENT_USER_STORAGE_KEY
    );

    return null;
  }
}

/* =========================================================
   SET CURRENT USER
========================================================= */

export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(
      CURRENT_USER_STORAGE_KEY
    );

    return;
  }

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
}

/* =========================================================
   LOGOUT
========================================================= */

export function logoutUser() {
  localStorage.removeItem(
    CURRENT_USER_STORAGE_KEY
  );
}

/* =========================================================
   USER STORAGE KEY
========================================================= */

export function getUserStorageKey(
  type,
  userId
) {
  return `cashflow_${type}_user_${userId}`;
}

/* =========================================================
   GET USER DATA
========================================================= */

export function getUserData(
  type,
  userId
) {
  if (!userId) {
    return [];
  }

  try {
    const key = getUserStorageKey(
      type,
      userId
    );

    const saved =
      localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const data = JSON.parse(saved);

    return Array.isArray(data)
      ? data
      : [];
  } catch {
    return [];
  }
}

/* =========================================================
   SAVE USER DATA
========================================================= */

export function saveUserData(
  type,
  userId,
  data
) {
  if (!userId) {
    return;
  }

  if (!Array.isArray(data)) {
    return;
  }

  const key = getUserStorageKey(
    type,
    userId
  );

  localStorage.setItem(
    key,
    JSON.stringify(data)
  );
}

/* =========================================================
   INITIALIZE USER DATA
========================================================= */

export function initializeUserData(
  userId
) {
  if (!userId) {
    return;
  }

  const types = [
    "income",
    "expense",
    "savings",
    "debt",
  ];

  types.forEach((type) => {
    const key = getUserStorageKey(
      type,
      userId
    );

    if (
      localStorage.getItem(key) ===
      null
    ) {
      localStorage.setItem(
        key,
        JSON.stringify([])
      );
    }
  });
}

/* =========================================================
   RESET USER DATA
========================================================= */

export function resetUserData(
  userId
) {
  if (!userId) {
    return;
  }

  const types = [
    "income",
    "expense",
    "savings",
    "debt",
  ];

  types.forEach((type) => {
    const key = getUserStorageKey(
      type,
      userId
    );

    localStorage.setItem(
      key,
      JSON.stringify([])
    );
  });
}

/* =========================================================
   DELETE USER DATA
========================================================= */

export function deleteUserData(
  userId
) {
  if (!userId) {
    return;
  }

  const types = [
    "income",
    "expense",
    "savings",
    "debt",
  ];

  types.forEach((type) => {
    const key = getUserStorageKey(
      type,
      userId
    );

    localStorage.removeItem(key);
  });
}

/* =========================================================
   EXPORT DEFAULT USERS
========================================================= */

export { DEFAULT_USERS };