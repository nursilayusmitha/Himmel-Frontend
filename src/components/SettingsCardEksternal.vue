<script setup lang="ts">
import Swal from "sweetalert2";
import { ref, onMounted } from "vue";
import { mdiAccountOutline, mdiEmailOutline, mdiTrayArrowUp, mdiCalendar, mdiMapMarkerOutline, mdiLockReset,mdiPhoneOutline } from '@mdi/js';
import { getUserEksternalById, updateUserEksternal,requestPasswordResetEksternal  } from "@/stores/functionAPI";
import { showLoading, successEdit, failedCreate,successData } from "@/stores/swal";
import { useIndexStore } from "@/stores";
import { API } from "@/API/";

const indexStore = useIndexStore();

// ===== DATA PERSONAL =====
const savedData = ref({
  _id: "",
  userName: "",
  email: "",
  userPhone: "",
  gender: "",
  birthDate: "",
  address: "",
  imageCondition: "ada",
  imageName: "",
});


const originalData = ref({ ...savedData.value });

// ===== DATA FOTO =====
const userImage = ref<string | File | null>(null);
const imagePreview = ref(API + "/images/user_eksternal/profile.png");
const imageCondition = ref("ada");
const fileInput = ref<HTMLInputElement | null>(null);

// ===== ONMOUNTED: GET USER DATA =====
onMounted(async () => {
  const data = await getUserEksternalById(indexStore.user._id);
  if (data) {
    const formatted = {
      _id: data._id,
      userName: data.userName || "",
      email: data.email || "",
      userPhone: data.userPhone || "",
      gender: data.userGender || "",
      birthDate: data.userBirth || "",
      address: data.userAddress || "",
      imageCondition: "ada",
      imageName: data.imageName || "",
    };

    savedData.value = { ...formatted };
    originalData.value = { ...formatted };

    if (data.imageName) {
      userImage.value = data.imageName;
      imagePreview.value = API + "/images/user_eksternal/" + data.imageName;
      imageCondition.value = "ada";
    } else {
      userImage.value = null;
      imagePreview.value = API + "/images/user_eksternal/profile.png";
      imageCondition.value = "hapus";
    }
  }
});

const requestResetPassword = async () => {
  const email = savedData.value.email;

  // Validasi email
  if (!email) {
    return Swal.fire({
      icon: 'error',
      title: 'Error!',
      text: 'Email tidak boleh kosong.',
    });
  }

  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email)) {
    return Swal.fire({
      icon: 'error',
      title: 'Format Email Tidak Valid!',
      text: 'Masukkan alamat email yang benar.',
    });
  }

  const result = await Swal.fire({
    title: "Kirim Email Reset Password?",
    html: '<p class="text-sm text-gray-600">Link reset password akan dikirimkan ke email user.</p>',
    showCancelButton: true,
    confirmButtonText: "Konfirmasi",
    cancelButtonText: "Batal",
    customClass: {
      popup: 'rounded-lg shadow-lg bg-white dark:bg-gray-800 p-4 max-w-md',
      title: 'text-lg font-semibold text-gray-800 dark:text-white',
      htmlContainer: 'text-sm text-gray-600 dark:text-gray-300',
      confirmButton: 'text-white bg-[#009ee5] hover:bg-[#094fa4] border border-transparent font-medium rounded-lg text-sm px-4 py-2',
      cancelButton: 'text-[#009ee5] bg-white border border-[#009ee5] hover:bg-[#f0faff] font-medium rounded-lg text-sm px-4 py-2',
      actions: 'flex justify-end space-x-2 mt-4',
    },
    buttonsStyling: false,
    width: '350px',
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      await requestPasswordResetEksternal({ email });

      await successData("Silakan cek email user untuk reset password.");
    } catch (error: any) {
      if (error.response?.status === 401) {
        await Swal.fire({
          icon: "error",
          title: "Email Tidak Ditemukan!",
          text: "Email ini belum terdaftar. Coba gunakan email lain.",
        });
      } else {
        await failedCreate(error);
      }
    }
  }
};

