<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { mdiEyeOutline , mdiEyeOffOutline   } from '@mdi/js';
import inputImageWithPreview from "@/components/Forms/SelectGroup/inputImageWithPreview.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate } from "@/stores/swal";
import { createUserEksternal, getAllRole } from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";

const indexStore = useIndexStore();
const pageTitle = ref("Master - Add User Eksternal");
const pageList = ref(["Master", "User Eksternal", "Add"]);

// Saved Data
const savedData = ref({
  companyCode: "",
  companyName: indexStore.user.companyName,
  userName: "",
  email: "",
  password: "",
  userBirth: "",
  userPhone: "",
  userAddress: "",
  userAccess: [],
  accessEdited: "N",
  userAccStatus: "enable",
  hierarchyCode: "3.1",
  userGender: "",
  userImage: null,
  imageName: null,
  userRole: "Pelanggan",
  isDeleted: "N",
  userProperties: [],
  user_created: "",
  user_updated: "",
});

const optionsType = ref([]);

// Fetch roles and populate dropdown
onMounted(async () => {
  const options = await getAllRole();
  options.forEach((option) => {
    option.label = option.roleName; // Map roleName to label
    option.value = option.roleName; // Use roleName as the value
  });
  optionsType.value = options;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.user_created = date;
  const page = await indexStore.getUtilPage();
  console.log(page)

});

// Function to handle role selection
const handleOptionChange = (selected: { label: string; value: string; hierarchyCode: string; roleAccess: string }) => {
  if (selected) {
    savedData.value.userRole = selected.value; // Set userRole from roleName
    savedData.value.hierarchyCode = selected.hierarchyCode; // Set hierarchyCode from selected role
    savedData.value.userAccess = selected.roleAccess; // Set userAccess from roleAccess
  }
};

// Fungsi untuk toggle visibilitas password
const showPassword = ref(false);

// Fungsi untuk toggle visibilitas password
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
// Validators for required fields
const dataValidator = ref([
  { key: "userName", label: "Nama User" },
  { key: "email", label: "Email User" },
  { key: "password", label: "Password User" },
  { key: "userRole", label: "Role User" },
  { key: "userGender", label: "Gender User" },
  { key: "userBirth", label: "Tanggal Lahir User" },
  { key: "userPhone", label: "No Telp User" },
  { key: "userAddress", label: "Alamat User" },
]);

const dataError = ref([]);

