<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import imageWithPreviewUser from "@/components/Forms/SelectGroup/imageWithPreviewUserPPE.vue"
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useIndexStore } from '@/stores'
import axios from 'axios'
import Swal from 'sweetalert2'
import { mdiAccountAlert , mdiEyeOutline, mdiForumOutline , mdiMagnify, mdiRefresh, mdiAccountCheck , mdiTooltipEditOutline, mdiArrowLeft, mdiSend, mdiPin  } from '@mdi/js'

const indexStore = useIndexStore()
const pageTitle = ref('Laporan - Masalah Pelanggan')
const pageList = ref(['Laporan', 'Masalah Pelanggan'])

const dataHeader = ref([
  { name: 'No.', class: 'py-2 pl-3' },
  { name: 'Priority', class: 'min-w-[100px] py-2 px-4' },
  { name: 'Tanggal', class: 'min-w-[100px] py-2 px-4' },
  { name: 'ID User', class: 'min-w-[100px] py-2 px-4' },
  { name: 'Nama User', class: 'min-w-[150px] py-2 px-4' },
  { name: 'No.Telp User', class: 'min-w-[150px] py-2 px-4' },
  { name: 'Email User', class: 'min-w-[150px] py-2 px-4' },
  { name: 'Aduan', class: 'min-w-[200px] py-2 px-4' },
  { name: 'Solusi', class: 'min-w-[200px] py-2 px-4' },
])
const selectedDescription = ref('')
const showDescModal = ref(false)

const openDescriptionModal = (desc: string) => {
  selectedDescription.value = desc
  showDescModal.value = true
}


let dataTable = ref([])
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 20

const showSolusiModal = ref(false)
const showStatusModal = ref(false)
const solusiText = ref('')
const selectedAduanId = ref('')


const showChatModal = ref(false)
const currentAduanId = ref('')
const currentUserInfo = ref({ userName: '', imageName: '', _id: '' })
const percakapan = ref([])
const newMessage = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)

let chatInterval: NodeJS.Timeout

const openSolusiModal = (aduanId) => {
  selectedAduanId.value = aduanId
  showSolusiModal.value = true
  showStatusModal.value = false
  solusiText.value = ''
}

const submitSolusi = async () => {
  if (!solusiText.value.trim()) return

  try {
    const { _id: modul_pic } = indexStore.user
    await axios.put('http://localhost:4000/api/Modul_aduan/solusi', {
      aduanId: selectedAduanId.value,
      solusi: solusiText.value,
      modul_pic
    })
    showSolusiModal.value = false
    await fetchAduan()
  } catch (err) {
    console.error('Gagal submit solusi:', err)
  }
}

const openStatusModal = () => {
  showSolusiModal.value = false
  showStatusModal.value = true
}

const changeStatus = async (status) => {
  try {
    const { _id: modul_pic } = indexStore.user
    await axios.put('http://localhost:4000/api/Modul_aduan/status', {
      aduanId: selectedAduanId.value,
      status,
      modul_pic
    })
    showStatusModal.value = false
    await fetchAduan()
  } catch (err) {
    console.error('Gagal ubah status:', err)
  }
}


const openChat = async (aduanId: string, userInfo: any) => {
  currentAduanId.value = aduanId
  currentUserInfo.value = userInfo
  showChatModal.value = true

  // urutan: mark seen dulu → baru fetch
  await axios.put(`http://localhost:4000/api/Modul_aduan/seen`, {
    aduanId: aduanId,
    bySenderType: "userInternal"
  })
  await fetchPercakapan()
}

const closeChat = () => {
  showChatModal.value = false
  currentAduanId.value = ''
  percakapan.value = []
}

const fetchAduan = async () => {
  try {
    const { data } = await axios.get('http://localhost:4000/api/Modul_aduan/status/Developer')
    dataTable.value = data || []
  } catch (err) {
    console.error('Gagal fetch aduan', err)
  }
}



const fetchPercakapan = async () => {
  try {
    const { data } = await axios.get(`http://localhost:4000/api/Modul_aduan/percakapan/${currentAduanId.value}`)
    percakapan.value = data || []
    console.log('Percakapan:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Gagal fetch percakapan', err)
  }
}

import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
dayjs.extend(isToday)
dayjs.extend(isSameOrBefore)

// Format jam untuk chat bubble
const formatTime = (timestamp) => {
  return dayjs(timestamp).format('HH:mm')
}

// Format tanggal header seperti "Today" atau "17 Juni 2025"
const formatDateLabel = (timestamp) => {
  const date = dayjs(timestamp)
  return date.isToday() ? 'Today' : date.format('DD MMMM YYYY')
}

