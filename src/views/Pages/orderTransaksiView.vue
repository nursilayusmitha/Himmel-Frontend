<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute, useRouter } from "vue-router"
import Swal from "sweetalert2"

import Navbar from '@/components/Header/Navbar.vue'
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue"
import DefaultCard from "@/components/Forms/DefaultCard.vue"
import DefaultLayout from "@/layouts/DefaultLayout.vue"

import { useIndexStore } from "@/stores"
import {
  getPembayaranById,
  createTransaksi,
  deletePembayaran
} from "@/stores/functionAPI"
import {
  showLoading,
  successCreate,
  failedCreate
} from "@/stores/swal"

const indexStore = useIndexStore()
const route = useRoute()
const router = useRouter()

// Data transaksi
const savedData = ref({
  Modul_transaksi_pic: "",
  userName: "",
  pembayaran: null,
  Money: null,
  Change: null,
  transaksi: null,
  isSuccess: false,
  buktiTransaksiId: ""
})

const isDarkMode = document.documentElement.classList.contains("dark")

onMounted(async () => {
  const id = route.params.id
  if (id) {
    try {
      const response = await getPembayaranById(id)
      if (response.success) {
        savedData.value.pembayaran = response.data
        savedData.value.Modul_transaksi_pic = response.data.pesananId?.Modul_pesanan_pic || ""
        savedData.value.userName = response.data.pesananId?.userName || ""

        if (isQrisWithBukti.value) {
          savedData.value.Money = savedData.value.pembayaran.Harga_total
        }
      } else {
        console.error("Gagal mendapatkan data pembayaran:", response.message)
      }
    } catch (error) {
      console.error("Error fetching pembayaran:", error)
    }
  }
})

const isQrisWithBukti = computed(() => {
  return savedData.value.pembayaran?.Metode === "Qris"
})

const submitTransaksi = async () => {
  if (!isQrisWithBukti.value && savedData.value.Money < savedData.value.pembayaran.Harga_total) {
    Swal.fire({
      title: "Gagal",
      text: "Uang yang diberikan kurang!",
      icon: "warning",
      ...(isDarkMode && {
        background: '#1f2937',
        color: '#f9fafb',
        iconColor: '#facc15'
      })
    })
    return
  }

  if (isQrisWithBukti.value && !savedData.value.buktiTransaksiId) {
    Swal.fire({
      title: "Gagal",
      text: "Bukti transaksi QRIS wajib diisi!",
      icon: "warning",
      ...(isDarkMode && {
        background: '#1f2937',
        color: '#f9fafb',
        iconColor: '#facc15'
      })
    })
    return
  }

  try {
    showLoading()
    const response = await createTransaksi(savedData.value.pembayaran._id, {
      Money: savedData.value.Money,
      Modul_transaksi_pic: savedData.value.Modul_transaksi_pic,
      userName: savedData.value.userName,
      buktiTransaksiId: savedData.value.buktiTransaksiId
    })

    savedData.value.transaksi = response.data
    savedData.value.isSuccess = true

    await successCreate()
    router.push(`/orderStruk/${response.data._id}`)
  } catch (error) {
    console.error("❌ Error saat membuat transaksi:", error)
    await failedCreate(error)
  }
}

const batalTransaksi = async () => {
  const id = route.params.id
  if (!id) {
    console.error("❌ ID tidak ditemukan!")
    return
  }

  const result = await Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Pembayaran ini akan dibatalkan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, batalkan pembayaran!",
    cancelButtonText: "Batal",
    ...(isDarkMode && {
      background: '#1f2937',
      color: '#f9fafb',
      iconColor: '#facc15'
    })
  })

  if (result.isConfirmed) {
    try {
      showLoading()
      await deletePembayaran(id)

      await Swal.fire({
        title: "Dibatalkan!",
        text: "Pembayaran telah dibatalkan.",
        icon: "success",
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#facc15'
        })
      })

      router.push(`/orders`)
    } catch (error) {
      console.error("❌ Gagal menghapus pembayaran:", error)
      await Swal.fire({
        title: "Gagal!",
        text: "Terjadi kesalahan saat menghapus pembayaran.",
        icon: "error",
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#facc15'
        })
      })
    }
  }
}
</script>

<template>
  <Navbar />
  <div class="container mx-auto p-6 max-w-3xl">
    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="flex flex-col gap-6 col-span-2">
        <DefaultCard cardTitle="Input Transaksi">
          <div
            v-if="savedData.pembayaran"
            class="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg"
          >
            <!-- Nama Pemesan -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Nama Pemesan
              </label>
              <input
                type="text"
                :value="savedData.pembayaran.pesananId?.userName"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-100 dark:bg-gray-700 text-lg text-gray-900 dark:text-white"
                disabled
              />
            </div>

            <!-- Harga Tiket -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Harga Tiket
              </label>
              <input
                type="text"
                :value="savedData.pembayaran.Harga_tiket"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-100 dark:bg-gray-700 text-lg text-gray-900 dark:text-white"
                disabled
              />
            </div>

            <!-- Harga Total -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Harga Total
              </label>
              <input
                type="text"
                :value="savedData.pembayaran.Harga_total"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-100 dark:bg-gray-700 text-lg text-gray-900 dark:text-white"
                disabled
              />
            </div>

            <!-- Bayar -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Bayar
              </label>
              <input
                type="number"
                v-model="savedData.Money"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                :disabled="isQrisWithBukti"
                placeholder="Masukkan uang"
              />
            </div>

            <!-- QRIS Section -->
            <div v-if="isQrisWithBukti" class="mb-4 text-center">
              <h3 class="font-semibold text-gray-800 dark:text-gray-100 text-lg">Scan QRIS:</h3>
              <img
                src="@/assets/images/qris.jpg"
                alt="QR Code"
                class="w-80 h-auto border rounded-lg mx-auto shadow-md"
              />
            </div>

            <!-- Bukti Transaksi QRIS -->
            <div v-if="isQrisWithBukti" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Bukti ID Transaksi QRIS
              </label>
              <input
                type="text"
                v-model="savedData.buktiTransaksiId"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-lg text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                placeholder="Masukkan bukti transaksi"
              />
            </div>

            <!-- Kembalian -->
            <div v-if="!isQrisWithBukti" class="mb-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-200">
                Kembalian
              </label>
              <input
                type="text"
                :value="Math.max(savedData.Money - savedData.pembayaran.Harga_total, 0)"
                class="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-gray-100 dark:bg-gray-700 text-lg text-gray-900 dark:text-white"
                disabled
              />
            </div>

            <!-- Tombol -->
            <div class="flex justify-end space-x-4 pt-4">
              <button
                @click="batalTransaksi"
                class="rounded-lg bg-gray-500 hover:bg-gray-600 px-6 py-3 text-white text-lg transition shadow-md"
              >
                Batal
              </button>
              <button
                @click="submitTransaksi"
                class="rounded-lg bg-primary hover:bg-blue-700 px-6 py-3 text-white text-lg transition shadow-md"
              >
                Simpan Transaksi
              </button>
            </div>
          </div>
        </DefaultCard>
      </div>
    </div>
  </div>
</template>
