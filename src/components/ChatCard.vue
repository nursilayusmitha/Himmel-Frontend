<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted, computed, nextTick, watch } from 'vue'
import { useIndexStore } from '@/stores'
import Swal from 'sweetalert2'
import imageWithPreviewUser from "@/components/Forms/SelectGroup/imageWithPreviewUserPP.vue"
import dayjs from 'dayjs'
import { mdiSend, mdiArrowLeftBold, mdiChatPlus } from '@mdi/js'

const indexStore = useIndexStore()

const chatData = ref([])
const searchQuery = ref('')
const userList = ref([])
const showUserPopup = ref(false)
const selectedChat = ref(null)
const chatMessages = ref([])
const newMessage = ref('')
const endOfMessages = ref(null)

const conversationInterval = ref<NodeJS.Timeout | null>(null)
const isInConversation = ref(false)
const previousMessageCount = ref(0)
const userScrolledUp = ref(false)

// Format jam
const formatToTime = (isoTime: string) => dayjs(isoTime).format('HH:mm')

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
  const currentDate = dayjs(msgs[index].createdAt).format('YYYY-MM-DD')
  const prevDate = dayjs(msgs[index - 1].createdAt).format('YYYY-MM-DD')
  return currentDate !== prevDate
}

// Scroll ke bawah
const scrollToBottom = () => {
  if (endOfMessages.value) {
    endOfMessages.value.scrollIntoView({ behavior: 'smooth' })
  }
}

// Deteksi apakah user scroll ke atas
const handleScroll = () => {
  const container = document.querySelector('.chat-content-scroll') as HTMLElement
  if (!container) return

  const isAtBottom = Math.abs(container.scrollHeight - container.scrollTop - container.clientHeight) < 10
  userScrolledUp.value = !isAtBottom
}

// Ambil isi percakapan
const fetchConversation = async (targetId: string, name: string, avatar: string) => {
  const userId = indexStore.user?._id
  if (!userId || !targetId) return
  try {
    const res = await axios.get(`http://localhost:4000/api/Modul_chat/conversation/${userId}/${targetId}`)
    const newMessages = res.data
    const isNewMessageAdded = newMessages.length > chatMessages.value.length

    const isFirstLoad = previousMessageCount.value === 0
    chatMessages.value = newMessages
    selectedChat.value = { id: targetId, name, avatar }

    // Tandai sebagai sudah dibaca
    await axios.put(`http://localhost:4000/api/Modul_chat/mark-seen`, {
      userId,
      targetId,
    })

    nextTick(() => {
      if (isFirstLoad) {
        scrollToBottom()
      } else if (isNewMessageAdded && !userScrolledUp.value) {
        scrollToBottom()
      }
      previousMessageCount.value = newMessages.length
    })
  } catch (err) {
    console.error('Gagal fetch conversation:', err)
  }
}

// Ambil daftar chat (last message)
const fetchChats = async () => {
  try {
    const userId = indexStore.user?._id
    if (!userId) return
    const res = await axios.get(`http://localhost:4000/api/Modul_chat/last-messages/${userId}`)
    const chats = res.data.map((item: any) => ({
      _id: item._id,
      avatar: item.imageName,
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

// Kirim pesan
const sendChat = async () => {
  const sender = indexStore.user?._id
  const receiver = selectedChat.value?.id
  if (!newMessage.value || !sender || !receiver) return
  try {
    const res = await axios.post(`http://localhost:4000/api/Modul_chat/create`, {
      sender,
      receiver,
      message: newMessage.value,
    })
    chatMessages.value.push(res.data)
    newMessage.value = ''
    nextTick(() => {
      scrollToBottom()
      previousMessageCount.value = chatMessages.value.length
    })
  } catch (err) {
    console.error('Gagal mengirim pesan:', err)
  }
}

// Mulai percakapan
const startChatWith = (user: any) => {
  fetchConversation(user._id, user.userName, user.imageName)
  showUserPopup.value = false
}

// Ambil daftar user internal
const fetchUserList = async () => {
  try {
    const res = await axios.get('http://localhost:4000/api/userinternal/')
    userList.value = res.data || []
    showUserPopup.value = true
  } catch (err) {
    console.error('Gagal fetch user internal:', err)
  }
}

// Filter chat berdasarkan search
const filteredChatData = computed(() => {
  if (!searchQuery.value) return chatData.value
  return chatData.value.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

// Hapus pesan
const openMessageContextMenu = async (event: MouseEvent, msg: any) => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const result = await Swal.fire({
    title: 'Delete this message?',
    text: 'This message will be deleted just for you.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',

    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  })
  if (result.isConfirmed) {
    try {
      await axios.put('http://localhost:4000/api/Modul_chat/delete-message', {
        messageId: msg._id,
        userId: indexStore.user?._id,
      })
      chatMessages.value = chatMessages.value.filter(m => m._id !== msg._id)
      await Swal.fire({
        title: 'Deleted!',
        text: 'The Message has been deleted.',
        icon: 'success',
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#4ade80', // green-400
        })
      })
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete Message.',
        icon: 'error',
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#f87171', // red-400
        })
      })
    }
  }
}
 
