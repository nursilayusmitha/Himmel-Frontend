<script setup lang="ts">
import { ref, onMounted } from 'vue'
// @ts-ignore
import VueApexCharts from 'vue3-apexcharts'
import axios from 'axios'

const chart = ref(null)
const chartData = ref({ series: [], labels: [] })
const apexOptions = ref({})
const activeFilter = ref<'day' | 'week' | 'month'>('month')
const dateRange = ref('')

// Format label Y-axis
const formatYAxisLabel = (value: number) => {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(0) + 'M'
  } else if (value >= 1_000_000) {
    return value.toLocaleString('id-ID') // 1.000.000
  } else if (value >= 1_000) {
    return value.toLocaleString('id-ID') // 1.000
  } else {
    return value
  }
}

const formatShortDate = (iso: string) => {
  const date = new Date(iso)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

const fetchData = async () => {
  const res = await axios.post('http://localhost:4000/api/Modul_teknis/generateLaporanTahunan')
  const { harian, mingguan, bulanan, rentang } = res.data

  const formatDate = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  dateRange.value = rentang.formatted[activeFilter.value]

  const buildChartData = (mode: 'day' | 'week' | 'month') => {
    let labels: string[] = []
    let tiket: number[] = []
    let pendapatan: number[] = []
    let maxVal = 0

    if (mode === 'day') {
      labels = harian.map((d: any) => d.tanggal)
      tiket = harian.map((d: any) => d.jumlahTiketTerjual)
      pendapatan = harian.map((d: any) => d.jumlahPemasukan)
      dateRange.value = rentang.formatted.harian

      const allValues = [...tiket, ...pendapatan]
      maxVal = Math.max(...allValues)

    } else if (mode === 'week') {
      labels = mingguan.map((d: any) => d.label)
      tiket = mingguan.map((d: any) => d.jumlahTiketTerjual)
      pendapatan = mingguan.map((d: any) => d.jumlahPemasukan)
      dateRange.value = rentang.formatted.mingguan

      const allValues = [...tiket, ...pendapatan]
      maxVal = Math.max(...allValues)

    } else {
      labels = bulanan.map((d: any) => d.bulan)
      tiket = bulanan.map((d: any) => d.jumlahTiketTerjual)
      pendapatan = bulanan.map((d: any) => d.jumlahPemasukan)
      dateRange.value = rentang.formatted.bulanan

      const allValues = [...tiket, ...pendapatan]
      maxVal = Math.max(...allValues)
    }

    chartData.value = {
      labels,
      series: [
        { name: 'Total Penjualan', data: tiket },
        { name: 'Total Pendapatan', data: pendapatan }
      ]
    }

    apexOptions.value = {
      legend: { show: false, position: 'top', horizontalAlign: 'left' },
      colors: ['#3C50E0', '#80CAEE'],
      chart: {
        fontFamily: 'Satoshi, sans-serif',
        height: 335,
        type: 'area',
        toolbar: { show: false },
        dropShadow: {
          enabled: true,
          color: '#623CEA14',
          top: 10,
          blur: 4,
          left: 0,
          opacity: 0.1
        }
      },
      stroke: { width: [2, 2], curve: 'straight' },
      dataLabels: { enabled: false },
      markers: {
        size: 4,
        colors: '#fff',
        strokeColors: ['#3056D3', '#80CAEE'],
        strokeWidth: 3
      },
      grid: {
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } }
      },
      xaxis: {
        type: 'category',
        categories: labels,
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        min: 0,
        max: maxVal,
        title: { style: { fontSize: '0px' } },
        labels: {
          formatter: formatYAxisLabel
        }
      }
    }
  }

  buildChartData(activeFilter.value)
}


const changeFilter = (type: 'day' | 'week' | 'month') => {
  activeFilter.value = type
  fetchData()
}

onMounted(fetchData)
</script>
<template>
  <div class="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-7.5 pb-5 shadow-default dark:border-strokedark dark:bg-boxdark dark:shadow-md">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="flex flex-wrap gap-3">
        <div class="flex min-w-47.5">
          <span class="mt-1 mr-2 flex h-4 max-w-4 items-center justify-center rounded-full border border-primary dark:border-primary">
            <span class="block h-2.5 max-w-2.5 rounded-full bg-primary"></span>
          </span>
          <div>
            <p class="font-semibold text-primary dark:text-white">Total Penjualan</p>
            <p class="text-sm font-medium text-body dark:text-bodydark">Rentang: {{ dateRange }}</p>
          </div>
        </div>
        <div class="flex min-w-47.5">
          <span class="mt-1 mr-2 flex h-4 max-w-4 items-center justify-center rounded-full border border-secondary dark:border-secondary">
            <span class="block h-2.5 max-w-2.5 rounded-full bg-secondary"></span>
          </span>
          <div>
            <p class="font-semibold text-secondary dark:text-white">Total Pendapatan</p>
            <p class="text-sm font-medium text-body dark:text-bodydark">Rentang: {{ dateRange }}</p>
          </div>
        </div>
      </div>
      <div class="flex">
        <div class="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
          <button
            @click="changeFilter('day')"
            :class="[
              'rounded py-1 px-3 text-xs font-medium',
              activeFilter === 'day'
                ? 'bg-white shadow-card dark:bg-boxdark dark:text-white'
                : 'hover:bg-white dark:hover:bg-meta-4 dark:text-bodydark'
            ]"
          >
            Day
          </button>
          <button
            @click="changeFilter('week')"
            :class="[
              'rounded py-1 px-3 text-xs font-medium',
              activeFilter === 'week'
                ? 'bg-white shadow-card dark:bg-boxdark dark:text-white'
                : 'hover:bg-white dark:hover:bg-meta-4 dark:text-bodydark'
            ]"
          >
            Week
          </button>
          <button
            @click="changeFilter('month')"
            :class="[
              'rounded py-1 px-3 text-xs font-medium',
              activeFilter === 'month'
                ? 'bg-white shadow-card dark:bg-boxdark dark:text-white'
                : 'hover:bg-white dark:hover:bg-meta-4 dark:text-bodydark'
            ]"
          >
            Month
          </button>
        </div>
      </div>
    </div>

    <div id="chartOne" class="-ml-5 mt-5">
      <VueApexCharts
        type="area"
        height="350"
        :options="apexOptions"
        :series="chartData.series"
        ref="chart"
      />
    </div>
  </div>
</template>
