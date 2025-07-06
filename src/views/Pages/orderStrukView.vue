<script setup lang="ts">
import Navbar from '@/components/Header/Navbar.vue'
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import router from "@/router";
import html2canvas from "html2canvas";
import { getStrukPesanan } from "@/stores/functionAPI";

const struk = ref(null);
const route = useRoute();
const strukRef = ref(null);

// Ambil data struk berdasarkan ID
onMounted(async () => {
  const id = route.params.id;
  try {
    const response = await getStrukPesanan(id);
    if (response.success) {
      struk.value = response.data;
    } else {
      console.error("Gagal mendapatkan data struk:", response.message);
    }
  } catch (error) {
    console.error("Error fetching struk:", error);
  }
});

// Format util
const formatJenisKendaraan = (jenis) => {
  return jenis === "pesawat" ? "Pesawat" : jenis === "kereta" ? "Kereta" : jenis;
};

const formatRupiah = (value) => {
  return value && value !== 0 ? `Rp ${value.toLocaleString('id-ID')}` : 'Rp 0';
};

// Simpan sebagai JPG dari elemen yang tampil
const downloadAsJPG = async () => {
  try {
    const element = strukRef.value;
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/jpeg", 1.0);
    link.download = "struk.jpg";
    link.click();
  } catch (error) {
    console.error("❌ Gagal menyimpan struk:", error);
  }
};
</script>
<template>
  <Navbar />

  <!-- Tombol Aksi -->
  <div class="flex mt-6 ml-7 space-x-5">
    <button 
      @click="router.push('/orders')"
      class="bg-primary text-white px-4 py-2 rounded shadow-md"
    >
      Kembali
    </button>
    <button 
      @click="downloadAsJPG" 
      class="bg-green-500 text-white px-4 py-2 rounded shadow-md"
    >
      Simpan sebagai JPG
    </button>
  </div>

  <!-- ✅ SATU-SATUNYA STRUK YANG DITAMPILKAN & DISIMPAN -->
  <div ref="strukRef" class="mt-6 p-4 border shadow-md max-w-xs mx-auto bg-white text-black dark:bg-gray-900 dark:text-white">
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
</template>


<style scoped>
@media print {
  @page {
    size: 110mm 250mm;
    margin: 0;
  }

  body {
    background: white !important;
  }
}
</style>