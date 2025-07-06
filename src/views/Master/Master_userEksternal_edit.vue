<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultCardTable from "@/components/Forms/DefaultCardAccessPage.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import inputImageWithPreviewUser from "@/components/Forms/SelectGroup/inputImageWithPreviewUserEksternal.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import multiselectReadOnly from "@/components/Forms/SelectGroup/multiselectReadOnly.vue";
import Swal from "sweetalert2";

import { useIndexStore } from "@/stores";
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successEdit, failedCreate } from "@/stores/swal";
import { updateUserEksternal, getUserEksternalById, getAllRole } from "@/stores/functionAPI";

import { ref, onMounted } from "vue";
import router from "@/router";
import { useRoute } from "vue-router";

const route = useRoute();

const indexStore = useIndexStore();
const pageTitle = ref("Master - Detail User Eksternal");
const pageList = ref(["Master", "User Eksternal", "Detail"]);
const dataHeader = ref([
  {name: '', class: 'min-w-[30px] py-2 px-4'}, // Kolom checkbox
  {name: 'Nama Halaman', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Kode', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Kategori', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Tipe', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Grup', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Halaman Tujuan', class: 'min-w-[150px] py-2 px-4'},
])
let dataTable = ref([])

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
  hierarchyCode: "",
  userGender: "",
  userImage: null,
  imageName: null,
  userRole: "",
  isDeleted: "N",
  userLogin:"Y",
  userProperties: [],
  user_created: "",
  user_updated: "",
});

const optionsType = ref([]);

// Fetch roles and populate dropdown
onMounted(async () => {
  const data = await getUserEksternalById(route.params.id);
  savedData.value = data;
  const pageData = await indexStore.getUtilPage();
  console.log(pageData);

  if (pageData && pageData.utilData) {
    // Ambil semua utilData
    dataTable.value = pageData.utilData.map((page) => {
      // Cek apakah pageCode ada di userAccess
      const isChecked = savedData.value.userAccess.some(
        (access) => access.pageCode === page.pageCode
      );
      return {
        ...page,
        isChecked, // Tambahkan properti isChecked untuk menandai checkbox
      };
    });
  }

  const options = await getAllRole();
  options.forEach((option) => {
    option.label = option.roleName; // Map roleName to label
    option.value = option.roleName; // Use roleName as the value
  });
  optionsType.value = options;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.user_created = date;
});



// Function to handle role selection
const handleOptionChange = (selected: { label: string; value: string; hierarchyCode: string; roleAccess: any[] }) => {
  if (selected) {
    savedData.value.userRole = selected.value; // Set userRole from roleName
    savedData.value.hierarchyCode = selected.hierarchyCode; // Set hierarchyCode from selected role
    savedData.value.userAccess = selected.roleAccess; // Set userAccess from roleAccess

    // Matikan toggle (switcherToggle) ketika userRole diubah
    switcherToggle.value = false;

    // Update the table checkboxes based on roleAccess
    dataTable.value = dataTable.value.map((page) => {
      // Check if the pageCode is in the roleAccess of the selected role
      const hasAccess = selected.roleAccess.some(
        (access) => access.pageCode === page.pageCode
      );
      return {
        ...page,
        isChecked: hasAccess, // Set isChecked based on roleAccess
      };
    });
  }
};




// Validators for required fields
const dataValidator = ref([
  { key: "userName", label: "Nama User" },
  { key: "userRole", label: "Role User" },
  { key: "hierarchyCode", label: "Kode Hirarki User" },
  { key: "email", label: "Email User" },
  { key: "userGender", label: "Gender User" },
  { key: "userBirth", label: "Tanggal Lahir User" },
  { key: "userPhone", label: "No Telp User" },
  { key: "userAddress", label: "Alamat User" },
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
    await router.push("/modules/master/user-eksternal");
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

      const formData = new FormData();
      formData.append('_id', savedData.value._id);
      formData.append('userName', savedData.value.userName);
      formData.append('email', savedData.value.email);
      formData.append('userRole', savedData.value.userRole);
      formData.append('userAddress', savedData.value.userAddress);
      formData.append('userBirth', savedData.value.userBirth);
      formData.append('userGender', savedData.value.userGender);
      formData.append('userPhone', savedData.value.userPhone);
      formData.append('companyCode', JSON.stringify(savedData.value.companyCode));
      formData.append('userAccess', JSON.stringify(
        dataTable.value.filter(item => item.isChecked).map(item => ({
          pageCode: item.pageCode,
          pageAccess: 'c.r.u.d',
        }))
      ));

      let imageCondition = 'ada'; // Default adalah 'ada'

if (savedData.value.userImage instanceof File) {
  formData.append('userImage', savedData.value.userImage);
  imageCondition = 'ganti'; // Gambar akan diganti
} else if (savedData.value.userImage === null && savedData.value.imageCondition === 'hapus') {
  imageCondition = 'hapus'; // Gambar akan dihapus
} else if (savedData.value.imageCondition === 'hapus') {
  imageCondition = 'hapus'; // Pastikan kondisi hapus dari frontend diproses
} else {
  imageCondition = 'ada'; // Gambar tetap ada, tidak diubah
  if (savedData.value.imageName) {
    formData.append('imageName', savedData.value.imageName); // Sertakan nama gambar jika gambar tidak diubah
  }
}

// Append kondisi gambar
formData.append('imageCondition', imageCondition);



      // Send FormData with updateUser
      await updateUserEksternal(formData, savedData.value._id);


      
      await successEdit().then(() => {
        router.push("/modules/master/user-eksternal");
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
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
        <DefaultCard cardTitle="Edit Data">
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
              <!-- <div class="w-full">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">
    Role User
  </label>
  <SelectGroup
    placeholder="Pilih Nama Role"
    id="userRole"
    :options="optionsType"
    v-model="savedData.userRole"
    @option-changed="handleOptionChange"
  />
</div> -->

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
      disabled
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
      disabled
    />
  </div>
</div>

          </div>
        </DefaultCard>
        <!-- Input Fields End -->
      </div>
      <div class="flex flex-col gap-9">
  <!-- Textarea Fields Start -->
  <DefaultCard cardTitle="Edit Data Pribadi">
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
    <inputImageWithPreviewUser
  :modelValue="savedData.userImage || savedData.imageName"
  @update:file="(file) => (savedData.userImage = file)"
  @remove:image="savedData.userImage = null" 
  @update:condition="(condition) => (savedData.imageCondition = condition)"  
  v-if="savedData.imageName !== ''"
/>


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
              placeholder="Tanggal Lahir"
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
