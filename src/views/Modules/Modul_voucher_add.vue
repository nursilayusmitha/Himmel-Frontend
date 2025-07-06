<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";

import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { ref, computed } from "vue";
import { useIndexStore } from "@/stores";
import Swal from "sweetalert2";
import router from "@/router";
import { createVoucher } from "@/stores/functionAPI";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";

import { mdiPlusCircleOutline, mdiTrashCanOutline } from "@mdi/js";

const indexStore = useIndexStore();
const pageTitle = ref("Modul - Add Voucher");
const pageList = ref(["Modul", "Voucher", "Add"]);

const savedData = ref({
  Modul_voucher_pic: indexStore.user.userName,
  Nama_voucher: "",
  User_voucher: "",
  Persen_potongan: "",
  Harga_potongan: "",
  Qty: "",
  Datetime_expired: "",
});

const optionsTargetUser = [
  { label: "Semua", value: "semua" },
  { label: "Internal", value: "internal" },
  { label: "Eksternal", value: "eksternal" },
];


const dataError = ref<string[]>([]);
  const validateForm = () => {
  dataError.value = []; // Reset error sebelum validasi
  
  // Validasi untuk field wajib
  if (!savedData.value.Nama_voucher.trim()) dataError.value.push("Nama Voucher tidak boleh kosong!");
  if (!savedData.value.Datetime_expired) dataError.value.push("Tanggal Kadaluwarsa tidak boleh kosong!");
  if (!savedData.value.User_voucher) dataError.value.push("Target User tidak boleh kosong!");

  // Validasi Qty harus angka valid dan tidak boleh <= 0
  const qty = Number(savedData.value.Qty);
  if (isNaN(qty) || qty <= 0) {
    dataError.value.push("Qty harus diisi dengan angka lebih dari 0!");
  }

  // Validasi Potongan Persen atau Potongan Harga
  const persenPotongan = Number(savedData.value.Persen_potongan);
  const hargaPotongan = Number(savedData.value.Harga_potongan);

  if (persenPotongan <= 0 && hargaPotongan <= 0) {
    dataError.value.push("Harus mengisi salah satu antara Potongan Persen atau Potongan Harga dengan nilai lebih dari 0!");
  }
  
  if (persenPotongan > 0 && hargaPotongan > 0) {
    dataError.value.push("Tidak boleh mengisi Potongan Persen dan Potongan Harga sekaligus, pilih salah satu!");
  }

  // Validasi untuk Potongan Persen tidak boleh lebih dari 100% dan harus > 0
  if (persenPotongan > 0 && (persenPotongan > 100 || persenPotongan <= 0)) {
    dataError.value.push("Potongan Persen harus diisi dengan angka lebih dari 0 dan tidak boleh lebih dari 100%!");
  }

  // Validasi untuk Potongan Harga tidak boleh <= 0
  if (hargaPotongan > 0 && hargaPotongan <= 0) {
    dataError.value.push("Potongan Harga harus diisi dengan angka lebih dari 0!");
  }

  return dataError.value.length === 0;
};


const formattedHargaPotongan = computed({
  get() {
    const val = savedData.value.Harga_potongan;
    return val != null && val !== ""
      ? `Rp ${Number(val).toLocaleString("id-ID")}`
      : "";
  },
  set(value: string) {
    const numeric = Number(value.replace(/[^\d]/g, ""));
    savedData.value.Harga_potongan = isNaN(numeric) ? null : numeric;
  },
});



const cancelAdd = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
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
      background: "#1f2937",   // gray-800
      color: "#f9fafb",        // gray-100
      iconColor: "#facc15",    // yellow-400
    }),
  });

  if (result.isConfirmed) {
    await router.push("/modules/modul-voucher");
  }
};

const submitData = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const isValid = validateForm();
  if (!isValid) {
    return; // Cegah submit jika ada error
  }

  // Menangani kasus jika salah satu dari Persen_potongan atau Harga_potongan bernilai 0, ubah menjadi null
  if (savedData.value.Persen_potongan === "0" || savedData.value.Persen_potongan === 0) {
    savedData.value.Persen_potongan = null;
  }

  if (savedData.value.Harga_potongan === "0" || savedData.value.Harga_potongan === 0) {
    savedData.value.Harga_potongan = null;
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
      background: "#1f2937",   // gray-800
      color: "#f9fafb",        // gray-100
      iconColor: "#facc15",    // yellow-400
    }),
  });

  if (result.isConfirmed) {
    try {
      showLoading();
      const requestData = {
        ...savedData.value,
        User_voucher: savedData.value.User_voucher?.value,
      };

      await createVoucher(requestData);
      await successCreate();
      router.push("/modules/modul-voucher");
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
          <div class="flex flex-col gap-2 p-6.5 dark:bg-gray-800 rounded-xl">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Nama Voucher
                </label>
                <input
                  type="text"
                  placeholder="Nama Voucher"
                  class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-800 py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
                  v-model="savedData.Nama_voucher"
                />
              </div>
              <div class="lg:w-1/2">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Tanggal Kadaluwarsa
                </label>
                <input
                  type="datetime-local"
                  class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-800 py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
                  v-model="savedData.Datetime_expired"
                />
              </div>
            </div>

            <div class="flex flex-col gap-3 xl:flex-row mt-3">
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Target User
                </label>
                <SelectGroup
                  placeholder="Target User"
                  :options="optionsTargetUser"
                  v-model="savedData.User_voucher"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Qty
                </label>
                <input
                  type="number"
                  placeholder="Qty"
                  class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-800 py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
                  v-model="savedData.Qty"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Potongan Persen
                </label>
                <input
                  type="number"
                  placeholder="Potongan Persen"
                  class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-800 py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
                  v-model="savedData.Persen_potongan"
                />
              </div>
              <div class="lg:w-1/4">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Potongan Harga
                </label>
                <input
  type="text"
  placeholder="Potongan Harga"
  class="w-full rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-gray-600 bg-transparent dark:bg-gray-800 py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary"
  v-model="formattedHargaPotongan"
/>

              </div>
            </div>
          </div>
        </DefaultCard>
      </div>

      <!-- Tombol Action -->
      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard>
          <div v-if="dataError.length > 0" class="mt-4 mb-4">
            <ul>
              <li
                v-for="(error, index) in dataError"
                :key="index"
                class="ml-5 text-red dark:text-red-500"
              >
                <b>- {{ error }}</b>
              </li>
            </ul>
          </div>

          <div class="pb-6 px-4 grid grid-cols-2 gap-2">
            <button
              @click="cancelAdd"
              class="flex w-full justify-center rounded bg-red p-3 font-medium text-gray-100 hover:bg-opacity-90"
            >
              Batalkan
            </button>
            <button
              @click="submitData"
              class="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90"
            >
              Tambah Data
            </button>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
