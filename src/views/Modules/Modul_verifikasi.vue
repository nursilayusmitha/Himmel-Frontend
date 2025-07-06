<script setup lang="ts">
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import { ref, onMounted, onUnmounted } from 'vue';
import jsQR from 'jsqr';
import { useIndexStore } from "@/stores";
import Swal from "sweetalert2";
import router from "@/router";

const indexStore = useIndexStore();
const pageTitle = ref("Modul - Validasi & Verifikasi");
const pageList = ref(["Modul", "Validasi & Verifikasi"]);

const video = ref(null);
const canvas = ref(null);
const qrResult = ref('');
const error = ref(null);
let scanInterval = null; // Interval untuk pemindaian otomatis

const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.value.srcObject = stream;
    scanInterval = setInterval(scanQRCodeAutomatically, 1000);
  } catch (err) {
    error.value = 'Gagal mengakses kamera';
    console.error(err);
  }
};

const scanQRCodeAutomatically = () => {
  if (!video.value || !canvas.value) return;

  const ctx = canvas.value.getContext('2d');
  canvas.value.width = video.value.videoWidth;
  canvas.value.height = video.value.videoHeight;
  ctx.drawImage(video.value, 0, 0, canvas.value.width, canvas.value.height);

  const imageData = ctx.getImageData(0, 0, canvas.value.width, canvas.value.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code) {
    qrResult.value = code.data;
    error.value = null; // Hilangkan pesan error jika berhasil scan

    try {
      const qrData = JSON.parse(code.data);
      if (qrData.pesananId) {
        verifyTicket(qrData.pesananId);
      }
    } catch (err) {
      console.error("Format QR Code tidak valid:", err);
    }
  } else {
    if (!qrResult.value) { // Hanya tampilkan error jika belum ada hasil scan
      error.value = 'QR Code tidak terbaca';
    }
  }
};

const verifyTicket = async (pesananId) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  try {
    const response = await fetch('http://localhost:4000/api/Modul_pesanan/scanqr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesananId })
    });

    const result = await response.json();
    console.log('Response dari server:', result);

    if (response.ok) {
      Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pesanan berhasil diverifikasi!',
        confirmButtonText: 'OK',
        ...(isDarkMode && {
          background: '#1f2937', // gray-800
          color: '#f9fafb', // gray-100
          iconColor: '#facc15', // yellow-400
        }),
      })
    } else {
      let message = result.message || "Gagal memverifikasi tiket.";
      
      if (message.includes("Pesanan belum menjadi tiket")) {
        message = "Tiket telah divalidasi sebelumnya.";
      } else if (message.includes("Pesanan tidak ditemukan")) {
        message = "Anda tidak memiliki hak tiket karena pesanan dibatalkan.";
      }

      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: message,
        confirmButtonText: 'OK',
        ...(isDarkMode && {
          background: '#1f2937', // gray-800
          color: '#f9fafb', // gray-100
          iconColor: '#facc15', // yellow-400
        }),
      });
    }
  } catch (error) {
    console.error("Error mengirim data ke backend:", error);
    Swal.fire({
      icon: 'error',
      title: 'Kesalahan!',
      text: 'Terjadi kesalahan server.',
      confirmButtonText: 'OK',
      ...(isDarkMode && {
        background: '#1f2937', // gray-800
        color: '#f9fafb', // gray-100
        iconColor: '#facc15', // yellow-400
      }),
    });
  }
};

onUnmounted(() => {
  if (scanInterval) clearInterval(scanInterval);
});

onMounted(startCamera);
</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault :pageTitle="pageTitle" :pageList="pageList" />
    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard cardTitle="Input Data">
          <div class="flex flex-col items-center justify-center text-center p-6">
            <h2 class="text-2xl font-bold mb-6">Scan QR Code dari Kamera</h2>

            <video
              ref="video"
              autoplay
              class="border border-gray-300 rounded-lg w-64 h-64 shadow-lg"
            ></video>
            <canvas ref="canvas" class="hidden"></canvas>

            <p v-if="qrResult" class="mt-4 text-lg text-green-500">
              QR Code: {{ qrResult }}
            </p>
            <p v-if="error" class="mt-4 text-lg text-red-500">{{ error }}</p>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
