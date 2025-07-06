<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import Swal from 'sweetalert2'
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { getAllRole } from '@/stores/functionAPI'
import { mdiTrashCanOutline, mdiEyeOutline, mdiSquareEditOutline, mdiMagnify, mdiRefresh, mdiPlusCircleOutline } from '@mdi/js';

const pageTitle = ref('Master - Setup Role')
const pageList = ref(['Master', 'Setup Role'])
const dataHeader = ref([
  { name: 'No.', class: 'py-2 pl-3' },
  { name: 'Nama Role', class: 'min-w-[150px] py-2 px-4' },
  { name: 'Jenis', class: 'min-w-[150px] py-2 px-4' },
  { name: 'Hirarki', class: 'min-w-[100px] py-2 px-4' },
  { name: 'Akses Halaman', class: 'min-w-[100px] py-2 px-4' },
])
let dataTable = ref([])
const searchQuery = ref("");

// Pagination state
const currentPage = ref(1);
const itemsPerPage = 10;


// Filtered data based on search query
const filteredData = computed(() => {
  if (!searchQuery.value.trim()) return dataTable.value;
  return dataTable.value.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const visiblePages = computed(() => {
  const pages = [];
  const range = 2; // Number of pages to show before and after the current page

  let start = Math.max(1, currentPage.value - range);
  let end = Math.min(totalPages.value, currentPage.value + range);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

// Total items based on the filtered data
const totalItems = computed(() => filteredData.value.length);
const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage));

// Paginated data based on filtered results
const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredData.value.slice(start, end);
});

