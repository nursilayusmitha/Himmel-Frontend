<script setup lang="ts">
import axios from 'axios'
import { ref, computed, onMounted, nextTick, watch,onUnmounted } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useIndexStore } from '@/stores'
import Swal from 'sweetalert2'
import imageWithPreviewUser from "@/components/Forms/SelectGroup/imageWithPreviewUserPPE.vue"
import { mdiAccountAlert , mdiEyeOutline, mdiForumOutline , mdiMagnify, mdiTooltipCheck , mdiAccountCheck , mdiTooltipEditOutline, mdiArrowLeft, mdiSend, mdiPin  } from '@mdi/js'


const indexStore = useIndexStore()
const pageTitle = ref('Informasi - Pertanyaan Diajukan')
const pageList = ref (['Informasi', 'Pertanyaan Diajukan'])

const chatData = ref([])
const searchQuery = ref('')

const isChatDoneView = ref(false)
const showChatModal = ref(false)
const currentAduanId = ref('')
const currentUserInfo = ref({ userName: '', imageName: '', _id: '' })
const percakapan = ref([])
const newMessage = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)

let chatInterval: NodeJS.Timeout



const openChat = async (aduanId: string, userInfo: any) => {
  console.log("AduanID:", aduanId)
  console.log("User Info:", userInfo)

  currentAduanId.value = aduanId
  currentUserInfo.value = userInfo
  showChatModal.value = true

  try {
    await axios.put(`http://localhost:4000/api/Modul_aduan/seen`, {
      aduanId,
      bySenderType: "userInternal"
    })
    await fetchPercakapan()
  } catch (e) {
    console.error("Gagal open chat:", e)
  }
}


