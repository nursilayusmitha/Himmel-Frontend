<script setup>
import BreadcrumbDefault from "@/components/Breadcrumbs/BreadcrumbDefault.vue";
import DefaultCard from "@/components/Forms/DefaultCard.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import SelectGroup from "@/components/Forms/SelectGroup/SelectGroup.vue";
import { useIndexStore } from "@/stores";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import Swal from "sweetalert2";
import router from "@/router";
import { getPesananById, createPembayaranMitra, getVoucherInternal } from "@/stores/functionAPI";
import { showLoading, successCreate, failedCreate } from "@/stores/swal";
const indexStore = useIndexStore();
const route = useRoute();
const pesanan = ref(null);
const voucherOptions = ref([]); // Simpan daftar voucher
const savedData = ref({
  Modul_pembayaran_pic: indexStore.user.userName,
  metode: "", // Akan diisi dengan 'mitra' atau 'Qris'
  transaksiId: "", // Hanya untuk Qris
  buktiTransaksiId:"",
  voucherId: "", // Tambahkan voucherId
});

onMounted(async () => {
  const id = route.params.id;
  if (id) {
    try {
      const response = await getPesananById(id);
      pesanan.value = response;
      console.log("📌 Data Pesanan:", response);
    } catch (error) {
      console.error("❌ Error fetching pesanan:", error);
    }
  }

  // Ambil daftar voucher
  try {
    const vouchers = await getVoucherInternal();
    voucherOptions.value = vouchers.map((voucher) => {
      let label = voucher.Nama_voucher;
      if (voucher.Persen_potongan) {
        label += ` - ${voucher.Persen_potongan}%`;
      } else if (voucher.Harga_potongan) {
        label += ` - Rp ${voucher.Harga_potongan.toLocaleString()}`;
      }
      return { label, value: voucher._id };
    });
    console.log("📌 Data Voucher:", voucherOptions.value);
  } catch (error) {
    console.error("❌ Error fetching vouchers:", error);
  }
});

const submitData = async () => {
  if (!savedData.value.metode) {
    Swal.fire("Gagal", "Silakan pilih metode pembayaran!", "warning");
    return;
  }
  const payload = {
    metode: savedData.value.metode,
    voucherId: savedData.value.voucherId || undefined,
    Modul_pembayaran_pic:savedData.value.Modul_pembayaran_pic
  };

  console.log("🚀 Payload yang dikirim:", payload);

  try {
    showLoading();

    // Dapatkan respons dari API pembayaran
    const response = await createPembayaranMitra(pesanan.value._id, payload);

    console.log("📌 Respons dari createPembayaranMitra:", response.data); // Pastikan respons terlihat di log

    // Ambil ID pembayaran dari respons
    const pembayaranId = response.data.data ? response.data.data._id : response.data._id;

    if (pembayaranId) {
      console.log("✅ ID Pembayaran yang dibuat:", pembayaranId);
      await successCreate();
      router.push(`/modules/modul-transaksi/add/${pembayaranId}`);
    } else {
      console.error("❌ ID pembayaran tidak ditemukan dalam respons:", response.data);
      throw new Error("ID pembayaran tidak ditemukan dalam respons.");
    }
  } catch (error) {
    console.error("❌ Error saat membuat pembayaran:", error);
    await failedCreate(error);
  }
};

</script>

<template>
  <DefaultLayout>
    <BreadcrumbDefault pageTitle="Modul - Add Pembayaran" :pageList="['Modul', 'Pembayaran', 'Add']" />
    <div class="grid grid-cols-1 gap-9 sm:grid-cols-2">
      <div class="flex flex-col gap-9 col-span-2">
        <DefaultCard cardTitle="Input Pembayaran">
          <div v-if="pesanan" class="p-6.5">
            <!-- Detail Pesanan -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Nama Pemesan</label>
              <input type="text" :value="pesanan.userName"
                class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded" disabled />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">No HP</label>
              <input type="email" :value="pesanan.userPhone"
                class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded" disabled />
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Jenis Kendaraan</label>
              <input type="text" :value="pesanan.Jenis_kendaraan"
                class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded" disabled />
            </div>
            <div class="mb-4">
  <label class="block text-sm font-medium text-black dark:text-white">Harga Tiket</label>
  <input
    type="text"
    :value="`Rp ${Number(pesanan?.Harga_tiket || 0).toLocaleString('id-ID')}`"
    class="w-full border p-2 bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:text-white rounded"
    disabled
  />
</div>


            <!-- Pilihan Metode Pembayaran -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Metode Pembayaran</label>
              <SelectGroup
                placeholder="Pilih Metode Pembayaran"
                :options="[
                  { label: 'Mitra', value: 'Mitra' },
                  { label: 'Qris', value: 'Qris' }
                ]"
                v-model="selectedMetode"
                @update:modelValue="savedData.metode = $event.value"
              />
            </div>

            <!-- Pilihan Voucher -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-black dark:text-white">Pilih Voucher</label>
              <SelectGroup
                placeholder="Pilih Voucher"
                :options="voucherOptions"
                v-model="selectedVoucher"
                @update:modelValue="savedData.voucherId = $event.value"
              />
            </div>
          </div>

          <!-- Tombol Submit -->
          <div class="flex justify-end mr-6 mb-4">
            <button @click="router.back()"
              class="rounded bg-gray-500 hover:bg-gray-600 p-3 text-white mr-5 transition">Batal</button>
            <button @click="submitData"
              class="rounded bg-primary hover:bg-primary-dark p-3 text-white transition">Pembayaran</button>
          </div>
        </DefaultCard>
      </div>
    </div>
  </DefaultLayout>
</template>
