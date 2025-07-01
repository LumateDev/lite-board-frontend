<template>
  <div class="about-header">
    <div class="about-header-content">
      <router-link to="/home" class="logo-link">Lite Board</router-link>
      <el-button 
        type="primary" 
        size="large" 
        @click="goToHome"
        class="go-to-boards-btn"
      >
        Перейти к доскам
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElButton } from 'element-plus'

const router = useRouter()

const goToHome = () => {
  router.push('/home')
}
</script>

<style scoped>
.about-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.about-header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-link {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo-link:hover {
  color: #ffd700;
}

.go-to-boards-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.go-to-boards-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Адаптивность */
@media (max-width: 768px) {
  .about-header {
    padding: 12px 16px;
  }
  
  .logo-link {
    font-size: 1.25rem;
  }
  
  .go-to-boards-btn {
    font-size: 14px;
    padding: 8px 16px;
  }
}
</style> 