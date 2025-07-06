<script setup lang="ts">
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { getStrukById } from "@/stores/functionAPI";
import router from "@/router";

const route = useRoute();
const struk = ref(null);

onMounted(async () => {
  const id = route.params.id;
  try {
    const response = await getStrukById(id);
    if (response.success) {
      struk.value = response.data;
    }
  } catch (error) {
    console.error("Gagal mengambil struk:", error);
  }
});

const formatJenisKendaraan = (jenis) =>
  jenis === "pesawat" ? "Pesawat" : jenis === "kereta" ? "Kereta" : jenis;

const formatRupiah = (value) =>
  value && value !== 0 ? `Rp ${value.toLocaleString("id-ID")}` : "Rp 0";

const printStruk = () => {
  window.print();
};
</script>

<template>
  <!-- ✅ Normal Mode with Layout (hidden saat print) -->
  <DefaultLayout class="print:hidden">
    <div class="flex gap-4 mt-4 ml-7">
      <button @click="router.push('/modules/modul-pembayaran')" class="bg-primary text-white px-4 py-2 rounded shadow">
        Kembali
      </button>
      <button @click="printStruk" class="bg-primary text-white px-4 py-2 rounded shadow">
        Cetak Struk
      </button>
    </div>

    <div class="mt-6 p-4 border shadow-md max-w-xs mx-auto bg-white dark:bg-gray-900 text-black dark:text-white">
      <h2 class="text-center text-lg font-bold">Tiket Perjalanan</h2>
      <p class="text-center text-sm mt-2">Jl. Raya Purwosari No.01, Polerejo, Purwosari</p>
      <p class="text-center text-sm mb-2 mt-1">(0851)58556806</p>
      <hr class="border-t border-gray-500 my-2" />

      <div v-if="struk">
        <p><strong>Nama:</strong> {{ struk.userName }}</p>
        <p><strong>{{ formatJenisKendaraan(struk.jenis_kendaraan) }}:</strong> {{ struk.nama_kendaraan }} - {{ struk.nomor_kendaraan }}</p>
        <p><strong>Kode Kursi:</strong> {{ struk.kode_kursi }}</p>
        <p><strong>Tanggal Berangkat:</strong> {{ new Date(struk.tanggal_berangkat).toLocaleString() }}</p>

        <div v-if="struk.qrCode" class="mt-6 text-center">
          <h3 class="font-semibold">QR Code Tiket:</h3>
          <img :src="struk.qrCode" alt="QR Code" class="w-40 h-40 border rounded mx-auto" />
        </div>

        <hr class="border-t border-gray-500 my-2" />
        <div class="flex justify-between"><span>Harga Tiket:</span><span>{{ formatRupiah(struk.harga_tiket) }}</span></div>
        <div class="flex justify-between"><span>Harga Diskon:</span><span>{{ formatRupiah(struk.diskon) }}</span></div>
        <div class="flex justify-between"><span>Total:</span><span>{{ formatRupiah(struk.harga_total) }}</span></div>

        <template v-if="struk.metode === 'Mitra'">
          <div class="flex justify-between"><span>Bayar (Cash):</span><span>{{ formatRupiah(struk.bayar_cash) }}</span></div>
          <div class="flex justify-between font-bold"><span>Kembali:</span><span>{{ formatRupiah(struk.kembali) }}</span></div>
        </template>

        <template v-else-if="struk.metode === 'Qris'">
          <div class="flex justify-center mt-2">
            <span>ID Transaksi Qris : {{ struk.bukti_transaksi }}</span>
          </div>
        </template>

        <hr class="border-t border-gray-500 my-2" />
        <p class="text-center text-sm">Terima kasih telah menggunakan<br />layanan kami!</p>
      </div>
    </div>
  </DefaultLayout>

  <!-- ✅ Print Mode Only (tanpa Layout, hanya saat print) -->
  <div class="hidden print:block">
    <div class="w-[110mm] h-[220mm] p-4 mx-auto box-border bg-white text-black">
      <div class="max-w-xs mx-auto">
        <h2 class="text-center text-lg font-bold">Tiket Perjalanan</h2>
      <p class="text-center text-sm mt-2">Jl. Raya Purwosari No.01, Polerejo, Purwosari</p>
      <p class="text-center text-sm mb-2 mt-1">(0851)58556806</p>
      <hr class="border-t border-gray-500 my-2" />

      <div v-if="struk">
        <p><strong>Nama:</strong> {{ struk.userName }}</p>
        <p><strong>{{ formatJenisKendaraan(struk.jenis_kendaraan) }}:</strong> {{ struk.nama_kendaraan }} - {{ struk.nomor_kendaraan }}</p>
        <p><strong>Kode Kursi:</strong> {{ struk.kode_kursi }}</p>
        <p><strong>Tanggal Berangkat:</strong> {{ new Date(struk.tanggal_berangkat).toLocaleString() }}</p>

        <div v-if="struk.qrCode" class="mt-6 text-center">
          <h3 class="font-semibold">QR Code Tiket:</h3>
          <img :src="struk.qrCode" alt="QR Code" class="w-40 h-40 border rounded mx-auto" />
        </div>

        <hr class="border-t border-gray-500 my-2" />
        <div class="flex justify-between"><span>Harga Tiket:</span><span>{{ formatRupiah(struk.harga_tiket) }}</span></div>
        <div class="flex justify-between"><span>Harga Diskon:</span><span>{{ formatRupiah(struk.diskon) }}</span></div>
        <div class="flex justify-between"><span>Total:</span><span>{{ formatRupiah(struk.harga_total) }}</span></div>

        <template v-if="struk.metode === 'Mitra'">
          <div class="flex justify-between"><span>Bayar (Cash):</span><span>{{ formatRupiah(struk.bayar_cash) }}</span></div>
          <div class="flex justify-between font-bold"><span>Kembali:</span><span>{{ formatRupiah(struk.kembali) }}</span></div>
        </template>

        <template v-else-if="struk.metode === 'Qris'">
          <div class="flex justify-center mt-2">
            <span>ID Transaksi Qris : {{ struk.bukti_transaksi }}</span>
          </div>
        </template>

        <hr class="border-t border-gray-500 my-2" />
        <p class="text-center text-sm">Terima kasih telah menggunakan<br />layanan kami!</p>
      </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media print {
  @page {
    size: 110mm 220mm;
    margin: 0;
  }

  body {
    background: white !important;
  }
}
</style>
