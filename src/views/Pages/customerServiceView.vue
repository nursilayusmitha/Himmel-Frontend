<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import Navbar from '@/components/Header/Navbar.vue'
import axios from 'axios'
import { useIndexStore } from '@/stores'
import Swal from 'sweetalert2'
import { mdiArrowLeft, mdiSend } from '@mdi/js'
import mascot from '@/assets/images/background/mascot-profile.png'
import mascotbg from '@/assets/images/background/mascot-bg.png'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
dayjs.extend(isToday)

const indexStore = useIndexStore()
const mascotImage = mascot
const mascotBackground=mascotbg
const showIntroCard = ref(false)
const hasTypedFirstMessage = ref(false)


// Chat-related refs
const percakapanAduan = ref([])
const newMessage = ref('')
const chatContainerRef = ref<HTMLElement | null>(null)
const showChatModal = ref(true) // langsung tampilkan chat
const currentUserId = indexStore.user?._id
let chatInterval: NodeJS.Timeout

// Format waktu
const formatTime = (time) => dayjs(time).format('HH:mm')
const formatDateLabel = (time) =>
  dayjs(time).isToday() ? 'Today' : dayjs(time).format('DD MMMM YYYY')
const showDateDivider = (msgs, index) => {
  if (index === 0) return true
  const current = dayjs(msgs[index].waktu).format('YYYY-MM-DD')
  const prev = dayjs(msgs[index - 1].waktu).format('YYYY-MM-DD')
  return current !== prev
}

// Scroll
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight
    }
  })
}


// Seen check
const isLastEksternalSeen = (index: number, chatList: any[]) => {
  const eksternalMessages = chatList.filter(m =>
    m.senderType === 'userEksternal' &&
    m.sender?.toString?.() === currentUserId
  )

  if (!eksternalMessages.length) return false

  const lastEksternalMsg = eksternalMessages[eksternalMessages.length - 1]
  const isLast = chatList[index] === lastEksternalMsg

  return isLast && lastEksternalMsg.seen === true
}


// Fetch aduan percakapan
const fetchAduan = async () => {
  try {
    const { data } = await axios.get(
      `http://localhost:4000/api/Modul_aduan/percakapan/cs/${indexStore.user?._id}`
    )
    percakapanAduan.value = data || []
  } catch (err) {
    console.error('❌ Gagal fetch percakapan CS', err)
  }
}

// Mark as seen untuk semua aduan Progress
const markSeenAllProgress = async () => {
  const progressAduan = percakapanAduan.value.filter(a => a.status === 'Progress')
  for (const aduan of progressAduan) {
    await axios.put('http://localhost:4000/api/Modul_aduan/seen', {
      aduanId: aduan._id,
      bySenderType: 'userEksternal'
    })
  }
}

// Chat interval saat aktif
const startChatInterval = () => {
  chatInterval = setInterval(async () => {
    await fetchAduan()
    await markSeenAllProgress()
  }, 1000)
}
const stopChatInterval = () => {
  if (chatInterval) clearInterval(chatInterval)
}

// Handle Kirim Pesan
const handleSendMessage = async () => {
  const msg = newMessage.value.trim()
  if (!msg) return

  const lastAduan = percakapanAduan.value[percakapanAduan.value.length - 1]

  try {
    if (!lastAduan || lastAduan.status === 'Done') {
      // Kirim aduan baru + percakapan
      await axios.post('http://localhost:4000/api/Modul_aduan/create-percakapan', {
        userId: currentUserId,
        sender: currentUserId,
        senderType: 'userEksternal',
        message: msg,
        nama: indexStore.user?.userName,
        noTelp: indexStore.user?.userPhone,
        email: indexStore.user?.email,
        priority: 'Medium',
        description: 'Berinteraksi dengan customer service',
      })
    } else if (lastAduan.status === 'Progress') {
      // Tambah percakapan ke aduan terakhir
      await axios.post('http://localhost:4000/api/Modul_aduan/percakapan', {
        aduanId: lastAduan._id,
        sender: currentUserId,
        senderType: 'userEksternal',
        message: msg
      })
    }

    newMessage.value = ''
    await fetchAduan()
    scrollToBottom()
  } catch (err) {
    console.error('❌ Gagal kirim pesan', err)
  }
}

// Watchers
watch(showChatModal, (val) => {
  if (val) {
    startChatInterval()
    document.body.style.overflow = 'hidden'
  } else {
    stopChatInterval()
    document.body.style.overflow = 'auto'
  }
})

watch(percakapanAduan, (newVal, oldVal) => {
  const newLength = newVal.map(a => a.percakapan.length).reduce((a, b) => a + b, 0)
  const oldLength = oldVal.map(a => a.percakapan.length).reduce((a, b) => a + b, 0)
  if (newLength > oldLength) scrollToBottom()
})

