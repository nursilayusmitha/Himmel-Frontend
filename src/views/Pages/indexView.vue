<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from "vue-router";

import Swal from 'sweetalert2'
import { mdiAirplane , mdiEyeOutline, mdiSquareEditOutline, mdiMagnify, mdiRefresh, mdiPlusCircleOutline, mdiTrain, mdiTrashCanOutline, mdiCashEdit, mdiWrenchCogOutline     } from '@mdi/js';


import { getAllTeknis } from '@/stores/functionAPI'
import Navbar from '@/components/Header/Navbar.vue'
import mascotbg from '@/assets/images/background/mascot-bg.png'
const mascotBackground = mascotbg

let dataTable = ref([])
const searchQuery = ref("");

const countAvailableSeats = (Kursi_tersedia) => {
  // Pastikan Kursi_tersedia adalah array, lalu iterasi dan hitung kursi yang tersedia
  return Kursi_tersedia
    ?.map(kursi => {
      const availableSeatsCount = Object.entries(kursi.seats || {})
        .filter(([_, status]) => status === "N").length;

      // Kembalikan objek {label, jumlah_tersedia}
      return { label: kursi.label, availableSeatsCount };
    });
};


const itemsPerPage = 8;
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage));

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};
const vehicleTypeFilter = ref('');  // Tambahkan state untuk filter jenis kendaraan

// Fungsi untuk toggle filter jenis kendaraan
const toggleFilter = (vehicleType: string) => {
  if (vehicleTypeFilter.value === vehicleType) {
    vehicleTypeFilter.value = ''; // Reset filter jika tombol yang sama ditekan lagi
  } else {
    vehicleTypeFilter.value = vehicleType; // Set filter berdasarkan tombol yang ditekan
  }
};

// Fungsi rekursif untuk menelusuri semua properti, termasuk array dan object
const recursiveSearch = (data, query) => {
  if (typeof data === 'string' || typeof data === 'number') {
    return data.toString().toLowerCase().includes(query.toLowerCase());
  }

  if (Array.isArray(data)) {
    return data.some(item => recursiveSearch(item, query));
  }

  if (typeof data === 'object' && data !== null) {
    return Object.values(data).some(value => recursiveSearch(value, query));
  }

  return false;
};

const filteredData = computed(() => {
  let result = dataTable.value;

  // Filter hanya data dengan status "Proses"
  result = result.filter(item => item.Teknis === "Proses");

// Filter berdasarkan jenis kendaraan jika ada
if (vehicleTypeFilter.value) {
  result = result.filter(item => item.Jenis_kendaraan.toLowerCase() === vehicleTypeFilter.value.toLowerCase());
  }

  // Filter berdasarkan searchQuery jika ada
  if (searchQuery.value.trim()) {
    result = result.filter(item => recursiveSearch(item, searchQuery.value));
  }

  return result;
});




