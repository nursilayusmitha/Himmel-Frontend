<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import ButtonDynamic from "@/components/Buttons/ButtonDynamic.vue";
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { getAllRute } from '@/stores/functionAPI'
import Swal from 'sweetalert2'
import { mdiAirplane , mdiEyeOutline, mdiSquareEditOutline, mdiMagnify, mdiRefresh, mdiPlusCircleOutline, mdiTrain, mdiTrashCanOutline, mdiCashEdit, mdiWrenchCogOutline     } from '@mdi/js';

const pageTitle = ref('Modul - Rute')
const pageList = ref (['Modul', 'Rute'])
const dataHeader = ref([
{ name: 'No.', class: 'py-2 pl-3' },
  { name: 'Kendaraan', class: 'min-w-[100px] py-2 px-4' },
  { name: 'Keberangkatan', class: 'min-w-[200px] py-2 px-4' },
  { name: 'Tujuan', class: 'min-w-[200] py-2 px-4' },
  { name: 'Perjalanan', class: 'min-w-[100px] py-2 px-4' },
  { name: 'Harga Tiket', class: 'min-w-[200px] py-2 px-4' },
])
let dataTable = ref([])
const searchQuery = ref("");
const vehicleTypeFilter = ref('');  // Tambahkan state untuk filter jenis kendaraan

// Fungsi untuk toggle filter jenis kendaraan
const toggleFilter = (vehicleType: string) => {
  if (vehicleTypeFilter.value === vehicleType) {
    vehicleTypeFilter.value = ''; // Reset filter jika tombol yang sama ditekan lagi
  } else {
    vehicleTypeFilter.value = vehicleType; // Set filter berdasarkan tombol yang ditekan
  }
};


// Pagination state
const currentPage = ref(1);
const itemsPerPage = 15;


// Filtered data berdasarkan jenis kendaraan dan search query
const filteredData = computed(() => {
  let data = dataTable.value;

  // Filter berdasarkan jenis kendaraan jika ada
  if (vehicleTypeFilter.value) {
    data = data.filter(item => item.Jenis_kendaraan.toLowerCase() === vehicleTypeFilter.value.toLowerCase());
  }

  // Filter berdasarkan search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    return data.filter(item => {
      const keberangkatan = item.Keberangkatan[0];
      const tujuan = item.Tujuan[0];
      const keberangkatanMatch = (
        keberangkatan[item.Jenis_kendaraan === 'pesawat' ? 'bandaraName' : 'stasiunName']?.toLowerCase().includes(query) ||
        keberangkatan[item.Jenis_kendaraan === 'pesawat' ? 'bandaraLocation' : 'stasiunLocation']?.toLowerCase().includes(query)
      );
      const tujuanMatch = (
        tujuan[item.Jenis_kendaraan === 'pesawat' ? 'bandaraName' : 'stasiunName']?.toLowerCase().includes(query) ||
        tujuan[item.Jenis_kendaraan === 'pesawat' ? 'bandaraLocation' : 'stasiunLocation']?.toLowerCase().includes(query)
      );
      return keberangkatanMatch || tujuanMatch || 
        item.Jenis_kendaraan?.toLowerCase().includes(query) ||
        item.Waktu_perjalanan?.toString().includes(query) ||
        item.Harga_tiket?.toString().includes(query);
    });
  }

  return data;
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
  const data = await getAllRute();
  // Add formatted roleAccess to each item
  dataTable.value = data
});
const togglePerbaikan = async (id, currentStatus) => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  const nextStatus = currentStatus === 'Y' ? 'N' : 'Y';
  const actionText = nextStatus === 'Y' ? 'menonaktifkan' : 'mengaktifkan';

  const result = await Swal.fire({
    title: 'Apakah Anda yakin?',
    text: `Anda akan ${actionText} rute ini.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Konfirmasi',
    cancelButtonText: 'Batal',
    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:4000/api/Modul_rute/perbaikan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Perbaikan: nextStatus })
      });

      if (response.ok) {
        const updatedRute = await response.json();
        dataTable.value = dataTable.value.map(item =>
          item._id === id ? { ...item, Perbaikan: nextStatus } : item
        );
        successDelete('Status Diperbarui!', '', 'center');
      } else {
        Swal.fire('Gagal', 'Tidak dapat memperbarui status.', 'error');
      }
    } catch (error) {
      Swal.fire('Error!', 'Terjadi kesalahan saat memperbarui status.', 'error');
    }
  }
};


const successDelete = async (title, text, position) => { 
  const isDarkMode = document.documentElement.classList.contains('dark')
  Swal.fire({
    position: position || "center",
    title: title || 'Update Success!', 
    text: text || '',
    timer: 1500,
    icon: 'success',
    showConfirmButton: false,
    toast: true,
    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  });
};
const isModalOpen = ref(false);
const savedData = ref({ Harga_tiket: [] });
const selectedRute = ref(null);

const openUpdateHarga = (rute) => {
  selectedRute.value = rute;
  // Tambahkan field hargaFormatted
  savedData.value.Harga_tiket = rute.Harga_tiket.map(kursi => ({
    ...kursi,
    hargaFormatted: kursi.harga?.toLocaleString("id-ID") || ""
  }));
  isModalOpen.value = true;
};
// Watch agar hargaFormatted diubah jadi angka dan kembali diformat
watch(
  () => savedData.value.Harga_tiket.map(k => k.hargaFormatted),
  (newVal) => {
    savedData.value.Harga_tiket.forEach((kursi, i) => {
      const clean = (newVal[i] || "").replace(/\./g, "");
      const num = parseInt(clean);
      kursi.harga = isNaN(num) ? 0 : num;
      kursi.hargaFormatted = kursi.harga ? kursi.harga.toLocaleString("id-ID") : "";
    });
  },
  { deep: true }
);


const closeModal = () => {
  isModalOpen.value = false;
  selectedRute.value = null;
};
const updateHargaTiket = async () => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  try {
    const response = await fetch(`http://localhost:4000/api/Modul_rute/updateHarga/${selectedRute.value._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Harga_tiket: savedData.value.Harga_tiket })
    });
    closeModal();
    if (response.ok) {
      Swal.fire({
        title: 'Berhasil!',
        text: 'Harga tiket berhasil diperbarui!',
        icon: 'success',
        confirmButtonText: 'OK',
        ...(isDarkMode && {
          background: '#1f2937',        // Tailwind `gray-800`
          color: '#f9fafb',             // Tailwind `gray-100`
          iconColor: '#facc15',         // Tailwind `yellow-400`
        })
      }).then(async () => {
        // 🔥 Hanya refresh data tabel, bukan reload seluruh halaman
        const updatedData = await getAllRute();
        dataTable.value = updatedData;
      });

    } else {
      Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui harga tiket.', 'error');
    }
  } catch (error) {
    Swal.fire('Error!', 'Terjadi kesalahan dalam permintaan.', 'error');
  }
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
          <!-- Tombol Pesawat -->
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-blue-600': vehicleTypeFilter === 'pesawat', 
              'hover:bg-blue-300': vehicleTypeFilter !== 'pesawat'
            }"
            @click="toggleFilter('pesawat')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiAirplane" fill="#"/>
            </svg>
          </button>

          <!-- Tombol Kereta -->
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-red-600': vehicleTypeFilter === 'kereta', 
              'hover:bg-blue-300': vehicleTypeFilter !== 'kereta'
            }"
            @click="toggleFilter('kereta')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiTrain" fill="#"/>
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
              <router-link to="/modules/modul-rute/add" class="px-1">
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
    <div class="max-w-full overflow-x-auto" :key="dataKey">
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
                :key="item._id"
                class="border"
              >
                <td class="pl-3 text-xs border">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="py-1 px-4 text-center border">
  <p 
    :class="{
      'bg-blue-600 text-white': item.Jenis_kendaraan === 'pesawat',
      'bg-red-600 text-white': item.Jenis_kendaraan === 'kereta'
    }"
    class="text-xs py-1 px-2 rounded">
    {{ item.Jenis_kendaraan === 'pesawat' ? 'Pesawat' : 'Kereta' }}
  </p>
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
                  <p class="text-black dark:text-white text-xs text-center">
                    {{ item.Waktu_perjalanan }} menit
                  </p>
                </td>
                <td class="py-1 px-4 border">
                  <ul class="list-disc pl-4"> <!-- Tambahkan list-disc dan padding kiri -->
    <li v-for="(harga, index) in item.Harga_tiket" :key="index" class="text-black dark:text-white text-xs">
      {{ harga.label }}: Rp {{ harga.harga.toLocaleString() }} 
    </li>
  </ul>
                </td>

            <td class="py-1 px-4">
              <div class="flex items-center space-x-3.5 d-flex justify-center">              

                <button 
    :disabled="item.Status_operasional === 'disable'"
    :class="{
      'cursor-not-allowed opacity-50': item.Status_operasional === 'disable',
      'hover:text-yellow-600': item.Status_operasional !== 'disable',
      'text-current': true
    }"
    @click="openUpdateHarga(item)">
    <svg 
      class="fill-current" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg">
      <path :d="mdiCashEdit" fill=""/>
    </svg>
  </button>



