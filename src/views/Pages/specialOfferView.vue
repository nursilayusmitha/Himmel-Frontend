<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Navbar from '@/components/Header/Navbar.vue'
import { useIndexStore } from '@/stores'
import { getVoucherEksternal } from '@/stores/functionAPI'
import Swal from 'sweetalert2'
import mascotVoucher from '@/assets/images/background/mascot-bg.png'


// Store dan data
const indexStore = useIndexStore()
const userId = indexStore.user._id

const dataTable = ref([])
const userVouchers = ref([])

const searchQuery = ref("")
const statusVoucherFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

// Filter & Pagination
const filteredData = computed(() => {
  let data = dataTable.value

  if (statusVoucherFilter.value) {
    data = data.filter(item =>
      item.Voucher_status.toLowerCase() === statusVoucherFilter.value.toLowerCase()
    )
  }

  if (searchQuery.value.trim()) {
    data = data.filter(item =>
      Object.values(item).join(" ").toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  return data
})

const totalPages = computed(() =>
  Math.ceil(filteredData.value.length / itemsPerPage)
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredData.value.slice(start, start + itemsPerPage)
})

// Fungsi ambil data
const fetchUserVouchers = async (userId: string) => {
  try {
    const res = await fetch("http://localhost:4000/api/userEksternal/getVoucherById/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    const data = await res.json()
    if (res.ok) userVouchers.value = data.vouchers
    else console.error("Gagal ambil voucher:", data.message)
  } catch (err) {
    console.error("Error:", err)
  }
}

// On mounted + interval per detik
onMounted(() => {
  const fetchData = async () => {
    const response = await getVoucherEksternal()
    if (Array.isArray(response)) dataTable.value = response
    if (userId) fetchUserVouchers(userId)
  }

  fetchData()
  const interval = setInterval(fetchData, 1000)

  onUnmounted(() => clearInterval(interval))
})

// Klaim voucher
const claimVoucher = async (kodeVoucher: string) => {
  const isDarkMode = document.documentElement.classList.contains('dark')

  if (!userId) {
    const result = await Swal.fire({
      title: "Anda belum login!",
      text: "Silakan login terlebih dahulu untuk klaim voucher.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Login",
      cancelButtonText: "Batal",
      ...(isDarkMode && {
        background: '#1f2937',
        color: '#f9fafb',
        iconColor: '#facc15',
      })
    })
    if (result.isConfirmed) window.location.href = "/sign-in"
    return
  }

  const confirm = await Swal.fire({
    title: "Konfirmasi",
    text: "Apakah Anda yakin ingin klaim voucher ini?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Klaim",
    cancelButtonText: "Batal",
    ...(isDarkMode && {
      background: '#1f2937',
      color: '#f9fafb',
      iconColor: '#facc15',
    })
  })

  if (!confirm.isConfirmed) return

  try {
    const res = await fetch("http://localhost:4000/api/Modul_voucher/claim/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, kodeVoucher }),
    })

    const data = await res.json()

    if (res.ok) {
      Swal.fire({
        title: "Berhasil!",
        text: data.message,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#facc15',
        })
      })
    } else {
      Swal.fire({
        title: "Gagal!",
        text: data.message,
        icon: "error",
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#facc15',
        })
      })
    }
  } catch (err) {
    Swal.fire({
      title: "Error!",
      text: "Anda sudah klaim voucher ini.",
      icon: "error",
      ...(isDarkMode && {
        background: '#1f2937',
        color: '#f9fafb',
        iconColor: '#facc15',
      })
    })
  }
}
</script>

<template>
  <Navbar />

  <!-- SECTION: Voucher Sudah Diklaim -->
  <div class="p-5">
    <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Voucher Anda</h2>

    <div v-if="userVouchers.length > 0" class="overflow-x-auto whitespace-nowrap pb-4">
      <div class="flex space-x-4">
        <div
          v-for="(item, index) in userVouchers"
          :key="index"
          class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-600 min-w-[250px]"
        >
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.Nama_voucher }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Kode: <span class="font-medium">{{ item.Kode_voucher }}</span>
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Diskon:
            <span v-if="item.Persen_potongan !== null">{{ item.Persen_potongan }}%</span>
            <span v-else-if="item.Harga_potongan !== null">Rp{{ item.Harga_potongan }}</span>
            <span v-else>-</span>
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Berlaku hingga: <br>{{ item.Expired_date }} {{ item.Expired_time }}
          </p>
        </div>
      </div>
    </div>

   <div v-else class="relative w-full">
  <!-- Spacer agar wrapper p-5 tetap tinggi -->
  <div class="h-[220px] invisible select-none pointer-events-none"></div>

  <!-- Konten floating yang full width dan tetap di tengah -->
  <div class="absolute inset-0 z-10 w-full flex justify-center items-center">
    <div class="flex items-center space-x-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-600 max-w-[800px] w-full mx-4">
      <img :src="mascotVoucher" alt="Mascot" class="w-32 h-auto opacity-80 shrink-0" />
      <div class="flex flex-col items-start">
        <p class="text-gray-700 dark:text-white text-base font-medium leading-relaxed">
          Kamu belum memiliki voucher saat ini. Yuk, cek dan klaim voucher spesial yang tersedia agar perjalananmu makin hemat!
        </p>
        <a href="#klaim-voucher" class="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition-all">
          Klaim Sekarang
        </a>
      </div>
    </div>
  </div>
