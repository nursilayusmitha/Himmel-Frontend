<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Swal from "sweetalert2";
import router from "@/router";

import Navbar from '@/components/Header/Navbar.vue';
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";

import { useIndexStore } from "@/stores";
import { getPesananById, createPembayaran } from "@/stores/functionAPI";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";

const indexStore = useIndexStore();
const route = useRoute();

const pesanan = ref(null);
const voucherOptions = ref([]);

const savedData = ref({
  userId: indexStore.user._id,
  metode: "",
  transaksiId: "",
  buktiTransaksiId: "",
  voucherId: "",
});

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const response = await getPesananById(id);
      pesanan.value = response;
      console.log("📌 Data Pesanan:", response);
    } catch (error) {
      console.error("❌ Error fetching pesanan:", error);
    }
  }

  const userId = indexStore.user._id;
  if (userId) {
    await fetchUserVouchers(userId);
  }
});

const fetchUserVouchers = async (userId) => {
  try {
    const response = await fetch("http://localhost:4000/api/userEksternal/getVoucherById/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("📌 Voucher dari API:", data.vouchers);
      voucherOptions.value = data.vouchers.map((voucher) => {
        let label = voucher.Nama_voucher;
        if (voucher.Persen_potongan) {
          label += ` - ${voucher.Persen_potongan}%`;
        } else if (voucher.Harga_potongan) {
          label += ` - Rp ${voucher.Harga_potongan.toLocaleString()}`;
        }
        return { label, value: voucher._id };
      });
    } else {
      console.error("❌ Gagal mengambil voucher:", data.message);
    }
  } catch (error) {
    console.error("❌ Terjadi kesalahan:", error);
  }
};

const submitData = async () => {
  const isDarkMode = document.documentElement.classList.contains("dark");

  if (!savedData.value.metode) {
    await Swal.fire({
      title: "Gagal",
      text: "Silakan pilih metode pembayaran!",
      icon: "warning",
      ...(isDarkMode && {
        background: '#1f2937',
        color: '#f9fafb',
        iconColor: '#facc15',
      }),
    });
    return;
  }

  const payload = {
    metode: savedData.value.metode,
    voucherId: savedData.value.voucherId,
    userId: savedData.value.userId,
  };

  console.log("🚀 Payload yang dikirim:", payload);

  try {
    showLoading();

    const response = await createPembayaran(pesanan.value._id, payload);
    console.log("📌 Respons dari createPembayaran:", response.data);

    const pembayaranId = response.data.data ? response.data.data._id : response.data._id;

    if (pembayaranId) {
      console.log("✅ ID Pembayaran yang dibuat:", pembayaranId);
      await successCreate(isDarkMode);

      if (savedData.value.metode === "Qris") {
        router.push(`/modul-transaksi/add/${pembayaranId}`);
      } else if (savedData.value.metode === "Mitra") {
        router.push(`/orders`);
      }
    } else {
      console.error("❌ ID pembayaran tidak ditemukan dalam respons:", response.data);
      throw new Error("ID pembayaran tidak ditemukan dalam respons.");
    }
  } catch (error) {
    console.error("❌ Error saat membuat pembayaran:", error);
    await failedCreate(error, isDarkMode);
  }
};
</script>


<template>
  <Navbar />

  <div class="max-w-3xl mx-auto mt-8 space-y-6 mb-9 px-4">
    <DefaultCard cardTitle="Input Pembayaran">
      <div v-if="pesanan" class="p-6 space-y-6">
        <!-- Detail Pesanan -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Detail Pesanan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Nama Pemesan</label>
              <input
                type="text"
                :value="pesanan.userName"
                class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">No HP</label>
              <input
                type="text"
                :value="pesanan.userPhone"
                class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Jenis Kendaraan</label>
              <input
                type="text"
                :value="pesanan.Jenis_kendaraan"
                class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">Harga Tiket</label>
              <input
                type="text"
                :value="pesanan.Harga_tiket"
                class="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled
              />
            </div>
          </div>
        </div>

        <!-- Metode Pembayaran -->
        <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">Pembayaran</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-600 dark:text-gray-300">Metode Pembayaran</label>
              <SelectGroup
                placeholder="Pilih Metode Pembayaran"
                :options="[
                  { label: 'Mitra', value: 'Mitra' },
                  { label: 'Qris', value: 'Qris' }
                ]"
                v-model="selectedMetode"
                @update:modelValue="savedData.metode = $event.value"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-600 dark:text-gray-300">Pilih Voucher</label>
              <SelectGroup
                placeholder="Pilih Voucher"
                :options="voucherOptions"
                v-model="selectedVoucher"
                @update:modelValue="savedData.voucherId = $event.value"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tombol Submit -->
      <div class="flex justify-end px-6 py-4 space-x-4">
        <button
          @click="router.back()"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
        >
          Batal
        </button>
        <button
          @click="submitData"
          class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 shadow-md"
        >
          Pembayaran
        </button>
      </div>
    </DefaultCard>
  </div>
</template>
