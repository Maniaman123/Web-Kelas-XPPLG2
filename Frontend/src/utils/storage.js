const DB_KEY = 'xpplg2_db';

const defaultData = {
  users: [
    { id: 0, username: 'admin', password: '123', role: 'admin', name: 'Admin PPLG' }
  ],
  students: [], // We will populate this from the seed data initially if empty
  projects: [],
  cinematography: [],
  achievements: []
};

// Initialize DB if it doesn't exist
function initDB(seedStudents = []) {
  if (!localStorage.getItem(DB_KEY)) {
    const initialData = { ...defaultData, students: seedStudents };
    localStorage.setItem(DB_KEY, JSON.stringify(initialData));
  } else {
    // Merge new tables if the old DB didn't have them
    const currentData = getDB();
    let updated = false;
    ['users', 'students', 'projects', 'cinematography', 'achievements'].forEach(key => {
      if (!currentData[key]) {
        currentData[key] = defaultData[key];
        updated = true;
      }
    });
    // Special case: if students are totally empty but we have seed data, populate it (optional, maybe admin handles this)
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
  saveAchievements: (achievements) => saveDB({ ...getDB(), achievements })
};
