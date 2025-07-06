<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getUserById } from '@/stores/functionAPI'
import { API } from '@/API/'

// Ambil ID dari URL
const route = useRoute()
const userId = route.params.id as string

// State data user
const userData = ref({
  userName: '',
  userRole: '',
  bio: '',
  imageName: '',
})

// Fetch data user dari endpoint berdasarkan ID dari URL
onMounted(async () => {
  const data = await getUserById(userId)
  if (data) {
    userData.value = {
      userName: data.userName || '',
      userRole: data.userRole || '',
      bio: data.bio || '',
      imageName: data.imageName || '',
    }
  }
})
</script>



<template>
  <!-- ====== Profile Section Start -->
  <div
    class="overflow-hidden rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <div class="relative z-20 h-35 md:h-65">
      <img
        src="@/assets/images/cover/cover-01.png"
        alt="profile cover"
        class="h-full w-full rounded-tl-sm rounded-tr-sm object-cover object-center"
      />
      <div class="absolute bottom-1 right-1 z-10 xsm:bottom-4 xsm:right-4">
      </div>
    </div>
    <div class="px-4 pb-6 text-center lg:pb-8 xl:pb-11.5">
      <div
        class="relative z-30 mx-auto -mt-22 h-30 w-full max-w-30 rounded-full bg-white/20 p-1 backdrop-blur sm:h-44 sm:max-w-44 sm:p-3"
      >
        <div class="relative drop-shadow-2">
          <img
  :src="userData.imageName ? API + '/images/user_internal/' + userData.imageName : API + '/images/user_internal/profile.png'"
  alt="Foto Profil"
  class="object-cover rounded-full"
/>

        </div>
      </div>
      <div class="mt-4">
        <h3 class="mb-1.5 text-2xl font-medium text-black dark:text-white">{{ userData.userName }}</h3>
        <p class="font-medium">{{ userData.userRole }}
</p>
       

        <div class="mx-auto max-w-180 mt-5">
          <h4 class="font-medium text-black dark:text-white">About Me</h4>
          <p class="mt-4.5 text-sm font-normal">
           {{ userData.bio || 'No bio available.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
  <!-- ====== Profile Section End -->
</template>