// ===== SUBMIT DATA PRIBADI =====
const submitData = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const result = await Swal.fire({
    title: "Edit Data?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#10B981",
    cancelButtonColor: "#d33",
    confirmButtonText: "Konfirmasi",
    cancelButtonText: "Batal",
    ...(isDarkMode && {
      background: '#1f2937',
      color: '#f9fafb',
      iconColor: '#facc15',
    }),
  });

  if (result.isConfirmed) {
    try {
      showLoading();

      const formData = new FormData();
      formData.append("_id", savedData.value._id);
      formData.append("userName", savedData.value.userName);
      formData.append("email", savedData.value.email);
      formData.append("userPhone", savedData.value.userPhone);
      formData.append("userGender", savedData.value.gender || "");
      formData.append("userBirth", savedData.value.birthDate || "");
      formData.append("userAddress", savedData.value.address || "");
      formData.append("imageCondition", savedData.value.imageCondition);

      await updateUserEksternal(formData, savedData.value._id);
      await successEdit();

      const updated = await getUserEksternalById(savedData.value._id);
      if (updated) {
        const formatted = {
          _id: updated._id,
          userName: updated.userName || "",
          email: updated.email || "",
          userPhone: updated.userPhone || "",
          gender: updated.userGender || "",
          birthDate: updated.userBirth || "",
          address: updated.userAddress || "",
          imageCondition: "ada",
          imageName: updated.imageName || ""
        };

        savedData.value = { ...formatted };
        originalData.value = { ...formatted };
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        await Swal.fire({
          title: "Email Sudah Digunakan!",
          text: "Silakan gunakan email yang lain.",
          icon: "error",
          confirmButtonColor: "#d33",
          ...(isDarkMode && {
            background: '#1f2937',
            color: '#f9fafb',
            iconColor: '#facc15',
          }),
        });
      } else {
        await failedCreate(error);
      }
    }
  }
};


// ===== SUBMIT FOTO PROFIL =====
const submitPhoto = async () => {
  try {
    showLoading();
    const formData = new FormData();
    formData.append("_id", savedData.value._id);
    formData.append("imageCondition", imageCondition.value);

    if (userImage.value instanceof File) {
      formData.append("userImage", userImage.value);
    }

    await updateUserEksternal(formData, savedData.value._id);
    const updated = await getUserEksternalById(savedData.value._id);

    if (updated.imageName) {
      userImage.value = updated.imageName;
      imagePreview.value = API + "/images/user_eksternal/" + updated.imageName;
      imageCondition.value = "ada";
    } else {
      userImage.value = null;
      imagePreview.value = API + "/images/user_eksternal/profile.png";
      imageCondition.value = "hapus";
    }

    await successEdit();
  } catch (error) {
    await failedCreate(error);
  }
};

// ===== HANDLE UPLOAD FOTO BARU =====
const handleFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
    userImage.value = file;
    imagePreview.value = URL.createObjectURL(file);
    imageCondition.value = "ganti";
  }
};

// ===== HANDLE DELETE & UPDATE BUTTON =====
const deletePhoto = (e: Event) => {
  e.preventDefault();
  userImage.value = null;
  imagePreview.value = API + "/images/user_eksternal/profile.png";
  imageCondition.value = "hapus";
};

const updatePhoto = (e: Event) => {
  e.preventDefault();
  fileInput.value?.click();
};

// ===== HANDLE CANCEL FOTO =====
const handlePhotoCancel = () => {
  if (originalData.value.imageName) {
    userImage.value = originalData.value.imageName;
    imagePreview.value = API + "/images/user_eksternal/" + originalData.value.imageName;
    imageCondition.value = "ada";
  } else {
    userImage.value = null;
    imagePreview.value = API + "/images/user_eksternal/profile.png";
    imageCondition.value = "hapus";
  }
};


// ===== CANCEL DATA PRIBADI =====
const handleCancel = () => {
  savedData.value = { ...originalData.value };
};
</script>



<template>
  <div class="grid grid-cols-5 gap-8">
    <!-- Personal Information Card -->
<div class="col-span-5 xl:col-span-3">
  <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
      <h3 class="font-medium text-black dark:text-white">Personal Information</h3>
    </div>
    <div class="p-7">
      <form>
        <!-- Full Name & Phone -->
        <div class="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
          <div class="w-full sm:w-1/2">
            <label class="mb-3 block text-sm font-medium text-black dark:text-white">Full Name</label>
            <div class="relative">
              <span class="absolute left-4.5 top-4">
                <svg class="fill-current" width="20" height="20" viewBox="0 0 20 20"><path :d="mdiAccountOutline" /></svg>
              </span>
              <input v-model="savedData.userName" type="text" placeholder="Nama User"
                class="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white" />
            </div>
          </div>

          <div class="w-full sm:w-1/2">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">Phone Number</label>
  <div class="relative">
    <span class="absolute left-4.5 top-4">
      <svg class="fill-current text-gray-500 dark:text-white" width="20" height="20" viewBox="0 0 24 24">
        <path :d="mdiPhoneOutline" />
      </svg>
    </span>
    <input
      v-model="savedData.userPhone"
      type="text"
      placeholder="Nomor User"
      class="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
    />
  </div>
</div>

        </div>

        <!-- Email & Reset Password (Side by Side, Equal Height) -->
