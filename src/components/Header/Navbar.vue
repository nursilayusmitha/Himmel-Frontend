<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useIndexStore } from '@/stores'
import axios from 'axios'
import { getUserEksternalById } from '@/stores/functionAPI'
import imageWithPreviewUser from '@/components/Forms/SelectGroup/imageWithPreviewUserPPE.vue'
import DarkModeSwitcher from './DarkModeSwitcher.vue'
import { mdiAccount, mdiMenuDown } from '@mdi/js'

import Swal from 'sweetalert2'

const indexStore = useIndexStore()
const route = useRoute()
const router = useRouter()

const dropdownVisible = ref(false)
const profileDropdownVisible = ref(false)
const mobileMenuVisible = ref(false)
const showCreateModal = ref(false)

// Form Aduan Baru
const newAduan = ref({
  nama: indexStore.user?.userName || '',
  phone: indexStore.user?.userPhone || '',
  email: indexStore.user?.email || '',
  priority: '',
  aduan: '',
  description: ''
})

const resetAduanForm = () => {
  newAduan.value = {
    nama: indexStore.user?.userName || '',
    phone: indexStore.user?.userPhone || '',
    email: indexStore.user?.email || '',
    priority: '',
    aduan: '',
    description: ''
  }
  showCreateModal.value = false
}

// Kirim aduan baru
const handleSubmitAduan = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')

  // Setup Toast
  const Toast = Swal.mixin({
    toast: true,
    position: 'center',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    ...(isDarkMode && {
      background: '#1f2937',       // Tailwind dark gray-800
      color: '#f9fafb',            // Tailwind gray-100
      iconColor: '#facc15',        // Tailwind yellow-400
    }),
  })

  try {
    await axios.post(`http://localhost:4000/api/Modul_aduan/create`, {
      nama: newAduan.value.nama,
      noTelp: newAduan.value.phone,
      email: newAduan.value.email,
      priority: newAduan.value.priority,
      aduan: newAduan.value.aduan,
      description: newAduan.value.description,
      userId: indexStore.user?._id ?? undefined,
    })

    resetAduanForm()

    Toast.fire({
      icon: 'success',
      title: 'Aduan berhasil dikirim',
    })
  } catch (err) {
    console.error('❌ Gagal kirim aduan', err)

    Toast.fire({
      icon: 'error',
      title: 'Gagal kirim aduan, field belum terisi lengkap',
    })
  }
}


const userData = ref({
  userName: '',
  userRole: '',
  imageName: null
})

onMounted(async () => {
  const result = await getUserEksternalById(indexStore.user._id)
  if (result) {
    userData.value = {
      userName: result.userName || '',
      userRole: result.userRole || '',
      imageName: result.imageName || null
    }
  }
})

const isLoggedIn = computed(() => !!indexStore.user.userName)

const toggleDropdown = () => {
  dropdownVisible.value = !dropdownVisible.value
  if (dropdownVisible.value) profileDropdownVisible.value = false
}

const toggleDropdownProfile = () => {
  profileDropdownVisible.value = !profileDropdownVisible.value
  if (profileDropdownVisible.value) {
    dropdownVisible.value = false
    mobileMenuVisible.value = false
  }
}

const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
  if (mobileMenuVisible.value) {
    profileDropdownVisible.value = false
    dropdownVisible.value = false
  }
}

// Mutual exclusive dropdowns on mobile
watch(mobileMenuVisible, (val) => {
  if (val) profileDropdownVisible.value = false
})

watch(profileDropdownVisible, (val) => {
  if (val) mobileMenuVisible.value = false
})

const handleLogout = () => {
  indexStore.clearUser()
  router.push('/')
}
</script>
<template>
  <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
    <div class="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3">
      <!-- Logo -->
      <router-link to="/" class="flex items-center">
        <img src="@/assets/images/logo/logo-blue.svg" alt="Logo" class="h-14" />
      </router-link>

      <!-- Mobile Buttons -->
      <div class="flex items-center md:hidden gap-3">
        <!-- Profile Dropdown (mobile) -->
        <div v-if="isLoggedIn" class="relative">
          <button @click="toggleDropdownProfile" class="w-10 h-10 border-2 border-gray-300 rounded-full overflow-hidden">
            <imageWithPreviewUser :model-value="userData.imageName" disabled class="w-full h-full object-cover" />
          </button>
          <div v-if="profileDropdownVisible"
               class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-50">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li class="px-4 py-2 flex items-center justify-between gap-2">
                <span>Mode</span>
                <DarkModeSwitcher />
              </li>
              <li>
                <router-link to="/profile" class="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  Profile
                </router-link>
              </li>
              <li>
                <button @click="handleLogout"
                        class="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Hamburger -->
        <div class="relative">
          <button @click="toggleMobileMenu" class="p-2 text-gray-600 dark:text-gray-300">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <!-- Hamburger Dropdown -->
          <div v-if="mobileMenuVisible"
               class="absolute right-0 mt-2 w-60 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-50">
            <ul class="flex flex-col gap-1 py-2 px-3 text-sm text-gray-900 dark:text-white">
              <li>
                <router-link to="/special-offer" class="block px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  Special Offer
                </router-link>
              </li>
              <li>
                <router-link to="/orders" class="block px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  Pesanan
                </router-link>
              </li>
              <li>
                <button
                  @click="toggleDropdown"
                  class="flex items-center w-full text-left px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition"
                >
                  Bantuan
                  <svg class="w-4 h-4 ml-1" fill="currentColor"><path :d="mdiMenuDown" /></svg>
                </button>
                <div v-if="dropdownVisible" class="pl-4 mt-1 flex flex-col gap-1 text-sm text-gray-700 dark:text-gray-300">
                  <router-link to="/customer-service" class="block py-1 hover:underline">Customer Service</router-link>
                  <template v-if="isLoggedIn">
  <router-link to="/aduan-masalah" class="block py-1 hover:underline">Laporkan Masalah</router-link>
