<script setup>
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { ref, onMounted, computed } from "vue";
import { useIndexStore } from "@/stores";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import { getPembayaranById, createTransaksi,deletePembayaran } from "@/stores/functionAPI";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";

const indexStore = useIndexStore();
const route = useRoute();
const router = useRouter();

// Data transaksi yang disimpan
const savedData = ref({
  Modul_transaksi_pic: "", 
  userName:"",
  pembayaran: null,
  Money: null,
  Change: null,
  transaksi: null,
  isSuccess: false,
  buktiTransaksiId: "", // Tambahkan untuk menyimpan bukti QRIS
});



onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const response = await getPembayaranById(id);
      if (response.success) {
        savedData.value.pembayaran = response.data;
        savedData.value.Modul_transaksi_pic = response.data.pesananId?.Modul_pesanan_pic || "";
        savedData.value.userName = response.data.pesananId?.userName || "";

        if (isQrisWithBukti.value) {
          savedData.value.Money = savedData.value.pembayaran.Harga_total;
        }
      } else {
        console.error("Gagal mendapatkan data pembayaran:", response.message);
      }
    } catch (error) {
      console.error("Error fetching pembayaran:", error);
    }
  }
});

const isQrisWithBukti = computed(() => {
  return savedData.value.pembayaran?.Metode === "Qris";
});

const submitTransaksi = async () => {
  if (!isQrisWithBukti.value && savedData.value.Money < savedData.value.pembayaran.Harga_total) {
    Swal.fire("Gagal", "Uang yang diberikan kurang!", "warning");
    return;
  }

  if (isQrisWithBukti.value && !savedData.value.buktiTransaksiId) {
    Swal.fire("Gagal", "Bukti transaksi QRIS wajib diisi!", "warning");
    return;
  }

  try {
    showLoading();
    const response = await createTransaksi(savedData.value.pembayaran._id, {
      Money: savedData.value.Money,
      Modul_transaksi_pic: savedData.value.Modul_transaksi_pic,
      userName: savedData.value.userName,
      buktiTransaksiId: savedData.value.buktiTransaksiId,
    });

    savedData.value.transaksi = response.data;
    savedData.value.isSuccess = true;
    await successCreate();
    router.push(`/struk/${response.data._id}`);
  } catch (error) {
    console.error("Error saat membuat transaksi:", error);
    await failedCreate(error);
  }
};
const formattedMoney = computed({
  get() {
    return savedData.value.Money != null
      ? `Rp ${Number(savedData.value.Money).toLocaleString("id-ID")}`
      : "";
  },
  set(value) {
    const numeric = Number(value.replace(/[^\d]/g, ""));
    savedData.value.Money = isNaN(numeric) ? null : numeric;
  },
});

const formatRupiah = (angka) => {
  if (angka == null || isNaN(angka)) return "Rp 0";
  return `Rp ${Number(angka).toLocaleString("id-ID")}`;
};

const handleMoneyInput = (e) => {
  const rawValue = e.target.value.replace(/[^\d]/g, "");
  savedData.value.Money = Number(rawValue);
};


const batalTransaksi = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  console.log("Tombol batal ditekan"); // Debugging

  const id = route.params.id;
  if (!id) {
    console.error("❌ ID tidak ditemukan!");
    return;
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
      background: "#1f2937",   // gray-800
      color: "#f9fafb",        // gray-100
      iconColor: "#facc15",    // yellow-400
    }),
  });

  if (result.isConfirmed) {
    console.log("Menghapus pembayaran dengan ID:", id); // Debugging

    try {
      showLoading();
      await deletePembayaran(id);
      
      // Pastikan Swal muncul sebelum berpindah halaman
      await Swal.fire("Dibatalkan!", "Pembayaran telah dibatalkan.", "success");

      // Tunggu SweetAlert selesai sebelum pindah halaman
      router.push(`/modules/modul-pesanan/`);
    } catch (error) {
      console.error("❌ Gagal menghapus pembayaran:", error);
      await Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus pembayaran.", "error");
    }
  } else {
    console.log("Pembatalan transaksi dibatalkan oleh pengguna.");
  }
};

</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault pageTitle="Modul - Add Transaksi" :pageList="['Modul', 'Transaksi', 'Add']" />
    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard cardTitle="Input Transaksi">
          <div v-if="savedData.pembayaran" class="p-6.5">
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Nama Pemesan</label>
              <input type="text" :value="savedData.pembayaran.pesananId?.userName"
                class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded" disabled />
            </div>
            <!-- Harga Tiket -->
<div class="mb-4">
  <label class="block text-sm font-medium text-black dark:text-white">Harga Tiket</label>
  <input
    type="text"
    :value="`Rp ${Number(savedData.pembayaran.Harga_tiket || 0).toLocaleString('id-ID')}`"
    class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded"
    disabled
  />
</div>

<!-- Harga Total -->
<div class="mb-4">
  <label class="block text-sm font-medium text-black dark:text-white">Harga Total</label>
  <input
    type="text"
    :value="`Rp ${Number(savedData.pembayaran.Harga_total || 0).toLocaleString('id-ID')}`"
    class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded"
    disabled
  />
</div>

            <!-- Input Money -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Bayar</label>
            <input
  type="text"
  v-model="formattedMoney"
  :disabled="isQrisWithBukti"
  placeholder="Masukkan uang"
  class="w-full border p-2 bg-white dark:bg-form-input dark:border-form-strokedark dark:text-white rounded"
/>

  
            </div>

            <!-- QRIS Image -->
            <div v-if="isQrisWithBukti" class="mb-4">
              <h3 class="font-semibold dark:text-white">Scan Qris:</h3>
              <img src="@/assets/images/qris.jpg" alt="QR Code"
                class="w-100 h-auto border rounded mx-auto justify-start" />
            </div>

            <!-- Bukti Transaksi -->
            <div v-if="isQrisWithBukti" class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Bukti ID Transaksi QRIS</label>
              <input type="text" v-model="savedData.buktiTransaksiId"
                class="w-full border p-2 bg-white dark:bg-form-input dark:border-form-strokedark dark:text-white rounded"
                placeholder="Masukkan bukti transaksi" />
            </div>

            <!-- Kembalian -->
            <div v-if="!isQrisWithBukti" class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Kembalian</label>
            <input
  type="text"
  :value="formatRupiah(Math.max(savedData.Money - savedData.pembayaran.Harga_total, 0))"
  class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded"
  disabled
/>
  
            </div>
          </div>

          <!-- Tombol -->
          <div class="flex justify-end mr-6 mb-4">
            <button @click="batalTransaksi"
              class="rounded bg-gray-500 hover:bg-gray-600 dark:hover:bg-gray-400 p-3 text-white mr-5 transition">
              Batal
            </button>
            <button @click="submitTransaksi"
              class="rounded bg-primary hover:bg-primary-dark p-3 text-white transition">
              Simpan Transaksi
            </button>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
