<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import Navbar from '@/components/Header/Navbar.vue'
import axios from 'axios'
import { useIndexStore } from '@/stores'
import Swal from 'sweetalert2'
import { mdiChat, mdiCommentPlus, mdiArrowLeft, mdiSend } from '@mdi/js'
import mascot from '@/assets/images/background/mascot-profile.png'
import mascotbg from '@/assets/images/background/mascot-bg.png'

const indexStore = useIndexStore()

// Data utama
const dataTable = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 20
const showChatModal = ref(false)
const currentAduanId = ref('')
const percakapan = ref([])
const newMessage = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)
const mascotName = 'Himmel'
const mascotImage = mascot
const mascotBackground = mascotbg
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

    await fetchAduan()
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


// Chat
const openChat = async (aduanId: string) => {
  currentAduanId.value = aduanId
  showChatModal.value = true
  await axios.put(`http://localhost:4000/api/Modul_aduan/seen`, {
    aduanId,
    bySenderType: 'userEksternal',
  })
  await fetchPercakapan()
}
const closeChat = () => {
  showChatModal.value = false
  percakapan.value = []
  currentAduanId.value = ''
}
const fetchPercakapan = async () => {
  try {
    const { data } = await axios.get(`http://localhost:4000/api/Modul_aduan/percakapan/${currentAduanId.value}`)
    percakapan.value = data || []
  } catch (err) {
    console.error('❌ Gagal fetch percakapan', err)
  }
}
const handleSendMessage = async () => {
  const userId = indexStore.user?._id
  if (!newMessage.value.trim()) return
  try {
    await axios.post(`http://localhost:4000/api/Modul_aduan/percakapan`, {
      message: newMessage.value,
      aduanId: currentAduanId.value,
      sender: userId,
      senderType: 'userEksternal',
    })
    newMessage.value = ''
    await fetchPercakapan()
    scrollToBottom()
  } catch (err) {
    console.error('❌ Gagal kirim pesan', err)
  }
}
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}

// Interval Chat
let chatInterval: NodeJS.Timeout
const startChatInterval = () => {
  chatInterval = setInterval(async () => {
    await axios.put(`http://localhost:4000/api/Modul_aduan/seen`, {
      aduanId: currentAduanId.value,
      bySenderType: 'userEksternal',
    })
    await fetchPercakapan()
  }, 1000)
}
const stopChatInterval = () => {
  if (chatInterval) clearInterval(chatInterval)
}

watch(percakapan, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) scrollToBottom()
})
watch(showChatModal, (val) => {
  if (val) {
    startChatInterval()
    document.body.style.overflow = 'hidden'
  } else {
    stopChatInterval()
    document.body.style.overflow = 'auto'
  }
})

// Format Waktu
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
dayjs.extend(isToday)
const formatTime = (time) => dayjs(time).format('HH:mm')
const formatDateLabel = (time) => dayjs(time).isToday() ? 'Today' : dayjs(time).format('DD MMMM YYYY')
const showDateDivider = (msgs, index) => {
  if (index === 0) return true
  const current = dayjs(msgs[index].waktu).format('YYYY-MM-DD')
  const prev = dayjs(msgs[index - 1].waktu).format('YYYY-MM-DD')
  return current !== prev
}

// Fetch Aduan by UserId
const fetchAduan = async () => {
  try {
    const { data } = await axios.get(`http://localhost:4000/api/Modul_aduan/user/${indexStore.user?._id}`)
    dataTable.value = data || []
  } catch (err) {
    console.error('❌ Gagal fetch aduan', err)
  }
}
onMounted(() => {
  fetchAduan()
  setInterval(fetchAduan, 1000) // fetch setiap detik
})
setInterval(() => {
  if (!showChatModal.value) fetchAduan()
}, 1000)


// Pagination & Search
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return dataTable.value
  return dataTable.value.filter(item =>
    Object.values(item).join(' ').toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const totalItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredData.value.slice(start, start + itemsPerPage)
})
const visiblePages = computed(() => {
  const range = 2
  const start = Math.max(1, currentPage.value - range)
  const end = Math.min(totalPages.value, currentPage.value + range)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) currentPage.value = page
}

const isLastEksternalSeen = (index: number) => {
  const currentUserId = indexStore.user?._id?.toString();

  const lastSeenIndex = percakapan.value
    .map((item, i) => ({ item, i }))
    .filter(({ item }) =>
      item.senderType === 'userEksternal' &&
      item.seen === true &&
      item.sender &&
      (item.sender._id?.toString?.() === currentUserId)
    )
    .map(({ i }) => i)
    .pop(); // ambil index terakhir

  return index === lastSeenIndex;
};
</script>