</template>
<template v-else>
  <button @click="showCreateModal = true" class="block text-left w-full py-1 hover:underline">
    Laporkan Masalah
  </button>
</template>
                </div>
              </li>
              <template v-if="!isLoggedIn">
                <li class="mt-2">
                  <router-link to="/sign-in">
                    <button class="w-full border border-[#009ee5] text-[#009ee5] px-3 py-2 rounded-lg text-sm hover:bg-[#f0faff] transition">
                      Masuk
                    </button>
                  </router-link>
                </li>
                <li>
                  <router-link to="/sign-up">
                    <button class="w-full bg-[#009ee5] hover:bg-[#094fa4] text-white px-3 py-2 rounded-lg text-sm transition">
                      Daftar
                    </button>
                  </router-link>
                </li>
              </template>
            </ul>
          </div>
        </div>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center gap-6">
        <router-link to="/special-offer" class="text-gray-900 dark:text-white hover:underline">Special Offer</router-link>
        <router-link to="/orders" class="text-gray-900 dark:text-white hover:underline">Pesanan</router-link>

        <!-- Bantuan Dropdown -->
        <div class="relative">
          <button @click="toggleDropdown" class="flex items-center text-gray-900 dark:text-white">
            Bantuan
            <svg class="w-5 h-5 ml-1" fill="currentColor"><path :d="mdiMenuDown" /></svg>
          </button>
          <div v-if="dropdownVisible"
               class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-50">
            <ul class="text-sm text-gray-700 dark:text-gray-200">
              <li>
                <router-link to="/customer-service" class="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  Customer Service
                </router-link>
              </li>
              <li>
               <template v-if="isLoggedIn">
  <router-link to="/aduan-masalah"
    class="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
    Laporkan Masalah
  </router-link>
</template>
<template v-else>
  <button @click="showCreateModal = true"
    class="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
    Laporkan Masalah
  </button>
</template>

              </li>
            </ul>
          </div>
        </div>

        <!-- Auth/Profile (desktop) -->
        <div v-if="!isLoggedIn" class="flex gap-3">
          <router-link to="/sign-in">
            <button class="flex items-center border border-[#009ee5] text-[#009ee5] px-4 py-2 rounded-lg text-sm hover:bg-[#f0faff] transition">
              <svg class="w-5 h-5 mr-2" fill="#009ee5" viewBox="0 0 24 24"><path :d="mdiAccount" /></svg>
              Masuk
            </button>
          </router-link>
          <router-link to="/sign-up">
            <button class="bg-[#009ee5] hover:bg-[#094fa4] text-white px-4 py-2 rounded-lg text-sm transition">Daftar</button>
          </router-link>
        </div>

        <div v-else class="relative">
          <button @click="toggleDropdownProfile" class="w-10 h-10 border-2 border-gray-300 rounded-full overflow-hidden">
            <imageWithPreviewUser :model-value="userData.imageName" disabled class="w-full h-full object-cover" />
          </button>
          <div v-if="profileDropdownVisible"
               class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 shadow-lg rounded-lg z-50">
            <ul class="py-2 text-sm text-gray-700 dark:text-gray-200">
              <li class="px-4 py-2 flex items-center justify-between gap-2">
                <span>Mode</span>
                <DarkModeSwitcher />
              </li>
              <li>
                <router-link to="/profile" class="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  Profile
                </router-link>
              </li>
              <li>
                <button @click="handleLogout"
                        class="block w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Modal Create Aduan -->
    <div
      v-if="showCreateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div class="bg-white dark:bg-boxdark rounded-lg w-full max-w-xl p-6 shadow-lg relative">
        <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Buat Laporan Aduan</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input v-model="newAduan.nama" type="text" placeholder="Nama"
            class="px-3 py-2 border rounded w-full dark:bg-meta-4 dark:text-white focus:outline-none" />
          <input v-model="newAduan.phone" type="text" placeholder="No. Telepon"
            class="px-3 py-2 border rounded w-full dark:bg-meta-4 dark:text-white focus:outline-none" />
          <input v-model="newAduan.email" type="email" placeholder="Email"
            class="px-3 py-2 border rounded w-full dark:bg-meta-4 dark:text-white focus:outline-none" />

          <select v-model="newAduan.priority"
            class="px-3 py-2 border rounded w-full dark:bg-meta-4 dark:text-white focus:outline-none">
            <option disabled value="">Priority</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <input v-model="newAduan.aduan" type="text" placeholder="Aduan"
            class="px-3 py-2 border rounded w-full dark:bg-meta-4 dark:text-white focus:outline-none sm:col-span-2" />

          <textarea v-model="newAduan.description" rows="4" placeholder="Deskripsi"
            class="px-3 py-2 border rounded w-full dark:bg-meta-4 dark:text-white focus:outline-none sm:col-span-2"></textarea>
        </div>

        <div class="flex justify-end mt-6 gap-3">
          <button @click="resetAduanForm"
            class="px-4 py-2 rounded bg-gray-300 dark:bg-white/10 text-gray-700 dark:text-white text-sm hover:bg-gray-400">
            Batal
          </button>
          <button
            class="px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary/90" @click="handleSubmitAduan">
            Kirim Laporan
          </button>
        </div>
      </div>
    </div>
</template>
