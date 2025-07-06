import axios from "axios";
import { API, domain } from "@/API/";

export const userInternal_Login = async (data) => {
  const response = await axios.post(API+'/api/userInternal/login', data)
  var suppData = response.data;
  return suppData
}

export const requestPasswordReset = async (data) => {
  const response = await axios.post(API+'/api/auth/requestResetPassword', data)
  var suppData = response.data;
  return suppData
}

export const resetPassword = async (data) => {
  const response = await axios.post(API+'/api/auth/resetPassword', data)
  var suppData = response.data;
  return suppData
}


export const requestPasswordResetEksternal = async (data) => {
  const response = await axios.post(API+'/api/auth/requestResetPasswordEksternal', data)
  var suppData = response.data;
  return suppData
}

export const resetPasswordEksternal = async (data) => {
  const response = await axios.post(API+'/api/auth/resetPasswordEksternal', data)
  var suppData = response.data;
  return suppData
}

// Utilities
export const getUtilByName = async (data) => {
  const response = await axios.get(API+'/api/utilities/byName/'+ data)
  var suppData = response.data;
  return suppData
}

export const createUtilities = async (data) => {
  const response = await axios.post(API+'/api/utilities/create/', data)
  var suppData = response.data;
  return suppData
}


// User Internal
export const getAllUsers = async () => {
  const response = await axios.get(API+'/api/userInternal/')
  var suppData = response.data;
  return suppData
}

export const createUser = async (data) => {
  const response = await axios.post(API+'/api/userInternal/create', data)
  var suppData = response.data;
  return suppData
}

export const updateUser = async (data, id) => {
  const response = await axios.put(API+'/api/userInternal/update/' + id, data)
  var suppData = response.data;
  return suppData
}

export const getUserById = async (id) => {
  const response = await axios.get(API+'/api/userInternal/detail/' + id)
  var suppData = response.data;
  return suppData
}

export const getUserByRequest = async () => {
  const response = await axios.get(API+'/api/userInternal/getUserByRequest')
  var suppData = response.data;
  return suppData
}

export const getUserInternalByRole = async (company, role) => {
  const response = await axios.get(API+'/api/userInternal/getUserByRole/'+company+'/'+role)
  var suppData = response.data;
  return suppData
}

// User Role
export const getAllRole = async (data) => {
  const response = await axios.get(API+'/api/role/', data)
  var suppData = response.data;
  return suppData
}

export const getRoleById = async (id) => {
  const response = await axios.get(API+'/api/role/getRoleById/' + id)
  var suppData = response.data;
  return suppData
}

export const createRole = async (data) => {
  const response = await axios.post(API+'/api/role/create', data)
  var suppData = response.data;
  return suppData
}

export const updateRole = async (data, id) => {
  const response = await axios.put(API+'/api/role/update/' + id, data)
  var suppData = response.data;
  return suppData
}

export const deleteRole = async (data, id) => {
  const response = await axios.delete(API+'/api/role/delete/' + id, data)
  var suppData = response.data;
  return suppData
}

// Item
export const item_getAllItemWithStatus = async (company, status) => {
  const response = await axios.get(API+'/api/item/getAllItem/'+company+'/'+status)
  var suppData = response.data;
  return suppData
}

// User Eksternal
export const getAllUsersEksternal = async () => {
  const response = await axios.get(API+'/api/userEksternal/')
  var suppData = response.data;
  return suppData
}

export const getUserEksternalById = async (id) => {
  const response = await axios.get(API+'/api/userEksternal/detail/' + id)
  var suppData = response.data;
  return suppData
}

export const createUserEksternal = async (data) => {
  const response = await axios.post(API+'/api/userEksternal/create', data)
  var suppData = response.data;
  return suppData
}



export const updateUserEksternal = async (data, id) => {
  const response = await axios.put(API+'/api/userEksternal/update/' + id, data)
  var suppData = response.data;
  return suppData
}

