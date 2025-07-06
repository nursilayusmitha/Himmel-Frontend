<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

import { mdiArrowULeftTop } from '@mdi/js';

import { showLoading, successData, failedCreate } from "@/stores/swal";
import { requestPasswordResetEksternal } from "@/stores/functionAPI";

// Fungsi untuk validasi email menggunakan regex
const validateEmail = (email: string) => {
  const regex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return regex.test(email);
};

const router = useRouter();

const savedData = ref({
  email: "",
});
const isLinkSent = ref(false); // Tambahkan isLinkSent

// Fungsi untuk menampilkan alert error yang sesuai
const showAlertError = async (title: string, text: string) => {
  await Swal.fire({
    title,
    text,
    showCancelButton: false,
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
};

// Fungsi utama submitData dengan alert
const submitData = async () => {
  if (!savedData.value.email) {
    // Validasi jika email kosong
    return showAlertError("Error!", "Email tidak boleh kosong.");
  } else if (!validateEmail(savedData.value.email)) {
    // Validasi jika email tidak valid
    return showAlertError("Error!", "Format email tidak valid.");
  }

  const result = await Swal.fire({
    title: "Kirim email untuk reset password?",
    html: '<p class="text-sm text-gray-600 dark:text-gray-300">Pastikan email yang dimasukkan benar.</p>',
    showCancelButton: true,
    confirmButtonText: "Konfirmasi",
    cancelButtonText: "Batal",
    customClass: {
      popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
      title: 'text-lg font-semibold text-gray-800 dark:text-white',
      htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
      confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
      cancelButton: 'text-[#009ee5] bg-white dark:bg-gray-900 border border-[#009ee5] hover:bg-[#f0faff] dark:hover:bg-gray-700 font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
      actions: 'flex justify-end space-x-2 mt-4',
    },
    buttonsStyling: false,
    width: '350px',
  });

  if (result.isConfirmed) {
    try {
      const requestData = { email: savedData.value.email };

      // Kirim permintaan reset password
      await requestPasswordResetEksternal(requestData);

      await successData().then(() => {
        isLinkSent.value = true; // Set isLinkSent ke true setelah sukses
        router.push("/forget-password");
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Menampilkan alert jika email tidak ditemukan
        await showAlertError("Email Tidak Ditemukan!", "Silakan masukkan email yang terdaftar.");
      } else {
        await failedCreate(error);
      }
    }
  }
};

// Fungsi resendData tanpa alert loading atau konfirmasi sukses
const resendData = async () => {
  if (!savedData.value.email) {
    // Validasi jika email kosong
    return showAlertError("Error!", "Email tidak boleh kosong.");
  } else if (!validateEmail(savedData.value.email)) {
    // Validasi jika email tidak valid
    return showAlertError("Error!", "Format email tidak valid.");
  }

  const result = await Swal.fire({
    title: "Kirim ulang link?",
    html: '<p class="text-sm text-gray-600 dark:text-gray-300">Kami akan mengirimkan ulang link reset password sesuai dengan email.</p>',
    showCancelButton: true,
    confirmButtonText: "Iya",
    cancelButtonText: "Batal",
    customClass: {
      popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
      title: 'text-lg font-semibold text-gray-800 dark:text-white',
      htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
      confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
      cancelButton: 'text-[#009ee5] bg-white dark:bg-gray-900 border border-[#009ee5] hover:bg-[#f0faff] dark:hover:bg-gray-700 font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
      actions: 'flex justify-end space-x-2 mt-4',
    },
    buttonsStyling: false,
    width: '350px',
  });

  if (result.isConfirmed) {
    try {
      const requestData = { email: savedData.value.email };

      // Kirim permintaan reset password
      await requestPasswordResetEksternal(requestData);

      await successData().then(() => {
        isLinkSent.value = true; // Set isLinkSent ke true setelah sukses
        router.push("/forget-password");
      });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Menampilkan alert jika email tidak ditemukan
        await showAlertError("Email Tidak Ditemukan!", "Silakan masukkan email yang terdaftar.");
      } else {
        await failedCreate(error);
      }
    }
  }
};

const goBack = () => {
  router.push("/sign-in");
};
</script>
<template>
  <div class="min-h-screen flex items-center justify-center bg-[url('@/assets/images/background/background.png')] bg-cover bg-center bg-no-repeat dark:bg-gray-900 px-4 sm:px-8">
    <div class="max-w-md mx-auto text-center bg-white dark:bg-gray-800 px-4 sm:px-8 py-10 rounded-xl shadow relative">
      <!-- Tombol Back -->
      <button class="absolute top-4 left-4 text-[#009ee5] hover:text-primary font-medium flex items-center space-x-1 text-lg group" @click="goBack">
        <svg class="fill-current text-[#009ee5] group-hover:text-primary transition-colors duration-150" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path :d="mdiArrowULeftTop" fill="currentColor" />
        </svg>
        <span class="text-[#009ee5] group-hover:text-primary transition-colors duration-150">Back</span>
      </button>

      <header class="mb-8 mt-8">
        <h1 class="text-2xl text-black dark:text-white font-bold mb-1">Request Reset Password</h1>
        <p class="text-[15px] text-slate-500 dark:text-gray-300">Masukkan email yang Anda daftarkan untuk dikirimkan link reset password</p>
      </header>

      <form id="otp-form">
        <div class="relative">
          <input v-model="savedData.email"
            class="w-4/5 rounded-lg border border-[#009ee5] bg-transparent py-4 pl-4 pr-4 outline-none focus:border-[#009ee5] focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary mb-2 text-black dark:text-white"
            :disabled="isLinkSent" />
        </div>

        <div class="max-w-[310px] mx-auto mt-4" v-if="!isLinkSent">
          <button class="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-[#009ee5] px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-primary focus:outline-none focus:ring focus:ring-indigo-300 transition-colors duration-150" @click.prevent="submitData">
            Kirim Link
          </button>
        </div>
      </form>

      <!-- Tampilkan link Kirim Ulang hanya jika isLinkSent true -->
      <div class="text-sm text-slate-500 dark:text-gray-300 mt-4" v-if="isLinkSent">
        Tidak menerima link reset password?
        <a class="font-medium text-[#009ee5] hover:text-primary" @click.prevent="resendData">Kirim ulang</a>
      </div>
    </div>
  </div>
</template>
