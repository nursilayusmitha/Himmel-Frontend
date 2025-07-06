<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import {
  mdiTicketConfirmation,
  mdiCash,
  mdiAccountGroup,
  mdiInvoiceCheck,
} from "@mdi/js";

// Format angka ke format rupiah
const formatShortCurrency = (value: number) => {
  if (typeof value !== "number") return value;

  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
  } else if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  } else if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(1)}rb`;
  } else {
    return `Rp ${value}`;
  }
};


// Data laporan dari API
const laporan = ref<any>({});
const growthRate = ref<any>({});

const fetchLaporan = async () => {
  try {
    // Data laporan total all-time
    const laporanRes = await axios.post(
      "http://localhost:4000/api/Modul_teknis/generateLaporan",
      { tipe: "semua" }
    );
    laporan.value = laporanRes.data;

    // Data growth rate terhadap all-time hingga kemarin
    const growthRes = await axios.post(
      "http://localhost:4000/api/Modul_teknis/generateGrowthCompareAllTimeBeforeToday"
    );
    growthRate.value = growthRes.data.growthRateComparedToAllTimeBeforeToday;

  } catch (error) {
    console.error("Gagal mengambil laporan", error);
  }
};

onMounted(fetchLaporan);

// Data card yang akan dirender, otomatis update saat laporan berubah
const cardItems = computed(() => [
  {
    iconPath: mdiInvoiceCheck,
    title: "Total Pesanan",
    total: laporan.value?.jumlahPesanan ?? 0,
    growthRate: growthRate.value?.jumlahPesanan,
  },
  {
    iconPath: mdiTicketConfirmation,
    title: "Total Penjualan",
    total: formatShortCurrency(laporan.value?.jumlahTiketTerjual ?? 0),
    growthRate: growthRate.value?.jumlahTiketTerjual,
  },
  {
    iconPath: mdiCash,
    title: "Total Pendapatan",
    total: formatShortCurrency(laporan.value?.jumlahPemasukan ?? 0),
    growthRate: growthRate.value?.jumlahPemasukan,
  },
  {
    iconPath: mdiAccountGroup,
    title: "Total Users",
    total: laporan.value?.jumlahUserEksternal ?? 0,
    growthRate: growthRate.value?.jumlahUserEksternal,
  },
]);


</script>
<template>
  <div
    v-for="(item, index) in cardItems"
    :key="index"
    class="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark"
  >
    <!-- Icon dengan background bulat -->
    <div
      class="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"
    >
      <svg
        class="fill-primary dark:fill-white"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path :d="item.iconPath" />
      </svg>
    </div>

    <!-- Data laporan -->
    <div class="mt-4 flex items-end justify-between">
      <div>
        <h4 class="text-title-md font-bold text-black dark:text-white">
          {{ item.total }}
        </h4>
        <span class="text-sm font-medium">{{ item.title }}</span>
      </div>

     <!-- Persentase -->
<span
  v-if="item.growthRate !== undefined && item.growthRate !== null"
  class="flex items-center gap-1 text-sm font-medium"
  :class="{
    'text-meta-3': item.growthRate > 0,
    'text-meta-5': item.growthRate < 0,
    'text-slate-400': item.growthRate === 0,
  }"
>
  <!-- Nilai -->
  <template v-if="item.growthRate > 0">
    {{ item.growthRate }}%
    <svg
      class="fill-meta-3"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 0L10 10H0L5 0Z" />
    </svg>
  </template>

  <template v-else-if="item.growthRate < 0">
    {{ Math.abs(item.growthRate) }}%
    <svg
      class="fill-meta-5"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 10L0 0H10L5 10Z" />
    </svg>
  </template>

  <template v-else>
    Growth Rate
  </template>
</span>


    </div>
  </div>
</template>
