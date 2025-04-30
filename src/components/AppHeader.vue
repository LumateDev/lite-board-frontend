<template>
  <el-header class="app-header">
    <div class="header-content">
      <router-link to="/home" class="logo-link"> Lite Board </router-link>

      <nav class="nav-links">
        <router-link to="/home" class="nav-link"> Home </router-link>
        <router-link to="/about" class="nav-link"> About </router-link>

        <router-link to="/Teams" class="nav-link"> Teams </router-link>
        <!--       Test board-->
        <router-link to="/board/1" class="nav-link"> Test board </router-link>
      </nav>

      <el-dropdown trigger="click" placement="bottom-end">
        <div class="profile-trigger">
          <el-icon :size="24"><User /></el-icon>
          <span>{{ userStore.email }}</span>
        </div>

        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>
              <el-switch
                v-model="isDark"
                active-text="Dark"
                inactive-text="Light"
                @change="themeStore.toggleTheme"
              />
            </el-dropdown-item>

            <el-dropdown-item divided>
              <router-link to="/settings" class="dropdown-item">
                <el-icon><Setting /></el-icon>
                Settings
              </router-link>
            </el-dropdown-item>

            <el-dropdown-item>
              <el-button link @click="handleLogout">
                <el-icon><SwitchButton /></el-icon>
                Logout
              </el-button>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'
import { useRouter } from 'vue-router'
import { User, Setting, SwitchButton } from '@element-plus/icons-vue'
import { computed } from 'vue'

const router = useRouter()
const themeStore = useThemeStore()
const userStore = useUserStore()
const isDark = computed({
  get: () => themeStore.isDark,
  set: (value) => themeStore.toggleTheme(value),
})

const handleLogout = () => {
  userStore.logout()
  router.push('/auth')
}
</script>
<style scoped lang="scss">
.app-header {
  margin: 12px;
  border-radius: 12px;
  z-index: 100000;
  height: 60px;
  background-color: var(--el-bg-color-overlay);
  border: 2px solid var(--el-border-color);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 24px;
  }

  .logo-link {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--el-text-color-primary);

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .nav-links {
    display: flex;
    gap: 2rem;

    .nav-link {
      font-weight: 500;
      padding: 8px 12px;
      border-radius: 6px;

      &.router-link-exact-active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }
    }
  }

  .profile-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background-color 0.2s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  // Стили для выпадающего меню
  :deep(.el-dropdown-menu) {
    .dropdown-item {
      display: flex;
      align-items: center;
      padding: 0 16px;

      .el-icon {
        margin-right: 8px;
      }
    }

    .el-dropdown-menu__item {
      &:hover {
        background-color: var(--el-color-primary-light-9);
      }

      &.is-active {
        color: var(--el-color-primary);
      }
    }
  }
}
</style>