// Menentukan apakah perlu tampilkan tanggal pemisah
const showDateDivider = (msgs, index) => {
  if (index === 0) return true
  const currentDate = dayjs(msgs[index].waktu).format('YYYY-MM-DD')
  const prevDate = dayjs(msgs[index - 1].waktu).format('YYYY-MM-DD')
  return currentDate !== prevDate
}



const handleSendMessage = async () => {
  const userId = indexStore.user?._id
  if (!newMessage.value.trim()) return
  try {
    await axios.post(`http://localhost:4000/api/Modul_aduan/percakapan/`, {
      message: newMessage.value,
      aduanId: currentAduanId.value,
      sender: userId,
      senderType: 'userInternal'
    })
    newMessage.value = ''
    await fetchPercakapan()
    scrollToBottom()
  } catch (err) {
    console.error('Gagal kirim pesan', err)
  }
}

const startRoomChatInterval = () => {
  chatInterval = setInterval(async () => {
    // mark as seen dulu
    await axios.put(`http://localhost:4000/api/Modul_aduan/seen`, {
      aduanId: currentAduanId.value,
      bySenderType: "userInternal"
    })
    await fetchPercakapan()
  }, 1000)
}

const stopRoomChatInterval = () => {
  if (chatInterval) clearInterval(chatInterval)
}

const scrollToBottom = () => {
  nextTick(() => {
    const container = chatContainerRef.value
    if (container) container.scrollTop = container.scrollHeight
  })
}

watch(percakapan, (newVal, oldVal) => {
  if (newVal.length > oldVal.length) {
    scrollToBottom()
  }
})

watch(showChatModal, (newVal) => {
  if (newVal) {
    startRoomChatInterval()
  } else {
    stopRoomChatInterval()
  }
})

watch(() => showChatModal, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = 'auto'
  }
})


onMounted(async () => {
  await fetchAduan()
  setInterval(fetchAduan, 1000)
})


// Pagination & Search
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return dataTable.value
  return dataTable.value.filter(item =>
    Object.values(item).join(" ").toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
const totalItems = computed(() => filteredData.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage))
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredData.value.slice(start, end)
})
const visiblePages = computed(() => {
  const range = 2
  let start = Math.max(1, currentPage.value - range)
  let end = Math.min(totalPages.value, currentPage.value + range)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) currentPage.value = page
}

