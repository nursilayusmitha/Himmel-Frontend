<script setup lang="ts">
import * as mdiIcons from '@mdi/js';
import { useIndexStore } from '@/stores'
import { useSidebarStore } from '@/stores/sidebar'
import { onClickOutside } from '@vueuse/core'
import { ref, onMounted } from 'vue'
import SidebarItem from './SidebarItem.vue'

const target = ref(null)

const indexStore = useIndexStore()
const sidebarStore = useSidebarStore()
const pageData = ref([])

onMounted(async () => {
  if (indexStore.user.userAccess) {
    const data = await indexStore.getUtilPage();
    if (indexStore.user.userAccess[0] === 'all') {
      pageData.value = data.utilData
    } else {
      const filteredPages = data.utilData.filter(filterData =>
        indexStore.user.userAccess.some(access => access.pageCode === filterData.pageCode));

      const newData = await groupPages(filteredPages)
      pageData.value = newData
    }
  }
})
const groupPages = async (pages) => {
  const groups = [
    { prefix: "1.1", name: "MENU" },
    { prefix: "1.2", name: "MASTER" },
    { prefix: "1.3", name: "MODULES" },
    { prefix: "1.4", name: "LAPORAN" },
    { prefix: "1.5", name: "INFORMASI" },
  ];

  const data = await pages;

  return groups.map(group => {
    const filteredPages = data.filter(page => page.pageCode.startsWith(group.prefix));
    const menuItems: any[] = [];
    const groupedPages: Record<string, any> = {};

    filteredPages.forEach((page) => {
      const { pageGroup, pageName, pageRoutes, groupIcon } = page;

      // If pageGroup is empty, add it directly to menuItems without grouping
      if (pageGroup === "") {
        menuItems.push({
          icon: `<svg
            class="fill-current"
            width="${page.pageProps.iconWidth}"
            height="${page.pageProps.iconHeight}"
            viewBox="${page.pageProps.iconViewBox}"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="${mdiIcons[page.pageIcon]}" />
          </svg>`,
          label: pageName,
          route: pageRoutes || '#'
        });
        return;
      }

      // Extract main group and sub-groups
      const [mainGroup, ...subGroups] = pageGroup.split('/');

      // Create a structure for the main group if it doesn't exist
      if (!groupedPages[mainGroup]) {
        groupedPages[mainGroup] = {
          icon: `<svg
            class="fill-current"
            width="${page.pageProps.iconWidth}"
            height="${page.pageProps.iconHeight}"
            viewBox="${page.pageProps.iconViewBox}"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="${mdiIcons[page.groupIcon || 'mdiFolder']}" />
          </svg>`,
          label: mainGroup,
          route: '#',
          children: []
        };
      }

      // Handle nested sub-groups
      let currentGroup = groupedPages[mainGroup];
      subGroups.forEach((subGroup) => {
        let existingChild = currentGroup.children.find(child => child.label === subGroup);
        if (!existingChild) {
          existingChild = {
            label: subGroup,
            route: '#',
            children: []
          };
          currentGroup.children.push(existingChild);
        }
        currentGroup = existingChild;
      });

      // Add the current page to the appropriate group
      currentGroup.children.push({
        label: pageName,
        route: pageRoutes || '#',
        icon: `<svg
          class="fill-current"
          width="${page.pageProps.iconWidth}"
          height="${page.pageProps.iconHeight}"
          viewBox="${page.pageProps.iconViewBox}"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="${mdiIcons[page.pageIcon]}" />
        </svg>`
      });
    });

    // Add grouped items to the final menuItems array
    Object.values(groupedPages).forEach(group => menuItems.push(group));

    return {
      name: group.name,
      menuItems
    };
  }).filter(group => group.menuItems.length > 0);
};


onClickOutside(target, () => {
  sidebarStore.isSidebarOpen = false
})
</script>

<template>
  <aside
    class="absolute left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:static lg:translate-x-0"
    :class="{
      'translate-x-0': sidebarStore.isSidebarOpen,
      '-translate-x-full': !sidebarStore.isSidebarOpen
    }"
    ref="target"
  >
    <div class="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
      <router-link to="/">
        <img src="@/assets/images/logo/logo-no-bg.svg" alt="Logo" class="-mb-9" />
      </router-link>

      <button class="block lg:hidden" @click="sidebarStore.isSidebarOpen = false">
        <svg
          class="fill-current"
          width="20"
          height="18"
          viewBox="0 0 20 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
            fill=""
          />
        </svg>
      </button>
    </div>

    <div class="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
      <nav class="mt-5 py-4 px-4 lg:mt-9 lg:px-6">
        <template v-for="menuGroup in pageData" :key="menuGroup.name">
          <div>
            <h3 class="mb-4 ml-4 text-sm font-medium text-bodydark2">{{ menuGroup.name }}</h3>

            <ul class="mb-6 flex flex-col gap-1.5">
              <SidebarItem
                v-for="(menuItem, index) in menuGroup.menuItems"
                :item="menuItem"
                :key="index"
                :index="index"
              />
            </ul>
          </div>
        </template>
      </nav>
    </div>
  </aside>
</template>
