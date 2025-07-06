<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import { ref } from "vue";
import { useIndexStore } from "@/stores";
import Swal from "sweetalert2";
import router from "@/router";
import { createTransport } from "@/stores/functionAPI";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";

import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";

const indexStore = useIndexStore();
const pageTitle = ref("Modul - Add Pesawat");
const pageList = ref(["Modul", "Pesawat", "Add"]);

const savedData = ref({
  Modul_transport_pic: indexStore.user.userName,
  Jenis_kendaraan: "pesawat",
  Nama_kendaraan: "",
  Nomor_kendaraan: "",
  Tanggal_pembuatan: "",
  Kapasitas_penumpang: "",
  Harga_kursi: [{ label: "", qty: "" }],
  Fasilitas: [""],
  Status: "Y",
  Status_operasional: "enable",
  Operator_kendaraan: indexStore.user.companyName,
});

const addHargaKursi = () => {
  savedData.value.Harga_kursi.push({ label: "", qty: "" });
};

const removeHargaKursi = (index) => {
  if (savedData.value.Harga_kursi.length > 1) {
    savedData.value.Harga_kursi.splice(index, 1);
  }
};

const addFasilitas = () => {
  savedData.value.Fasilitas.push("");
};

const removeFasilitas = (index) => {
  if (savedData.value.Fasilitas.length > 1) {
    savedData.value.Fasilitas.splice(index, 1);
  }
};

const calculateTotalQty = () => {
  const totalQty = savedData.value.Harga_kursi.reduce((total, kursi) => total + (kursi.qty || 0), 0);
  return totalQty;
};


const dataError = ref<string[]>([]);
  const validateForm = () => {
  dataError.value = []; // Reset error sebelum validasi
  
  // Validasi untuk field lain
  if (!savedData.value.Nama_kendaraan.trim()) dataError.value.push("Nama Kendaraan tidak boleh kosong!");
  if (!savedData.value.Nomor_kendaraan.trim()) dataError.value.push("Nomor Kendaraan tidak boleh kosong!");
  if (!savedData.value.Tanggal_pembuatan) dataError.value.push("Tanggal Pembuatan tidak boleh kosong!");
  if (!savedData.value.Kapasitas_penumpang || isNaN(savedData.value.Kapasitas_penumpang)) {
    dataError.value.push("Kapasitas Penumpang harus diisi dengan angka yang valid!");
  }

  savedData.value.Harga_kursi.forEach((kursi, index) => {
    if (!kursi.label.trim()) dataError.value.push(`Label Kursi ke-${index + 1} tidak boleh kosong!`);
    if (!kursi.qty || isNaN(kursi.qty) || kursi.qty <= 0) dataError.value.push(`Qty Kursi ke-${index + 1} harus lebih dari 0!`);
  });

  // Validasi untuk total qty
  const totalQty = calculateTotalQty();
  if (totalQty > Number(savedData.value.Kapasitas_penumpang)) {
    dataError.value.push("Kuota kursi melewati batas kapasitas penumpang!");
  }

  if (savedData.value.Fasilitas.length === 0 || savedData.value.Fasilitas.some(f => f.trim() === "")) {
    dataError.value.push("Minimal 1 fasilitas harus diisi!");
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
    await router.push("/modules/modul-pesawat");
  }
};

