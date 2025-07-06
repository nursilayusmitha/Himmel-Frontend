<script setup lang="ts">
import DataStatsOne from '@/components/DataStats/DataStatsOne.vue'
import ChartOne from '@/components/Charts/ChartOne.vue'
import ChartTwo from '@/components/Charts/ChartTwo.vue'
import ChatCard from '@/components/ChatCard.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

import { ref, onMounted } from "vue";
import axios from "axios";


import { useIndexStore } from "@/stores";

const indexStore = useIndexStore();


// Format angka dengan titik untuk ribuan dan Rp untuk uang
const formatCurrency = (value) => {
  if (typeof value === "number") {
    return `Rp ${value.toLocaleString("id-ID")}`;
  }
  return value;
};


</script>

<template>
  
  <DefaultLayout>
    
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
      <DataStatsOne />
    </div>

    <div class="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
      <ChartOne />
      <ChartTwo />
      <ChatCard />
    </div>
  </DefaultLayout>
</template>
