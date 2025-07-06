<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import { ref, watch, onMounted, computed } from "vue";

import SelectGroupRute from "@/components/Forms/SelectGroup/SelectGroupRute.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { useIndexStore } from "@/stores";
import Swal from "sweetalert2";
import router from "@/router";
import { getRuteBandara,getRuteStasiun,getPesawat,getKereta, createTeknis, getRuteById, getDetailById } from "@/stores/functionAPI";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";

import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";

const indexStore = useIndexStore();
const pageTitle = ref("Modul - Add Teknis");
const pageList = ref(["Modul", "Teknis", "Add"]);

const savedData = ref({
  Modul_transport_pic: indexStore.user.userName,
  Jenis_kendaraan: "", // Tambahkan ini
  transportId: "",
  ruteId: "",
  Datetime_berangkat: "",
});


const optionsJenisKendaraan = [
  { label: "Pesawat", value: "pesawat" },
  { label: "Kereta", value: "kereta" },
];

const optionsKendaraan = ref([]);
const optionsRute = ref([]);
watch(() => savedData.value.Jenis_kendaraan, async (newValue) => {
  console.log("Jenis Kendaraan berubah:", newValue);

  savedData.value.transportId = "";
  savedData.value.ruteId = "";
  optionsKendaraan.value = [];
  optionsRute.value = [];

  try {
    if (newValue.value === "pesawat") {
      const pesawatRes = await getPesawat();
      console.log("Response getPesawat:", pesawatRes); 

      if (pesawatRes.pesawat && Array.isArray(pesawatRes.pesawat)) {
        optionsKendaraan.value = pesawatRes.pesawat.map(item => ({
          label: `${item.Nama_kendaraan} (${item.Nomor_kendaraan})`,
          value: item._id
        }));
      }

      const ruteRes = await getRuteBandara();
      console.log("Response getRuteBandara:", ruteRes); 

      if (Array.isArray(ruteRes)) {
        optionsRute.value = ruteRes.map(item => ({
          label: `${item.Keberangkatan[0]?.bandaraName} - ${item.Tujuan[0]?.bandaraName}`,
          value: item._id
        }));
      }
    } 
    
    // 🔽 ELSE untuk KERETA 🔽
    else if (newValue.value === "kereta") {
      const keretaRes = await getKereta();
      console.log("Response getKereta:", keretaRes); 

      if (keretaRes.kereta && Array.isArray(keretaRes.kereta)) {
        optionsKendaraan.value = keretaRes.kereta.map(item => ({
          label: `${item.Nama_kendaraan} (${item.Nomor_kendaraan})`,
          value: item._id
        }));
      }

      const ruteRes = await getRuteStasiun();
      console.log("Response getRuteStasiun:", ruteRes); 

      if (Array.isArray(ruteRes)) {
        optionsRute.value = ruteRes.map(item => ({
          label: `${item.Keberangkatan[0]?.stasiunName} - ${item.Tujuan[0]?.stasiunName}`,
          value: item._id
        }));
      }
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }

  console.log("Options Kendaraan setelah update:", optionsKendaraan.value);
  console.log("Options Rute setelah update:", optionsRute.value);
});


const selectedTransport = ref(null);
const selectedRute = ref(null);

watch(
  () => savedData.value.transportId,
  async (newValue) => {
    if (newValue && newValue.value) { // Ambil hanya value-nya
      try {
        selectedTransport.value = await getDetailById(newValue.value);
      } catch (error) {
        console.error("Error fetching transport detail:", error);
      }
    } else {
      selectedTransport.value = null;
    }
  }
);

watch(
  () => savedData.value.ruteId,
  async (newValue) => {
    if (newValue && newValue.value) { // Ambil hanya value-nya
      try {
        selectedRute.value = await getRuteById(newValue.value);
      } catch (error) {
        console.error("Error fetching rute detail:", error);
      }
    } else {
      selectedRute.value = null;
    }
  }
);



const pesawatData = ref([]);
const keretaData = ref([]);
const bandaraData = ref([]);
const stasiunData = ref([]);

onMounted(async () => {
  try {
    pesawatData.value = await getPesawat();
    keretaData.value = await getKereta();
    bandaraData.value = await getRuteBandara();
    stasiunData.value = await getRuteStasiun();
  } catch (error) {
    console.error("Error fetching initial data:", error);
  }
});




const dataError = ref<string[]>([]);
  const validateForm = () => {
  dataError.value = []; // Reset error sebelum validasi

  if (!savedData.value.Datetime_berangkat.trim()) {
    dataError.value.push("Tanggal Berangkat tidak boleh kosong!");
  }

  if (!savedData.value.transportId) {
    dataError.value.push("Silakan pilih kendaraan terlebih dahulu!");
  }

  if (!savedData.value.ruteId) {
    dataError.value.push("Silakan pilih rute terlebih dahulu!");
  }

  return dataError.value.length === 0; // True jika tidak ada error
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
    await router.push("/modules/modul-teknis");
  }
};

