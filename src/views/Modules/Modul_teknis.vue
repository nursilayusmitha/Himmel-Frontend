<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { getAllTeknis } from '@/stores/functionAPI'
import Swal from 'sweetalert2'
import { mdiTrashCanOutline, mdiEyeOutline, mdiPlusBox, mdiMagnify, mdiRefresh, mdiPlusCircleOutline, mdiCloseOctagon, mdiTimerAlert,mdiTimerRemove,mdiTimerCheck,mdiTimerCog    } from '@mdi/js';

const pageTitle = ref('Modul - Teknis')
const pageList = ref (['Modul', 'Teknis'])
const dataHeader = ref([
  {name: 'No.', class: 'py-2 pl-3'},
  {name: 'Kendaraan', class: 'min-w-[60px] py-2 px-4'},
  {name: 'Nama', class: 'min-w-[120px] py-2 px-4'},
  {name: 'Nomor', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Fasilitas', class: 'min-w-[120px] py-2 px-4'},
  {name: 'Kapasitas', class: 'min-w-[60px] py-2 px-4'},
  {name: 'Rute Awal', class: 'min-w-[170px] py-2 px-4'},
  {name: 'Rute Tujuan', class: 'min-w-[170px] py-2 px-4'},
  {name: 'Perjalanan', class: 'min-w-[80px] py-2 px-4'},
  {name: 'Harga Tiket', class: 'min-w-[190px] py-2 px-4'},
  {name: 'Kursi Tersedia', class: 'min-w-[140px] py-2 px-4'},
  {name: 'Tanggal Berangkat', class: 'min-w-[170px] py-2 px-4'},
  {name: 'Status', class: 'min-w-[60px] py-2 px-4'},
])
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




// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;
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

const statusTeknisFilter = ref('');

// Fungsi untuk toggle filter jenis kendaraan
const toggleFilter = (Teknis: string) => {
  if (statusTeknisFilter.value === Teknis) {
    statusTeknisFilter.value = ''; // Reset filter jika tombol yang sama ditekan lagi
  } else {
    statusTeknisFilter.value = Teknis; // Set filter berdasarkan tombol yang ditekan
  }
};

const filteredData = computed(() => {
  let result = dataTable.value;

  // Filter berdasarkan searchQuery jika ada
  if (searchQuery.value.trim()) {
    result = result.filter(item => recursiveSearch(item, searchQuery.value));
  }

  // Filter berdasarkan statusTeknisFilter jika ada
  if (statusTeknisFilter.value) {
    result = result.filter(item => item.Teknis === statusTeknisFilter.value);
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
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// Paginated data based on filtered results
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

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


const cancelTeknis = async (id) => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  if (!id) {
    Swal.fire('Error!', 'ID tidak valid.', 'error');
    return;
  }

  Swal.fire({
    title: 'Apakah anda yakin?',
    text: "Karena masalah internal, Anda akan membatalkan data teknis? Ini tidak bisa dipulihkan.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Konfirmasi',
    cancelButtonText: 'Kembali',
    ...(isDarkMode && {
      background: "#1f2937",   // gray-800
      color: "#f9fafb",        // gray-100
      iconColor: "#facc15",    // yellow-400
    }),
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:4000/api/modul_teknis/cancel/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Teknis: "Cancel" }) // Sesuaikan dengan API backend
        });

        const result = await response.json();
        
        if (!response.ok) throw new Error(result.message || "Gagal mengubah status");

        // Perbarui dataTable tanpa menghapus item
        dataTable.value = dataTable.value.map(item => 
          item._id === id ? { ...item, Teknis: "Cancel" } : item
        );

        Swal.fire({
          position: "center",
          title: 'Cancel Teknis Berhasil!', 
          timer: 1500,
          icon: 'success',
          showConfirmButton: false,
          toast: true,
          ...(document.documentElement.classList.contains('dark') && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
        });

      } catch (error) {
        Swal.fire('Error!', error.message, 'error');
      }
    }
  });
};



const confirmBlock = (id) => {
  Swal.fire({
    title: 'Apakah anda yakin?',
    text: "Anda akan memblokir akun user.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Konfirmasi',
    cancelButtonText: 'Kembali',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:4000/api/userteknis/block/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Tampilkan custom success alert
          successBlock('Block Success!', '', 'center');
          
          // Update dataTable to remove the deleted item
          dataTable.value = dataTable.value.filter(item => item._id !== id);
          
        } else {
          Swal.fire('Failed!', 'Gagal memblokir user.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'Terjadi kesalahan saat memblokir user.', 'error');
      }
    }
  });
};

const successBlock = async (title, text, position) => { 
  Swal.fire({
    position: position || "center",
    title: title || 'Block Success!', 
    text: text || '',
    timer: 1500,
    icon: 'success',
    showConfirmButton: false,
    toast: true
  });
};
</script>

