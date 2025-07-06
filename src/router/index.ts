import { createRouter, createWebHistory } from 'vue-router'

import { useIndexStore } from '@/stores/index'
import Swal from 'sweetalert2'

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/Pages/indexView.vue'),
    meta: {
      title: 'Index',
    }
  },
  {
    path: '/sign-in',
    name: 'signIn',
    component: () => import('@/views/Authentication/signInView.vue'),
    meta: {
      title: 'Sign In',
    }
  },
  {
    path: '/sign-up',
    name: 'signUp',
    component: () => import('@/views/Authentication/signUpView.vue'),
    meta: {
      title: 'Sign Up',
    }
  },
  {
    path: '/special-offer',
    name: 'specialOffer',
    component: () => import('@/views/Pages/specialOfferView.vue'),
    meta: {
      title: 'Special Offer',
    }
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/Pages/ordersView.vue'),
    meta: {
      title: 'Pesanan',
      requiresAuthPelanggan: true,
    }
  },
  {
    path: '/profile',
    name: 'settingsProfile',
    component: () => import('@/views/Pages/SettingsProfileView.vue'),
    meta: {
      title: 'Settings Profile',
      requiresAuthPelanggan: true,
    }
  },
  {
    path: '/customer-service',
    name: 'customerService',
    component: () => import('@/views/Pages/customerServiceView.vue'),
    meta: {
      title: 'Customer Service',
      requiresAuthPelanggan: true,
    }
  },
   {
    path: '/aduan-masalah',
    name: 'aduanMasalah',
    component: () => import('@/views/Pages/aduanMasalahView.vue'),
    meta: {
      title: 'Aduan Masalah',
      requiresAuthPelanggan: true,
    }
  },
  {
    path: '/admin',
    name: 'dashboard',
    component: () => import('@/views/Dashboard/dashbordView.vue'),
    meta: {
      title: 'Dashboard',
      requiresAuth: true,
    },
    beforeEnter: (to, from, next) => {
      const store = useIndexStore();
      const userRole = store.user.userRole;
  
      // Cek jika userRole ada dan jika user eksternal mencoba mengakses admin
      if (!userRole) {
        // Jika tidak ada userRole (belum login), redirect ke login
        next('/admin/login');
      } else if (userRole === 'Pelanggan') {
        // Jika userRole adalah "Pelanggan", tampilkan alert dan arahkan ke login
        const isDarkMode = document.documentElement.classList.contains('dark')
        Swal.fire({
          title: "Access Denied",
          text: "You must log in as an internal user to access the admin page.",
          icon: "warning",
          confirmButtonText: "OK",
          ...(isDarkMode && {
            background: '#1f2937',        // Tailwind `gray-800`
            color: '#f9fafb',             // Tailwind `gray-100`
            iconColor: '#facc15',         // Tailwind `yellow-400`
          })
        }).then(() => {
          next('/admin/login'); // Redirect ke halaman login setelah alert ditutup
        });
      } else {
        // Jika userRole sesuai, lanjutkan ke halaman admin
        next();
      }
    },
  },  
  {
    path: '/admin/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: {
      title: 'Profile',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/admin/profile/:id',
    name: 'profileUser',
    component: () => import('@/views/ProfileViewUser.vue'),
    meta: {
      title: 'Profile User',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/admin/pages/settings',
    name: 'settings',
    component: () => import('@/views/Pages/SettingsView.vue'),
    meta: {
      title: 'Settings',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/admin/login',
    name: 'Login',
    component: () => import('@/views/Authentication/loginView.vue'),
    meta: {
      title: 'Login',
    },
  },
  {
    path: '/admin/register',
    name: 'register',
    component: () => import('@/views/Authentication/registerView.vue'),
    meta: {
      title: 'Register',
    }
  },
  {
    path: '/admin/forget-password',
    name: 'forgetPassword',
    component: () => import('@/views/Authentication/forgetPassword.vue'),
    meta: {
      title: 'Forget Password',
    }
  },
  {
    path: '/admin/passwordReset',
    name: 'resetPassword',
    component: () => import('@/views/Authentication/changePassword.vue'),
    meta: {
      title: 'Reset Password',
    }
},
{
  path: '/forget-password',
  name: 'forgetPasswordEksternal',
  component: () => import('@/views/Authentication/requestResetPassword.vue'),
  meta: {
    title: 'Forget Password',
  }
},
{
  path: '/passwordReset',
  name: 'resetPasswordEksternal',
  component: () => import('@/views/Authentication/resetPassword.vue'),
  meta: {
    title: 'Reset Password',
  }
},

  // Modules
  {
    path: '/modules/modul-pesawat/add',
    name: 'modulTransportAdd',
    component: () => import('@/views/Modules/Modul_pesawat_add.vue'),
    meta: {
      title: 'Modul Tambah Kendaraan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-pesawat',
    name: 'modulPesawat',
    component: () => import('@/views/Modules/Modul_pesawat.vue'),
    meta: {
      title: 'Modul Pesawat',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-pesawat/detail/:id',
    name: 'modulTransportDetail',
    component: () => import('@/views/Modules/Modul_pesawat_detail.vue'),
    meta: {
      title: 'Modul Detail Kendaraan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
  {
    path: '/modules/modul-pesawat/edit/:id',
    name: 'modulTransportEdit',
    component: () => import('@/views/Modules/Modul_pesawat_edit.vue'),
    meta: {
      title: 'Modul Edit Kendaraan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-kereta/add',
    name: 'modulKeretaAdd',
    component: () => import('@/views/Modules/Modul_kereta_add.vue'),
    meta: {
      title: 'Modul Tambah Kereta',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-kereta',
    name: 'modulKereta',
    component: () => import('@/views/Modules/Modul_kereta.vue'),
    meta: {
      title: 'Modul Kereta',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-kereta/detail/:id',
    name: 'modulKeretaDetail',
    component: () => import('@/views/Modules/Modul_kereta_detail.vue'),
    meta: {
      title: 'Modul Detail Kereta',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
  {
    path: '/modules/modul-kereta/edit/:id',
    name: 'modulKeretaEdit',
    component: () => import('@/views/Modules/Modul_kereta_edit.vue'),
    meta: {
      title: 'Modul Edit Kereta',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-rute/add',
    name: 'modulRuteAdd',
    component: () => import('@/views/Modules/Modul_rute_add.vue'),
    meta: {
      title: 'Modul Tambah Rute',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-rute',
    name: 'modulRute',
    component: () => import('@/views/Modules/Modul_rute.vue'),
    meta: {
      title: 'Modul Rute',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-teknis',
    name: 'modulTeknis',
    component: () => import('@/views/Modules/Modul_teknis.vue'),
    meta: {
      title: 'Modul Teknis',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-teknis/add',
    name: 'modulTeknisAdd',
    component: () => import('@/views/Modules/Modul_teknis_add.vue'),
    meta: {
      title: 'Modul Add Teknis',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-pesanan/add/:id',
    name: 'modulPesananAdd',
    component: () => import('@/views/Modules/Modul_pesanan_add.vue'),
    meta: {
      title: 'Modul Add Pesanan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modul-pesanan/add/:id',
    name: 'modulPesananPelangganAdd',
    component: () => import('@/views/Pages/modulPesananView.vue'),
    meta: {
      title: 'Modul Add Pesanan',
      requiresAuthPelanggan: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-pesanan/',
    name: 'modulPesanan',
    component: () => import('@/views/Modules/Modul_pesanan.vue'),
    meta: {
      title: 'Modul Pesanan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-pesanan/detail/:id',
    name: 'modulPesananDetail',
    component: () => import('@/views/Modules/Modul_pesanan_detail.vue'),
    meta: {
      title: 'Modul Detail Pesanan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modul-pesanan/detail/:id',
    name: 'orderDetail',
    component: () => import('@/views/Pages/orderDetailView.vue'),
    meta: {
      title: 'Detail Pesanan',
      requiresAuthPelanggan: true // Add this line to protect this route
    }
  },
  {
    path: '/modul-pembayaran/add/:id',
    name: 'orderPayment',
    component: () => import('@/views/Pages/orderPaymentView.vue'),
    meta: {
      title: 'Bayar Pesanan',
      requiresAuthPelanggan: true // Add this line to protect this route
    }
  },
  {
    path: '/modul-transaksi/add/:id',
    name: 'orderTransaksi',
    component: () => import('@/views/Pages/orderTransaksiView.vue'),
    meta: {
      title: 'Transaksi Bayar Pesanan',
      requiresAuthPelanggan: true // Add this line to protect this route
    }
  },
  {
    path: '/orderStruk/:id',
    name: 'orderStruk',
    component: () => import('@/views/Pages/orderStrukView.vue'),
    meta: {
      title: 'Struk',
      requiresAuthPelanggan: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-voucher',
    name: 'modulVoucher',
    component: () => import('@/views/Modules/Modul_voucher.vue'),
    meta: {
      title: 'Modul Voucher',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/generate-laporan',
    name: 'generateLaporan',
    component: () => import('@/views/Modules/Generate_laporan.vue'),
    meta: {
      title: 'Generate Laporan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/laporan-masalah',
    name: 'laporanMasalah',
    component: () => import('@/views/Modules/Laporan_masalah.vue'),
    meta: {
      title: 'Laporan Masalah',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/aduan-pelanggan',
    name: 'aduanPelanggan',
    component: () => import('@/views/Modules/Aduan_pelanggan.vue'),
    meta: {
      title: 'Aduan Pelanggan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/pertanyaan-diajukan',
    name: 'pertanyaanDiajukan',
    component: () => import('@/views/Modules/Pertanyaan_diajukan.vue'),
    meta: {
      title: 'Pertanyaan Diajukan',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-pembayaran/add/:id',
    name: 'modulPembayaranAdd',
    component: () => import('@/views/Modules/Modul_pembayaran_add.vue'),
    meta: {
      title: 'Modul Add Pembayaran',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-transaksi/add/:id',
    name: 'modulTransaksiAdd',
    component: () => import('@/views/Modules/Modul_transaksi_add.vue'),
    meta: {
      title: 'Modul Add Transaksi',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: "/struk/:id",
    name: "StrukTransaksi",
    component: () => import("@/views/Modules/strukTransaksi_detail.vue"),
    meta: {
      title: 'Struk Transaksi',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-validasi',
    name: 'modulValidasi',
    component: () => import('@/views/Modules/Modul_verifikasi.vue'),
    meta: {
      title: 'Modul Verifikasi',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-pembayaran',
    name: 'modulPembayaran',
    component: () => import('@/views/Modules/Modul_pembayaran.vue'),
    meta: {
      title: 'Modul Pembayaran',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/modul-voucher/add',
    name: 'modulVoucherAdd',
    component: () => import('@/views/Modules/Modul_voucher_add.vue'),
    meta: {
      title: 'Modul Voucher Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  // Master User Internal
  {
    path: '/modules/master/user-internal',
    name: 'userInternal',
    component: () => import('@/views/Master/Master_userInternal.vue'),
    meta: {
      title: 'Master User Internal',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-internal-request',
    name: 'userInternalRequest',
    component: () => import('@/views/Master/Master_userInternalRequest.vue'),
    meta: {
      title: 'Master User Internal Request',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-internal/add',
    name: 'userInternalAdd',
    component: () => import('@/views/Master/Master_userInternal_add.vue'),
    meta: {
      title: 'Master User Internal Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-internal/detail/:id',
    name: 'userInternalDetail',
    component: () => import('@/views/Master/Master_userInternal_detail.vue'),
    meta: {
      title: 'Master User Internal Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-internal/edit/:id',
    name: 'userInternalEdit',
    component: () => import('@/views/Master/Master_userInternal_edit.vue'),
    meta: {
      title: 'Master User Internal Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },

  // Master User Eksternal
  {
    path: '/modules/master/user-eksternal',
    name: 'userEksternal',
    component: () => import('@/views/Master/Master_userEksternal.vue'),
    meta: {
      title: 'Master User Eksternal',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-eksternal/add',
    name: 'userEksternalAdd',
    component: () => import('@/views/Master/Master_userEksternal_add.vue'),
    meta: {
      title: 'Master User Eksternal Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  
  {
    path: '/modules/master/user-eksternal/detail/:id',
    name: 'userEksternalDetail',
    component: () => import('@/views/Master/Master_userEksternal_detail.vue'),
    meta: {
      title: 'Master User Eksternal Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-eksternal/edit/:id',
    name: 'userEksternalEdit',
    component: () => import('@/views/Master/Master_userEksternal_edit.vue'),
    meta: {
      title: 'Master User Eksternal Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/admin/page',
    name: 'setupPage',
    component: () => import('@/views/Master/Development_page.vue'),
    meta: {
      title: 'Development Page',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/admin/hierarchy',
    name: 'Hierarchy',
    component: () => import('@/views/Master/Development_hierarchy.vue'),
    meta: {
      title: 'Development Hierarchy',
      requiresAuth: true // Add this line to protect this route
    }
  },
  


  // Master User Role
  {
    path: '/modules/master/user-role',
    name: 'userRole',
    component: () => import('@/views/Master/Master_userRole.vue'),
    meta: {
      title: 'Master User Role',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-role/add',
    name: 'userRoleAdd',
    component: () => import('@/views/Master/Master_userRole_add.vue'),
    meta: {
      title: 'Master User Role Add',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-role/detail/:id',
    name: 'userRoleDetail',
    component: () => import('@/views/Master/Master_userRole_detail.vue'),
    meta: {
      title: 'Master User Role Detail',
      requiresAuth: true // Add this line to protect this route
    }
  },
  {
    path: '/modules/master/user-role/edit/:id',
    name: 'userRoleEdit',
    component: () => import('@/views/Master/Master_userRole_edit.vue'),
    meta: {
      title: 'Master User Role Edit',
      requiresAuth: true // Add this line to protect this route
    }
  },
]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
  if (to.hash) {
    return {
      el: to.hash,
      behavior: 'smooth',
    }
  }
  return savedPosition || { left: 0, top: 0 }
}
})


router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} | Himmel`

  const token = localStorage.getItem('token')
  const loginTime = localStorage.getItem('loginTime')
  const indexStore = useIndexStore()

  if (to.meta.requiresAuthPelanggan) {
    if (!token || !loginTime) {
      return next({ name: 'signIn' })
    }
  }

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token || !loginTime) {
      return next({ name: 'Login' })
    } else {
      const currentTime = new Date().toISOString()
      const timeDifference = new Date(currentTime) - new Date(loginTime)

      if (timeDifference > 24 * 60 * 60 * 1000) { // 24 jam
        indexStore.clearUser()
        indexStore.clearCompany()
        localStorage.removeItem('token')
        localStorage.removeItem('loginTime')
        return next({ name: 'login' })
      }
    }
  }

  next()
})

export default router
