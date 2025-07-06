<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";

import Navbar from '@/components/Header/Navbar.vue'
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { ref, watch, onMounted } from "vue";
import { useRoute } from 'vue-router';
import { useIndexStore } from "@/stores";
import Swal from "sweetalert2";
import router from "@/router";
import { getTeknisById, createPesanan } from "@/stores/functionAPI";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";

const indexStore = useIndexStore();
const route = useRoute();
const teknis = ref(null);

onMounted(async () => {
    const id = route.params.id;
    if (id) {
        try {
            const response = await getTeknisById(id);
            teknis.value = response;
            savedData.value.teknisId = response._id; // ✅ Isi teknisId dengan _id yang diambil
            console.log("Teknis ID:", savedData.value.teknisId); // Debugging
        } catch (error) {
            console.error("Error fetching teknis:", error);
        }
    }
});

const savedData = ref({
  Modul_pesanan_pic: "",
  userId:indexStore.user._id,
  userName: indexStore.user.userName, // Diisi manual
  userPhone: indexStore.user.userPhone, // Diisi manual
  email: indexStore.user.email, // Diisi manual
  teknisId: "",
  Kelas_kursi: "",
  Kode_kursi: "",
});

const optionsKelas = ref([]);
const optionsKursi = ref([]);

watch(() => savedData.value.teknisId, async (newValue) => {
  if (!newValue) return;
  console.log("📌 Watch Triggered! teknisId:", newValue); // Debugging

  try {
    const teknisDetail = await getTeknisById(newValue);
    console.log("🎯 Detail Teknis:", teknisDetail);

    // Isi Kelas Kursi
    optionsKelas.value = teknisDetail.Kursi_tersedia.map(item => ({
      label: item.label,
      value: item.label
    }));

    console.log("✅ Options Kelas:", optionsKelas.value);
  } catch (error) {
    console.error("❌ Error fetching kelas data:", error);
  }
});



watch(() => savedData.value.Kelas_kursi, async (newValue) => {
  if (!newValue || !savedData.value.teknisId) {
    optionsKursi.value = [];
    return;
  }

  const selectedKelas = typeof newValue === "object" ? newValue.value : newValue;

  try {
    const teknisDetail = await getTeknisById(savedData.value.teknisId);
    const kelasData = teknisDetail.Kursi_tersedia.find(
      item => item.label.trim().toLowerCase() === selectedKelas.trim().toLowerCase()
    );

    if (!kelasData || !kelasData.seats) {
      optionsKursi.value = [];
      return;
    }

    if (typeof kelasData.seats === "object") {
      optionsKursi.value = Object.keys(kelasData.seats).map(kode => ({
        label: kode,
        value: kode,
        available: kelasData.seats[kode] === "N" // Cek apakah kursi tersedia
      }));
    }
  } catch (error) {
    console.error("❌ Error fetching kursi data:", error);
  }
});





const selectSeat = (kode) => {
  savedData.value.Kode_kursi = kode;
};


const submitData = async () => {
  console.log("📌 Data sebelum dikirim:", savedData.value);

  const formattedData = {
    ...savedData.value,
    Kelas_kursi: savedData.value.Kelas_kursi.value || savedData.value.Kelas_kursi,
    Kode_kursi: savedData.value.Kode_kursi.value || savedData.value.Kode_kursi,
    Berangkat_date: teknis.value?.Berangkat_date,  // ⬅️ Tambahkan ini
    Berangkat_time: teknis.value?.Berangkat_time  // ⬅️ Tambahkan ini
  };

  console.log("🚀 Payload yang dikirim:", formattedData);

  try {
    showLoading();
    await createPesanan(formattedData.teknisId, formattedData);
    await successCreate();
    router.push("/orders");
  } catch (error) {
    console.error("❌ Error saat menyimpan pesanan:", error);
    await failedCreate(error);
  }
};




</script>

