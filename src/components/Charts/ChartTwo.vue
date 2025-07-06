<script setup lang="ts">
// @ts-ignore
import VueApexCharts from 'vue3-apexcharts'
import { onMounted, ref } from 'vue'
import axios from 'axios'

const chartData = ref({
  series: [
    { name: 'Penjualan', data: [] },
    { name: 'Pendapatan', data: [] }
  ],
  labels: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
})

const chart = ref(null)
const apexOptions = ref({}) // akan diisi nanti

const formatShortNumber = (num: number) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2).replace(/\.00$/, '')}jt`
  if (num >= 1_000) return `${(num / 1_000).toFixed(2).replace(/\.00$/, '')}rb`
  return num.toString()
}

const roundTo3Digits = (value: number) => {
  if (value === 0) return 0
  const raw = value + 100_000
  const str = Math.round(raw).toString()
  const firstThree = str.slice(0, 3)
  const zeros = str.length - 3
  return parseFloat((parseInt(firstThree) / Math.pow(10, zeros)).toFixed(2))
}

const selectedWeek = ref('mingguIni')

const fetchData = async (tipe: 'mingguIni' | 'mingguLalu') => {
  selectedWeek.value = tipe
  try {
    const res = await axios.get('http://localhost:4000/api/Modul_teknis/getLaporanMingguanPerHari')
    const data = res.data[tipe] || []

    const penjualan = data.map(d => d.jumlahTiketTerjual || 0)
    const pendapatan = data.map(d => d.jumlahPemasukan || 0)

    // Ambil nilai harian tertinggi & terendah dari penjualan dan pendapatan
    const allValues = [...penjualan, ...pendapatan]
const max = Math.max(...allValues)
const min = 0


    chartData.value.series = [
      { name: 'Penjualan', data: penjualan },
      { name: 'Pendapatan', data: pendapatan }
    ]

    apexOptions.value = {
      ...apexOptions.value,
      colors: ['#3056D3', '#80CAEE'],
      chart: {
        type: 'bar',
        height: 335,
        stacked: false,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 0,
          columnWidth: '25%',
          borderRadiusApplication: 'end',
          borderRadiusWhenStacked: 'last'
        }
      },
      dataLabels: { enabled: false },
      xaxis: {
        type: 'category',
        categories: chartData.value.labels
      },
      yaxis: {
        min,
        max,
        labels: {
          formatter: formatShortNumber
        }
      },
      legend: {
        position: 'top',
        horizontalAlign: 'left',
        fontFamily: 'Satoshi',
        fontWeight: 500,
        fontSize: '14px',
        markers: { radius: 99 }
      },
      fill: { opacity: 1 },
      responsive: [{
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: '25%'
            }
          }
        }
      }]
    }
  } catch (err) {
    console.error('Gagal mengambil data chart:', err)
  }
}

onMounted(() => {
  fetchData('mingguIni') // Default ke minggu ini
})
</script>


<template>
  <div class="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
    <div class="mb-4 justify-between gap-4 sm:flex">
      <div>
  <h4 class="text-xl font-bold text-black dark:text-white">
    Profit {{ selectedWeek === 'mingguIni' ? 'This Week' : 'Last Week' }}
  </h4>
</div>

      <div>
        <div class="relative z-20 inline-block">
  <select 
    @change="e => fetchData(e.target.value)"
    class="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none 
           text-gray-900 dark:text-white dark:bg-gray-800 dark:border-gray-700"
  >
    <option value="mingguIni">This Week</option>
    <option value="mingguLalu">Last Week</option>
  </select>

  <span class="pointer-events-none absolute top-1/2 right-3 z-10 -translate-y-1/2">
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path 
        d="M0.47 1.09c0-.06.03-.13.07-.17.1-.1.27-.1.37 0l3.94 3.71c.07.07.2.07.29 0l3.94-3.71c.1-.1.27-.1.37 0s.1.27 0 .37L5.5 4.99c-.28.25-.72.25-.99 0L0.56 1.28c-.06-.06-.09-.12-.09-.19Z" 
        :fill="isDarkMode ? '#ffffff' : '#637381'" 
      />
    </svg>
  </span>
</div>

      </div>
    </div>
    <div>
      <div id="chartTwo" class="-ml-5 -mb-9">
        <VueApexCharts
          type="bar"
          height="335"
          :options="apexOptions"
          :series="chartData.series"
          ref="chart"
        />
      </div>
    </div>
  </div>
</template>