<template>
  <Navbar />

  <div class="fixed inset-0 bg-[#1379F2] overflow-hidden pt-20 px-4 sm:px-8 mt-6">
    <div class="max-w-5xl mx-auto bg-white dark:bg-boxdark rounded-xl shadow-md p-6 h-[80vh] overflow-hidden flex flex-col">

      <!-- Top Controls -->
      <div v-if="!showChatModal" class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-black dark:text-white">Daftar Aduan</h2>
        <div class="flex items-center gap-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Cari aduan..."
            class="px-3 py-2 border rounded-md w-64 text-sm focus:outline-none dark:bg-meta-4 dark:text-white"
          />
          <button @click="showCreateModal = true" class="bg-black text-white p-2 rounded-md">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path :d="mdiCommentPlus" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Daftar Aduan / Kosong -->
      <div v-if="!showChatModal" class="overflow-y-auto pr-1 h-full">
        <div v-if="paginatedData.length">
          <div
            v-for="(item, index) in paginatedData"
            :key="index"
            class="border rounded-lg p-4 shadow-sm bg-white dark:bg-meta-4 text-black dark:text-white mb-4"
          >
            <!-- Tanggal & Badge -->
            <div class="flex justify-between items-center mb-2">
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ dayjs(item.createdAt).format('DD/MM/YYYY') }}
                </span>

                <!-- Badge Status -->
                <span
                  v-if="['Prioritize', 'Problem', 'Developer'].includes(item.status)"
                  class="text-xs font-medium px-2 py-0.5 rounded-full bg-red-600 text-white"
                >
                  Problem
                </span>
                <span
                  v-else-if="item.status === 'Solved'"
                  class="text-xs font-medium px-2 py-0.5 rounded-full bg-green-600 text-white"
                >
                  Solved
                </span>
              </div>

              <!-- Tombol Chat -->
              <button @click="openChat(item._id)" class="relative">
                <svg class="w-6 h-6" viewBox="0 0 24 24">
                  <path :d="mdiChat" fill="currentColor" />
                </svg>
                <span
                  v-if="item.unreadCount > 0"
                  class="absolute -top-1.5 -right-1.5 w-4 h-4 text-[10px] rounded-full bg-red-600 text-white flex items-center justify-center"
                >
                  {{ item.unreadCount }}
                </span>
              </button>
            </div>

            <!-- Aduan -->
            <div class="text-sm mb-2"><strong>Aduan:</strong> {{ item.aduan }}</div>

            <!-- Deskripsi -->
            <blockquote
              v-if="item.description"
              class="border-l-4 border-gray-400 dark:border-gray-600 pl-4 italic text-sm text-gray-600 dark:text-gray-300 mb-2"
            >
              {{ item.description }}
            </blockquote>

            <!-- Solusi -->
            <div class="text-sm"><strong>Solusi:</strong> {{ item.solusi || '-' }}</div>
          </div>
        </div>

        <div v-else class="flex flex-col justify-center items-center h-full">
          <img :src="mascotBackground" alt="Mascot" class="w-60 opacity-80" />
          <p class="mt-6 text-white dark:text-white/80 text-lg font-semibold italic tracking-wide">
            Tidak ada laporan masalah yang diajukan
          </p>
        </div>
      </div>

      <!-- Chat Section -->
      <div
        v-if="showChatModal"
        class="flex flex-col h-full"
      >
        <!-- Header Chat -->
        <div class="flex items-center gap-3 mb-4">
          <button @click="closeChat" class="text-primary">
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path :d="mdiArrowLeft" fill="currentColor" />
            </svg>
          </button>
          <img :src="mascotImage" alt="Himmel" class="h-10 w-10 object-cover rounded-full" />
          <span class="text-sm font-medium text-black dark:text-white">Himmel</span>
        </div>

        <!-- Chat Messages -->
        <div ref="chatContainerRef" class="flex-1 overflow-y-auto px-2 space-y-3">
          <div v-for="(msg, i) in percakapan" :key="i">
            <div v-if="showDateDivider(percakapan, i)" class="text-center text-xs text-gray-400 my-2">
              {{ formatDateLabel(msg.waktu) }}
            </div>

            <div class="flex flex-col"
              :class="msg.senderType === 'userEksternal' ? 'items-end' : 'items-start'">
              <div
                class="py-2 pb-5 pl-4 pr-12 rounded-lg text-sm relative break-words"
                :class="msg.senderType === 'userEksternal'
                  ? 'bg-primary text-white max-w-[80%]'
                  : 'bg-gray-200 dark:bg-meta-4 text-black dark:text-white max-w-sm'"
              >
                {{ msg.message }}
                <span class="absolute text-[10px]"
                  :class="msg.senderType === 'userEksternal' 
                    ? 'text-white/70 bottom-1 right-2' 
                    : 'text-black/40 dark:text-white/40 bottom-1 right-2'"
                >
                  {{ formatTime(msg.waktu) }}
                </span>
              </div>
              <!-- Seen text -->
              <span
                v-if="msg.senderType === 'userEksternal' && isLastEksternalSeen(i)"
                class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mr-1 block text-right"
              >
                seen
              </span>
            </div>
          </div>
        </div>

        <!-- Input Chat -->
        <div class="border-t mt-4 pt-3 flex items-center gap-2 dark:border-strokedark">
          <input v-model="newMessage" @keyup.enter="handleSendMessage" type="text"
            placeholder="Ketik pesan..."
            class="w-full px-3 py-2 rounded bg-gray-100 dark:bg-meta-4 text-sm focus:outline-none dark:text-white" />
          <button @click="handleSendMessage" class="text-primary">
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path :d="mdiSend" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>

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
  </div>
</template>
