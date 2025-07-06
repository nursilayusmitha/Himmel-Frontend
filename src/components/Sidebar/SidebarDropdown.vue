<script setup lang="ts">
import { useSidebarStore } from '@/stores/sidebar'
import { ref } from 'vue'

const sidebarStore = useSidebarStore()

const props = defineProps(['items', 'page'])
const items = ref(props.items)

const handleItemClick = (index: number) => {
  const item = props.items[index]
  const pageName = sidebarStore.selected === item.label ? '' : item.label

  // If item has grandchildren, toggle `selectedChild` without affecting `page`
  if (item.children && item.children.length > 0) {
    sidebarStore.selectedChild = sidebarStore.selectedChild === item.label ? '' : item.label
  } else {
    // If no grandchildren, proceed as normal link
    sidebarStore.selected = pageName
    sidebarStore.selectedChild = ''  // Clear any open grandchild menu
  }
}
</script>

<template>
  <ul class="mt-4 mb-5.5 flex flex-col gap-2.5 pl-6">
    <template v-for="(childItem, index) in items" :key="index">
      <li>
        <!-- Render child with grandchildren as dropdown -->
        <div v-if="childItem.children && childItem.children.length > 0">
          <router-link
            :to="childItem.route"
            @click.prevent="handleItemClick(index)"
            class="group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
            :class="{
              'bg-graydark dark:bg-meta-4': sidebarStore.selectedChild === childItem.label
            }"
          >
            <span v-html="childItem.icon"></span>
            {{ childItem.label }}

            <svg
              class="absolute right-4 top-1/2 -translate-y-1/2 fill-current"
              :class="{ 'rotate-180': sidebarStore.selectedChild === childItem.label }"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M4.41107 6.9107C4.73651 6.58527 5.26414 6.58527 5.58958 6.9107L10.0003 11.3214L14.4111 6.91071C14.7365 6.58527 15.2641 6.58527 15.5896 6.91071C15.915 7.23614 15.915 7.76378 15.5896 8.08922L10.5896 13.0892C10.2641 13.4147 9.73651 13.4147 9.41107 13.0892L4.41107 8.08922C4.08563 7.76378 4.08563 7.23614 4.41107 6.9107Z"
                fill=""
              />
            </svg>
          </router-link>

          <!-- Render grandchildren if present and selectedChild matches child label -->
          <div class="translate transform overflow-hidden" v-show="sidebarStore.selectedChild === childItem.label">
            <SidebarDropdown
              v-if="childItem.children"
              :items="childItem.children"
              :page="childItem.label"
            />
          </div>
        </div>

        <!-- Render child without grandchildren as a regular link -->
        <router-link
          v-else
          :to="childItem.route"
          @click="handleItemClick(index)"
          class="group relative flex items-center gap-2.5 rounded-sm py-2 px-4 font-medium text-bodydark1 duration-300 ease-in-out hover:bg-graydark dark:hover:bg-meta-4"
          :class="{
            'bg-graydark dark:bg-meta-4': sidebarStore.selected === childItem.label
          }"
        >
          <span v-html="childItem.icon"></span>
          {{ childItem.label }}
        </router-link>
      </li>
    </template>
  </ul>
</template>