<div class="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
  <!-- Email Input -->
  <div class="w-full sm:w-1/2">
    <label class="mb-3 block text-sm font-medium text-black dark:text-white">Email Address</label>
    <div class="relative">
      <span class="absolute left-4.5 top-4">
        <svg class="fill-current" width="20" height="20" viewBox="0 0 22 20">
          <path :d="mdiEmailOutline" />
        </svg>
      </span>
      <input
        v-model="savedData.email"
        type="email"
        placeholder="Email User"
        class="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
      />
    </div>
  </div>

  <!-- Reset Password Button -->
  <div class="w-full sm:w-1/2 flex flex-col justify-end">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">Reset Password</label>
  <button
    type="button"
    @click="requestResetPassword"
    class="h-[48px] w-fit px-4 flex items-center gap-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="white">
      <path :d="mdiLockReset" />
    </svg>
    Request Reset Password
  </button>
</div>
</div>


        <!-- Gender & Birth Date (Side by Side) -->
<div class="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
  <!-- Gender -->
  <div class="w-full sm:w-1/2">
    <label class="mb-3 block text-sm font-medium text-black dark:text-white">Gender</label>
    <div class="flex space-x-6">
      <label class="inline-flex items-center text-black dark:text-white">
        <input
          type="radio"
          name="gender"
          value="pria"
          v-model="savedData.gender"
          class="form-radio h-5 w-5 text-primary focus:ring-0 rounded-full border-2 border-gray-300 checked:bg-primary checked:border-primary"
        />
        <span class="ml-2">Pria</span>
      </label>
      <label class="inline-flex items-center text-black dark:text-white">
        <input
          type="radio"
          name="gender"
          value="wanita"
          v-model="savedData.gender"
          class="form-radio h-5 w-5 text-primary focus:ring-0 rounded-full border-2 border-gray-300 checked:bg-primary checked:border-primary"
        />
        <span class="ml-2">Wanita</span>
      </label>
    </div>
  </div>

  <!-- Birth Date -->
  <div class="w-full sm:w-1/2">
  <label class="mb-3 block text-sm font-medium text-black dark:text-white">Tanggal Lahir</label>
  <input
    v-model="savedData.birthDate"
    type="date"
    class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"
  />
</div>

</div>


        <!-- Address -->
        <div class="mb-5.5">
          <label class="mb-3 block text-sm font-medium text-black dark:text-white">Address</label>
          <div class="relative">
            <span class="absolute left-4.5 top-4">
              <svg class="fill-current" width="20" height="20" viewBox="0 0 24 24"><path :d="mdiMapMarkerOutline" /></svg>
            </span>
            <textarea v-model="savedData.address" rows="3" placeholder="Alamat"
              class="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white"></textarea>
          </div>
        </div>

        <!-- Buttons -->
        <div class="flex justify-end gap-4.5">
          <button
            type="button"
            @click="handleCancel"
            class="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            @click="submitData"
            class="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

    <!-- Your Photo Section -->
<div class="col-span-5 xl:col-span-2">
  <div class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
    <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
      <h3 class="font-medium text-black dark:text-white">Your Photo</h3>
    </div>
    <div class="p-7">
      <form @submit.prevent="submitPhoto">
        <!-- User Photo Section -->
        <div class="mb-4 flex items-center gap-3">
          <div class="h-14 w-14 rounded-full">
            <img
              :src="imagePreview"
              alt="Foto Profil"
              class="object-cover rounded-full w-full h-full"
            />
          </div>
          <div>
            <span class="mb-1.5 font-medium text-black dark:text-white">Edit your photo</span>
            <span class="flex gap-2.5">
              <button class="text-sm font-medium hover:text-primary" @click="deletePhoto">
                Delete
              </button>
              <button class="text-sm font-medium hover:text-primary" @click="updatePhoto">
                Update
              </button>
            </span>
          </div>
        </div>

        <!-- File Upload Section -->
        <div
          id="FileUpload"
          class="relative mb-5.5 block w-full cursor-pointer appearance-none rounded border-2 border-dashed border-primary bg-gray py-4 px-4 dark:bg-meta-4 sm:py-7.5"
        >
          <input
            type="file"
            accept="image/png, image/jpeg"
            class="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
            @change="handleFileChange"
            ref="fileInput"
          />
          <div class="flex flex-col items-center justify-center space-y-3">
            <span class="flex h-10 w-10 items-center justify-center rounded-full border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
              <svg width="16" height="16" viewBox="0 0 22 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiTrayArrowUp" fill="#3C50E0" />
              </svg>
            </span>
            <p class="text-sm font-medium">
              <span class="text-primary">Click to upload</span> or drag and drop
            </p>
            <p class="mt-1.5 text-sm font-medium">JPG or PNG (max 800 x 800px)</p>
          </div>
        </div>

        <!-- Save and Cancel Buttons for Photo Section -->
        <div class="flex justify-end gap-4.5">
          <button
            class="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            type="button"
            @click="handlePhotoCancel"
          >
            Cancel
          </button>
          <button
            class="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
            type="submit"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</div>

  </div>
</template>
