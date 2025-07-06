<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import { useIndexStore } from '@/stores'
import { mdiLogout, mdiCogOutline, mdiAccountOutline } from '@mdi/js'
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useRouter, useRoute } from 'vue-router'
import imageWithPreviewUser from "@/components/Forms/SelectGroup/imageWithPreviewUserPP.vue"
import { getUserById } from '@/stores/functionAPI'

const target = ref(null)
const dropdownOpen = ref(false)

const route = useRoute()
const router = useRouter()
const indexStore = useIndexStore()

// ✅ Gunakan ref baru untuk menyimpan data user yang ter-update
const userData = ref({
  userName: '',
  userRole: '',
  imageName: null
})

// ✅ Fetch data user yang ter-update saat komponen mount
onMounted(async () => {
  const result = await getUserById(indexStore.user._id)
  if (result) {
    userData.value = {
      userName: result.userName || '',
      userRole: result.userRole || '',
      imageName: result.imageName || null
    }
  }
})

onClickOutside(target, () => {
  dropdownOpen.value = false
})

const logOut = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'You will be logged out of your account.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, log me out!',
    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  })

  if (result.isConfirmed) {
    indexStore.clearUser()
    indexStore.clearCompany()
    await Swal.fire({
      title: 'Logged Out!',
      text: 'You have been successfully logged out.',
      timer: 1000,
      icon: 'success',
      showConfirmButton: false,
      
    ...(document.documentElement.classList.contains('dark') && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
    }).then(() => {
      router.push('/admin/login')
    })
  }
}
</script>
<template>
  <div class="relative" ref="target">
    <router-link
      class="flex items-center gap-4 justify-center"
      to="#"
      @click.prevent="dropdownOpen = !dropdownOpen"
    >
      <span class="hidden text-right lg:block">
        <span class="block text-sm font-medium text-black dark:text-white">
          {{ userData.userName }}
        </span>
        <span class="block text-xs font-medium">
          {{ userData.userRole }}
        </span>
      </span>

      <imageWithPreviewUser
        :model-value="userData.imageName"
        disabled
        class="object-cover rounded-full justify-center"
      />
    </router-link>

    <!-- Dropdown Start -->
    <div
      v-show="dropdownOpen"
      class="absolute right-0 mt-4 flex w-62.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
    >
      <ul class="flex flex-col gap-5 border-b border-stroke px-6 py-7.5 dark:border-strokedark">
        <li>
          <router-link
            to="/admin/profile"
            class="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          >
            <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path :d="mdiAccountOutline" fill="" />
            </svg>
            My Profile
          </router-link>
        </li>
        <li>
          <router-link
            to="/admin/pages/settings"
            class="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
          >
            <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path :d="mdiCogOutline" fill="" />
            </svg>
            Account Settings
          </router-link>
        </li>
      </ul>

      <button
        class="flex items-center gap-3.5 py-4 px-6 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
        @click="logOut"
      >
        <svg class="fill-current" width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path :d="mdiLogout" fill="" />
        </svg>
        Log Out
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>