export const userEksternal_Login = async (data) => {
  const response = await axios.post(API+'/api/userEksternal/login', data)
  var suppData = response.data;
  return suppData
}

// Modul Transport
export const createTransport = async (data) => {
  const response = await axios.post(API+'/api/Modul_transport/create',data)
  var suppData = response.data;
  return suppData
}

export const getPesawatAll = async () => {
  const response = await axios.get(API+'/api/Modul_transport/getPesawatAll')
  var suppData = response.data;
  return suppData
}

export const getKeretaAll = async () => {
  const response = await axios.get(API+'/api/Modul_transport/getKeretaAll')
  var suppData = response.data;
  return suppData
}

export const getPesawat = async () => {
  const response = await axios.get(API+'/api/Modul_transport/getPesawat')
  var suppData = response.data;
  return suppData
}

export const getKereta = async () => {
  const response = await axios.get(API+'/api/Modul_transport/getKereta')
  var suppData = response.data;
  return suppData
}

export const getTransportById = async (id) => {
  const response = await axios.get(API+'/api/Modul_transport/getById/' + id)
  var suppData = response.data;
  return suppData
}

export const getDetailById = async (id) => {
  const response = await axios.get(API+'/api/Modul_transport/getTransportById/' + id)
  var suppData = response.data;
  return suppData
}

export const updateTransport = async (data, id) => {
  const response = await axios.put(API+'/api/Modul_transport/update/'+ id,data)
  var suppData = response.data;
  return suppData
}

// Modul Rute
export const createRute = async (data) => {
  const response = await axios.post(API+'/api/Modul_rute/create',data)
  var suppData = response.data;
  return suppData
}

export const getAllRute = async (data) => {
  const response = await axios.get(API+'/api/Modul_rute/',data)
  var suppData = response.data;
  return suppData
}

export const getRuteBandara = async () => {
  const response = await axios.get(API+'/api/Modul_rute/getRuteBandara')
  var suppData = response.data;
  return suppData
}

export const getRuteStasiun = async () => {
  const response = await axios.get(API+'/api/Modul_rute/getRuteStasiun')
  var suppData = response.data;
  return suppData
}

export const getRuteById = async (id) => {
  const response = await axios.get(API+'/api/Modul_rute/getRuteById/' + id)
  var suppData = response.data;
  return suppData
}

export const updateRute = async (data, id) => {
  const response = await axios.put(API+'/api/Modul_rute/update/'+ id,data)
  var suppData = response.data;
  return suppData
}

export const updateHargaTiket = async (data, id) => {
  const response = await axios.put(API+'/api/Modul_rute/updateHarga/'+ id,data)
  var suppData = response.data;
  return suppData
}


export const deleteRute = async (id) => {
  const response = await axios.delete(API+'/api/Modul_rute/delete/'+ id)
  var suppData = response.data;
  return suppData
}


// Modul Rute
export const createTeknis = async (data) => {
  const response = await axios.post(API+'/api/Modul_teknis/create',data)
  var suppData = response.data;
  return suppData
}

export const getAllTeknis = async (data) => {
  const response = await axios.get(API+'/api/Modul_teknis/',data)
  var suppData = response.data;
  return suppData
}

export const getTeknisById = async (id) => {
  const response = await axios.get(API+'/api/Modul_teknis/getTeknisById/' + id)
  var suppData = response.data;
  return suppData
}

export const cancelTeknis = async (data, id) => {
  const response = await axios.put(API+'/api/Modul_teknis/cancel/'+ id,data)
  var suppData = response.data;
  return suppData
}


// Modul Rute
export const createVoucher = async (data) => {
  const response = await axios.post(API+'/api/Modul_voucher/create',data)
  var suppData = response.data;
  return suppData
}

export const getAllVoucher = async (data) => {
  const response = await axios.get(API+'/api/Modul_voucher/',data)
  var suppData = response.data;
  return suppData
}