<template>
  <DefaultLayout>
    <!-- Breadcrumb Start -->
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <!-- Breadcrumb End -->

    <div class="flex flex-col gap-10">
    
  <div
    class="rounded-sm border border-stroke bg-white px-5 py-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5"
  >
  <div class="flex space-x-2 mb-3 -mt-3 justify-end">
    <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-orange-600': statusTeknisFilter === 'Proses', 
              'hover:bg-blue-300': statusTeknisFilter !== 'Proses'
            }"
            @click="toggleFilter('Proses')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiTimerCog" fill="#"/>
            </svg>
          </button>
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-blue-600': statusTeknisFilter === 'Jalan', 
              'hover:bg-blue-300': statusTeknisFilter !== 'Jalan'
            }"
            @click="toggleFilter('Jalan')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiTimerAlert" fill="#"/>
            </svg>
          </button>
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-blue-600': statusTeknisFilter === 'Selesai', 
              'hover:bg-blue-300': statusTeknisFilter !== 'Selesai'
            }"
            @click="toggleFilter('Selesai')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiTimerCheck " fill="#"/>
            </svg>
          </button>
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-red-600': statusTeknisFilter === 'Cancel', 
              'hover:bg-blue-300': statusTeknisFilter !== 'Cancel'
            }"
            @click="toggleFilter('Cancel')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiTimerRemove " fill="#"/>
            </svg>
          </button>
        </div>
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
              <!-- Add Button -->
              <router-link to="/modules/modul-teknis/add" class="px-1">
              <svg 
                class="fill-current hover:text-primary"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path :d="mdiPlusCircleOutline" fill=""/>
              </svg>
              
              <!-- Refresh Button -->
              </router-link>
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
          <tr v-for="(item, index) in paginatedData" :key="index" class="border">
                <td class="pl-3 text-xs border">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs ">{{ item.Jenis_kendaraan }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs ">{{ item.Nama_kendaraan }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs ">{{ item.Nomor_kendaraan }}</p>
            </td>
            <td class="py-1 px-4 border">
  <ul class="list-disc pl-4"> <!-- Tambahkan list-disc dan padding kiri -->
    <li v-for="(fasilitas, index) in item.Fasilitas" :key="index" class="text-black dark:text-white text-xs">
      {{ fasilitas }}
    </li>
  </ul>
</td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white text-center">{{ item.Kapasitas_penumpang }}</p>
            </td>
            
<td class="py-2 px-3 border border-gray-200 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
  <p class="text-black dark:text-white text-sm">
    <span class="font-semibold text-gray-800 dark:text-gray-200">
      {{ item.Jenis_kendaraan === 'pesawat' ? 'Bandara' : 'Stasiun' }}:
    </span>
    <br>
    <span class="text-gray-700 dark:text-gray-300">
      {{ item.Keberangkatan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraName' : 'stasiunName'] }}
    </span>
    <br>

    <span class="font-semibold text-gray-800 dark:text-gray-200">Lokasi:</span>
    <br>
    <span class="text-gray-700 dark:text-gray-300">
      {{ item.Keberangkatan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraLocation' : 'stasiunLocation'] }}
    </span>
  </p>
</td>

<td class="py-2 px-3 border border-gray-200 bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm">
  <p class="text-black dark:text-white text-sm text-left">
    <span class="font-semibold text-gray-800 dark:text-gray-200">
      {{ item.Jenis_kendaraan === 'pesawat' ? 'Bandara' : 'Stasiun' }}:
    </span>
    <br>
    <span class="text-gray-700 dark:text-gray-300">
      {{ item.Tujuan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraName' : 'stasiunName'] }}
    </span>
    <br>

    <span class="font-semibold text-gray-800 dark:text-gray-200">Lokasi:</span>
    <br>
    <span class="text-gray-700 dark:text-gray-300">
      {{ item.Tujuan[0][item.Jenis_kendaraan === 'pesawat' ? 'bandaraLocation' : 'stasiunLocation'] }}
    </span>
  </p>
</td>
            <td class="py-1 px-4 border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.Waktu_perjalanan }}</h5>
            </td>
            <td class="py-1 px-4 border">
  <ul class="list-disc pl-4"> <!-- Tambahkan list-disc dan padding kiri -->
    <li v-for="(harga, index) in item.Harga_tiket" :key="index" class="text-black dark:text-white text-xs">
      {{ harga.label }}: Rp {{ harga.harga.toLocaleString() }}
    </li>
  </ul>
</td>
<td class="py-1 px-4 border">
  <ul class="list-disc pl-2"> <!-- List dengan bullet -->
    <li v-for="seat in countAvailableSeats(item.Kursi_tersedia)" :key="seat.label" class="text-black dark:text-white text-xs">
      {{ seat.label }}: {{ seat.availableSeatsCount }}
    </li>
  </ul>
</td>



            <td class="py-1 px-4 text-center border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.Berangkat_date }}</h5>
              <p class="text-xs">{{ item.Berangkat_time }}</p>
            </td>
            <td class="py-1 px-4 text-center border">
              <h5 class="font-medium text-black text-xs dark:text-white text-left">{{ item.Teknis }}</h5>
            </td>
            <td class="py-1 px-4">
              <div class="flex items-center space-x-3.5 d-flex justify-center">              
                
                <router-link
  :to="item.Teknis === 'Proses' ? '/modules/modul-pesanan/add/' + item._id : ''"
  :class="item.Teknis === 'Proses' ? 'hover:text-primary' : 'cursor-not-allowed opacity-50 pointer-events-none'"
>
  <svg
    class="fill-current"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiPlusBox" fill="#" />
  </svg>
</router-link>


<button
  :disabled="item.Teknis !== 'Proses'"
  :class="item.Teknis === 'Proses' ? 'hover:text-primary' : 'cursor-not-allowed opacity-50'"
  @click="item.Teknis === 'Proses' ? cancelTeknis(item._id) : null"
>
  <svg
    class="fill-current"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiCloseOctagon" fill="#" />
  </svg>
</button>


              </div>
            </td>
          </tr> 
        </tbody>
      </table>
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
    </div>
  </DefaultLayout>
</template>
