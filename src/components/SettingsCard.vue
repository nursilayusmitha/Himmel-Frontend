<script setup lang="ts">
import Swal from "sweetalert2";
import { ref, onMounted } from "vue";
import { mdiAccountOutline, mdiEmailOutline, mdiSquareEditOutline, mdiTrayArrowUp } from '@mdi/js';
import { getUserById, updateUser } from "@/stores/functionAPI";
import { showLoading, successEdit, failedCreate } from "@/stores/swal";
import { useIndexStore } from "@/stores";
import { API } from "@/API/";

const indexStore = useIndexStore();

// ===== DATA PERSONAL =====
const savedData = ref({
  _id: "",
  userName: "",
  email: "",
  userPhone: "",
  bio: "",
  imageCondition: "ada",
  imageName: "", 
});

const originalData = ref({ ...savedData.value });

// ===== DATA FOTO =====
const userImage = ref<string | File | null>(null);
const imagePreview = ref(API + "/images/user_internal/profile.png");
const imageCondition = ref("ada");
const fileInput = ref<HTMLInputElement | null>(null);

// ===== ONMOUNTED: GET USER DATA =====
onMounted(async () => {
  const data = await getUserById(indexStore.user._id);
  if (data) {
    const formatted = {
      _id: data._id,
      userName: data.userName || "",
      email: data.email || "",
      userPhone: data.userPhone || "",
      bio: data.bio || "",
      imageCondition: "ada",
      imageName: data.imageName || "",
    };

    savedData.value = { ...formatted };
    originalData.value = { ...formatted };

    if (data.imageName) {
      userImage.value = data.imageName;
      imagePreview.value = API + "/images/user_internal/" + data.imageName;
      imageCondition.value = "ada";
    } else {
      userImage.value = null;
      imagePreview.value = API + "/images/user_internal/profile.png";
      imageCondition.value = "hapus";
    }
  }
});

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
      formData.append("bio", savedData.value.bio);
      formData.append("imageCondition", savedData.value.imageCondition);

      await updateUser(formData, savedData.value._id);
      await successEdit();

      const updated = await getUserById(savedData.value._id);
      if (updated) {
        const formatted = {
          _id: updated._id,
          userName: updated.userName || "",
          email: updated.email || "",
          userPhone: updated.userPhone || "",
          bio: updated.bio || "",
          imageCondition: "ada",
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

    await updateUser(formData, savedData.value._id);
    const updated = await getUserById(savedData.value._id);

    if (updated.imageName) {
      userImage.value = updated.imageName;
      imagePreview.value = API + "/images/user_internal/" + updated.imageName;
      imageCondition.value = "ada";
    } else {
      userImage.value = null;
      imagePreview.value = API + "/images/user_internal/profile.png";
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
  imagePreview.value = API + "/images/user_internal/profile.png";
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
    imagePreview.value = API + "/images/user_internal/" + originalData.value.imageName;
    imageCondition.value = "ada";
  } else {
    userImage.value = null;
    imagePreview.value = API + "/images/user_internal/profile.png";
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
    <!-- Personal Information Section -->
    <div class="col-span-5 xl:col-span-3">
      <div
        class="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
      >
        <div class="border-b border-stroke py-4 px-7 dark:border-strokedark">
          <h3 class="font-medium text-black dark:text-white">Personal Information</h3>
        </div>
        <div class="p-7">
          <form>
            <!-- Full Name Section -->
            <div class="mb-5.5 flex flex-col gap-5.5 sm:flex-row">
              <div class="w-full sm:w-1/2">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  for="fullName"
                  >Full Name</label
                >
                <div class="relative">
                  <span class="absolute left-4.5 top-4">
                    <svg
                      class="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <g opacity="0.6">
                        <path
                          :d="mdiAccountOutline "
                          fill=""
                        />
                      </g>
                    </svg>
                  </span>
                  <input
                    v-model="savedData.userName"
                    class="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                    type="text"
                    placeholder="Nama User"
                  />
                </div>
              </div>

              <!-- Phone Number Section -->
              <div class="w-full sm:w-1/2">
                <label
                  class="mb-3 block text-sm font-medium text-black dark:text-white"
                  for="phoneNumber"
                  >Phone Number</label
                >
                <input
                  v-model="savedData.userPhone"
                  class="w-full rounded border border-stroke bg-gray py-3 px-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="text"
                  placeholder="Nomor User"
                />
              </div>
            </div>

            <!-- Email Address Section -->
            <div class="mb-5.5">
              <label
                class="mb-3 block text-sm font-medium text-black dark:text-white"
                for="emailAddress"
                >Email Address</label
              >
              <div class="relative">
                <span class="absolute left-4.5 top-4">
                  <svg
                      class="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 22 20"
                      fill="none"
                    >
                      <g opacity="0.6">
                        <path
                          :d="mdiEmailOutline  "
                          fill=""
                        />
                      </g>
                    </svg>
                </span>
                <input
                  v-model="savedData.email"
                  class="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  type="email"
                  placeholder="Email User"
                />
              </div>
            </div>

            <!-- Bio Section -->
            <div class="mb-5.5">
              <label class="mb-3 block text-sm font-medium text-black dark:text-white" for="bio"
                >BIO</label
              >
              <div class="relative">
                <span class="absolute left-4.5 top-4">
                  <svg
                      class="fill-current"
                      width="20"
                      height="20"
                      viewBox="0 0 22 20"
                      fill="none"
                    >
                      <g opacity="0.6">
                        <path
                          :d="mdiSquareEditOutline  "
                          fill=""
                        />
                      </g>
                    </svg>
                </span>
                <textarea
                  v-model="savedData.bio"
                  class="w-full rounded border border-stroke bg-gray py-3 pl-11.5 pr-4.5 font-normal text-black focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-meta-4 dark:text-white dark:focus:border-primary"
                  rows="5"
                  placeholder="Write your bio here"
                ></textarea>
              </div>
            </div>

            <!-- Save and Cancel Buttons -->
            <div class="flex justify-end gap-4.5">
              <button
                class="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                type="button"
                @click="handleCancel"
              >
                Cancel
              </button>
              <button
                class="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90"
                type="button"
                @click="submitData"
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