</div>

  </div>

  <!-- SECTION: Scroll Banner (tidak ikut p-5) -->
  <div class="my-8">
  <div class="
  mt-0
  max-[480px]:mt-0
  max-[680px]:-mt-[50px]
  max-[768px]:-mt-[80px]
  max-[1199px]:-mt-[100px]
  min-[1200px]:-mt-[200px]
  transition-all duration-10
  bg-gray-100 dark:bg-[#1A222C]
  ">
  <!-- Wave -->
  <div class="relative z-0">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 340" class="w-full">
      <!-- Light mode -->
      <path
        class="block dark:hidden"
        fill="#1379F2"
        fill-opacity="1"
        d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,
          768,256,864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,
          240L1440,224L1440,340L0,340Z"
      />
      <!-- Dark mode -->
      <path
        class="hidden dark:block"
        fill="#1379F2"
        fill-opacity="1"
        d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,
          768,256,864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,
          240L1440,224L1440,340L0,340Z"
      />
    </svg>
  </div>

  <!-- Banner Scroll -->
  <div class="relative z-10 -mt-1">
    <router-link to="/special-offer">
      <div class="w-full overflow-hidden h-[150px] bg-[#1379F2] dark:bg-[#1379F2]">
        <div class="flex animate-scroll-banner w-[200%]">
          <img
            src="@/assets/images/background/OfferDeal.png"
            alt="Offer Deal"
            class="h-[150px] w-auto object-cover"
          />
          <img
            src="@/assets/images/background/OfferDeal.png"
            alt="Offer Deal Duplicate"
            class="h-[150px] w-auto object-cover"
          />
        </div>
      </div>
    </router-link>
  </div>
  </div>
  </div>
  <div class="
  mt-0
  max-[480px]:mt-0
  max-[680px]:-mt-[50px]
  max-[768px]:-mt-[80px]
  max-[1199px]:-mt-[100px]
  min-[1200px]:-mt-[200px]
  transition-all duration-10
  bg-[#1379F2] dark:bg-[#1379F2]
  ">
  <!-- Wave -->
  <div class="relative z-0">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="w-full">
      <!-- Light mode -->
      <path
        class="block dark:hidden"
        fill="#F3F4F6"
        fill-opacity="1"
        d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,
          768,256,864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,
          240L1440,224L1440,320L0,320Z"
      />
      <!-- Dark mode -->
      <path
        class="hidden dark:block"
        fill="#1A222C"
        fill-opacity="1"
        d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,
          768,256,864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,
          240L1440,224L1440,320L0,320Z"
      />
    </svg>
  </div>
  <!-- SECTION: Voucher Tersedia -->
<div id="klaim-voucher" class="p-5 bg-[#F3F4F6] dark:bg-[#1A222C] -mt-1">
  <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">Voucher Tersedia</h2>

  <div v-if="dataTable.length > 0" class="overflow-x-auto whitespace-nowrap pb-4">
    <div class="flex space-x-4">
      <div
        v-for="(item, index) in dataTable"
        :key="index"
        class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-600 min-w-[250px] flex flex-col justify-between"
      >
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ item.Nama_voucher }}</h3>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Kode: <span class="font-medium">{{ item.Kode_voucher }}</span>
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Diskon:
            <span v-if="item.Persen_potongan !== null">{{ item.Persen_potongan }}%</span>
            <span v-else-if="item.Harga_potongan !== null">Rp{{ item.Harga_potongan }}</span>
            <span v-else>-</span>
          </p>
          <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Berlaku hingga: <br>{{ item.Expired_date }} {{ item.Expired_time }}
          </p>
        </div>
        <button
          class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="item.Qty <= 0 || item.Voucher_status !== 'enable'"
          @click="claimVoucher(item.Kode_voucher)"
        >
          Klaim
        </button>
      </div>
    </div>
  </div>

  <!-- Placeholder jika voucher kosong -->
  <div v-else class="relative w-full">
    <!-- Spacer agar tinggi area tetap terjaga -->
    <div class="h-[220px] invisible select-none pointer-events-none"></div>

    <!-- Konten floating center -->
    <div class="absolute inset-0 z-10 w-full flex justify-center items-center">
      <div
        class="flex items-center space-x-6 bg-white dark:bg-gray-800 rounded-lg p-6 border border-dashed border-gray-300 dark:border-gray-600 max-w-[800px] w-full mx-4"
      >
        <img :src="mascotVoucher" alt="Mascot" class="w-32 h-auto opacity-80 shrink-0" />
        <p class="text-gray-700 dark:text-white text-base font-medium leading-relaxed">
          Belum ada voucher yang tersedia untuk diklaim saat ini. Yuk, pantau terus ya! Kami akan segera hadirkan promo menarik untukmu.
        </p>
      </div>
    </div>
  </div>
</div>
</div>

  
</template>
