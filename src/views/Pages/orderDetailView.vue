<script setup lang="ts">
import { ref, onMounted, computed } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"
import router from "@/router"
import Navbar from '@/components/Header/Navbar.vue'
import DefaultCard from "@/components/Forms/DefaultCard.vue"

const route = useRoute()
const pesanan = ref({
  userName: "",
  userPhone: "",
  email: "",
  Jenis_kendaraan: "",
  Nama_kendaraan: "",
  Nomor_kendaraan: "",
  Keberangkatan: "",
  Tujuan: "",
  Kode_kursi: "",
  Harga_tiket: "",
  Status: "",
  Verifikasi: "",
  qrCode: "",
})

onMounted(async () => {
  try {
    const id = route.params.id
    const response = await axios.get(`http://localhost:4000/api/modul_pesanan/pesanan/${id}`)
    pesanan.value = response.data.data
  } catch (error) {
    console.error("Gagal mengambil detail pesanan:", error)
  }
})

const fields = computed(() => ({
  userName: "Nama",
  userPhone: "No. Telepon",
  email: "Email",
  Jenis_kendaraan: "Jenis Kendaraan",
  Nama_kendaraan: "Nama Kendaraan",
  Nomor_kendaraan: "Nomor Kendaraan",
  Kode_kursi: "Kode Kursi",
  Harga_tiket: "Harga Tiket",
  Status: "Status",
  Verifikasi: "Verifikasi",
}))
</script>

<template>
  <Navbar />

  <div class="max-w-4xl mx-auto mt-6 space-y-6 px-4 sm:px-6 lg:px-8">
    <!-- Card Detail Pesanan -->
    <DefaultCard cardTitle="Detail Pesanan">
      <div class="p-6 space-y-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-for="(label, key) in fields" :key="key">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-200">{{ label }}:</label>
            <div class="block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-white shadow-sm">
              {{ pesanan[key] || '-' }}
            </div>
          </div>
        </div>

        <!-- QR Code -->
        <div v-if="pesanan.qrCode" class="mt-8 flex flex-col items-center bg-gray-100 dark:bg-gray-700 p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white">QR Code Tiket:</h3>
          <img :src="pesanan.qrCode" alt="QR Code Tiket" class="w-40 h-40 border rounded-lg mt-2 shadow-md" />
        </div>
      </div>
    </DefaultCard>

    <!-- Card Kembali -->
    <DefaultCard>
      <div class="px-4 py-4">
        <button
          @click="router.back()"
          class="w-full bg-red-500 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:bg-red-600 shadow"
        >
          Kembali
        </button>
      </div>
    </DefaultCard>
  </div>
</template>