export const getVoucherInternal = async () => {
  const response = await axios.get(API+'/api/Modul_voucher/getVoucherInternal')
  var suppData = response.data;
  return suppData
}

export const getVoucherEksternal = async () => {
  const response = await axios.get(API+'/api/Modul_voucher/getVoucherEksternal')
  var suppData = response.data;
  return suppData
}

export const getVoucherById = async (id) => {
  const response = await axios.get(API+'/api/Modul_voucher/getVoucherById/' + id)
  var suppData = response.data;
  return suppData
}

export const updateVoucher = async (data, id) => {
  const response = await axios.put(API+'/api/Modul_voucher/update/'+ id,data)
  var suppData = response.data;
  return suppData
}

export const updateStatusVoucher = async (data, id) => {
  const response = await axios.put(API+'/api/Modul_voucher/updateStatusVoucher/'+ id,data)
  var suppData = response.data;
  return suppData
}


export const deleteVoucher = async (id) => {
  const response = await axios.delete(API+'/api/Modul_voucher/delete/'+ id)
  var suppData = response.data;
  return suppData
}


export const createPesanan = async (id, data) => { 
  console.log("📌 ID yang dikirim:", id); 
  console.log("📌 Data yang dikirim:", data); 

  const response = await axios.post(`${API}/api/Modul_pesanan/create/${String(id)}`, data);
  return response.data;
}

export const getAllPesanan = async (data) => {
  const response = await axios.get(API+'/api/Modul_pesanan/',data)
  var suppData = response.data;
  return suppData
}

export const getPesananById = async (id, data) => {
  const response = await axios.get(API+'/api/Modul_pesanan/getPesananById/'+id, data)
  var suppData = response.data;
  return suppData
}

export const createPembayaran = async (pesananId, data) => { 
  console.log("📌 ID yang dikirim:", pesananId); 
  console.log("📌 Data yang dikirim:", data); 

  const response = await axios.post(`${API}/api/Modul_pesanan/pembayaran/${String(pesananId)}`, data);
  return response.data;
}

export const createPembayaranMitra = async (pesananId, data) => { 
  console.log("📌 ID yang dikirim:", pesananId); 
  console.log("📌 Data yang dikirim:", data); 

  const response = await axios.post(`${API}/api/Modul_pesanan/pembayaran-mitra/${String(pesananId)}`, data);
  return response.data;
}

export const getAllPembayaran = async (data) => {
  const response = await axios.get(API+'/api/Modul_pesanan/pembayaran',data)
  var suppData = response.data;
  return suppData
}

export const getPembayaranById = async (id, data) => {
  const response = await axios.get(API+'/api/Modul_pesanan/getPembayaranById/'+id, data)
  var suppData = response.data;
  return suppData
}

export const getTransaksiById = async (id, data) => {
  const response = await axios.get(API+'/api/Modul_pesanan/getTransaksiById/'+id, data)
  var suppData = response.data;
  return suppData
}
export const getStrukById = async (id, data) => {
  const response = await axios.get(API+'/api/Modul_pesanan/struk/'+id, data)
  var suppData = response.data;
  return suppData
}

export const getStrukPesanan = async (id, data) => {
  const response = await axios.get(API+'/api/Modul_pesanan/struk-order/'+id, data)
  var suppData = response.data;
  return suppData
}

export const deletePembayaran = async (id, data) => {
  const response = await axios.delete(API+'/api/Modul_pesanan/deletePembayaran/'+id, data)
  var suppData = response.data;
  return suppData
}

export const getAduan = async (id, data) => {
  const response = await axios.get(API+'/api/Modul_aduan/', data)
  var suppData = response.data;
  return suppData
}

export const createTransaksi = async (pembayaranId, data) => { 
  console.log("📌 ID yang dikirim:", pembayaranId); 
  console.log("📌 Data yang dikirim:", data); 

  const response = await axios.post(`${API}/api/Modul_pesanan/transaksi/${String(pembayaranId)}`, data);
  return response.data;
}