const isLastInternalSeen = (index: number) => {
  const currentUserId = indexStore.user?._id?.toString();

  const lastSeenIndex = percakapan.value
    .map((item, i) => ({ item, i }))
    .filter(({ item }) =>
      item.senderType === 'userInternal' &&
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
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <div class="flex flex-col gap-10">
    
  <div v-if="!showChatModal"
    class="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5">

    <!-- Search and Helper -->
        <div
          class="helper border-2 flex justify-between bg-gray-2 text-left dark:bg-meta-4 text-black dark:text-white py-2 px-4"
        >
        <div class="left-data">
              <div class="relative">
            <button class="absolute top-1/2 left-0 -translate-y-1/2">
              <svg
                class="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  :d="mdiMagnify"
                  fill=""
                />
              </svg>
            </button>

            <input
                type="text"
                placeholder="Type to search..."
                class="w-full xl:w-125 bg-transparent pr-4 pl-9 focus:outline-none"
                v-model="searchQuery"
              />
          </div>
            </div>
            <div class="right-data flex items-center flex-row-reverse">
              <button class="px-1">
              <svg 
                class="fill-current hover:text-primary"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                  <path :d="mdiRefresh" fill=""/>
                  </svg>
              </button>
            </div>
          </div>
    <div class="max-w-full overflow-x-auto">
      <table class="w-full table-auto">
        <thead>
          <tr class="bg-gray-2 text-left dark:bg-meta-4">
          <th v-for="data in dataHeader" :class="data.class" class="font-medium text-black dark:text-white text-center">
          {{ data.name }}
          </th>
          <th class="py-2 px-4 font-medium text-black dark:text-white text-center">
            Opsi
          </th>
          </tr>
        </thead>
        <tbody>
          <tr 
  v-for="(item, index) in paginatedData"
  :key="index"
  :class="[
    'border',
    item.status === 'Prioritize' ? 'bg-yellow-100 dark:bg-yellow-700' : '',
  ]"
>
                <td class="pl-3 text-xs border">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
             <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white">{{ item.priority }}</p>
            </td>
            <td class="py-1 px-4 border">
  <p class="text-black dark:text-white text-xs">
    {{ dayjs(item.createdAt).format('DD/MM/YYYY') }}
  </p>
</td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs">
  {{ item.userId?._id === '64dffd9f9ee78b9a0d000000' ? 'Unknown ID' : item.userId?._id }}
</p>

            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white text-center">{{ item.userId?.userName || item.nama }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white">{{ item.noTelp }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white">{{ item.email }}</p>
            </td>
            <td class="py-1 px-4 border cursor-pointer hover:underline"
    @click="openDescriptionModal(item.description)">
  <h5 class="font-medium text-black text-xs dark:text-white">{{ item.aduan }}</h5>
</td>
            <td class="py-1 px-4 text-center border">
              <h5 class="font-medium text-black text-xs dark:text-white text-left">{{ item.solusi }}</h5>
            </td>
            <td class="py-1 px-4">
              <div class="flex items-center space-x-3.5 d-flex justify-center">              
                
                <router-link :class="item.Tr_teknis_status === 'closed' ? 'cursor-default opacity-50' : 'hover:text-primary'" class="" :to="'/modules/master/user-eksternal/detail/'+item.userId._id">
                <svg
                  class="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiEyeOutline" fill="#"/>
                </svg>
              </router-link>

            <button @click="openChat(item._id, item.userId)" class="relative">
  <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
    <path :d="mdiForumOutline" fill="#"/>
  </svg>
  <!-- Badge -->
  <span v-if="item.unreadCount > 0"
        class="absolute -top-1.5 -right-1.5 w-4 h-4 text-[10px] rounded-full bg-red-600 text-white flex items-center justify-center">
    {{ item.unreadCount }}
  </span>
</button>


              <button 
  :class="item.status === 'Solved' ? 'cursor-default opacity-50' : 'hover:text-primary'" 
  @click="item.status !== 'Solved' && openSolusiModal(item._id)"
>
  <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
    <path :d="mdiTooltipEditOutline" fill="#"/>
  </svg>
</button>


              </div>
            </td>
          </tr> 
        </tbody>
      </table>
      
    </div>
<!-- Modal Solusi -->
<div v-if="showSolusiModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
  <div class="bg-white dark:bg-meta-4 p-6 rounded-lg w-full max-w-md relative">
    <h4 class="text-lg font-semibold text-black dark:text-white mb-3">Tambah Solusi</h4>
    <div class="flex items-center space-x-2">
      <!-- Ganti status -->
      <button @click="openStatusModal">
        <svg class="fill-current text-primary" width="24" height="24" viewBox="0 0 24 24">
          <path :d="mdiTooltipEditOutline" fill="currentColor" />
        </svg>
      </button>

      <!-- Input solusi -->
      <input
        type="text"
        v-model="solusiText"
        placeholder="Tulis solusi..."
        class="flex-1 px-3 py-2 border rounded text-sm dark:bg-meta-2 dark:text-white"
      />

      <!-- Kirim solusi -->
      <button @click="submitSolusi">
        <svg class="fill-current text-primary" width="24" height="24" viewBox="0 0 24 24">
          <path :d="mdiSend" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</div>

<!-- Modal Solusi -->
<div
  v-if="showSolusiModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all"
  @click.self="showSolusiModal = false"
>
  <div class="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative shadow-lg transition-all duration-300">
    <h4 class="text-lg font-semibold text-black dark:text-white mb-3">Tambah Solusi</h4>

    <div class="flex items-start space-x-3">
      <!-- Tombol Edit -->
      <button @click="openStatusModal" class="text-primary hover:text-primary/80 transition mt-1">
        <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
          <path :d="mdiTooltipEditOutline" fill="currentColor" />
        </svg>
      </button>

      <!-- Textarea -->
      <textarea
        v-model="solusiText"
        placeholder="Tulis solusi lengkap..."
        rows="3"
        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded text-sm 
               text-black dark:text-white dark:bg-gray-700 focus:outline-none 
               focus:ring-2 focus:ring-primary transition resize-none"
      ></textarea>

      <!-- Tombol Kirim -->
      <button @click="submitSolusi" class="text-primary hover:text-primary/80 transition mt-1">
        <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
          <path :d="mdiSend" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</div>


<!-- Modal Ubah Status -->
<div
  v-if="showStatusModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
  @click.self="showStatusModal = false"
>
  <div class="bg-white dark:bg-meta-4 p-6 rounded-lg w-full max-w-sm relative">
    <h4 class="text-lg font-semibold text-black dark:text-white mb-4">Ubah Status</h4>
    <div class="grid grid-cols-2 gap-3">
      <button
        @click="changeStatus('Problem')"
        class="py-2 px-4 rounded bg-yellow-400 text-white hover:bg-yellow-500 text-sm"
      >Problem</button>
      <button
        @click="changeStatus('Prioritize')"
        class="py-2 px-4 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
      >Prioritize</button>
      <button
        @click="changeStatus('Developer')"
        class="py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 text-sm"
      >Developer</button>
      <button
        @click="changeStatus('Solved')"
        class="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 text-sm"
      >Solved</button>
    </div>
  </div>
</div>
 


<!-- Pagination and Total Data -->
<div class="mt-4 flex justify-between items-center">
          <p class="text-sm">Total Data: {{ totalItems }}</p>
          <div class="flex space-x-2">
            <!-- Previous Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Prev
            </button>

            <!-- First Page -->
            <button
              v-if="currentPage > 3"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(1)"
            >
              1
            </button>

            <!-- Ellipsis Before -->
            <span v-if="currentPage > 4" class="text-xs px-2 py-1">...</span>

            <!-- Visible Page Buttons -->
            <button
              v-for="page in visiblePages"
              :key="page"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :class="currentPage === page ? 'bg-primary text-white' : ''"
              @click="changePage(page)"
            >
              {{ page }}
            </button>

            <!-- Ellipsis After -->
            <span v-if="currentPage < totalPages - 3" class="text-xs px-2 py-1">...</span>

            <!-- Last Page -->
            <button
              v-if="currentPage < totalPages - 2"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <!-- Next Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>

  </div>
  
  
  <!-- Chat View -->
  <div v-else
  class="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 h-[71vh] flex flex-col">
 
    <!-- Header Chat -->
    <div class="flex items-center gap-3 mb-4">
      <button @click="closeChat" class="text-primary">
        <svg class="w-6 h-6" viewBox="0 0 24 24">
          <path :d="mdiArrowLeft" fill="currentColor" />
        </svg>
      </button>
      <imageWithPreviewUser
  :model-value="currentUserInfo.imageName"
  disabled
  class="h-10 w-10 object-cover rounded-full"
/>

      <span class="text-sm text-black dark:text-white">{{ currentUserInfo.userName }}</span>
    </div>

   <!-- Chat Messages -->
<div ref="chatContainerRef" class="flex-1 overflow-y-auto px-2 space-y-3 relative">
  <div v-for="(msg, i) in percakapan" :key="i">

    <!-- Date divider -->
    <div v-if="showDateDivider(percakapan, i)" class="text-center text-xs text-gray-400 my-2">
      {{ formatDateLabel(msg.waktu) }}
    </div>

   <!-- Message bubble -->
<div class="flex flex-col"
  :class="msg.senderType === 'userInternal' ? 'items-end' : 'items-start'">

  <div
    class="py-2 pb-5 pl-4 pr-12 rounded-lg text-sm relative break-words"
    :class="[
      msg.senderType === 'userInternal'
        ? 'bg-primary text-white max-w-[80%]'
        : 'bg-gray-200 dark:bg-meta-4 text-black dark:text-white max-w-sm'
    ]"
  >
    {{ msg.message }}

    <!-- Time -->
    <span
      class="absolute text-[10px]"
      :class="msg.senderType === 'userInternal'
        ? 'text-white/70 bottom-1 right-2'
        : 'text-black/40 dark:text-white/40 bottom-1 right-2'"
    >
      {{ formatTime(msg.waktu) }}
    </span>
  </div>

  <!-- Seen -->
  <span v-if="msg.senderType === 'userInternal' && isLastInternalSeen(i)"
    class="text-[10px] text-gray-400 mt-1 block">
    seen
  </span>
</div>

  </div>
</div>



    <!-- Input -->
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
<!-- Modal Description -->
<div
  v-if="showDescModal"
  class="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-sm transition-all duration-200"
  @click.self="showDescModal = false"
>
  <div class="bg-white dark:bg-boxdark rounded-lg w-full max-w-lg p-6 shadow-xl">
    <h3 class="text-lg font-bold text-gray-800 dark:text-white mb-4">Deskripsi Aduan</h3>
    <p class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line max-h-[60vh] overflow-y-auto">
      {{ selectedDescription }}
    </p>
    <div class="flex justify-end mt-6">
      <button
        @click="showDescModal = false"
        class="px-4 py-2 rounded bg-primary text-white text-sm hover:bg-primary-dark"
      >
        Tutup
      </button>
    </div>
  </div>
</div>


  </DefaultLayout>

</template>
