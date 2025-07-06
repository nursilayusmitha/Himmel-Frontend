<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { getAllPesanan } from '@/stores/functionAPI'
import Swal from 'sweetalert2'
import { mdiTrashCanOutline, mdiEyeOutline, mdiCash , mdiMagnify, mdiRefresh, mdiPlusCircleOutline, mdiCloseOctagon, mdiTimerAlert,mdiTimerRemove,mdiTimerCheck,mdiTimerCog    } from '@mdi/js';

const pageTitle = ref('Modul - Pesanan')
const pageList = ref (['Modul', 'Pesanan'])
const dataHeader = ref([
  {name: 'No.', class: 'py-2 pl-3'},
  {name: 'ID Teknis', class: 'min-w-[80px] py-2 px-4'},
  {name: 'Nama Pembeli', class: 'min-w-[140px] py-2 px-4'},
  {name: 'No. HP', class: 'min-w-[100px] py-2 px-4'},
  {name: 'No. Kendaraan', class: 'min-w-[140px] py-2 px-4'},
  {name: 'Harga Tiket', class: 'min-w-[170px] py-2 px-4'},
  {name: 'Tanggal Berangkat ', class: 'min-w-[170px] py-2 px-4'},
  {name: 'Status', class: 'min-w-[80px] py-2 px-4'},
  {name: 'Verifikasi', class: 'min-w-[80px] py-2 px-4'},
])
let dataTable = ref([])
const searchQuery = ref("");

import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import dayjs from 'dayjs'

const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Data Pesanan')

  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFDDDDDD' }
  }
  const headerBorder = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  }

  // === HEADER UTAMA ===
  worksheet.mergeCells('A1:J1')
  worksheet.getCell('A1').value = 'Data Pesanan'
  worksheet.getCell('A1').font = { size: 16, bold: true }
  worksheet.getCell('A1').alignment = { horizontal: 'center' }
  worksheet.getCell('A1').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  }

  worksheet.mergeCells('A2:J2')
  worksheet.getCell('A2').value = 'Tanggal Export: ' + dayjs().format('DD/MM/YYYY HH:mm')
  worksheet.getCell('A2').alignment = { horizontal: 'center' }
  worksheet.getCell('A2').fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFEFEFEF' }
  }

  worksheet.addRow([]) // Baris kosong sebelum tabel

  // === MERGE HEADER ===
  worksheet.mergeCells('A4:A5')
  worksheet.mergeCells('B4:B5')
  worksheet.mergeCells('C4:C5')
  worksheet.mergeCells('D4:D5')
  worksheet.mergeCells('E4:E5')
  worksheet.mergeCells('F4:F5')
  worksheet.mergeCells('G4:H4') // merge G4 dan H4 jadi 1 judul
  worksheet.mergeCells('I4:I5')
  worksheet.mergeCells('J4:J5')

  // === ISI HEADER ===
  worksheet.getCell('A4').value = 'No.'
  worksheet.getCell('B4').value = 'ID Teknis'
  worksheet.getCell('C4').value = 'Nama Pembeli'
  worksheet.getCell('D4').value = 'No. HP'
  worksheet.getCell('E4').value = 'No. Kendaraan'
  worksheet.getCell('F4').value = 'Harga Tiket'
  worksheet.getCell('G4').value = 'Tanggal Berangkat'
  worksheet.getCell('I4').value = 'Status'
  worksheet.getCell('J4').value = 'Verifikasi'

  // === SUBHEADER (Row 5) untuk Tanggal & Jam ===
  worksheet.getCell('G5').value = 'Tanggal'
  worksheet.getCell('H5').value = 'Jam'

  // === STYLING HEADER (Row 4 & 5) ===
  for (let col = 1; col <= 10; col++) {
    const cell4 = worksheet.getRow(4).getCell(col)
    cell4.fill = headerFill
    cell4.font = { bold: true }
    cell4.alignment = { vertical: 'middle', horizontal: 'center' }
    cell4.border = headerBorder

    const cell5 = worksheet.getRow(5).getCell(col)
    cell5.fill = headerFill
    cell5.font = { bold: true }
    cell5.alignment = { vertical: 'middle', horizontal: 'center' }
    cell5.border = headerBorder
  }

  // === ISI DATA ===
  paginatedData.value.forEach((item, index) => {
    const row = worksheet.addRow([
      index + 1,
      item.teknisId?._id ?? '',
      item.userName,
      item.userPhone,
      item.Nomor_kendaraan,
      'Rp ' + Number(item.Harga_tiket || 0).toLocaleString('id-ID'),
      item.Berangkat_date,
      item.Berangkat_time,
      item.Status,
      item.Verifikasi
    ])

    row.eachCell((cell, colNumber) => {
      cell.border = headerBorder
      cell.alignment = { vertical: 'middle', horizontal: 'center' }

      // Rata kiri untuk Nama, Harga, Tanggal, Jam
      if ([3, 6, 7, 8].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'left' }
      }
    })

    if (index % 2 === 1) {
      row.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF7F7F7' }
        }
      })
    }
  })

  // === LEBAR KOLOM ===
  worksheet.getColumn(1).width = 5
  worksheet.getColumn(2).width = 25
  worksheet.getColumn(3).width = 25
  worksheet.getColumn(4).width = 16
  worksheet.getColumn(5).width = 14
  worksheet.getColumn(6).width = 20
  worksheet.getColumn(7).width = 18
  worksheet.getColumn(8).width = 13
  worksheet.getColumn(9).width = 12
  worksheet.getColumn(10).width = 14

  // === EXPORT FILE ===
  const buffer = await workbook.xlsx.writeBuffer()
  saveAs(new Blob([buffer]), `DataPesanan_${dayjs().format('YYYYMMDD_HHmmss')}.xlsx`)
}




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
    result = result.filter(item => item.Status === statusTeknisFilter.value);
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
  const data = await getAllPesanan()
  dataTable.value = data
})