const closeChat = () => {
  showChatModal.value = false
  currentAduanId.value = ''
  percakapan.value = []
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


// Ambil daftar chat (last message)
const fetchChats = async () => {
  try {
    const userId = indexStore.user?._id
    if (!userId) return
    const res = await axios.get(`http://localhost:4000/api/Modul_aduan/last-message/${userId}`)
    const chats = res.data.map((item: any) => ({
  _id: item.aduanId,
  imageName: item.imageName,
  userID: item.userID, // tetap pakai userID
  name: item.name,
  text: item.lastMessage,
  time: formatToTime(item.lastTime),
  textCount: item.unreadCount,
}))
    chatData.value = chats
  } catch (err) {
    console.error('Gagal fetch last messages:', err)
  }
}

const fetchChatDone = async (setView = true) => {
  try {
    const userId = indexStore.user?._id
    if (!userId) return
    const res = await axios.get(`http://localhost:4000/api/Modul_aduan/last-message-done/${userId}`)
    const chats = res.data.map((item: any) => ({
      _id: item.aduanId,
      imageName: item.imageName,
      userID: item.userID,
      name: item.name,
      text: item.lastMessage,
      time: formatToTime(item.lastTime),
      textCount: item.unreadCount,
    }))
    chatData.value = chats
    if (setView) isChatDoneView.value = true
  } catch (err) {
    console.error('Gagal fetch last message done:', err)
  }
}



const backToChatList = async () => {
  isChatDoneView.value = false
  await fetchChats()
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

// Format jam
const formatToTime = (isoTime: string) => dayjs(isoTime).format('HH:mm')


// Format tanggal header seperti "Today" atau "17 Juni 2025"
const formatDateLabel = (timestamp) => {
  const date = dayjs(timestamp)
  return date.isToday() ? 'Today' : date.format('DD MMMM YYYY')
}

// Menentukan apakah perlu tampilkan tanggal pemisah
const showDateDivider = (msgs, index) => {
  if (index === 0) return true
  const currentDate = dayjs(msgs[index].createdAt).format('YYYY-MM-DD')
  const prevDate = dayjs(msgs[index - 1].createdAt).format('YYYY-MM-DD')
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

const markAsDone = async (aduanId: string) => {
  const userId = indexStore.user?._id
  if (!userId) return

  try {
    await axios.put('http://localhost:4000/api/Modul_aduan/status', {
      aduanId,
      status: "Done",
      modul_pic: userId
    })

    Swal.fire({
      icon: 'success',
      title: 'Berhasil',
      text: 'Status diubah menjadi Done.'
    })

    await fetchChats()
  } catch (err) {
    console.error("Gagal ubah status:", err)
    Swal.fire({
      icon: 'error',
      title: 'Gagal',
      text: 'Tidak bisa mengubah status.'
    })
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


onUnmounted(() => {
  clearInterval(chatListInterval)
  clearInterval(chatInterval)
})



let chatListInterval: NodeJS.Timeout

onMounted(() => {
  fetchChats()

  chatListInterval = setInterval(() => {
    if (isChatDoneView.value) {
      fetchChatDone(false) // tanpa ubah tampilan
    } else {
      fetchChats()
    }
  }, 1000)

  nextTick(() => {
    const container = document.querySelector('.chat-content-scroll') as HTMLElement
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
  })
})



// Filter chat berdasarkan search
const filteredChatData = computed(() => {
  if (!searchQuery.value) return chatData.value
  return chatData.value.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})



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
    
  <div
    class="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 h-[71vh] flex flex-col"
  >
         <!-- Jika belum memilih chat -->
    <template v-if="!showChatModal">
      <div class="relative mb-6 px-7.5">
  <!-- Tombol back kiri -->
  <button
    v-if="isChatDoneView"
    @click="backToChatList"
    class="absolute left-0 top-1 text-gray-500 hover:text-primary"
    title="Kembali"
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
      <path :d="mdiArrowLeft" />
    </svg>
  </button>

  <!-- Header dan Search + Button -->
  <div class="flex items-center justify-between pl-6">
    <!-- Judul -->
    <h4 class="text-xl font-semibold text-black dark:text-white">
      {{ isChatDoneView ? 'Chats Done' : 'Chats' }}
    </h4>

    <!-- Search dan tombol kanan -->
    <div class="flex items-center gap-2">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search..."
        class="w-60 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      />
      <button
  :disabled="isChatDoneView"
  :class="[
    'text-primary',
    isChatDoneView ? 'invisible cursor-default' : ''
  ]"
  @click="!isChatDoneView && fetchChatDone()"
  title="Tampilkan yang sudah selesai"
>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
          <path :d="mdiTooltipCheck" />
        </svg>
      </button>
    </div>
  </div>
</div>



      <!-- Last Message Area -->
      <div class="h-[500px] overflow-y-auto space-y-3 mb-4 ">
        <div
  v-for="(item, index) in filteredChatData"
  :key="index"
  @click="openChat(item._id, { userName: item.name, imageName: item.imageName, _id: item.userID })"
  class="flex items-start gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4 cursor-pointer"
>

          <div class="flex items-center gap-2 w-16">
  <!-- Tombol Done -->
<button
  :disabled="isChatDoneView"
  :class="[
    'text-success hover:text-success/80',
    isChatDoneView ? 'invisible cursor-default' : ''
  ]"
  @click.stop="!isChatDoneView && markAsDone(item._id)"
  title="Tandai selesai"
>
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor">
    <path :d="mdiAccountCheck" />
  </svg>
</button>



  <!-- Avatar -->
  <router-link
    :to="'/modules/master/user-eksternal/detail/' + item.userID"
    class="relative h-14 w-14 rounded-full shrink-0"
    @click.stop
  >
    <imageWithPreviewUser
      :model-value="item.imageName"
      disabled
      class="object-cover rounded-full justify-center h-full w-full"
      title="Lihat detail pengguna"
    />
  </router-link>
</div>



          <!-- Info -->
          <div class="flex flex-1 justify-between">
            <div class="flex flex-col justify-between">
              <h5 class="font-medium text-black dark:text-white">{{ item.name }}</h5>
              <p class="text-sm text-black dark:text-white max-w-[500px] truncate">{{ item.text }}</p>
            </div>
            <div class="flex flex-col justify-between items-end text-right min-h-[40px]">
              <div class="flex h-6 w-6 items-center justify-center rounded-full" :class="item.textCount !== 0 ? 'bg-primary' : 'invisible'">
                <span class="text-sm font-medium text-white">{{ item.textCount }}</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Jika sedang melihat percakapan -->
    <template v-else>
     <!-- Chat View -->
  
    <!-- Header Chat -->
    <div class="flex items-center gap-3 mb-4">
      <button @click="closeChat" class="text-primary">
        <svg class="w-6 h-6" viewBox="0 0 24 24">
          <path :d="mdiArrowLeft" fill="currentColor" />
        </svg>
      </button>
      <router-link
  :to="'/modules/master/user-eksternal/detail/' + currentUserInfo._id"
  class="h-10 w-10"
  title="Lihat detail pengguna"
>
  <imageWithPreviewUser
    :model-value="currentUserInfo.imageName"
    disabled
    class="h-10 w-10 object-cover rounded-full"
  />
</router-link>


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
    </template>
  </div>
    </div>

  </DefaultLayout>
</template>
