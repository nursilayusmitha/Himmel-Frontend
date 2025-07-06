<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultCardTable from "@/components/Forms/DefaultCardAccessPage.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";

import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import SelectGroupRute from "@/components/Forms/SelectGroup/SelectGroupRute.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";

import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
import { createRute } from "@/stores/functionAPI";

import { ref, onMounted, computed,watch, nextTick } from "vue";
import router from "@/router";

const indexStore = useIndexStore();
const pageTitle = ref("Modul - Add Rute");
const pageList = ref(["Modul", "Rute", "Add"]);
const dataHeader = ref([
  {name: '', class: 'min-w-[30px] py-2 px-4'}, // Kolom checkbox
  {name: 'Nama Halaman', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Kode', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Kategori', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Tipe', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Grup', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Halaman Tujuan', class: 'min-w-[150px] py-2 px-4'},
]);
let dataTable = ref([]);

// Saved Data
// Set default harga kursi dengan label tetap
const savedData = ref({
  Modul_rute_pic: indexStore.user.userName,
  Jenis_kendaraan: "",
  Keberangkatan: [],
  Tujuan: [],
  Waktu_perjalanan: "",
  Harga_tiket: [
    { label: "Economy", harga: "" },
    { label: "Business", harga: "" },
    { label: "Executive", harga: "" },
  ],
  Perbaikan: "N",
});

// Watch agar hargaFormatted berubah jadi angka ke harga, lalu diformat lagi
savedData.value.Harga_tiket.forEach((kursi) => {
  watch(
    () => kursi.hargaFormatted,
    (val) => {
      const clean = val.replace(/\./g, '')
      const num = parseInt(clean)
      kursi.harga = isNaN(num) ? '' : num

      // Format ulang hanya kalau sedang mengetik
      if (val !== '') {
        kursi.hargaFormatted = kursi.harga.toLocaleString('id-ID')
      }
    }
  )
})
// Hapus fungsi tambah kursi karena tidak dibutuhkan lagi
const addHargaKursi = () => {}; // Kosongkan agar tidak digunakan

// Hapus juga tombol tambah kursi dari template


const optionsJenisKendaraan = [
  { label: "Pesawat", value: "pesawat" },
  { label: "Kereta", value: "kereta" },
];

watch(
  () => savedData.value.Jenis_kendaraan,
  (newValue) => {
    console.log("Jenis_kendaraan berubah menjadi:", newValue);
    // Reset Keberangkatan dan Tujuan ketika Jenis_kendaraan berubah
    savedData.value.Keberangkatan = [];
    savedData.value.Tujuan = [];
  }
);



const bandaraOptions = ref([]);
const stasiunOptions = ref([]);
const routeOptions = computed(() => {
  if (savedData.value.Jenis_kendaraan?.value === "pesawat") {
    return bandaraOptions.value;
  } else if (savedData.value.Jenis_kendaraan?.value === "kereta") {
    return stasiunOptions.value;
  } else {
    return [];
  }
});




onMounted(async () => {
  const bandaraData = await indexStore.getUtilBandara();
  const stasiunData = await indexStore.getUtilStasiun();

  bandaraOptions.value = bandaraData.utilData.map(b => ({
    label: `${b.bandaraName} (${b.bandaraLocation})`,
    value: b, // Simpan objek bandara lengkap
  }));

  stasiunOptions.value = stasiunData.utilData.map(s => ({
    label: `${s.stasiunName} (${s.stasiunLocation})`,
    value: s, // Simpan objek stasiun lengkap
  }));
});

const formattedRouteOptions = computed(() => {
  return routeOptions.value.map(option => ({
    label: `${option.label}`,
    value: option.value
  }));
});


// Validators for required fields, with conditional checks for Keberangkatan and Tujuan
const dataValidator = ref([
  { key: "Jenis_kendaraan", label: "Jenis Kendaraan" },
  { key: "Waktu_perjalanan", label: "Waktu Perjalanan" },
  { key: "Harga_tiket", label: "Harga Tiket" },
  { key: "Keberangkatan", label: "Rute Awal", condition: () => savedData.value.Jenis_kendaraan },
  { key: "Tujuan", label: "Rute Akhir", condition: () => savedData.value.Jenis_kendaraan },
]);


const dataError = ref([]);
// Helper function for validation
const validateForm = () => {
  dataError.value = [];

  savedData.value.Harga_tiket.forEach((kursi, index) => {
  if (!kursi.label.trim()) {
    dataError.value.push(`Label Kursi ke-${index + 1} tidak boleh kosong!`);
  }
  if (!kursi.harga || isNaN(Number(kursi.harga)) || Number(kursi.harga) <= 0) {
    dataError.value.push(`Harga Kursi ke-${index + 1} harus lebih dari 0!`);
  }
});


  // Cek apakah Rute Awal dan Rute Akhir sama
  if (savedData.value.Keberangkatan && savedData.value.Tujuan) {
    if (savedData.value.Keberangkatan.value === savedData.value.Tujuan.value) {
      dataError.value.push("Rute Awal dan Rute Akhir tidak boleh sama!");
    }
  }

  return dataError.value.length === 0;
};



const cancelAdd = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "Anda yakin membatalkan tambah data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Batalkan",
    cancelButtonText: "Kembali",
    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  });

  if (result.isConfirmed) {
    await router.push("/modules/modul-rute");
  }
};

