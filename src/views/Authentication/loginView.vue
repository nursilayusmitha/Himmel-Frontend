<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from "vue-router";

import DefaultAuthCard from '@/components/Auths/DefaultAuthCard.vue'
import InputGroup from '@/components/Auths/InputGroup.vue'
import { mdiEmailOutline, mdiLockOutline } from '@mdi/js';
import { successLogin} from "@/stores/swal";
import { useIndexStore } from "@/stores/index"
import { userInternal_Login } from "@/stores/functionAPI";

import Swal from "sweetalert2";

const indexStore = useIndexStore();
const router = useRouter();

const pageTitle = ref('Sign In')
const recoverPass = ref(false)
const form = reactive({
  username: "",
  password: ""
})

// Fungsi untuk validasi email dan password
const validateForm = () => {
  let errors = [];

  // Cek email kosong atau tidak valid
  if (!form.username) {
    errors.push("Email tidak boleh kosong");
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.username)) {
    errors.push("Format email tidak valid");
  }

  // Cek password kosong atau kurang dari 8 karakter
  if (!form.password) {
    errors.push("Password tidak boleh kosong");
  } else if (form.password.length < 8) {
    errors.push("Password minimal 8 karakter");
  }

  return errors;
}

const logCredentials = async () => {
  const errors = validateForm();
  if (errors.length > 0) {
    await Swal.fire({
      title: "Error",
      html: errors.map(e => `<p class="text-sm text-gray-600 dark:text-gray-300">${e}</p>`).join(''),
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
      },
      buttonsStyling: false,
      width: '350px',
    });
    return;
  }

  const data = {
    email: form.username,
    password: form.password,
  };

  try {
    const loginData = await userInternal_Login(data);

    // Debug: log response
    console.log("Login Data:", loginData);

    // Kondisi pengecekan userAccess dan userLogin
    if (loginData.user.isDeleted === "Y") {
      await Swal.fire({
        title: "Akun Telah Dihapus",
        html: `<p class="text-sm text-gray-600 dark:text-gray-300">Admin telah melakukan penghapusan pada akun anda.</p>`,
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
          title: 'text-lg font-semibold text-gray-800 dark:text-white',
          htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
          confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
        },
        buttonsStyling: false,
        width: '350px',
      });
      return;
    }

    if (loginData.user.userAccStatus === "disable") {
      await Swal.fire({
        title: "Akun Telah Diblokir",
        html: `<p class="text-sm text-gray-600 dark:text-gray-300">Admin telah melakukan pemblokiran pada akun anda.</p>`,
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
          title: 'text-lg font-semibold text-gray-800 dark:text-white',
          htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
          confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
        },
        buttonsStyling: false,
        width: '350px',
      });
      return;
    }

    if (loginData.user.userAccStatus === "enable" && loginData.user.userLogin === "N") {
      await Swal.fire({
        title: "Akun Tidak Aktif",
        html: `<p class="text-sm text-gray-600 dark:text-gray-300">Admin belum memberikan akses pada akun anda.</p>`,
        customClass: {
          popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
          title: 'text-lg font-semibold text-gray-800 dark:text-white',
          htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
          confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
        },
        buttonsStyling: false,
        width: '350px',
      });
      return;
    }

    // Jika semua kondisi terpenuhi, lanjutkan login
    indexStore.setUser({
      _id: loginData.user._id,
      companyCode: loginData.user.companyCode,
      companyName: loginData.user.companyName,
      email: loginData.user.email,
      bio: loginData.user.bio,
      userPhone: loginData.user.userPhone,
      userRole: loginData.user.userRole,
      imageName: loginData.user.imageName,
      userName: loginData.user.userName,
      hierarchyCode: loginData.user.hierarchyCode,
      userAccess: loginData.user.userAccess,
    });
    indexStore.setToken(loginData.token);
    const currentTime = new Date().toISOString();
    indexStore.setLoginTime(currentTime);
    indexStore.refreshUtilPage();

    // Tampilkan success login sebelum push ke route admin
    await successLogin();
    router.push("/admin");

  } catch (error) {
    await Swal.fire({
      title: "Error",
      html: `<p class="text-sm text-gray-600 dark:text-gray-300">${error.response?.data?.message || "Login gagal"}</p>`,
      customClass: {
        popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
        title: 'text-lg font-semibold text-gray-800 dark:text-white',
        htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
        confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2 transition duration-150 ease-in-out',
      },
      buttonsStyling: false,
      width: '350px',
    });
  }
};
</script>

<template>
  <DefaultAuthCard subtitle="Start now" title="Sign In to Himmel">
    <form>
      <InputGroup label="Email" type="email" placeholder="Enter your email" v-model="form.username">
        <svg
          class="fill-current"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.5">
            <path
              :d="mdiEmailOutline"
              fill=""
            />
          </g>
        </svg>
      </InputGroup>

      <InputGroup label="Password" type="password" placeholder="Enter your password" v-model="form.password">
        <svg
          class="fill-current"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g opacity="0.5">
            <path
            :d="mdiLockOutline"
            fill=""
            />
          </g>
        </svg>
      </InputGroup>

      <div class="mb-5 mt-6">
        <button
          class="w-full cursor-pointer rounded-lg border border-[#009ee5] bg-[#009ee5] p-4 font-medium text-white transition hover:bg-opacity-90"
          @click.prevent="logCredentials"
        >Sign In</button>
      </div>

      <div class="mt-6 text-center">
        <p class="font-medium">
            Lupa Password?
            <router-link to="/admin/forget-password" class="text-gray-400 cursor-default">Pulihkan password anda</router-link>
        </p>
        <p class="font-medium text-black dark:text-white mt-1">
  Belum punya akun?
  <router-link to="/admin/register" class="text-[#009ee5] hover:underline">Request akun ke admin</router-link>
</p>
      </div>
    </form>
  </DefaultAuthCard>
</template>