const submitData = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const isValid = validateForm();
  if (!isValid) {
    return; // Cegah submit jika ada error
  }

  // Melanjutkan proses submit data jika form valid
  const result = await Swal.fire({
    title: "Tambah Data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Tambah!",
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
      const requestData = {
        ...savedData.value,
        Kapasitas_penumpang: Number(savedData.value.Kapasitas_penumpang),
        Harga_kursi: savedData.value.Harga_kursi.map(kursi => ({
          label: kursi.label.trim(),
          qty: Number(kursi.qty)
        })),
        Fasilitas: savedData.value.Fasilitas.map(f => f.trim())
      };

      await createTransport(requestData);
      await successCreate();
      router.push("/modules/modul-pesawat");
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
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nama Kendaraan
                </label>
                <input
                  type="text"
                  placeholder="Nama Kendaraan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary dark:text-white dark:border-form-strokedark dark:bg-form-input"
                  v-model="savedData.Nama_kendaraan"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nomor Kendaraan
                </label>
                <input
                  type="text"
                  placeholder="Nomor Kendaraan"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary dark:text-white dark:border-form-strokedark dark:bg-form-input"
                  v-model="savedData.Nomor_kendaraan"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tanggal Pembuatan
                </label>
                <input
                  type="date"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary dark:text-white dark:border-form-strokedark dark:bg-form-input"
                  v-model="savedData.Tanggal_pembuatan"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kapasitas Penumpang
                </label>
                <input
                  type="number"
                  placeholder="Kapasitas Penumpang"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary dark:text-white dark:border-form-strokedark dark:bg-form-input"
                  v-model.number="savedData.Kapasitas_penumpang"
                />
              </div>
            </div>
          </div>
        </DefaultCard>
      </div>
      
      <div class="flex flex-col gap-9">
  <DefaultCard cardTitle="Input Fasilitas">
    <div class="p-6.5">
      <div
        class="flex flex-col gap-2 xl:flex-row"
        v-for="(fasilitas, index) in savedData.Fasilitas"
        :key="index"
        :class="index === 0 ? '' : 'pt-2'"
      >
        <div class="w-full">
          <label
            class="mb-3 block text-sm font-medium text-black dark:text-white"
            v-if="index === 0"
          >
            Fasilitas
          </label>
          <input
            type="text"
            placeholder="Fasilitas"
            class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            v-model="savedData.Fasilitas[index]"
          />
        </div>
        <div class="w-1/12 flex items-end pb-2 flex-wrap">
          <div
            class="flex w-full justify-center mb-2 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
            @click="addFasilitas"
            v-if="index === 0"
          >
            <svg
              class="fill-current"
              width="20"
              height="20"
              viewBox="0 0 22 22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path :d="mdiPlusCircleOutline" />
            </svg>
          </div>
          <ButtonDynamic
            v-if="index > 0"
            :icon="mdiTrashCanOutline"
            buttonClass="flex w-full justify-center p-2 cursor-pointer rounded bg-red-500 text-gray-50 hover:bg-red-600"
            @click="removeFasilitas(index)"
          />
        </div>
      </div>
    </div>
  </DefaultCard>
</div>
<div class="flex flex-col gap-9">
  <DefaultCard cardTitle="Input Kursi">
    <div class="p-6.5">
      <div
        class="flex flex-col gap-2 xl:flex-row"
        v-for="(kursi, index) in savedData.Harga_kursi"
        :key="index"
        :class="index === 0 ? '' : 'pt-2'"
      >
        <div class="w-6/12">
          <label
            class="mb-3 block text-sm font-medium text-black dark:text-white"
            v-if="index === 0"
          >
            Nama
          </label>
          <input
            type="text"
            placeholder="Label"
            class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            v-model="kursi.label"
          />
        </div>

        <div class="w-6/12">
          <label
            class="mb-3 block text-sm font-medium text-black dark:text-white"
            v-if="index === 0"
          >
            Qty
          </label>
          <input
            type="number"
            placeholder="Qty"
            class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            v-model.number="kursi.qty"
            @change="validateQtyKeluar(index)"
          />
        </div>

        <div class="w-1/12 flex items-end pb-2 flex-wrap">
          <div
            class="flex w-full justify-center mb-2 cursor-pointer font-medium text-blue-600 hover:bg-opacity-90"
            @click="addHargaKursi"
            v-if="index === 0"
          >
            <svg
              class="fill-current"
              width="20"
              height="20"
              viewBox="0 0 22 22"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path :d="mdiPlusCircleOutline" />
            </svg>
          </div>
          <ButtonDynamic
            v-if="index > 0"
            :icon="mdiTrashCanOutline"
            buttonClass="flex w-full justify-center p-2 cursor-pointer rounded bg-red-500 text-gray-50 hover:bg-red-600"
            @click="removeHargaKursi(index)"
          />
        </div>
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