// Start
onMounted(() => {
  fetchAduan()
  startChatInterval()
})
</script>

<template>
  <Navbar />

  <div class="fixed inset-0 bg-[#1379F2] overflow-hidden pt-20 px-4 sm:px-8 mt-6">
    <div class="max-w-5xl mx-auto bg-white dark:bg-boxdark rounded-xl shadow-md p-6 h-[80vh] overflow-hidden flex flex-col">
      
      <!-- ❗ Jika belum ada aduan -->
<div v-if="percakapanAduan.length === 0 && !showIntroCard" class="flex flex-col justify-center items-center h-full text-center px-4">
  <img :src="mascotBackground" alt="Mascot" class="w-60 opacity-80" />

  <h2 class="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-200">
    Belum Ada Riwayat Percakapan
  </h2>

  <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
    Anda belum pernah tersambung dengan <span class="font-medium text-primary">Customer Service</span> kami sebelumnya.
    Jika Anda mengalami kendala, silakan laporkan masalah Anda melalui
    <router-link to="/aduan-masalah" class="text-primary underline hover:text-primary-dark">halaman laporan</router-link>.
  </p>

  <p class="mt-2 text-sm text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
    Atau, jika Anda membutuhkan bantuan secara langsung, kami siap menyambungkan Anda dengan tim Customer Service.
  </p>

  <button
    class="mt-4 bg-primary text-white px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-all duration-200"
    @click="showIntroCard = true"
  >
    Sambungkan ke Customer Service
  </button>
</div>


      <!-- ❗Jika belum pernah ada aduan, tapi sudah klik sambungkan -->
      <div v-else-if="percakapanAduan.length === 0 && showIntroCard" class="flex flex-col h-full">
        <div class="text-xs text-center bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white py-2 rounded mb-2">
          Silahkan kirim pesan untuk disambungkan dengan Customer Service kami.
        </div>

        <!-- Input -->
        <div class="mt-auto border-t pt-3 flex items-center gap-2 dark:border-strokedark">
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

      <!-- ❗Jika sudah ada aduan Progress atau Done -->
      <div v-else class="flex flex-col h-full">
        <!-- Header Chat -->
        <div class="flex items-center gap-3 mb-4">
          <img :src="mascotImage" alt="Himmel" class="h-10 w-10 object-cover rounded-full" />
          <span class="text-sm font-medium text-black dark:text-white">Himmel</span>
        </div>

        <!-- ❗Status CS Connection -->
        <div v-if="percakapanAduan.length > 0" class="text-xs text-center py-2 rounded mb-2"
            :class="{
              'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200':
                percakapanAduan[percakapanAduan.length - 1].status === 'Progress',
              'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200':
                percakapanAduan[percakapanAduan.length - 1].status === 'Done'
            }">
          <template v-if="percakapanAduan[percakapanAduan.length - 1].status === 'Progress'">
            Anda sedang tersambung dengan Customer Service kami.
          </template>
          <template v-else-if="percakapanAduan[percakapanAduan.length - 1].status === 'Done'">
            Anda sudah tidak tersambung dengan Customer Service.<br />
            Mulai kirim pesan lagi untuk menyambungkan ke Customer Service kami.
          </template>
        </div>


        <!-- Chat -->
        <div ref="chatContainerRef" class="flex-1 overflow-y-auto px-2 space-y-3">
          <template v-for="(aduan, aduanIndex) in percakapanAduan" :key="aduan._id">
            <div v-for="(msg, i) in aduan.percakapan" :key="i">
              <div v-if="showDateDivider(aduan.percakapan, i)" class="text-center text-xs text-gray-400 my-2">
                {{ formatDateLabel(msg.waktu) }}
              </div>

              <div class="flex flex-col"
                :class="msg.senderType === 'userEksternal' ? 'items-end' : 'items-start'">
                <div
                  class="py-2 pb-5 pl-4 pr-12 rounded-lg text-sm relative break-words"
                  :class="msg.senderType === 'userEksternal'
                    ? 'bg-primary text-white max-w-[80%]'
                    : 'bg-gray-200 dark:bg-meta-4 text-black dark:text-white max-w-sm'">
                  {{ msg.message }}
                  <span class="absolute text-[10px]"
                    :class="msg.senderType === 'userEksternal'
                      ? 'text-white/70 bottom-1 right-2'
                      : 'text-black/40 dark:text-white/40 bottom-1 right-2'">
                    {{ formatTime(msg.waktu) }}
                  </span>
                </div>

                <!-- Seen indicator -->
                <span v-if="msg.senderType === 'userEksternal' && isLastEksternalSeen(i, aduan.percakapan)"
                  class="text-[10px] text-gray-400 dark:text-gray-500 mt-1 mr-1 block text-right">
                  seen
                </span>
              </div>
            </div>
          </template>
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
  </div>
</template>