const visiblePages = computed(() => {
  const pages = [];
  const range = 2; // Number of pages to show before and after the current page

  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Total items based on the filtered data
const totalItems = computed(() => filteredData.value.length);

// Change page function
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

onMounted( async () => {
  const data = await getAllTeknis()
  dataTable.value = data
})
</script>

<template>
  <Navbar />

  <!-- Hero Section -->
  <div
    class="min-h-[107vh] h-[60vh] sm:h-[50vh] md:h-[40vh] lg:h-[30vh] relative flex flex-col justify-center items-center 
           px-4 sm:px-8 bg-cover bg-center bg-no-repeat 
           bg-[url('@/assets/images/background/background.png')] dark:bg-gray-900 
           transition-all duration-600 ease-in-out pb-0"
  >
    <!-- Konten Hero -->
    <div class="text-center py-20 -mt-20 text-white dark:text-white">
      <h1 class="text-4xl font-bold">Himmel - Perjalanan Tanpa Batas</h1>
      <p class="text-lg mt-4">Pesan tiket pesawat dan kereta dengan mudah, cepat, dan harga terbaik.</p>
      <a
        href="#pesan"
        class="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg shadow-lg transition"
      >
        Pesan Tiket Sekarang
      </a>
    </div>

    <!-- Wave -->
    <div class="absolute bottom-0 left-0 right-0 -mb-1">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="wave-svg">
        <!-- Light mode wave -->
        <path
          class="block dark:hidden"
          fill="#F3F4F6"
          fill-opacity="1"
          d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,768,256,
            864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,240L1440,224L1440,
            320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,
            672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
        <!-- Dark mode wave -->
        <path
          class="hidden dark:block"
          fill="#111827" 
          fill-opacity="1"
          d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,768,256,
            864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,240L1440,224L1440,
            320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,
            672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>
    </div>
  </div>
  

  <!-- Konten Halaman -->
  <div class="bg-gray-100 dark:bg-gray-900 mt-0" id="pesan">
    <section class="py-12 px-4 sm:px-8">
      <div class="bg-gray-100 dark:bg-gray-900 py-10 px-4 sm:px-6">

        <!-- Filter & Search -->
        <div class="flex items-center justify-center space-x-3 mb-6">
          <!-- Tombol Pesawat -->
          <button
            class="bg-black text-white p-2 rounded-md flex items-center justify-center w-10 h-10"
            :class="{
              'bg-blue-600': vehicleTypeFilter === 'pesawat',
              'hover:bg-blue-300': vehicleTypeFilter !== 'pesawat'
            }"
            @click="toggleFilter('pesawat')"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path :d="mdiAirplane" fill="white" />
            </svg>
          </button>

          <!-- Tombol Kereta -->
          <button
            class="bg-black text-white p-2 rounded-md flex items-center justify-center w-10 h-10"
            :class="{
              'bg-blue-600': vehicleTypeFilter === 'kereta',
              'hover:bg-blue-300': vehicleTypeFilter !== 'kereta'
            }"
            @click="toggleFilter('kereta')"
          >
            <svg class="w-6 h-6" viewBox="0 0 24 24">
              <path :d="mdiTrain" fill="white" />
            </svg>
          </button>

          <!-- Search -->
          <div class="relative flex-1 max-w-lg">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari kendaraan..."
              class="w-full pl-4 pr-12 py-2 border rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition-all 
                     dark:bg-gray-800 dark:text-white dark:border-gray-600"
            />
            <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300">
              <svg class="w-6 h-6" viewBox="0 0 24 24">
                <path :d="mdiMagnify" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>

        <!-- Grid Data -->
        <!-- Grid Data -->
