<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultCardTable from "@/components/Forms/DefaultCardAccessPage.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import { showLoading, successCreate, failedCreate, successEdit } from "@/stores/swal";
import { updateRole, getRoleById } from "@/stores/functionAPI";
import { useRoute } from "vue-router";

const route = useRoute();

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();
const pageTitle = ref("Master - Edit Role");
const pageList = ref(["Master", "Setup Role", "Edit"]);
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
const savedData = ref({
  hierarchyCode: "",
  roleName:"",
  roleType:"",
  roleAccess:[],
});

const optionsType = ref<{ label: string; hierarchyCode: string }[]>([]); // Sesuaikan format options


// Fetch roles and populate dropdown
onMounted(async () => {
  const data = await getRoleById(route.params.id); // route.params.id should be a valid ObjectId
  savedData.value = data;
  const pageData = await indexStore.getUtilPage();
  console.log(pageData);

  const pageHierarchy = await indexStore.getUtilHierarchy();

  if (pageHierarchy && pageHierarchy.utilHierarchy) {
    // Konversi ke format yang sesuai untuk SelectGroup
    optionsType.value = pageHierarchy.utilHierarchy.map(item => ({
      label: item.hierarchyName, // label untuk SelectGroup
      hierarchyCode: item.hierarchyCode, // Simpan hierarchyCode
    }));
  }

  if (pageData && pageData.utilData) {
    // Ambil semua utilData
    dataTable.value = pageData.utilData.map((page) => {
      // Cek apakah pageCode ada di userAccess
      const isChecked = savedData.value.roleAccess.some(
        (access) => access.pageCode === page.pageCode
      );
      return {
        ...page,
        isChecked, // Tambahkan properti isChecked untuk menandai checkbox
      };
    });
  }
});

// Fungsi untuk menangani perubahan roleType
const handleOptionChange = (selectedOption: { label: string; hierarchyCode: string }) => {
  savedData.value.roleType = selectedOption.label;
  savedData.value.hierarchyCode = selectedOption.hierarchyCode;
};

// Validators for required fields
const dataValidator = ref([
  { key: "roleName", label: "Nama Role" },
  { key: "roleType", label: "Tipe Role" },
  { key: "hierarchyCode", label: "Kode Hirarki Role" },
  { key: "roleAccess", label: "Role Akses" },
]);

const switcherToggle = ref<boolean>(false);
const toggleAllCheckboxes = () => {
  // When the switcher is toggled on, set all items to be checked
  dataTable.value.forEach(item => {
    item.isChecked = switcherToggle.value;
  });
};


const dataError = ref([]);

// Helper function for validation
const validateForm = () => {
  dataError.value = [];
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });
  return dataError.value.length === 0;
};

const cancelAdd = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const result = await Swal.fire({
    title: "Batalkan?",
    text: "Anda yakin membatalkan edit data?",
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
    await router.push("/modules/master/user-role");
  }
};

const submitData = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const isValid = validateForm();
  if (!isValid) return;

  const result = await Swal.fire({
    title: "Edit Data?",
    text: "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Konfirmasi",
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

      // Collect selected pages for roleAccess
      const selectedAccess = dataTable.value
        .filter(item => item.isChecked)
        .map(item => ({
          pageCode: item.pageCode,
          pageAccess: 'c.r.u.d', // You can customize page access here
        }));

        const fixData = {
  ...savedData.value,
  _id: savedData.value._id, // Ensure the role ID is included
  roleAccess: selectedAccess,
};



      // Send request to create role with raw JSON data
      await updateRole(fixData, savedData.value._id); // Kirim id pada param kedua

      
      await successEdit().then(() => {
        router.push("/modules/master/user-role");
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        await Swal.fire({
          title: "Hierarchy Code Sudah Digunakan!",
          text: "Silakan gunakan kode yang lain.",
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
      <div class="grid grid-cols-1 space-y-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-3 xl:flex-row">
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                   Nama Role
                </label>
                <input
                  type="text"
                  placeholder="Nama Role"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.roleName"
                />
              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Jenis Role
                </label>
                <SelectGroup
        placeholder="Pilih Jenis Role"
        id="roleType"
        :options="optionsType"
        v-model="savedData.roleType"
        @option-changed="handleOptionChange"
      />
              </div>
              <div class="lg:w-1/3">
                <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                  Kode Hirarki
                </label>
                <input
                  type="text"
                  placeholder="Kode Hirarki"
                  class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-2 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  v-model="savedData.hierarchyCode"
                  readonly
                />
              </div>
            </div>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
  

<div class="flex flex-col gap-9 col-span-2">
  <DefaultCardTable cardTitle="Pilih Akses Halaman">
    <template #card-tools>
      <label for="toggle4" class="flex cursor-pointer select-none items-center">
  <div class="relative">
    <input
      type="checkbox"
      id="toggle4"
      class="sr-only"
      @change="switcherToggle = !switcherToggle; toggleAllCheckboxes()"
    />
    <div :class="switcherToggle && '!bg-primary'" class="block h-8 w-14 rounded-full bg-black"></div>
    <div :class="switcherToggle && '!right-1 !translate-x-full'" class="absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white transition"></div>
  </div>
</label>


    </template>
    <div class="flex flex-col gap-10">
    
    <div
      class="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5"
    >
   <!-- Table ditampilkan jika switcherToggle bernilai false (toggle mati) -->
<div v-if="!switcherToggle" class="max-w-full overflow-x-auto">
  <table class="w-full table-auto">
    <thead>
      <tr class="bg-gray-2 text-left dark:bg-meta-4">
        <th v-for="data in dataHeader" :class="data.class" class="font-medium text-black dark:text-white text-center">
          {{ data.name }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, index) in dataTable" :key="index" class="border">
        <td class="py-2 px-4 align-middle justify-center">
          <input type="checkbox" v-model="item.isChecked">
        </td>
        <td class="py-1 px-4 border">
          <p class="font-medium text-black dark:text-white text-xs ">{{ item.pageName }}</p>
        </td>
        <td class="py-1 px-4 border">
          <p class="font-medium text-black dark:text-white text-xs text-center">{{ item.pageCode }}</p>
        </td>
        <td class="py-1 px-4 border">
          <p class="font-medium text-xs text-black dark:text-white text-center">{{ item.pageCategory }}</p>
        </td>
        <td class="py-1 px-4 border">
          <h5 class="font-medium text-black text-xs dark:text-white text-center">{{ item.pageType }}</h5>
        </td>
        <td class="py-1 px-4 text-center border">
          <h5 class="font-medium text-black text-xs dark:text-white text-left">{{ item.pageGroup }}</h5>
        </td>
        <td class="py-1 px-4 border">
          <h5 class="font-medium text-black text-xs dark:text-white">{{ item.pageRoutes }}</h5>
        </td>
      </tr> 
    </tbody>
  </table>
</div>

<!-- Pesan ditampilkan jika switcherToggle bernilai true (toggle menyala) -->
<div v-else class="text-center py-4">
  <p class="font-medium text-black dark:text-white">
    Anda memilih akses ke semua halaman untuk Role ini
  </p>
</div>


    </div>
    </div>
    </DefaultCardTable>
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
              Edit Data
            </button>
          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
    </div>
    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
