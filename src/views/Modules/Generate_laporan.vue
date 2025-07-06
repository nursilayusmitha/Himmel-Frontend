<script setup lang="ts">
import { ref, computed, onMounted,watch } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { mdiReload,mdiMicrosoftExcel    } from '@mdi/js';

import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
const pageTitle = ref('Laporan - Generate Laporan')
const pageList = ref (['Laporan', 'Generate Laporan'])
const dataHeader = ref([
  {name: 'Jumlah Teknis', class: 'min-w-[80px] py-2 px-4'},
  {name: 'Total Tiket Terjual', class: 'min-w-[80px] py-2 px-4'},
  {name: 'Total Penjualan', class: 'min-w-[200px] py-2 px-4'},
  {name: 'Total Pendapatan', class: 'min-w-[200px] py-2 px-4'},
  {name: 'Total Diskon Dikeluarkan', class: 'min-w-[200px] py-2 px-4'},
])
const dataHeader2 = ref([
  {name: 'Jumlah Transportasi', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Jumlah Rute', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Jumlah User Eksternal', class: 'min-w-[100px] py-2 px-4'},
  {name: 'Jumlah User Internal', class: 'min-w-[100px] py-2 px-4'},
])
let dataTable = ref([])
const searchQuery = ref("");
function pad2(n: string | number) {
  return n.toString().padStart(2, "0");
}

function setDefaultInputByType(type: string) {
  const now = new Date();
  const hari = pad2(now.getDate());
  const bulan = pad2(now.getMonth() + 1);
  const tahun = now.getFullYear().toString();

  if (type === "harian") inputs.value = { hari, bulan, tahun, minggu: "" };
  else if (type === "mingguan") {
    const week = getWeekOfMonth(now);
    inputs.value = { minggu: week.toString(), bulan, tahun, hari: "" };
  } else if (type === "bulanan") {
    inputs.value = { bulan, tahun, hari: "", minggu: "" };
  } else if (type === "tahunan") {
    inputs.value = { tahun, hari: "", bulan: "", minggu: "" };
  } else {
    inputs.value = { hari: "", bulan: "", tahun: "", minggu: "" };
  }
}



import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val)
}

const formatNumber = (val: number) => {
  return val.toLocaleString('id-ID')
}

const exportToExcel = async () => {
  if (!laporanData.value) return

  const header = laporanHeader.value
  const range = laporanTanggal.value
  const tipe = selectedType.value

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Laporan')

  // Set kolom hanya sampai B
  sheet.columns = [
    { header: 'Keterangan', key: 'keterangan', width: 40 },
    { header: 'Jumlah', key: 'jumlah', width: 25 },
  ]

  // Baris 1: Judul
  sheet.mergeCells('A1:B1')
  const headerCell = sheet.getCell('A1')
  headerCell.value = header
  headerCell.font = { bold: true, size: 16 }
  headerCell.alignment = { horizontal: 'center' }
  headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }

  // Baris 2: Rentang Waktu
  sheet.mergeCells('A2:B2')
  const rangeCell = sheet.getCell('A2')
  rangeCell.value = 'Rentang Waktu: ' + range
  rangeCell.font = { bold: true }
  rangeCell.alignment = { horizontal: 'center' }
  rangeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D9E1F2' } }

  sheet.addRow([]) // baris kosong

  // Baris Header Tabel (A4 & B4)
  const tableHeader = sheet.addRow(['Keterangan', 'Jumlah'])
  tableHeader.getCell(1).font = { bold: true }
  tableHeader.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BDD7EE' } }
  tableHeader.getCell(1).border = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  }
  tableHeader.getCell(2).font = { bold: true }
  tableHeader.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'BDD7EE' } }
  tableHeader.getCell(2).border = {
    top: { style: 'thin' },
    bottom: { style: 'thin' },
    left: { style: 'thin' },
    right: { style: 'thin' },
  }

  // Baris data
  const rows = [
    ['Jumlah Teknis', formatNumber(laporanData.value.jumlahTeknis)],
    ['Total Tiket Terjual', formatNumber(laporanData.value.jumlahPesanan)],
    ['Total Penjualan', formatRupiah(laporanData.value.jumlahTiketTerjual)],
    ['Total Pendapatan', formatRupiah(laporanData.value.jumlahPemasukan)],
    ['Total Diskon Dikeluarkan', formatRupiah(laporanData.value.jumlahDiskon)],
    [
      'Jumlah Transportasi',
      tipe === 'semua'
        ? formatNumber(laporanData.value.jumlahTransportAll)
        : `${formatNumber(laporanData.value.jumlahTransportAll)} (+${formatNumber(laporanData.value.jumlahTransport)})`,
    ],
    [
      'Jumlah Rute',
      tipe === 'semua'
        ? formatNumber(laporanData.value.jumlahRuteAll)
        : `${formatNumber(laporanData.value.jumlahRuteAll)} (+${formatNumber(laporanData.value.jumlahRute)})`,
    ],
    [
      'Jumlah User Eksternal',
      tipe === 'semua'
        ? formatNumber(laporanData.value.jumlahUserEksternalAll)
        : `${formatNumber(laporanData.value.jumlahUserEksternalAll)} (+${formatNumber(laporanData.value.jumlahUserEksternal)})`,
    ],
    [
      'Jumlah User Internal',
      tipe === 'semua'
        ? formatNumber(laporanData.value.jumlahUserInternalAll)
        : `${formatNumber(laporanData.value.jumlahUserInternalAll)} (+${formatNumber(laporanData.value.jumlahUserInternal)})`,
    ],
  ]

  // Tambahkan baris dan style hanya A & B saja
  rows.forEach((row, i) => {
    const r = sheet.addRow(row)
    const isEven = i % 2 === 0

    const fillColor = isEven ? 'F3F3F3' : undefined

    r.getCell(1).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
    r.getCell(2).border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }

    if (fillColor) {
      r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }
      r.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: fillColor } }
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  saveAs(blob, `${header}.xlsx`)
}



