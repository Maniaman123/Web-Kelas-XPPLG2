const DB_KEY = 'xpplg2_db';

const defaultData = {
  users: [
    { id: 0, username: 'admin@gmail.com', password: '123', role: 'admin', name: 'Admin PPLG' }
  ],
  students: [],
  projects: [],
  cinematography: [],
  achievements: [],
  pendingItems: []  // { id, type, studentId, studentName, data, createdAt }
};

function initDB(seedStudents = []) {
  if (!localStorage.getItem(DB_KEY)) {
    const initialData = { ...defaultData, students: seedStudents };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  } else {
    const currentData = getDB();
    let updated = false;
    ['users', 'students', 'projects', 'cinematography', 'achievements', 'pendingItems'].forEach(key => {
      if (!currentData[key]) {
        currentData[key] = defaultData[key];
        updated = true;
      }
    });

    // Always sync the default admin account so credential changes take effect
    const adminDefault = defaultData.users.find(u => u.role === 'admin');
    if (adminDefault) {
      const idx = currentData.users.findIndex(u => u.role === 'admin');
      if (idx === -1) {
        currentData.users.push(adminDefault);
      } else {
        currentData.users[idx] = { ...currentData.users[idx], ...adminDefault };
      }
      updated = true;
    }

    if (currentData.students.length === 0 && seedStudents.length > 0) {
      currentData.students = seedStudents;
      updated = true;
    }
    if (updated) saveDB(currentData);
  }
}

function getDB() {
  return JSON.parse(localStorage.getItem(DB_KEY) || JSON.stringify(defaultData));
}

function saveDB(data) {
  localStorage.setItem(DB_KEY, JSON.stringify(data));
}

export const storage = {
  init: initDB,

  getUsers: () => getDB().users,
  saveUsers: (users) => saveDB({ ...getDB(), users }),

  getStudents: () => getDB().students,
  saveStudents: (students) => saveDB({ ...getDB(), students }),

  getProjects: () => getDB().projects,
  saveProjects: (projects) => saveDB({ ...getDB(), projects }),

  getCinematography: () => getDB().cinematography,
  saveCinematography: (cinematography) => saveDB({ ...getDB(), cinematography }),

  getAchievements: () => getDB().achievements,
  saveAchievements: (achievements) => saveDB({ ...getDB(), achievements }),

  // --- Pending / Approval system ---
  getPendingItems: () => getDB().pendingItems || [],

  /** Submit content for admin review */
  submitPending: (type, studentId, studentName, data) => {
    const db = getDB();
    const newItem = {
      id: `pending-${Date.now()}`,
      type,           // 'cinematography' | 'project' | 'achievement'
      studentId,
      studentName,
      data,
      createdAt: new Date().toISOString(),
    };
    db.pendingItems = [...(db.pendingItems || []), newItem];
    saveDB(db);
    return newItem;
  },

  /** Admin approves → item moves to its collection */
  approvePending: (pendingId) => {
    const db = getDB();
    const item = (db.pendingItems || []).find(p => p.id === pendingId);
    if (!item) return;

    const approvedData = { ...item.data, id: `${item.type}-${Date.now()}` };
    if (item.type === 'cinematography') {
      db.cinematography = [approvedData, ...db.cinematography];
    } else if (item.type === 'project') {
      db.projects = [approvedData, ...db.projects];
    } else if (item.type === 'achievement') {
      db.achievements = [approvedData, ...db.achievements];
    }

    db.pendingItems = db.pendingItems.filter(p => p.id !== pendingId);
    saveDB(db);
  },

  /** Admin rejects → item removed from pending */
  rejectPending: (pendingId) => {
    const db = getDB();
    db.pendingItems = (db.pendingItems || []).filter(p => p.id !== pendingId);
    saveDB(db);
  },
};