const submitData = async () => {
  if (!validateForm()) {
    Swal.fire("Error", "Harap isi semua field yang diperlukan.", "error");
    return;
  }

  const requestData = {
    Modul_teknis_pic: savedData.value.Modul_transport_pic,
    ruteId: savedData.value.ruteId?.value,
    transportId: savedData.value.transportId?.value,
    Datetime_berangkat: savedData.value.Datetime_berangkat,
  };

  // Deteksi Tailwind dark mode
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Konfirmasi sebelum submit
  const result = await Swal.fire({
    title: "Tambah Data?",
    text: "Data akan disimpan ke sistem.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981", // green-500
    cancelButtonColor: "#d33",
    confirmButtonText: "Tambah!",
    cancelButtonText: "Batal",
    ...(isDarkMode && {
      background: "#1f2937",   // gray-800
      color: "#f9fafb",        // gray-100
      iconColor: "#facc15",    // yellow-400
    }),
  });

  if (result.isConfirmed) {
    try {
      showLoading();
      await createTeknis(requestData);
      await successCreate();
      router.push("/modules/modul-teknis");
    } catch (error) {
      console.error("Error saat menyimpan data:", error);
      await failedCreate(error);
    }
  }
};




</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/3">
                
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Jenis Kendaraan
  </label>
  <SelectGroup
  placeholder="Jenis Kendaraan"
  :options="optionsJenisKendaraan"
  v-model="savedData.Jenis_kendaraan"
/>


              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Kendaraan dipilih
  </label>
  <SelectGroup
  placeholder="Pilih Kendaraan"
  :options="optionsKendaraan"
  v-model="savedData.transportId"
  :disabled="!savedData.Jenis_kendaraan"
  @update:modelValue="(value) => savedData.transportId = value"
/>

              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Rute dipilih
  </label>
  <SelectGroup
  placeholder="Pilih Rute"
  :options="optionsRute"
  v-model="savedData.ruteId"
  :disabled="!savedData.Jenis_kendaraan"
  @update:modelValue="(value) => savedData.ruteId = value"
/>
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9 col-span-2 mt-9">

       <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <!-- Detail Transport -->
  <DefaultCard v-if="selectedTransport" cardTitle="Detail Transport yang Dipilih">
    <div class="p-6.5">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Nama Kendaraan</label>
          <input type="text" class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary" :value="selectedTransport?.Nama_kendaraan || '-'" readonly />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Nomor Kendaraan</label>
          <input type="text" class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary" :value="selectedTransport?.Nomor_kendaraan || '-'" readonly />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Kapasitas Penumpang</label>
          <input type="text" class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary" :value="selectedTransport?.Kapasitas_penumpang || '-'" readonly />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Fasilitas</label>
          <input type="text" class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary" :value="selectedTransport?.Fasilitas?.join(', ') || 'Tidak ada'" readonly />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Kursi</label>
          <div class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white">
            <ul v-if="selectedTransport?.Harga_kursi?.length" class="text-black dark:text-white space-y-1">
              <li v-for="(kursi, index) in selectedTransport.Harga_kursi" :key="kursi._id">
                {{ index + 1 }}. {{ kursi.label }} - {{ kursi.qty }} Kursi
              </li>
            </ul>
            <p v-else class="text-gray-500 dark:text-gray-400">Tidak ada data kursi</p>
          </div>
        </div>
      </form>
    </div>
  </DefaultCard>

  <!-- Detail Rute -->
  <DefaultCard v-if="selectedRute" cardTitle="Detail Rute yang Dipilih">
    <div class="p-6.5">
      <form class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Keberangkatan</label>
          <input type="text" class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
            :value="selectedRute?.Keberangkatan?.[0]?.bandaraName || selectedRute?.Keberangkatan?.[0]?.stasiunName || '-'" readonly />
          <input type="text" class="w-full mt-2 rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
            :value="selectedRute?.Keberangkatan?.[0]?.bandaraLocation || selectedRute?.Keberangkatan?.[0]?.stasiunLocation || '-'" readonly />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Tujuan</label>
          <input type="text" class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
            :value="selectedRute?.Tujuan?.[0]?.bandaraName || selectedRute?.Tujuan?.[0]?.stasiunName || '-'" readonly />
          <input type="text" class="w-full mt-2 rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
            :value="selectedRute?.Keberangkatan?.[0]?.bandaraLocation || selectedRute?.Keberangkatan?.[0]?.stasiunLocation || '-'" readonly />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Waktu Perjalanan (menit)</label>
          <input type="text" class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary" :value="selectedRute?.Waktu_perjalanan || '-'" readonly />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-white">Harga Tiket</label>
          <div class="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-white">
            <ul v-if="selectedRute?.Harga_tiket?.length" class="text-black dark:text-white space-y-1">
              <li v-for="(tiket, index) in selectedRute.Harga_tiket" :key="tiket._id">
                {{ index + 1 }}. {{ tiket.label }} - Rp.{{ tiket.harga.toLocaleString() }}
              </li>
            </ul>
            <p v-else class="text-gray-500 dark:text-gray-400">Tidak ada data harga tiket</p>
          </div>
        </div>
      </form>
    </div>
  </DefaultCard>
</div>

</div>
    </div>



    <div class="grid grid-cols-1 space-y-9 mt-9">

        
        <div class="flex flex-col gap-9 col-span-2">
          <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              
                <label class="mb-3 block text-sm font-medium text-black dark:text-white w-1/6 justify-center align-middle mt-3">
    Tanggal Berangkat
  </label>
  <input
          type="datetime-local"
          placeholder="Harga Tiket"
          class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          v-model="savedData.Datetime_berangkat"
        />
            </div>
</div>

        </DefaultCard>
        </div>


      <div class="flex flex-col gap-9 col-span-2">
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
  </DefaultLayout>
</template>
