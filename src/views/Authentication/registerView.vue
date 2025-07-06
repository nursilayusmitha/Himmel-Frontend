<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from "vue-router";
import DefaultAuthCard from '@/components/Auths/DefaultAuthCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { mdiEmailOutline, mdiLockOutline, mdiAccountOutline, mdiPhoneOutline, mdiHomeOutline } from '@mdi/js';
import { useIndexStore } from "@/stores/index"
import { getDateToday } from "@/stores/date";
import { showLoading, confirmDelete, successCreate, failedCreate, successData } from "@/stores/swal";
import { createUser, getAllRole } from "@/stores/functionAPI";
import Swal from "sweetalert2";

const indexStore = useIndexStore();
const router = useRouter();

const pageTitle = ref('Sign Up')
const savedData = ref({
  companyCode: "",
  companyName: "Himmel",
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
  userLogin: "N",
  userProperties: [],
  user_created: "",
  user_updated: "",
});

const optionsType = ref([]);
const currentStep = ref(1);
onMounted(async () => {
  const options = await getAllRole();
  options.forEach((option) => {
    option.label = option.roleName; // Map roleName to label
    option.value = option.roleName; // Use roleName as the value
  });
  optionsType.value = options;
  const date = await getDateToday("yyyy-MM-dd");
  savedData.value.user_created = date;
});

const handleOptionChange = (selected: { label: string; value: string; hierarchyCode: string; roleAccess: string }) => {
  if (selected) {
    savedData.value.userRole = selected.value; // Set userRole from roleName
    savedData.value.hierarchyCode = selected.hierarchyCode; // Set hierarchyCode from selected role
    savedData.value.userAccess = selected.roleAccess; // Set userAccess from roleAccess
  }
};

// Regex for email and phone validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]*$/;

const validateStep1 = async () => {
  const errors = [];

  if (!savedData.value.userRole) {
    errors.push("Role tidak boleh kosong!");
  }
  if (!savedData.value.email) {
    errors.push("Email tidak boleh kosong!");
  } else if (!emailRegex.test(savedData.value.email)) {
    errors.push("Email tidak valid!");
  }
  if (!savedData.value.password) {
    errors.push("Password tidak boleh kosong!");
  } else if (savedData.value.password.length < 8) {
    errors.push("Password harus minimal 8 karakter!");
  }

  if (errors.length > 0) {
    await Swal.fire({
      title: "Validasi Gagal",
      html: `<p>${errors.join('<br>')}</p>`,
      confirmButtonText: "OK",
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
        actions: 'flex justify-end space-x-2 mt-4',
      },
      buttonsStyling: false,
      width: '350px',
    });
    return false;
  }
  return true;
};

const validateStep2 = async () => {
  const errors = [];

  if (!savedData.value.userName) {
    errors.push("Nama tidak boleh kosong!");
  }
  if (!savedData.value.userBirth) {
    errors.push("Tanggal lahir tidak boleh kosong!");
  }
  if (!savedData.value.userGender) {
    errors.push("Gender tidak boleh kosong!");
  }
  if (!savedData.value.userPhone) {
    errors.push("No telepon tidak boleh kosong!");
  } else if (!phoneRegex.test(savedData.value.userPhone)) {
    errors.push("No telepon harus berupa angka!");
  }
  if (!savedData.value.userAddress) {
    errors.push("Alamat tidak boleh kosong!");
  }

  if (errors.length > 0) {
    await Swal.fire({
      title: "Validasi Gagal",
      html: `<p>${errors.join('<br>')}</p>`,
      confirmButtonText: "OK",
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
        actions: 'flex justify-end space-x-2 mt-4',
      },
      buttonsStyling: false,
      width: '350px',
    });
    return false;
  }
  return true;
};

const goToNextStep = async () => {
  if (currentStep.value === 1) {
    const isValid = await validateStep1();
    if (!isValid) return;
  } else if (currentStep.value === 2) {
    const isValid = await validateStep2();
    if (!isValid) return;
  }
  currentStep.value++;
};

const goBackToPreviousStep = () => {
  currentStep.value--;
};