// Hapus chat
const openChatContextMenu = async (event: MouseEvent, chat: any) => {
  const isDarkMode = document.documentElement.classList.contains('dark')

  const result = await Swal.fire({
    title: `Delete chat with ${chat.name}?`,
    text: 'This will delete the chat from your side only.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel',

    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  })

  if (result.isConfirmed) {
    try {
      await axios.put('http://localhost:4000/api/Modul_chat/delete-chat', {
        userId: indexStore.user?._id,
        targetId: chat._id,
      })
      chatData.value = chatData.value.filter(c => c._id !== chat._id)

      await Swal.fire({
        title: 'Deleted!',
        text: 'The chat has been deleted.',
        icon: 'success',
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#4ade80', // green-400
        })
      })
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete chat.',
        icon: 'error',
        ...(isDarkMode && {
          background: '#1f2937',
          color: '#f9fafb',
          iconColor: '#f87171', // red-400
        })
      })
    }
  }
}



// Watch selectedChat
watch(selectedChat, (newVal) => {
  if (conversationInterval.value) clearInterval(conversationInterval.value)
  if (newVal) {
    isInConversation.value = true
    previousMessageCount.value = 0
    userScrolledUp.value = false
    conversationInterval.value = setInterval(() => {
      fetchConversation(newVal.id, newVal.name, newVal.avatar)
    }, 1000)
  } else {
    isInConversation.value = false
    clearInterval(conversationInterval.value!)
  }
})

// Initial fetch
onMounted(() => {
  fetchChats()
  setInterval(fetchChats, 1000)

  nextTick(() => {
    const container = document.querySelector('.chat-content-scroll') as HTMLElement
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
  })
})
</script>




<template>
  <div class="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-8">
    
    <!-- Jika belum memilih chat -->
    <template v-if="!selectedChat">
      <div class="flex items-center justify-between mb-6 px-7.5">
  <h4 class="text-xl font-semibold text-black dark:text-white">Chats</h4>
  <div class="flex items-center gap-2">
    <input
      type="text"
      v-model="searchQuery"
      placeholder="Search..."
      class="w-60 rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
    />
    <button @click="fetchUserList" class="text-primary">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
        <path :d="mdiChatPlus" />
      </svg>
    </button>
  </div>
</div>


      <!-- Last Message Area -->
      <div class="max-h-[360px] overflow-y-auto pr-1.5">
        <div
  v-for="(chat, index) in filteredChatData"
  :key="index"
  @click="() => fetchConversation(chat._id, chat.name, chat.avatar)"
  @contextmenu.prevent="openChatContextMenu($event, chat)"
  class="flex items-start gap-5 py-3 px-7.5 hover:bg-gray-3 dark:hover:bg-meta-4 cursor-pointer"