<div class="max-w-7xl mx-auto">
  <div v-if="filteredData.length === 0" class="flex flex-col justify-center items-center h-[300px]">
    <img :src="mascotBackground" alt="Mascot" class="w-60 opacity-80" />
    <p class="mt-6 text-gray-700 dark:text-white/80 text-lg font-semibold italic tracking-wide">
      {{
        vehicleTypeFilter === 'pesawat'
          ? 'Tidak ada data teknis keberangkatan Pesawat saat ini.'
          : vehicleTypeFilter === 'kereta'
          ? 'Tidak ada data teknis keberangkatan Kereta saat ini.'
          : 'Tidak ada data teknis keberangkatan saat ini.'
      }}
    </p>
  </div>

  <div
    v-else
    class="grid gap-6 grid-cols-1 min-[680px]:grid-cols-2 min-[1024px]:grid-cols-3 min-[1230px]:grid-cols-4"
  >
    <!-- 🧩 Loop data teknis -->
    <div
      v-for="item in paginatedData"
      :key="item.id"
      class="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl 
            transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]"
    >
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white tracking-wide">
              {{ item.Nama_kendaraan }}
            </h3>
            <p class="text-gray-500 dark:text-gray-300 text-sm mb-3">
              {{ item.Jenis_kendaraan }} - {{ item.Nomor_kendaraan }}
            </p>

            <!-- Keberangkatan -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
              <p class="text-gray-700 dark:text-white text-sm font-medium">Keberangkatan:</p>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {{ item.Keberangkatan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraName' : 'stasiunName'] }}
              </p>
              <p class="text-gray-400 dark:text-gray-400 text-xs">
                {{ item.Keberangkatan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraLocation' : 'stasiunLocation'] }}
              </p>
            </div>

            <!-- Tujuan -->
            <div class="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-1">
              <p class="text-gray-700 dark:text-white text-sm font-medium">Tujuan:</p>
              <p class="text-gray-600 dark:text-gray-300 text-sm">
                {{ item.Tujuan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraName' : 'stasiunName'] }}
              </p>
              <p class="text-gray-400 dark:text-gray-400 text-xs">
                {{ item.Tujuan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraLocation' : 'stasiunLocation'] }}
              </p>
            </div>

            <!-- Info Waktu & Harga -->
            <div class="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3">
              <div>
                <p class="text-gray-700 dark:text-white text-sm font-medium">Waktu Perjalanan:</p>
                <p class="text-gray-600 dark:text-gray-300 text-sm">{{ item.Waktu_perjalanan }}</p>
              </div>
              <div>
                <p class="text-gray-700 dark:text-white text-sm font-medium">Harga:</p>
                <p class="text-blue-500 font-semibold text-lg">
                  Rp {{ item.Harga_tiket[0].harga.toLocaleString() }}
                </p>
              </div>
            </div>

            <!-- Kursi -->
            <div class="mt-3">
              <p class="text-gray-700 dark:text-white text-sm font-medium">Kursi Tersedia:</p>
              <ul class="list-disc pl-4 text-gray-600 dark:text-gray-300 text-xs space-y-1">
                <li
                  v-for="seat in countAvailableSeats(item.Kursi_tersedia)"
                  :key="seat.label"
                >
                  {{ seat.label }}: {{ seat.availableSeatsCount }}
                </li>
              </ul>
            </div>

            <!-- Tombol Pesan -->
            <div class="flex justify-between items-center mt-4">
              <p class="text-xs text-gray-500 dark:text-gray-400">
                Berangkat:<br />
                <span>{{ item.Berangkat_date }}</span><br />
                <span>{{ item.Berangkat_time }}</span>
              </p>
              <router-link
                :to="item.Teknis === 'Proses' ? '/modul-pesanan/add/' + item._id : ''"
                :class="item.Teknis === 'Proses' ?
                  'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md transition-all' :
                  'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-300 px-4 py-2 rounded-lg cursor-not-allowed'"
              >
                Pesan
              </router-link>
            </div>
          </div>
        </div>
      </div>
      </div>

      <!-- Paginasi -->
      <div class="relative z-20 flex justify-center mt-6 space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-l-lg hover:bg-gray-400 disabled:opacity-50 transition-all"
        >
          Prev
        </button>
        <span class="px-4 py-2 font-medium dark:text-white">
          {{ currentPage }} / {{ totalPages }}
        </span>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-r-lg hover:bg-gray-400 disabled:opacity-50 transition-all"
        >
          Next
        </button>
      </div>
    </section>
  </div>
  <div class="
  mt-0
  max-[480px]:mt-0
  max-[680px]:-mt-[50px]
  max-[768px]:-mt-[80px]
  max-[1199px]:-mt-[100px]
  min-[1200px]:-mt-[200px]
  transition-all duration-10
  bg-gray-100 dark:bg-gray-900
  ">
  <!-- Wave -->
  <div class="relative z-0">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" class="w-full">
      <!-- Light mode -->
      <path
        class="block dark:hidden"
        fill="#1379F2"
        fill-opacity="1"
        d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,
          768,256,864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,
          240L1440,224L1440,320L0,320Z"
      />
      <!-- Dark mode -->
      <path
        class="hidden dark:block"
        fill="#1379F2"
        fill-opacity="1"
        d="M0,288L48,272C96,256,192,224,288,208C384,192,480,192,576,208C672,224,
          768,256,864,277.3C960,299,1056,309,1152,298.7C1248,288,1344,256,1392,
          240L1440,224L1440,320L0,320Z"
      />
    </svg>
  </div>

  <!-- Banner Scroll -->
  <div class="relative z-10 -mt-1">
    <router-link to="/special-offer">
      <div class="w-full overflow-hidden h-[150px] bg-[#1379F2] dark:bg-[#1379F2]">
        <div class="flex animate-scroll-banner w-[200%]">
          <img
            src="@/assets/images/background/OfferDeal.png"
            alt="Offer Deal"
            class="h-[150px] w-auto object-cover"
          />
          <img
            src="@/assets/images/background/OfferDeal.png"
            alt="Offer Deal Duplicate"
            class="h-[150px] w-auto object-cover"
          />
        </div>
      </div>
    </router-link>
  </div>
  </div>

  <!-- Section: Mascot and Text -->
  <section class="bg-[#1379F2] dark:bg-[#1379F2] py-10 px-4 sm:px-10">
    <div class="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center gap-8">
      
      <!-- Left: Mascot Image -->
      <div class="w-full md:w-1/2 flex justify-center">
        <img
          src="@/assets/images/background/mascot.png"
          alt="Himmel Mascot"
          class="max-h-[250px] sm:max-h-[300px] object-contain"
        />
      </div>

      <!-- Right: Text -->
      <div class="w-full md:w-1/2 text-white text-center md:text-left">
        <h2 class="text-3xl font-bold mb-3">Hello! I'm Himmel!</h2>
        <p class="text-lg font-medium leading-relaxed">
          Dengan <span class="font-semibold">Himmel</span>, Anda bisa <br />
          <span class="italic">Travel kemana saja, kapan saja, semau Anda.</span><br /><br />
          Pesan tiket <span class="underline">pesawat</span> dan <span class="underline">kereta</span> dari mana saja!
        </p>
      </div>

    </div>
  </section>


</template>