const cancelPesanan = async (id) => {
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
        const response = await fetch(`http://localhost:4000/api/modul_pesanan/cancelOrder/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Status: "cancel" }) // Sesuaikan dengan API backend
        });

        const result = await response.json();
        
        if (!response.ok) throw new Error(result.message || "Gagal mengubah status");

        // Perbarui dataTable tanpa menghapus item
        dataTable.value = dataTable.value.map(item => 
          item._id === id ? { ...item, Status: "cancel" } : item
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
    <button @click="exportToExcel" class="bg-blue-500 text-white px-2 py-2 rounded ">Export to Excel</button>
    
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-blue-600': statusTeknisFilter === 'order', 
              'hover:bg-blue-300': statusTeknisFilter !== 'order'
            }"
            @click="toggleFilter('order')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiTimerAlert" fill="#"/>
            </svg>
          </button>
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-blue-600': statusTeknisFilter === 'tiket', 
              'hover:bg-blue-300': statusTeknisFilter !== 'tiket'
            }"
            @click="toggleFilter('tiket')"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
              <path :d="mdiTimerCheck " fill="#"/>
            </svg>
          </button>
          <button
            class="bg-black text-white p-2 rounded-md"
            :class="{
              'bg-red-600': statusTeknisFilter === 'cancel', 
              'hover:bg-blue-300': statusTeknisFilter !== 'cancel'
            }"
            @click="toggleFilter('cancel')"
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
  <p class="text-black dark:text-white text-xs">{{ item.teknisId._id }}</p>
</td>

            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs ">{{ item.userName }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class="text-black dark:text-white text-xs ">{{ item.userPhone }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white text-center">{{ item.Nomor_kendaraan }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white text-center">Rp. {{ item.Harga_tiket.toLocaleString('id-ID') }}</p>
            </td>
            <td class="py-1 px-4 text-center border">
              <h5 class="font-medium text-black text-xs dark:text-white">{{ item.Berangkat_date }}</h5>
              <p class="text-xs">{{ item.Berangkat_time }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white text-center">{{ item.Status }}</p>
            </td>
            <td class="py-1 px-4 border">
              <p class=" text-xs text-black dark:text-white text-center">{{ item.Verifikasi }}</p>
            </td>
            <td class="py-1 px-4">
              <div class="flex items-center space-x-3.5 d-flex justify-center">              
                
                <router-link :class="item.Tr_teknis_status === 'closed' ? 'cursor-default opacity-50' : 'hover:text-primary'" class="" :to="'/modules/modul-pesanan/detail/'+item._id">
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

              <router-link
  :to="item.Status === 'order' ? '/modules/modul-pembayaran/add/' + item._id : ''"
  :class="item.Status === 'order' ? 'hover:text-primary' : 'cursor-not-allowed opacity-50 pointer-events-none'"
>
  <svg
    class="fill-current"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiCash " fill="#" />
  </svg>
</router-link>

<button
  :disabled="item.Status !== 'order'"
  :class="item.Status === 'order' ? 'hover:text-primary' : 'cursor-not-allowed opacity-50'"
  @click="item.Status === 'order' ? cancelPesanan(item._id) : null"
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