<button 
  :class="{
    'opacity-50': item.Perbaikan === 'Y',
    'hover:text-primary': item.Perbaikan === 'N'
  }"
  @click="togglePerbaikan(item._id, item.Perbaikan)">
  <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
    <path :d="mdiWrenchCogOutline" fill=""/>
  </svg>
</button>


              </div>
            </td>
          </tr> 
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
  <div class="bg-white dark:bg-form-input rounded-lg p-6 w-1/2">
    <h2 class="text-xl font-semibold mb-4 text-black dark:text-white">Update Harga Tiket</h2>

    <div class="flex flex-col">
      <DefaultCard cardTitle="Input Kursi">
        <div class="p-6.5">
          <div
            class="flex flex-col gap-2"
            v-for="(kursi, index) in savedData.Harga_tiket"
            :key="index"
          >
            <div class="w-full flex items-center gap-4">
              <!-- Label kursi -->
              <span class="text-sm font-medium text-black dark:text-white w-1/3">
                {{ kursi.label }}
              </span>

              <!-- Input Harga -->
              <input
  inputmode="numeric"
  pattern="[0-9]*"
  placeholder="Harga"
  class="w-2/3 rounded-lg border-[1.5px] text-black dark:text-white border-stroke dark:border-form-strokedark bg-transparent dark:bg-form-input py-3 px-5 font-normal outline-none transition focus:border-primary dark:focus:border-primary"
  v-model="kursi.hargaFormatted"
/>


            </div>
          </div>
        </div>
      </DefaultCard>
    </div>

    <div class="flex justify-end mt-4">
      <button
        @click="closeModal"
        class="mr-2 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-700"
      >
        Batal
      </button>
      <button
        @click="updateHargaTiket"
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
      >
        Konfirmasi
      </button>
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
    </div>
  </DefaultLayout>
</template>
