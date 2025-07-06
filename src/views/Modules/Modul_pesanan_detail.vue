<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import router from "@/router";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const pageTitle = ref("Detail Pesanan");
const pageList = ref(["Modul", "Pesanan", "Detail"]);

// Data pesanan yang akan diambil dari API
const pesanan = ref({
  userName: "",
  userPhone: "",
  email: "",
  Jenis_kendaraan: "",
  Nama_kendaraan: "",
  Nomor_kendaraan: "",
  Keberangkatan: "",
  Tujuan: "",
  Kode_kursi: "",
  Harga_tiket: "",
  Status: "",
  Verifikasi: "",
  qrCode: "",
});

onMounted(async () => {
  try {
    const id = route.params.id;
    const response = await axios.get(`http://localhost:4000/api/modul_pesanan/pesanan/${id}`);
    pesanan.value = response.data.data;
  } catch (error) {
    console.error("Gagal mengambil detail pesanan:", error);
  }
});
const keberangkatanText = computed(() => {
  const data = pesanan.value;
  if (Array.isArray(data.Keberangkatan) && data.Keberangkatan.length > 0) {
    const lokasi = data.Keberangkatan[0];
    if (data.Jenis_kendaraan === 'pesawat') {
      return `${lokasi.bandaraName || 'Nama tidak tersedia'}, ${lokasi.bandaraLocation || 'Lokasi tidak tersedia'}`;
    } else if (data.Jenis_kendaraan === 'kereta') {
      return `${lokasi.stasiunName || 'Nama tidak tersedia'}, ${lokasi.stasiunLocation || 'Lokasi tidak tersedia'}`;
    }
  }
  return "Data tidak tersedia";
});

const tujuanText = computed(() => {
  const data = pesanan.value;
  if (Array.isArray(data.Tujuan) && data.Tujuan.length > 0) {
    const lokasi = data.Tujuan[0];
    if (data.Jenis_kendaraan === 'pesawat') {
      return `${lokasi.bandaraName || 'Nama tidak tersedia'}, ${lokasi.bandaraLocation || 'Lokasi tidak tersedia'}`;
    } else if (data.Jenis_kendaraan === 'kereta') {
      return `${lokasi.stasiunName || 'Nama tidak tersedia'}, ${lokasi.stasiunLocation || 'Lokasi tidak tersedia'}`;
    }
  }
  return "Data tidak tersedia";
});

</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />

    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard cardTitle="Detail Pesanan">
          <div class="flex flex-col gap-2 p-6.5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Nama:</label>
                <input type="text" v-model="pesanan.userName" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">No. Telepon:</label>
                <input type="text" v-model="pesanan.userPhone" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Email:</label>
                <input type="text" v-model="pesanan.email" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Jenis Kendaraan:</label>
                <input type="text" v-model="pesanan.Jenis_kendaraan" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Nama Kendaraan:</label>
                <input type="text" v-model="pesanan.Nama_kendaraan" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Nomor Kendaraan:</label>
                <input type="text" v-model="pesanan.Nomor_kendaraan" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Keberangkatan:</label>
                <input type="text" :value="keberangkatanText" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Tujuan:</label>
                <input type="text" :value="tujuanText" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Kode Kursi:</label>
                <input type="text" v-model="pesanan.Kode_kursi" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
  <label class="block text-sm font-medium text-black dark:text-white">Harga Tiket:</label>
  <input
    type="text"
    :value="`Rp ${Number(pesanan.Harga_tiket || 0).toLocaleString('id-ID')}`"
    readonly
    class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white"
  />
</div>

              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Status:</label>
                <input type="text" v-model="pesanan.Status" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
              <div>
                <label class="block text-sm font-medium text-black dark:text-white">Verifikasi:</label>
                <input type="text" v-model="pesanan.Verifikasi" disabled class="w-full border border-stroke rounded-lg p-2 dark:bg-form-input dark:border-form-strokedark dark:text-white" />
              </div>
            </div>

            <!-- QR Code -->
            <div v-if="pesanan.qrCode" class="mt-6 text-center">
              <h3 class="font-semibold dark:text-white">QR Code Tiket:</h3>
              <img :src="pesanan.qrCode" alt="QR Code Tiket" class="w-40 h-40 border rounded mx-auto" />
            </div>
          </div>
        </DefaultCard>
      </div>

      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard>
          <div class="pb-6 px-4">
            <button @click="router.back()" class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-300">Kembali</button>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
