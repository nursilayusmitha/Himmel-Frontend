import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { getUtilByName as fetchUtilByName } from './functionAPI';

interface User {
  [key: string]: any; // Allow any string key
  _id: string;
  companyCode: string[];
  companyName: string;
  email: string;
  bio: string;
  userPhone:string;
  hierarchyCode: string;
  userRole: string;
  userName: string;
  imageName: string;
  userAccess: string[];
  token: string;
  loginTime: string;
}

interface Company {
  _id: string;
  companyCode: string[];
  companyDesc: string;
  companyLocation: string;
  companyName: string;
  companyPage: string[];
  companyLogo: string;
  logoName: string;
}

export const useIndexStore = defineStore('index', () => {
  // State untuk user
  const dataUser: User | null = JSON.parse(localStorage.getItem('user') || 'null');
  const user = reactive<User>({
    _id: dataUser?._id || '',
    companyCode: dataUser?.companyCode || [],
    companyName: dataUser?.companyName || "",
    userPhone: dataUser?.userPhone || '',
    email: dataUser?.email || '',
    bio: dataUser?.bio || '',
    imageName: dataUser?.imageName || '', 
    hierarchyCode: dataUser?.hierarchyCode || '',
    userRole: dataUser?.userRole || '',
    userName: dataUser?.userName || '',
    userAccess: dataUser?.userAccess || [],
    token: dataUser?.token || '',
    loginTime: dataUser?.loginTime || ''
  });

  function setUser(userData: Partial<User>) {
    Object.assign(user, userData);
    localStorage.setItem('user', JSON.stringify(user));
  }

  function setToken(token: string) {
    user.token = token;
    localStorage.setItem('token', token);
  }

  function setLoginTime(time: string) {
    user.loginTime = time;
    localStorage.setItem('loginTime', time);
  }

  function clearUser() {
    Object.keys(user).forEach(key => {
      if (Array.isArray(user[key])) {
        user[key] = [];
      } else {
        user[key] = '';
      }
    });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('loginTime');
  }

  // State untuk company
  const dataCompany: Company | null = JSON.parse(localStorage.getItem('company') || 'null');
  const company = reactive<Company>({
    _id: dataCompany?._id || '',
    companyCode: dataCompany?.companyCode || [],
    companyDesc: dataCompany?.companyDesc || '',
    companyLocation: dataCompany?.companyLocation || '',
    companyName: dataCompany?.companyName || '',
    companyPage: dataCompany?.companyPage || [],
    companyLogo: dataCompany?.companyLogo || '',
    logoName: dataCompany?.logoName || ''
  });

  function setCompany(companyData: Partial<Company>) {
    Object.assign(company, companyData);
    localStorage.setItem('company', JSON.stringify(company));
  }

  function clearCompany() {
    Object.keys(company).forEach(key => {
      if (Array.isArray(company[key])) {
        company[key] = [];
      } else {
        company[key] = '';
      }
    });
    localStorage.removeItem('company');
  }

// State dan logika untuk util
const utilData = ref<any>(
  sessionStorage.getItem('utilData') ? JSON.parse(sessionStorage.getItem('utilData') as string) : null
);
const lastUpdatedSidebar = ref<number | null>(
  sessionStorage.getItem('lastUpdatedSidebar') ? Number(sessionStorage.getItem('lastUpdatedSidebar')) : null
);

async function getUtilPage() {
  const now = Date.now();

  // Check if the cached data is still valid
  if (lastUpdatedSidebar.value !== null && now - lastUpdatedSidebar.value < 3600000) {
    console.log('Using cached sidebar data.');
    return utilData.value;
  }

  console.log('Fetching new sidebar data...');
  try {
    const response = await fetchUtilByName('page'); // Fetch new data
    utilData.value = response;
    lastUpdatedSidebar.value = now; // Update the timestamp

    // Persist the updated timestamp and data to sessionStorage
    sessionStorage.setItem('lastUpdatedSidebar', String(now));
    sessionStorage.setItem('utilData', JSON.stringify(response));

  } catch (error) {
    console.error('Failed to fetch sidebar data:', error);
  }

  return utilData.value;
}

// State untuk bandara dan stasiun
const utilBandara = ref<any[]>([]);
const utilStasiun = ref<any[]>([]);
const utilHierarchy = ref<any[]>([]);

// Fungsi untuk get bandara
async function getUtilHierarchy() {
  try {
    const response = await fetchUtilByName('hierarchy');
    utilHierarchy.value = response;
    sessionStorage.setItem('utilHierarchy', JSON.stringify(response));
  } catch (error) {
    console.error('Failed to fetch hierarchy data:', error);
  }
  return utilHierarchy.value;
}

// Fungsi untuk get bandara
async function getUtilBandara() {
  try {
    const response = await fetchUtilByName('bandara');
    utilBandara.value = response;
    sessionStorage.setItem('utilBandara', JSON.stringify(response));
  } catch (error) {
    console.error('Failed to fetch bandara data:', error);
  }
  return utilBandara.value;
}

// Fungsi untuk get stasiun
async function getUtilStasiun() {
  try {
    const response = await fetchUtilByName('stasiun');
    utilStasiun.value = response;
    sessionStorage.setItem('utilStasiun', JSON.stringify(response));
  } catch (error) {
    console.error('Failed to fetch stasiun data:', error);
  }
  return utilStasiun.value;
}


async function refreshUtilPage() {
  const now = Date.now();
  try {
    const response = await fetchUtilByName('page'); // Fetch new data
    utilData.value = response;
    lastUpdatedSidebar.value = now; // Update the timestamp

    // Persist the updated timestamp and data to sessionStorage
    sessionStorage.setItem('lastUpdatedSidebar', String(now));
    sessionStorage.setItem('utilData', JSON.stringify(response));

  } catch (error) {
    console.error('Failed to fetch sidebar data:', error);
  }

  return utilData.value;
}

  return {
    user,
    company,
    utilData,
    getUtilBandara,
    getUtilStasiun,
    setUser,
    setCompany,
    setToken,
    setLoginTime,
    clearUser,
    clearCompany,
    getUtilPage,
    refreshUtilPage,
    getUtilHierarchy
  };
});