const submitData = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const isValid = validateForm();
  if (!isValid) return;

  const result = await Swal.fire({
    title: "Tambah Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Tambah",
    cancelButtonText: "Batal",
    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      // Mengubah Keberangkatan dan Tujuan menjadi array jika belum
      const fixData = {
        Modul_rute_pic: savedData.value.Modul_rute_pic,
        Jenis_kendaraan: savedData.value.Jenis_kendaraan?.value, // Pastikan mengambil hanya value untuk Jenis Kendaraan
        Keberangkatan: Array.isArray(savedData.value.Keberangkatan)
          ? savedData.value.Keberangkatan.map(k => k.value)  // Jika sudah array, gunakan map
          : [savedData.value.Keberangkatan.value],  // Jika hanya objek, jadikan array
        Tujuan: Array.isArray(savedData.value.Tujuan)
          ? savedData.value.Tujuan.map(t => t.value)  // Jika sudah array, gunakan map
          : [savedData.value.Tujuan.value],  // Jika hanya objek, jadikan array
        Waktu_perjalanan: savedData.value.Waktu_perjalanan,
        Harga_tiket: savedData.value.Harga_tiket.map(kursi => ({
    label: kursi.label.trim(),
    harga: Number(kursi.harga) || 0, // Jika tidak bisa dikonversi, jadikan 0
  })),
        isDeleted: savedData.value.isDeleted,
      };

      console.log('Data yang akan dikirim:', fixData);

      // Kirim request untuk menambah data
      await createRute(fixData); // Jangan kirim dalam bentuk JSON.stringify, cukup object saja

      await successCreate().then(() => {
        router.push("/modules/modul-rute");
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await Swal.fire({
          title: "Hierarchy Code Error!",
          text: "Hierarchy Code telah digunakan.",
          icon: "error",
          confirmButtonColor: "#d33",
          ...(isDarkMode && {
            background: '#1f2937',        // Tailwind `gray-800`
            color: '#f9fafb',             // Tailwind `gray-100`
            iconColor: '#facc15',         // Tailwind `yellow-400`
          })
        });
      } else {
        await failedCreate(error);  // Error lainnya
      }
    }
  }
};




</script>


<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <!-- ====== Form Elements Section Start -->
      <div class="grid grid-cols-2">
        <!-- Input Fields Start -->
        <div class="flex flex-col gap-9 mr-9">
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Jenis Kendaraan
  </label>
  <SelectGroup
  placeholder="Jenis Kendaraan"
  :options="optionsJenisKendaraan"
  v-model="savedData.Jenis_kendaraan"
/>

              </div>
              <div class="lg:w-1/2">
                <div>
        <label class="mb-3 block text-sm font-medium text-black dark:text-white">
          Waktu Perjalanan
        </label>
        <input
          type="Number"
          placeholder="Menit Perjalanan"
          class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          v-model="savedData.Waktu_perjalanan"
        />
      </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2 -mt-6 p-6.5">
  <div>
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Rute Awal
  </label>
  <SelectGroupRute
  placeholder="Rute Awal"
  :options="formattedRouteOptions"
  v-model="savedData.Keberangkatan"
  :disabled="!savedData.Jenis_kendaraan"
  class="w-full"
/>
</div>
</div>
<div class="flex flex-col gap-2 -mt-6 p-6.5">
    <div>
      <label class="mb-3 block text-sm font-medium text-black dark:text-white">
        Rute Akhir
      </label>
      <SelectGroupRute
    placeholder="Rute Akhir"
    :options="formattedRouteOptions"
    v-model="savedData.Tujuan"
    :disabled="!savedData.Jenis_kendaraan"
    class="w-full"
  />
    </div>
  </div>


        </DefaultCard>
        <!-- Input Fields End -->
      </div>

        <div class="flex flex-col">
  <DefaultCard cardTitle="Input Kursi">
    <div class="p-6.5">
      <div
        class="flex flex-col gap-2"
        v-for="(kursi, index) in savedData.Harga_tiket"
        :key="index"
      >
        <div class="w-full flex items-center gap-4">
          <!-- Label -->
          <span class="text-sm font-medium text-black dark:text-white w-1/3">
            {{ kursi.label }}
          </span>

          <!-- Input Harga Format -->
          <input
            inputmode="numeric"
            pattern="[0-9]*"
            placeholder="Harga"
            class="w-2/3 rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            v-model="kursi.hargaFormatted"
          />
        </div>
      </div>
    </div>
  </DefaultCard>
</div>
  


      <div class="flex flex-col mt-9 col-span-2">
        <!-- Input Fields Start -->
        <DefaultCard>
          <div v-if="dataError.length > 0" class="mt-4 mb-4">
            <ul>
              <li v-for="(error, index) in dataError" :key="index" class="ml-5 text-red">
                <b>- {{ error }}</b>
              </li>
            </ul>
          </div>
          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <button
              @click="cancelAdd"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
            >
              Tambah Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>
    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