// Change page function
const changePage = (page: number) => {
  if (page > 0 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

/**
 * Format roleAccess field.
 * @param {Array} roleAccess - Array containing role access data.
 * @returns {String|Number} - "all" if "all" is in the array, or the count of objects if array contains objects.
 */
function formatRoleAccess(roleAccess) {
  if (!Array.isArray(roleAccess) || roleAccess.length === 0) {
    return '-'; // Return "-" if the array is empty or undefined
  }

  if (roleAccess.includes('all')) {
    return 'all'; // Return "all" if "all" is present in the array
  }

  // Count the number of objects in the array
  const objectCount = roleAccess.filter(item => typeof item === 'object' && item !== null).length;

  return objectCount > 0 ? objectCount : '-';
}

onMounted(async () => {
  const data = await getAllRole();
  // Add formatted roleAccess to each item
  dataTable.value = data.map(item => ({
    ...item,
    formattedRoleAccess: formatRoleAccess(item.roleAccess), // Add formatted roleAccess
  }));
});

const confirmDelete = (id) => {
  const isDarkMode = document.documentElement.classList.contains('dark')
  Swal.fire({
    title: 'Apakah anda yakin?',
    text: "Anda tidak bisa memulihkan data kembali!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Hapus',
    cancelButtonText: 'Kembali',
    ...(isDarkMode && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  }).then(async (result) => {
    if (result.isConfirmed) {
      // Call API to delete the data
      try {
        const response = await fetch(`http://localhost:4000/api/role/delete/${id}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          // Tampilkan custom success alert
          successDelete('Delete Success!', '', 'center');
          
          // Update dataTable to remove the deleted item
          dataTable.value = dataTable.value.filter(item => item._id !== id);
          
        } else {
          Swal.fire('Failed!', 'Gagal menghapus data.', 'error');
        }
      } catch (error) {
        Swal.fire('Error!', 'Terjadi kesalahan saat menghapus.', 'error');
      }
    }
  });
};

const successDelete = async (title, text, position) => { 
  Swal.fire({
    position: position || "center",
    title: title || 'Delete Success!', 
    text: text || '',
    timer: 1500,
    icon: 'success',
    showConfirmButton: false,
    toast: true,

    ...(document.documentElement.classList.contains('dark') && {
      background: '#1f2937',        // Tailwind `gray-800`
      color: '#f9fafb',             // Tailwind `gray-100`
      iconColor: '#facc15',         // Tailwind `yellow-400`
    })
  });
};



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
            <!-- Search and Helper -->
          <div
            class="helper border-2 flex justify-between bg-gray-2 text-left dark:bg-meta-4 text-black dark:text-white py-2 px-4"
          >
          <div class="left-data">
                <div class="relative">
              <button class="absolute top-1/2 left-0 -translate-y-1/2">
                <svg
                  class="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    :d="mdiMagnify"
                    fill=""
                  />
                </svg>
              </button>
  
              <input
                  type="text"
                  placeholder="Type to search..."
                  class="w-full xl:w-125 bg-transparent pr-4 pl-9 focus:outline-none"
                  v-model="searchQuery"
                />
            </div>
              </div>
              <div class="right-data flex items-center flex-row-reverse">
                <!-- Add Button -->
                <router-link to="/modules/master/user-role/add" class="px-1">
                <svg 
                  class="fill-current hover:text-primary"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path :d="mdiPlusCircleOutline" fill=""/>
                </svg>
                
                <!-- Refresh Button -->
                </router-link>
                <button class="px-1">
                <svg 
                  class="fill-current hover:text-primary"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                    <path :d="mdiRefresh" fill=""/>
                    </svg>
                </button>
              </div>
            </div>
        <div class="max-w-full overflow-x-auto">
          <table class="w-full table-auto">
            <thead>
              <tr class="bg-gray-2 text-left dark:bg-meta-4">
                <th v-for="data in dataHeader" :class="data.class" class="font-medium text-black dark:text-white text-center">
                  {{ data.name }}
                </th>
                <th class="py-2 px-4 font-medium text-black dark:text-white text-center">Opsi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in paginatedData" :key="index" class="border">
                <td class="pl-3 text-xs border">
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </td>
                <td class="py-1 px-4 border">
                  <p class="text-black dark:text-white text-xs">{{ item.roleName }}</p>
                </td>
                <td class="py-1 px-4 border">
                  <p class="text-black dark:text-white text-xs">{{ item.roleType }}</p>
                </td>
                <td class="py-1 px-4 border">
                  <p class="text-xs text-black dark:text-white text-center">{{ item.hierarchyCode }}</p>
                </td>
                <td class="py-1 px-4 text-center border">
                  <h5 class="font-medium text-black text-xs dark:text-white">{{ item.formattedRoleAccess }}</h5>
                </td>
                <td class="py-1 px-4">
                  <div class="flex items-center space-x-3.5 d-flex justify-center">
                    <!-- Detail Button -->
                    <router-link :class="item.Tr_teknis_status === 'closed' ? 'cursor-default opacity-50' : 'hover:text-primary'" class="" :to="'/modules/master/user-role/detail/'+item._id">
                      <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiEyeOutline" fill="#" />
                      </svg>
                    </router-link>
                    <!-- Edit Button -->
                    <router-link :class="item.Tr_teknis_status === 'closed' ? 'cursor-default opacity-50' : 'hover:text-primary'" class="" :to="item.Tr_teknis_status !== 'closed' ? '/modules/master/user-role/edit/'+item._id : ''">
                      <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiSquareEditOutline" fill="#" />
                      </svg>
                    </router-link>
                    <!-- Delete Button -->
<button 
  :class="item.Tr_teknis_status === 'closed' ? 'cursor-default opacity-50' : 'hover:text-primary'" 
  @click="confirmDelete(item._id)"
>
  <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" :d="mdiTrashCanOutline" fill="#" />
  </svg>
</button>

                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
<!-- Pagination and Total Data -->
<div class="mt-4 flex justify-between items-center">
          <p class="text-sm">Total Data: {{ totalItems }}</p>
          <div class="flex space-x-2">
            <!-- Previous Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              Prev
            </button>

            <!-- First Page -->
            <button
              v-if="currentPage > 3"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(1)"
            >
              1
            </button>

            <!-- Ellipsis Before -->
            <span v-if="currentPage > 4" class="text-xs px-2 py-1">...</span>

            <!-- Visible Page Buttons -->
            <button
              v-for="page in visiblePages"
              :key="page"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :class="currentPage === page ? 'bg-primary text-white' : ''"
              @click="changePage(page)"
            >
              {{ page }}
            </button>

            <!-- Ellipsis After -->
            <span v-if="currentPage < totalPages - 3" class="text-xs px-2 py-1">...</span>

            <!-- Last Page -->
            <button
              v-if="currentPage < totalPages - 2"
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              @click="changePage(totalPages)"
            >
              {{ totalPages }}
            </button>

            <!-- Next Button -->
            <button
              class="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              Next
            </button>
          </div>
        </div>

  </div>
      </div>
      
  </DefaultLayout>
</template>
