import Swal from "sweetalert2";

// Helper: Konfigurasi dark mode
const getDarkModeSwalOptions = () => {
  return document.documentElement.classList.contains('dark') ? {
    background: '#1f2937',        // Tailwind gray-800
    color: '#f9fafb',             // Tailwind gray-100
    iconColor: '#facc15',         // Tailwind yellow-400
  } : {};
};

// Others
export const showLoading = async () => {
  Swal.fire({
    title: 'Loading...',
    text: 'Please wait!',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
    ...getDarkModeSwalOptions()
  });
};

export const confirmDelete = async (title, text, onConfirm) => {
  const result = await Swal.fire({
    title: title || 'Delete',
    text: text || 'Are you sure to delete?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: "#FF0000",
    cancelButtonColor: "#",
    confirmButtonText: "Delete",
    cancelButtonText: "Cancel",
    ...getDarkModeSwalOptions()
  });

  if (result.isConfirmed && typeof onConfirm === 'function') {
    await onConfirm();
  }
};

// ✅ SUCCESS
export const successData = async (title, text, position) => {
  Swal.fire({
    position: position || "center",
    title: title || 'Berhasil terkirim!',
    text: text || '',
    timer: 1500,
    iconHtml: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#009ee5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>',
    showConfirmButton: false,
    toast: true,
    customClass: {
      popup: 'p-3 max-w-xs text-sm',
      title: 'text-gray-700 dark:text-gray-100 font-normal',
      htmlContainer: 'text-gray-600 dark:text-gray-300 font-light',
    },
    ...getDarkModeSwalOptions()
  });
};

export const successLogin = async (title, text, position) => {
  Swal.fire({
    position: position || "center",
    title: title || 'Berhasil Login!',
    text: text || '',
    timer: 1500,
    iconHtml: '<svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-[#009ee5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>',
    showConfirmButton: false,
    toast: true,
    customClass: {
      popup: 'p-3 max-w-xs text-sm',
      title: 'text-gray-700 dark:text-gray-100 font-normal',
      htmlContainer: 'text-gray-600 dark:text-gray-300 font-light',
    },
    ...getDarkModeSwalOptions()
  });
};

export const successCreate = async (title, text, position) => {
  Swal.fire({
    position: position || "center",
    title: title || 'Create Success!',
    text: text || '',
    timer: 1500,
    icon: 'success',
    showConfirmButton: false,
    toast: true,
    ...getDarkModeSwalOptions()
  });
};

export const successEdit = async (title, text, position) => {
  Swal.fire({
    position: position || "center",
    title: title || 'Edit Success!',
    text: text || '',
    timer: 1500,
    icon: 'success',
    showConfirmButton: false,
    toast: true,
    ...getDarkModeSwalOptions()
  });
};

export const successJoin = async (title, text) => {
  Swal.fire({
    title: title || 'Join Success!',
    text: text || '',
    timer: 1500,
    icon: 'success',
    showConfirmButton: false,
    ...getDarkModeSwalOptions()
  });
};

export const successDelete = async (title, text) => {
  Swal.fire({
    title: title || 'Delete Success!',
    text: text || '',
    timer: 1500,
    icon: 'success',
    showConfirmButton: false,
    ...getDarkModeSwalOptions()
  });
};

// ❌ FAILED
export const failedCreate = async (data) => {
  Swal.fire({
    title: 'Failed!',
    text: 'Create Failed :' + data,
    icon: 'error',
    ...getDarkModeSwalOptions()
  });
};

export const failedEdit = async (data) => {
  Swal.fire({
    title: 'Failed!',
    text: 'Edit Failed :' + data,
    icon: 'error',
    ...getDarkModeSwalOptions()
  });
};

export const failedJoin = async (data) => {
  Swal.fire({
    title: 'Failed!',
    text: 'Join Failed :' + data,
    icon: 'error',
    ...getDarkModeSwalOptions()
  });
};