>
<router-link
    :to="'/admin/profile/' + chat._id"
    class="relative h-14 w-14 rounded-full shrink-0"
    @click.stop
  >
          <!-- Avatar -->
          <div class="relative h-14 w-14 rounded-full shrink-0">
            <imageWithPreviewUser
              :model-value="chat.avatar"
              disabled
              class="object-cover rounded-full justify-center h-full w-full"
            />
          </div>
          </router-link>

          <!-- Info -->
          <div class="flex flex-1 justify-between">
            <div class="flex flex-col justify-between">
              <h5 class="font-medium text-black dark:text-white">{{ chat.name }}</h5>
              <p class="text-sm text-black dark:text-white max-w-[500px] truncate">{{ chat.text }}</p>
            </div>
            <div class="flex flex-col justify-between items-end text-right min-h-[40px]">
              <div class="flex h-6 w-6 items-center justify-center rounded-full" :class="chat.textCount !== 0 ? 'bg-primary' : 'invisible'">
                <span class="text-sm font-medium text-white">{{ chat.textCount }}</span>
              </div>
              <span class="text-xs text-gray-500 dark:text-gray-400">{{ chat.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Jika sedang melihat percakapan -->
    <template v-else>
      <!-- Header chat -->
      <div class="px-7.5 mb-4 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="() => {
  selectedChat = null
}" class="text-primary">
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor">
    <path :d="mdiArrowLeftBold" />
  </svg>
</button>
          <imageWithPreviewUser
            :model-value="selectedChat.avatar"
            disabled
            class="h-10 w-10 object-cover rounded-full"
          />
          <span class="font-medium text-black dark:text-white">{{ selectedChat.name }}</span>
        </div>
      </div>

      <!-- Chat content -->
<div class="h-[300px] overflow-y-auto px-7.5 space-y-3 mb-4 chat-content-scroll">
  <div
  v-for="(msg, index) in chatMessages"
  :key="index"
  class="flex flex-col"
  @contextmenu.prevent="openMessageContextMenu($event, msg)"
>
  <!-- Date divider -->
  <div
    v-if="showDateDivider(chatMessages, index)"
    class="w-full text-center text-xs text-gray-400 my-2"
  >
    {{ formatDateLabel(msg.createdAt) }}
  </div>

  <div
    class="flex flex-col"
    :class="msg.sender === indexStore.user._id ? 'items-end' : 'items-start'"
  >
    <div
      class="py-2 pb-5 pl-4 pr-12 rounded-lg text-sm relative break-words"
      :class="[
        msg.sender === indexStore.user._id 
          ? 'bg-primary text-white max-w-[80%]'
          : 'bg-gray-200 dark:bg-meta-4 text-black dark:text-white max-w-sm'
      ]"
    >
      {{ msg.message }}

      <!-- Time -->
      <span
        class="absolute text-[10px]"
        :class="msg.sender === indexStore.user._id
          ? 'text-white/70 bottom-1 right-2'
          : 'text-black/40 dark:text-white/40 bottom-1 right-2'"
      >
        {{ formatTime(msg.createdAt) }}
      </span>
    </div>

    <!-- Tulisan "seen" kecil -->
    <span
      v-if="msg.sender === indexStore.user._id && index === chatMessages.length - 1 && msg.seen"
      class="text-xs text-gray-500 dark:text-gray-400 mt-1"
    >
      seen
    </span>
  </div>
</div>


  <!-- Scroll Target -->
  <div ref="endOfMessages"></div>
</div>



      <!-- Input Chat -->
      <div class="flex items-center px-7.5 gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendChat"
          type="text"
          placeholder="Type a message..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
        <button @click="sendChat" class="text-primary text-xl">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    fill="currentColor"
  >
    <path :d="mdiSend" />
  </svg>
</button>
      </div>
    </template>
  </div>
  <!-- Modal Pilih User Internal -->
<Teleport to="body">
  <div
    v-if="showUserPopup"
    class="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
    @click.self="showUserPopup = false"
  >
    <div
      class="bg-white dark:bg-boxdark p-6 rounded-lg w-96 max-h-[360px] overflow-y-auto shadow-lg border border-gray-200 dark:border-gray-700"
    >
      <h3 class="text-lg font-semibold mb-4 text-black dark:text-white">Pilih user untuk mulai chat</h3>

      <div class="divide-y divide-gray-200 dark:divide-gray-700">
        <div
          v-for="(user, index) in userList.slice(0, 20)" 
          :key="user._id"
          @click="startChatWith(user)"
          class="flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 px-2 rounded"
        >
          <imageWithPreviewUser
            :model-value="user.imageName"
            disabled
            class="h-10 w-10 rounded-full object-cover"
          />
          <span class="text-black dark:text-white font-medium">{{ user.userName }}</span>
        </div>
      </div>

      <button
        @click="showUserPopup = false"
        class="mt-4 text-sm text-gray-500 hover:underline"
      >
        Tutup
      </button>
    </div>
  </div>
</Teleport>



</template>
