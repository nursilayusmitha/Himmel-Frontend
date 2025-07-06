<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
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
  Modul_pesanan_pic: indexStore.user.userName,
  userName: "", // Diisi manual
  userPhone: "", // Diisi manual
  email: "", // Diisi manual
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
    router.push("/modules/modul-pesanan");
  } catch (error) {
    console.error("❌ Error saat menyimpan pesanan:", error);
    await failedCreate(error);
  }
};




</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault pageTitle="Modul - Add Pesanan" :pageList="['Modul', 'Pesanan', 'Add']" />
    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard cardTitle="Input Pesanan">
          <div class="p-6.5">
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Nama</label>
              <input type="text" v-model="savedData.userName" class="w-full border p-2 dark:bg-form-input dark:text-white dark:border-form-strokedark" />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Nomor HP</label>
              <input type="text" v-model="savedData.userPhone" class="w-full border p-2 dark:bg-form-input dark:text-white dark:border-form-strokedark" />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Email</label>
              <input type="email" v-model="savedData.email" class="w-full border p-2 dark:bg-form-input dark:text-white dark:border-form-strokedark" />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Kelas Kursi</label>
              <SelectGroup placeholder="Pilih Kelas" :options="optionsKelas" v-model="savedData.Kelas_kursi" />
            </div>

            <div class="mb-4" v-if="optionsKursi.length > 0">
              <label class="block text-sm font-medium text-black dark:text-white">Kode Kursi</label>
              <div class="flex flex-wrap items-start gap-x-6 gap-y-2 mt-2">
                <!-- Kelompok Kursi Kiri -->
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="kursi in optionsKursi.slice(0, Math.ceil(optionsKursi.length / 2))"
                    :key="kursi.value"
                    @click="kursi.available ? selectSeat(kursi.value) : null"
                    :disabled="!kursi.available"
                    :class="[
                      'w-12 h-12 flex items-center justify-center border rounded',
                      kursi.value === savedData.Kode_kursi ? 'bg-blue-500 text-white' :
                      (kursi.available ? 'bg-white hover:bg-gray-200 dark:bg-form-input dark:hover:bg-gray-700 dark:text-white' :
                      'bg-gray-400 cursor-not-allowed text-gray-700 dark:text-gray-300')
                    ]"
                  >
                    {{ kursi.label }}
                  </button>
                </div>

                <div class="w-8"></div>

                <!-- Kelompok Kursi Kanan -->
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="kursi in optionsKursi.slice(Math.ceil(optionsKursi.length / 2))"
                    :key="kursi.value"
                    @click="kursi.available ? selectSeat(kursi.value) : null"
                    :disabled="!kursi.available"
                    :class="[
                      'w-12 h-12 flex items-center justify-center border rounded',
                      kursi.value === savedData.Kode_kursi ? 'bg-blue-500 text-white' :
                      (kursi.available ? 'bg-white hover:bg-gray-200 dark:bg-form-input dark:hover:bg-gray-700 dark:text-white' :
                      'bg-gray-400 cursor-not-allowed text-gray-700 dark:text-gray-300')
                    ]"
                  >
                    {{ kursi.label }}
                  </button>
                </div>

                <div class="flex flex-col gap-2 ml-8">
                  <div class="flex items-center gap-2">
                    <div class="w-12 h-12 bg-blue-500 text-white flex items-center justify-center border rounded">Kode</div>
                    <span class="dark:text-white">Kursi Dipilih</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-12 h-12 bg-gray-400 text-gray-700 dark:text-gray-300 flex items-center justify-center border rounded">Kode</div>
                    <span class="dark:text-white">Kursi Telah Dipesan</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-12 h-12 bg-white border flex items-center justify-center rounded dark:bg-form-input dark:text-white">Kode</div>
                    <span class="dark:text-white">Kursi Tersedia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-end mr-6 mb-4 -mt-5">
            <button @click="router.back()" class="rounded bg-primary p-3 text-white mr-5">Batal Pesan</button>
            <button @click="submitData" class="rounded bg-primary p-3 text-white">Tambah Pesanan</button>
          </div>
        </DefaultCard>
      </div>
    </div>

    <div class="mt-9">
      <DefaultCard cardTitle="Detail Teknis yang Dipilih" v-if="teknis">
        <div class="p-6.5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Nama Kendaraan</label>
            <input type="text" :value="teknis.Nama_kendaraan" class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark" readonly />
          </div>
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Nomor Kendaraan</label>
            <input type="text" :value="teknis.Nomor_kendaraan" class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark" readonly />
          </div>
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Jenis Kendaraan</label>
            <input type="text" :value="teknis.Jenis_kendaraan" class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark" readonly />
          </div>
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Kapasitas Penumpang</label>
            <input type="text" :value="teknis.Kapasitas_penumpang" class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark" readonly />
          </div>
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Keberangkatan</label>
            <input
              type="text"
              :value="teknis.Keberangkatan[0].bandaraName
                ? `${teknis.Keberangkatan[0].bandaraName} - ${teknis.Keberangkatan[0].bandaraLocation}`
                : `${teknis.Keberangkatan[0].stasiunName} - ${teknis.Keberangkatan[0].stasiunLocation}`"
              class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark"
              readonly
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Tujuan</label>
            <input
              type="text"
              :value="teknis.Tujuan[0].bandaraName
                ? `${teknis.Tujuan[0].bandaraName} - ${teknis.Tujuan[0].bandaraLocation}`
                : `${teknis.Tujuan[0].stasiunName} - ${teknis.Tujuan[0].stasiunLocation}`"
              class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark"
              readonly
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Waktu Berangkat</label>
            <input type="text" :value="new Date(teknis.Datetime_berangkat).toLocaleString()" class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark" readonly />
          </div>
          <div>
            <label class="block text-sm font-medium text-black dark:text-white">Waktu Perjalanan</label>
            <input type="text" :value="`${teknis.Waktu_perjalanan} jam`" class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:text-white dark:border-form-strokedark" readonly />
          </div>
        </div>
      </DefaultCard>
    </div>
  </DefaultLayout>
</template>