// Helper function for validation
const validateForm = () => {
  dataError.value = [];

  // Validasi kosong pada field tertentu
  dataValidator.value.forEach((validator) => {
    if (!savedData.value[validator.key]) {
      dataError.value.push(`${validator.label} tidak boleh kosong!`);
    }
  });

  // Validasi email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(savedData.value.email)) {
    dataError.value.push("Email tidak valid!");
  }

  // Validasi password minimal 8 karakter
  if (savedData.value.password.length < 8) {
    dataError.value.push("Password harus minimal 8 karakter!");
  }

  // Validasi no telp hanya angka
  const phoneRegex = /^[0-9]+$/;
  if (!phoneRegex.test(savedData.value.userPhone)) {
    dataError.value.push("No Telp harus berisi angka saja!");
  }

  // Jika ada error, tampilkan pesan error
  if (dataError.value.length > 0) {
    return false;
  }

  return true;
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
    await router.push("/modules/master/user-eksternal");
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

      const fixData = { ...savedData.value };
      fixData.userAccess = JSON.stringify(fixData.userAccess);

      const formData = new FormData();

      // Append all fields to FormData
      Object.keys(fixData).forEach((key) => {
        formData.append(key, fixData[key]);
      });

      // Send request to create user
      await createUserEksternal(formData);
      
      await successCreate().then(() => {
        router.push("/modules/master/user-eksternal");
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Menangkap error status 401 dan menampilkan SweetAlert untuk email duplikat
        await Swal.fire({
          title: "Email Sudah Digunakan!",
          text: "Silakan gunakan email yang lain.",
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



// Remove image function
const removeImage = (field: string) => {
  savedData.value[field] = null;
};
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <!-- ====== Form Elements Section Start -->
    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9">
        <!-- Input Fields Start -->
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="flex flex-col gap-6 xl:flex-row">
              <div class="w-full">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Nama User
              </label>
              <input
                type="text"
                placeholder="Nama User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.userName"
              />
              </div>
            </div>

            <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Email
              </label>
              <input
                type="text"
                placeholder="Email User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.email"
              />
              </div>

              <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                Password
              </label>
              <div class="relative">
    <!-- Input password -->
    <input
      :type="showPassword ? 'text' : 'password'"
      placeholder="Password User"
      class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input pr-10"
      v-model="savedData.password"
    />
    <!-- Icon untuk toggle password -->
    <button
      type="button"
      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
      @click="togglePassword"
    >
      <svg
        v-if="showPassword"
        :d="mdiEyeOffOutline "
        class="w-6 h-6"
        fill="currentColor"
      >
      <path
                      :d="mdiEyeOffOutline  "
                    /></svg>
      <svg
        v-else
        :d="mdiEyeOutline "
        class="w-6 h-6"
        fill="currentColor"
      >
      <path
                      :d="mdiEyeOutline  "
                    /></svg>
    </button>
  </div>
              </div>
              <!-- <div class="w-full">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Role User
  </label>
  <SelectGroup
    placeholder="Pilih Nama Role"
    id="userRole"
    :options="optionsType"
    v-model="logistikData"
    @option-changed="handleOptionChange"
  />
</div>

<div class="hidden">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Hierarchy Code
  </label>
  <div>
    <input
      id="hierarchyCode"
      type="text"
      placeholder="Kode Hirarki"
      class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      v-model="savedData.hierarchyCode"
      readonly
    />
  </div>
</div>

<div class="hidden">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    User Access
  </label>
  <div>
    <input
      id="userAccess"
      type="text"
      placeholder="Hak Akses User"
      class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      v-model="savedData.userAccess"
      readonly
    />
  </div>
</div> -->

          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
  <!-- Textarea Fields Start -->
  <DefaultCard cardTitle="Input Data Pribadi">
    <div class="flex flex-col gap-2 p-6.5">
      <!-- Flex Container untuk Gambar dan Form -->
      <div class="flex flex-col lg:flex-row gap-6">
        
        <!-- Bagian Input Gambar -->
        <div class="lg:w-2/5 flex items-center justify-center">
          <div class="relative flex border flex-col items-center p-2 justify-end w-full">
            <!-- Label untuk Input Gambar -->
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Photo User
            </label>
            <inputImageWithPreview
              v-model="savedData.userImage"
              @update:file="(file) => (savedData.userImage = file)"
            />

            <!-- Tombol Hapus -->
            <button
              v-if="savedData.userImage"
              @click="removeImage('userImage')"
              class="absolute top-2 right-2 w-7 h-7 flex items-center justify-center bg-red-500 text-white rounded-md text-xs"
            >
              X
            </button>
          </div>
        </div>
        
        <!-- Bagian Form Gender dan Tanggal Lahir -->
        <div class="lg:w-3/5 flex flex-col gap-6">
          <!-- Gender -->
          <div>
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Gender
            </label>
            <div class="flex items-center space-x-6">
              <label for="radioPria" class="flex cursor-pointer select-none items-center">
                <div class="relative">
                  <input
                    type="radio"
                    id="radioPria"
                    name="gender"
                    value="pria"
                    v-model="savedData.userGender"
                    class="sr-only"
                  />
                  <div :class="savedData.userGender === 'pria' ? 'border-primary bg-primary' : 'border'"
                    class="mr-2 flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-300">
                    <span :class="savedData.userGender === 'pria' ? 'bg-white' : 'bg-transparent'"
                      class="h-2.5 w-2.5 rounded-full"></span>
                  </div>
                </div>
                Pria
              </label>

              <label for="radioWanita" class="flex cursor-pointer select-none items-center">
                <div class="relative">
                  <input
                    type="radio"
                    id="radioWanita"
                    name="gender"
                    value="wanita"
                    v-model="savedData.userGender"
                    class="sr-only"
                  />
                  <div :class="savedData.userGender === 'wanita' ? 'border-primary bg-primary' : 'border'"
                    class="mr-2 flex h-5 w-5 items-center justify-center rounded-full border transition-colors duration-300">
                    <span :class="savedData.userGender === 'wanita' ? 'bg-white' : 'bg-transparent'"
                      class="h-2.5 w-2.5 rounded-full"></span>
                  </div>
                </div>
                Wanita
              </label>
            </div>
          </div>

          <!-- Tanggal Lahir -->
          <div>
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">
              Tanggal Lahir
            </label>
            <input
              type="date"
              placeholder="Server"
              class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              v-model="savedData.userBirth"
            />
          </div>
        </div>
      </div>
      <div>
              <label class="mb-3 block text-sm font-medium text-black dark:text-white">
                No Telp
              </label>
              <input
                type="text"
                placeholder="No Telp User"
                class="w-full rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
                v-model="savedData.userPhone"
              />
              </div>

              <div>
        <label class="mb-3 block text-sm font-medium text-black dark:text-white">
          Alamat
        </label>
        <textarea
          rows="3"
          placeholder="Masukan alamat disini!"
          class="w-full rounded-lg border-[1.5px] text-black border-stroke bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          v-model="savedData.userAddress"
        ></textarea>
      </div>
    </div>
  </DefaultCard>
  <!-- Textarea Fields End -->
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
    <!-- ====== Form Elements Section End -->
  </DefaultLayout>
</template>