// helper minggu ke-
function getWeekOfMonth(date: Date) {
  const startWeek = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  return Math.ceil((date.getDate() + startWeek) / 7);
}

const optionsType = [
  { label: "Semua", value: "semua" },
  { label: "Harian", value: "harian" },
  { label: "Mingguan", value: "mingguan" },
  { label: "Bulanan", value: "bulanan" },
  { label: "Tahunan", value: "tahunan" },
];

const selectedType = ref("");
const inputs = ref({ hari: "", minggu: "", bulan: "", tahun: "" });

const laporanHeader = ref("");
const laporanTanggal = ref("");
const laporanData = ref(null);

const handleOptionChange = (option: any) => {
  selectedType.value = option.value;
  setDefaultInputByType(option.value);
  if (option.value === "semua") fetchLaporan(); // hanya semua yg fetch langsung
};


watch(inputs, () => {
  const tipe = selectedType.value;
  if (tipe === "harian" && inputs.value.hari && inputs.value.bulan && inputs.value.tahun) fetchLaporan();
  if (tipe === "mingguan" && inputs.value.minggu && inputs.value.bulan && inputs.value.tahun) fetchLaporan();
  if (tipe === "bulanan" && inputs.value.bulan && inputs.value.tahun) fetchLaporan();
  if (tipe === "tahunan" && inputs.value.tahun) fetchLaporan();
});
const fetchLaporan = async () => {
  const tipe = selectedType.value;

  // validasi input sesuai tipe
  if (tipe === "harian" && (!inputs.value.hari || !inputs.value.bulan || !inputs.value.tahun)) return;
  if (tipe === "mingguan" && (!inputs.value.minggu || !inputs.value.bulan || !inputs.value.tahun)) return;
  if (tipe === "bulanan" && (!inputs.value.bulan || !inputs.value.tahun)) return;
  if (tipe === "tahunan" && !inputs.value.tahun) return;

  const body = {
    tipe,
    hari: pad2(inputs.value.hari),
    minggu: inputs.value.minggu,
    bulan: pad2(inputs.value.bulan),
    tahun: inputs.value.tahun,
  };

  try {
    const res = await fetch('http://localhost:4000/api/Modul_teknis/generateLaporan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    laporanData.value = data;

    // Label header dan tanggal
    const tipeLabel = selectedType.value === 'semua'
      ? 'Seluruh Data'
      : optionsType.find(opt => opt.value === selectedType.value)?.label;

    laporanHeader.value = `Laporan ${tipeLabel}`;
    const start = new Date(data.rentang.startDate).toLocaleDateString('id-ID');
    const end = new Date(data.rentang.endDate).toLocaleDateString('id-ID');
    laporanTanggal.value = start === end ? start : `${start} - ${end}`;
  } catch (err) {
    console.error('Gagal ambil laporan', err);
  }
};


// Pagination state
const currentPage = ref(1);
const itemsPerPage = 20;

// Filtered data based on search query
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return dataTable.value;
  return dataTable.value.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Paginated data based on filtered results
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

onMounted(() => {
  selectedType.value = "semua";
  inputs.value = { hari: "", bulan: "", tahun: "", minggu: "" };
  fetchLaporan();
});


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
            <div class="flex flex-col gap-3 xl:flex-row justify-between items-center mb-3">
  <!-- Kiri: Select -->
  <div class="flex gap-2 items-center">
    <SelectGroup
      placeholder="Pilih Jenis Laporan"
      :options="optionsType"
      @option-changed="handleOptionChange"
    />
    <div class="flex flex-wrap items-center gap-3">
      <input
        v-if="selectedType === 'harian'"
        v-model="inputs.hari"
        type="number"
        placeholder="Hari"
        class="w-full max-w-[150px] rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      />
      <input
        v-if="['harian', 'mingguan', 'bulanan'].includes(selectedType)"
        v-model="inputs.bulan"
        type="number"
        placeholder="Bulan"
        class="w-full max-w-[150px] rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      />
      <input
        v-if="['harian', 'mingguan', 'bulanan', 'tahunan'].includes(selectedType)"
        v-model="inputs.tahun"
        type="number"
        placeholder="Tahun"
        class="w-full max-w-[150px] rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      />
      <input
        v-if="selectedType === 'mingguan'"
        v-model="inputs.minggu"
        type="number"
        placeholder="Minggu Ke-"
        class="w-full max-w-[150px] rounded-lg border-[1.5px] text-black bg-transparent py-3 px-5 font-normal outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:text-white dark:bg-form-input"
      />
    </div>
  </div>

  <!-- Kanan: Button -->
  <div class="flex items-center">
    <button @click="exportToExcel" class="bg-blue-500 text-white px-2 py-2 rounded mr-3 flex gap-2"><svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
        <path :d="mdiMicrosoftExcel " fill="white" />
      </svg>Export to Excel</button>
    <button
      class="bg-black text-white p-2 rounded-md"
      @click="fetchLaporan"
    >
      <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24">
        <path :d="mdiReload" fill="white" />
      </svg>
    </button>
  </div>
</div>

<hr class="my-4 border-gray-300 dark:border-gray-600" />
            <div v-if="laporanData" class="mt-6 justify-center flex flex-col items-center">
              <h4 class="text-title-md2 font-medium text-black dark:text-white">{{ laporanHeader }}</h4>
  <p class="text-sm text-gray-600 dark:text-gray-300">{{ laporanTanggal }}</p>
</div>

    <div class="max-w-full overflow-x-auto">
      <table class="w-full table-auto mt-3">
        <thead>
          <tr class="bg-gray-200 text-left dark:bg-meta-4">
          <th v-for="data in dataHeader" :class="data.class" class="font-medium text-black dark:text-white text-center">
          {{ data.name }}
          </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="laporanData" class="border">
  <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">{{ laporanData.jumlahTeknis.toLocaleString('id-ID') }}</td>
  <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">{{ laporanData.jumlahPesanan.toLocaleString('id-ID') }}</td>
  <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">{{ laporanData.jumlahTiketTerjual.toLocaleString('id-ID') }}</td>
  <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">{{ laporanData.jumlahPemasukan.toLocaleString('id-ID') }}</td>
  <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">{{ laporanData.jumlahDiskon.toLocaleString('id-ID') }}</td>
</tr>
        </tbody>
      </table>
    </div>
    <hr class="my-4 border-gray-300 dark:border-gray-600" />
    <div class="max-w-full overflow-x-auto">
      <table class="w-full table-auto mt-3">
        <thead>
          <tr class="bg-gray-200 text-left dark:bg-meta-4">
          <th v-for="data in dataHeader2" :class="data.class" class="font-medium text-black dark:text-white text-center">
          {{ data.name }}
          </th>
          </tr>
        </thead>
       <tbody>
  <tr v-if="laporanData" class="border">
    <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">
      {{ laporanData.jumlahTransportAll }}
      <span v-if="selectedType !== 'semua'" class="text-primary">(+{{ laporanData.jumlahTransport }})</span>
    </td>
    <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">
      {{ laporanData.jumlahRuteAll }}
      <span v-if="selectedType !== 'semua'" class="text-primary">(+{{ laporanData.jumlahRute }})</span>
    </td>
    <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">
      {{ laporanData.jumlahUserEksternalAll }}
      <span v-if="selectedType !== 'semua'" class="text-primary">(+{{ laporanData.jumlahUserEksternal }})</span>
    </td>
    <td class="py-1 px-4 border text-xs text-black dark:text-white text-center">
      {{ laporanData.jumlahUserInternalAll }}
      <span v-if="selectedType !== 'semua'" class="text-primary">(+{{ laporanData.jumlahUserInternal }})</span>
    </td>
  </tr>
</tbody>

      </table>
    </div>

  </div>
  
    </div>
  </DefaultLayout>
</template>
