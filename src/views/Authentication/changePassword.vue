<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

import { showLoading, successCreate, failedCreate } from "@/stores/swal";

import { mdiEyeOutline , mdiEyeOffOutline } from '@mdi/js';
import { resetPassword } from "@/stores/functionAPI"; // Sesuaikan nama API jika perlu

const router = useRouter();
const route = useRoute();

// Ambil token dan id dari URL
const token = route.query.token;
const userId = route.query.id;

const savedData = ref({
  password: "",
  confirmPassword: ""
});

// State untuk show/hide password
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value;
};

const submitData = async () => {
  // Validasi apakah password kosong
  if (!savedData.value.password || !savedData.value.confirmPassword) {
    await Swal.fire({
      title: "Password Kosong!",
      html: '<p class="text-sm text-gray-600 dark:text-gray-300">Pastikan semua kolom password diisi.</p>',
      confirmButtonText: "OK",
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] rounded-lg text-sm px-4 py-2',
      },
      buttonsStyling: false,
    });
    return;
  }

  // Validasi apakah password kurang dari 8 karakter
  if (savedData.value.password.length < 8) {
    await Swal.fire({
      title: "Password Terlalu Pendek!",
      html: '<p class="text-sm text-gray-600 dark:text-gray-300">Password harus terdiri dari minimal 8 karakter.</p>',
      confirmButtonText: "OK",
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] rounded-lg text-sm px-4 py-2',
      },
      buttonsStyling: false,
    });
    return;
  }

  // Validasi apakah password dan confirm password sama
  if (savedData.value.password !== savedData.value.confirmPassword) {
    await Swal.fire({
      title: "Password Tidak Cocok!",
      html: '<p class="text-sm text-gray-600 dark:text-gray-300">Pastikan kedua password yang dimasukkan sama.</p>',
      confirmButtonText: "OK",
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] rounded-lg text-sm px-4 py-2',
      },
      buttonsStyling: false,
    });
    return;
  }

  const result = await Swal.fire({
    title: "Ubah Password?",
    html: '<p class="text-sm text-gray-600 dark:text-gray-300">Apakah Anda yakin ingin mengubah password?</p>',
    showCancelButton: true,
    confirmButtonText: "Ubah",
    cancelButtonText: "Batal",
    customClass: {
      popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
      title: 'text-lg font-semibold text-gray-800 dark:text-white',
      htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
      confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] rounded-lg text-sm px-4 py-2',
      cancelButton: 'text-[#009ee5] bg-white dark:bg-transparent border border-[#009ee5] hover:bg-[#f0faff] dark:hover:bg-gray-700 font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
      actions: 'flex justify-end mt-4 space-x-2',
    },
    buttonsStyling: false,
  });

  if (result.isConfirmed) {
    try {
      const requestData = {
        userId,
        token,
        password: savedData.value.password
      };

      await resetPassword(requestData);

      // Tampilkan alert "Berhasil"
      await Swal.fire({
        title: "Berhasil",
        html: '<p class="text-sm text-gray-600 dark:text-gray-300">Password telah berhasil diubah.</p>',
        confirmButtonText: "Arahkan ke login",
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
          title: 'text-lg font-semibold text-gray-800 dark:text-white',
          htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
          confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] rounded-lg text-sm px-4 py-2',
        },
        buttonsStyling: false,
      }).then(() => {
        router.push("/admin/login");
      });

    } catch (error) {
      const errorMessage = error.response?.data?.message || "Terjadi kesalahan";
      
      if (error.response?.status === 401) {
        await Swal.fire({
          title: "Token Tidak Valid!",
          html: '<p class="text-sm text-gray-600 dark:text-gray-300">Token reset password yang digunakan tidak valid.</p>',
          confirmButtonText: "OK",
          customClass: {
            popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
            title: 'text-lg font-semibold text-gray-800 dark:text-white',
            htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
            confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] rounded-lg text-sm px-4 py-2',
          },
          buttonsStyling: false,
        });
      } else if (error.response?.status === 400) {
        await Swal.fire({
          title: "Token Expired!",
          html: '<p class="text-sm text-gray-600 dark:text-gray-300">Token reset password sudah kadaluarsa.</p>',
          confirmButtonText: "OK",
          customClass: {
            popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
            title: 'text-lg font-semibold text-gray-800 dark:text-white',
            htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
            confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] rounded-lg text-sm px-4 py-2',
          },
          buttonsStyling: false,
        });
      } else {
        await failedCreate(errorMessage);
      }
    }
  }
};

const goBack = () => {
  router.push("/admin/login");
};
</script>
<template>
  <!-- ====== Forms Section Start ====== -->
  <div class="min-h-screen flex items-center justify-center bg-[url('@/assets/images/background/background.png')] bg-cover bg-center bg-no-repeat dark:bg-gray-900 px-4 sm:px-8">
    <div class="w-full max-w-lg mx-auto bg-white dark:bg-gray-800 px-8 py-10 rounded-xl shadow relative">
      <!-- Header -->
      <header class="mb-8 text-center">
        <h1 class="text-2xl text-black dark:text-white font-bold mb-1">Reset Password</h1>
      </header>

      <!-- Form untuk Ubah Password -->
      <form id="reset-password-form">
        <!-- Input Password -->
        <div class="mb-6 relative">
          <label for="password" class="block font-medium text-black dark:text-white text-left mb-2">Password Baru</label>
          <input 
            id="password"
            v-model="savedData.password"
            :type="showPassword ? 'text' : 'password'"
            class="w-full rounded-lg border border-[#009ee5] bg-transparent py-4 pl-4 pr-10 outline-none focus:border-[#009ee5] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary mb-2 text-black dark:text-white"
            required
          />
          <!-- Icon Mata -->
          <i class="absolute inset-y-0 right-4 flex items-center cursor-pointer justify-center mt-5" @click="togglePasswordVisibility">
            <svg
              v-if="showPassword"
              class="w-6 h-6 text-black dark:text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path :d="mdiEyeOffOutline" />
            </svg>
            <svg
              v-else
              class="w-6 h-6 text-black dark:text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path :d="mdiEyeOutline" />
            </svg>
          </i>
        </div>

        <!-- Input Confirm Password -->
        <div class="mb-6 relative">
          <label for="confirm-password" class="block font-medium text-black dark:text-white text-left mb-2">Konfirmasi Password Baru</label>
          <input 
            id="confirm-password"
            v-model="savedData.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="w-full rounded-lg border border-[#009ee5] bg-transparent py-4 pl-4 pr-10 outline-none focus:border-[#009ee5] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary mb-2 text-black dark:text-white"
            required
          />
          <!-- Icon Mata -->
          <i class="absolute inset-y-0 right-4 flex items-center cursor-pointer justify-center mt-5 ml-2" @click="toggleConfirmPasswordVisibility">
            <svg
              v-if="showConfirmPassword"
              class="w-6 h-6 text-black dark:text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path :d="mdiEyeOffOutline" />
            </svg>
            <svg
              v-else
              class="w-6 h-6 text-black dark:text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path :d="mdiEyeOutline" />
            </svg>
          </i>
        </div>

        <!-- Tombol Submit -->
        <div class="text-center mt-6">
          <button
            class="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-[#009ee5] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150"
            @click.prevent="submitData"
          >
            Ubah Password
          </button>
        </div>
      </form>
    </div>
  </div>
  <!-- ====== Forms Section End ====== -->
</template>
