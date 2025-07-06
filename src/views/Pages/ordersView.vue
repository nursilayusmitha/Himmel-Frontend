<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from "vue-router"
import Swal from 'sweetalert2'
import Navbar from '@/components/Header/Navbar.vue'
import { useIndexStore } from "@/stores"
import { getAllPesanan } from '@/stores/functionAPI'
import mascotBg from '@/assets/images/background/mascot-bg.png'
import {
  mdiTrashCanOutline,
  mdiEyeOutline,
  mdiCash,
  mdiMagnify,
  mdiRefresh,
  mdiPlusCircleOutline,
  mdiCloseOctagon,
  mdiTimerAlert,
  mdiTimerRemove,
  mdiTimerCheck,
  mdiTimerCog
} from '@mdi/js'

const scrollToPesan = () => {
  setTimeout(() => {
    const pesanSection = document.querySelector('#pesan')
    if (pesanSection) {
      pesanSection.scrollIntoView({ behavior: 'smooth' })
    }
  }, 500) // Tunggu render halaman
}

const indexStore = useIndexStore()
const router = useRouter()

const dataTable = ref([])
const userPesanan = ref([])

const currentPage = ref(1)
const itemsPerPage = 6

const paginatedPesanan = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return userPesanan.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() =>
  Math.ceil(userPesanan.value.length / itemsPerPage)
)

const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) currentPage.value = page
}

// Ambil userId dari indexStore dan fetch setiap detik
onMounted(() => {
  const userId = indexStore.user._id
  if (userId) {
    fetchUserPesanan(userId)
    setInterval(() => fetchUserPesanan(userId), 1000) // ⏱ fetch tiap detik
  }
})

// Fungsi ambil pesanan dari userId
const fetchUserPesanan = async (userId: string) => {
  try {
    const response = await fetch("http://localhost:4000/api/Modul_pesanan/getPesananByUserId/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
    const data = await response.json()
    if (response.ok) {
      userPesanan.value = data.data
    } else {
      console.error("Gagal mengambil pesanan:", data.message)
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error)
  }
}

// Fungsi Batalkan Pesanan
const cancelPesanan = async (id: string) => {
  if (!id) {
    Swal.fire('Error!', 'ID tidak valid.', 'error')
    return
  }

  const isDarkMode = document.documentElement.classList.contains('dark')

  const result = await Swal.fire({
    title: 'Apakah anda yakin?',
    text: "Anda akan membatalkan pesanan Tiket Anda.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Konfirmasi',
    cancelButtonText: 'Kembali',
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    ...(isDarkMode && {
      background: '#1f2937',
      color: '#f9fafb',
      iconColor: '#facc15',
    })
  })

  if (!result.isConfirmed) return

  try {
    const response = await fetch(`http://localhost:4000/api/modul_pesanan/cancelOrder/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Status: "cancel" })
    })

    const resData = await response.json()

    if (!response.ok) throw new Error(resData.message || "Gagal membatalkan order")

    dataTable.value = dataTable.value.map(item =>
      item._id === id ? { ...item, Status: "cancel" } : item
    )

    Swal.fire({
      position: "center",
      title: 'Cancel Order Berhasil!',
      timer: 1500,
      icon: 'success',
      showConfirmButton: false,
      toast: true,
      ...(isDarkMode && {
        background: '#1f2937',
        color: '#f9fafb',
        iconColor: '#facc15',
      })
    })
  } catch (error) {
    Swal.fire({
      title: 'Error!',
      text: error.message,
      icon: 'error',
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
  <div class="container mx-auto p-4">
    <h2 class="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-white">Daftar Pesanan Anda</h2>

    <div
  v-if="paginatedPesanan.length === 0"
  class="w-full flex items-center justify-center bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 mb-8"
>
  <img :src="mascotBg" alt="Maskot" class="w-32 h-auto opacity-80 mr-6" />
  <div class="flex flex-col justify-center items-start max-w-lg">
    <p class="text-gray-700 dark:text-white text-base font-medium leading-relaxed">
      Kamu belum melakukan pemesanan tiket apa pun.<br />
      Yuk, mulai rencanakan perjalananmu dan pesan tiket pesawat atau kereta dengan mudah di <span class="font-semibold text-blue-600">Himmel</span>!
    </p>
    <router-link
  to="/"
  @click.native="scrollToPesan"
  class="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md font-semibold transition-all"
>
  Pesan Tiket Sekarang
</router-link>
  </div>
</div>


    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(item, index) in paginatedPesanan"
        :key="index"
        class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md overflow-hidden"
      >
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">{{ item.Nama_kendaraan }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-300">Nomor Kendaraan: {{ item.Nomor_kendaraan }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-300">Keberangkatan: {{ item.Berangkat_date }} - {{ item.Berangkat_time }}</p>
          <p class="text-sm text-gray-500 dark:text-gray-300">Harga: Rp {{ item.Harga_tiket.toLocaleString() }}</p>

          <div class="mt-3">
            <span
              class="px-3 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-yellow-100 text-yellow-600 dark:bg-yellow-200 dark:text-yellow-800': item.Status === 'order',
                'bg-gray-100 text-gray-600 dark:bg-gray-200 dark:text-gray-800': item.Status === 'expired',
                'bg-red-100 text-red-600 dark:bg-red-200 dark:text-red-800': item.Status === 'cancel',
                'bg-blue-100 text-blue-600 dark:bg-blue-200 dark:text-blue-800': item.Status === 'tiket',
                'bg-orange-100 text-orange-600 dark:bg-orange-200 dark:text-orange-800': item.Status === 'pending',
                'bg-gray-200 text-gray-800 dark:bg-gray-300 dark:text-gray-900': ![
                  'order', 'expired', 'cancel', 'tiket', 'pending'
                ].includes(item.Status)
              }"
            >
              {{ item.Status }}
            </span>
          </div>
        </div>


        <div class="border-t dark:border-gray-700 p-3 flex justify-between items-center">
          <!-- Tombol Detail -->
          <router-link
            class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-semibold flex items-center"
            :to="'/modul-pesanan/detail/' + item._id"
          >
            <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiEyeOutline" fill="currentColor" />
            </svg>
            Detail
          </router-link>

          <!-- Tombol Cetak Tiket -->
          <router-link
            v-if="item.Status === 'tiket'"
            class="text-purple-600 hover:text-purple-800 text-sm font-semibold flex items-center"
            :to="'/orderStruk/' + item._id"
          >
          <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiCash" fill="currentColor"/>
            </svg>
            Struk Tiket
          </router-link>

          <!-- Tombol Bayar -->
          <router-link
            v-if="item.Status === 'order'"
            class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 text-sm font-semibold flex items-center"
            :to="'/modul-pembayaran/add/' + item._id"
          >
            <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiCash" fill="currentColor" />
            </svg>
            Bayar
          </router-link>

          <!-- Tombol Batalkan -->
          <button
            v-if="item.Status === 'order' || item.Status === 'pending'"
            @click="cancelPesanan(item._id)"
            class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-semibold flex items-center"
          >
            <svg class="w-5 h-5 mr-1" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiCloseOctagon" fill="currentColor" />
            </svg>
            Batalkan
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="mt-6 flex justify-center text-gray-700 dark:text-gray-300">
      <button
        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-sm rounded-l"
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        Prev
      </button>
      <span class="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-sm">Halaman {{ currentPage }} dari {{ totalPages }}</span>
      <button
        class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-sm rounded-r"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>