<template>
  <Navbar />

  <!-- Wrapper dengan padding dan gap responsif -->
  <div class="p-5">
    <div class="grid grid-cols-1 min-[821px]:grid-cols-2 gap-3">
      
      <!-- Card Tiket yang Dipilih -->
      <div v-if="teknis" class="w-full">
        <div class="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border dark:border-gray-700">
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white border-b pb-3 mb-4">Tiket yang Dipilih</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Kendaraan</label>
              <input type="text" :value="teknis.Nama_kendaraan" class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white" readonly />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor Kendaraan</label>
              <input type="text" :value="teknis.Nomor_kendaraan" class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white" readonly />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Jenis Kendaraan</label>
              <input type="text" :value="teknis.Jenis_kendaraan" class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white" readonly />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kapasitas Penumpang</label>
              <input type="text" :value="teknis.Kapasitas_penumpang" class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white" readonly />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Keberangkatan</label>
              <textarea
                :value="teknis.Keberangkatan[0].bandaraName ? `${teknis.Keberangkatan[0].bandaraName} - ${teknis.Keberangkatan[0].bandaraLocation}` : `${teknis.Keberangkatan[0].stasiunName} - ${teknis.Keberangkatan[0].stasiunLocation}`"
                class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white min-h-[50px] resize-none"
                readonly
              ></textarea>
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tujuan</label>
              <textarea
                :value="teknis.Tujuan[0].bandaraName ? `${teknis.Tujuan[0].bandaraName} - ${teknis.Tujuan[0].bandaraLocation}` : `${teknis.Tujuan[0].stasiunName} - ${teknis.Tujuan[0].stasiunLocation}`"
                class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white min-h-[50px] resize-none"
                readonly
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu Berangkat</label>
              <input type="text" :value="new Date(teknis.Datetime_berangkat).toLocaleString()" class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white" readonly />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Waktu Perjalanan</label>
              <input type="text" :value="`${teknis.Waktu_perjalanan} menit`" class="w-full border p-2 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-white" readonly />
            </div>
          </div>
        </div>
      </div>

      <!-- Card Pemesanan Tiket -->
      <div class="w-full">
        <div class="p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700">
          <h2 class="text-xl font-semibold text-gray-700 dark:text-white mb-4">Pesan Tiket</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama</label>
              <input type="text" v-model="savedData.userName" class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomor HP</label>
              <input type="text" v-model="savedData.userPhone" class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input type="email" v-model="savedData.email" class="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Kelas Kursi</label>
              <SelectGroup placeholder="Pilih Kelas" :options="optionsKelas" v-model="savedData.Kelas_kursi" class="w-full" />
            </div>

            <!-- Pilihan Kursi -->
            <div v-if="optionsKursi.length > 0">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Pilih Kursi</label>
              <div class="flex flex-wrap items-start gap-x-8 gap-y-2 mt-2">
                <!-- Kursi kiri -->
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="kursi in optionsKursi.slice(0, Math.ceil(optionsKursi.length / 2))"
                    :key="kursi.value"
                    @click="kursi.available ? selectSeat(kursi.value) : null"
                    :disabled="!kursi.available"
                    :class="[
                      'w-12 h-12 flex items-center justify-center border rounded-lg font-semibold transition-all',
                      kursi.value === savedData.Kode_kursi ? 'bg-blue-500 text-white shadow-md' :
                      kursi.available ? 'bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-600' : 'bg-gray-400 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    ]"
                  >
                    {{ kursi.label }}
                  </button>
                </div>

                <div class="w-10"></div>

                <!-- Kursi kanan -->
                <div class="grid grid-cols-2 gap-3">
                  <button
                    v-for="kursi in optionsKursi.slice(Math.ceil(optionsKursi.length / 2))"
                    :key="kursi.value"
                    @click="kursi.available ? selectSeat(kursi.value) : null"
                    :disabled="!kursi.available"
                    :class="[
                      'w-12 h-12 flex items-center justify-center border rounded-lg font-semibold transition-all',
                      kursi.value === savedData.Kode_kursi ? 'bg-blue-500 text-white shadow-md' :
                      kursi.available ? 'bg-gray-100 dark:bg-gray-700 dark:text-white hover:bg-blue-100 dark:hover:bg-blue-600' : 'bg-gray-400 text-gray-700 dark:text-gray-300 cursor-not-allowed'
                    ]"
                  >
                    {{ kursi.label }}
                  </button>
                </div>

                <!-- Penjelasan -->
                <div class="flex flex-col gap-2 ml-8">
                  <div class="flex items-center gap-2">
                    <div class="w-12 h-12 bg-blue-500 text-white flex items-center justify-center border rounded-lg shadow-md">✔</div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Kursi Dipilih</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-12 h-12 bg-gray-400 text-gray-700 flex items-center justify-center border rounded-lg">✖</div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Kursi Telah Dipesan</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-12 h-12 bg-gray-100 dark:bg-gray-700 flex items-center justify-center border rounded-lg text-gray-900 dark:text-white">○</div>
                    <span class="text-sm text-gray-700 dark:text-gray-300">Kursi Tersedia</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tombol Aksi -->
            <div class="flex justify-end mt-6 gap-4">
              <button @click="router.back()" class="px-4 py-2 rounded-lg bg-gray-500 text-white hover:bg-gray-600">Batal</button>
              <button @click="submitData" class="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Pesan Tiket</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