const submitData = async () => {
  const isValid = await validateStep2();
  if (!isValid) return;

  try {

    const fixData = { ...savedData.value };
    fixData.userAccess = JSON.stringify(fixData.userAccess);

    const formData = new FormData();
    Object.keys(fixData).forEach((key) => {
      formData.append(key, fixData[key]);
    });

    // Send request to create user
    await createUser(formData);

    // Custom success Swal
    await Swal.fire({
      title: "Berhasil Mengirim Request Akun!",
      text: "Tolong tunggu admin untuk mengkonfirmasi akun anda atau hubungi admin jika tidak segera di konfirmasi.",
      confirmButtonText: "OK",
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
        actions: 'flex justify-end space-x-2 mt-4',
      },
      buttonsStyling: false,
      width: '350px',
    }).then(() => {
      // Redirect to admin login page after OK button is clicked
      router.push("/admin/login");
    });
  } catch (error) {
    if (error.response && error.response.status === 401) {
      await Swal.fire({
        title: "Email Sudah Digunakan!",
        text: "Silakan gunakan email yang lain.",
        confirmButtonText: "OK",
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
          title: 'text-lg font-semibold text-gray-800 dark:text-white',
          confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
          actions: 'flex justify-end space-x-2 mt-4',
        },
        buttonsStyling: false,
        width: '350px',
      });
    } else {
      await failedCreate(error);
    }
  }
};
</script>


<template>
  <DefaultAuthCard subtitle="Start now" title="Sign Up to Himmel">
    <form>
      <!-- Step 1: Basic Information (Phone, Email, Password) -->
      <div v-if="currentStep === 1">
        <label class="mb-2.5 block font-medium text-black dark:text-white">Role</label>
        <SelectGroup
          placeholder="Pilih Nama Role"
          id="userRole"
          :options="optionsType"
          v-model="savedData.userRole"
          @option-changed="handleOptionChange"
        />
        <div class="mb-3"></div>
        <InputGroup label="Email" type="email" placeholder="Enter your email" v-model="savedData.email">
          <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5">
              <path :d="mdiEmailOutline" fill="" />
            </g>
          </svg>
        </InputGroup>

        <InputGroup label="Password" type="password" placeholder="Enter your password" v-model="savedData.password">
          <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5">
              <path :d="mdiLockOutline" fill="" />
            </g>
          </svg>
        </InputGroup>

        <div class="mb-5 mt-6">
          <button
            class="w-full cursor-pointer rounded-lg border border-[#009ee5] bg-[#009ee5] p-4 font-medium text-white transition hover:bg-opacity-90"
            @click.prevent="goToNextStep"
          >Next</button>
        </div>
      </div>

      <!-- Step 2: Additional Information (Name, Date of Birth, Address) -->
      <div v-if="currentStep === 2">
        <InputGroup label="Nama User" type="text" placeholder="Enter your name" v-model="savedData.userName">
          <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5">
              <path :d="mdiAccountOutline" fill="" />
            </g>
          </svg>
        </InputGroup>

        <label class="mb-2.5 block font-medium text-black dark:text-white">Tanggal Lahir</label>
        <input type="date" class="w-full mb-4 rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-4 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary text-black dark:text-white" v-model="savedData.userBirth" />

        <label class="mb-2.5 block font-medium text-black dark:text-white">Gender</label>
        <div class="flex space-x-4 mb-5">
          <label class="inline-flex items-center text-black dark:text-white">
            <input type="radio" name="gender" value="pria" v-model="savedData.userGender" class="form-radio h-5 w-5 text-primary focus:ring-0 rounded-full border-2 border-gray-300 checked:bg-primary checked:border-primary" />
            <span class="ml-2">Pria</span>
          </label>
          <label class="inline-flex items-center text-black dark:text-white">
            <input type="radio" name="gender" value="wanita" v-model="savedData.userGender" class="form-radio h-5 w-5 text-primary focus:ring-0 rounded-full border-2 border-gray-300 checked:bg-primary checked:border-primary" />
            <span class="ml-2">Wanita</span>
          </label>
        </div>

        <InputGroup label="Phone Number" type="text" placeholder="Enter your phone number" v-model="savedData.userPhone">
          <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5">
              <path :d="mdiPhoneOutline" fill="" />
            </g>
          </svg>
        </InputGroup>

        <InputGroup label="Alamat" type="text" placeholder="Enter your address" v-model="savedData.userAddress" :isTextarea="true">
          <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g opacity="0.5">
              <path :d="mdiHomeOutline" fill="" />
            </g>
          </svg>
        </InputGroup>

        <div class="flex gap-2">
          <button @click.prevent="goBackToPreviousStep" class="text-[#009ee5] w-full cursor-pointer rounded-lg border border-[#009ee5] p-3">Back</button>
          
          <button
            class="w-full cursor-pointer rounded-lg border border-[#009ee5] bg-[#009ee5] p-4 font-medium text-white transition hover:bg-opacity-90"
            @click.prevent="submitData"
          >Daftar</button>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="font-medium text-black dark:text-white mt-1">
  Sudah punya akun?
  <router-link to="/admin/login" class="text-[#009ee5] hover:underline">Yuk, Masuk ke akun kamu!</router-link>
</p>
      </div>
    </form>
  </DefaultAuthCard>
</template>
