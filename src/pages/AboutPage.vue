<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AboutHeader from '@/components/AboutHeader.vue'
import {
  ElButton,
  ElIcon
} from 'element-plus'
import {
  Monitor,
  Users,
  Lightning,
  Shield,
  Edit,
  Share,
  Connection
} from '@element-plus/icons-vue'

const router = useRouter()
const featuresRef = ref<HTMLElement>()

const features = [
  {
    id: 1,
    icon: 'Monitor',
    title: 'Реальное время',
    description: 'Работайте вместе в реальном времени. Видите изменения коллег мгновенно.'
  },
  {
    id: 2,
    icon: 'Users',
    title: 'Командная работа',
    description: 'Приглашайте участников, назначайте роли и управляйте доступом.'
  },
  {
    id: 3,
    icon: 'Lightning',
    title: 'Быстро и просто',
    description: 'Интуитивный интерфейс. Начните работу за минуты, а не часы.'
  },
  {
    id: 4,
    icon: 'Shield',
    title: 'Безопасность',
    description: 'Ваши данные защищены. Контролируйте, кто имеет доступ к доскам.'
  },
  {
    id: 5,
    icon: 'Edit',
    title: 'Гибкие инструменты',
    description: 'Рисуйте, пишите, добавляйте изображения. Все в одном месте.'
  },
  {
    id: 6,
    icon: 'Share',
    title: 'Простое деление',
    description: 'Делитесь досками с коллегами одной ссылкой.'
  }
]

const steps = [
  {
    id: 1,
    title: 'Создайте доску',
    description: 'Зарегистрируйтесь и создайте свою первую доску за несколько кликов.'
  },
  {
    id: 2,
    title: 'Пригласите команду',
    description: 'Отправьте приглашения коллегам и начните совместную работу.'
  },
  {
    id: 3,
    title: 'Работайте вместе',
    description: 'Рисуйте, пишите и обменивайтесь идеями в реальном времени.'
  }
]

const stats = [
  {
    id: 1,
    number: '1',
    label: 'Открытое ПО'
  },
  {
    id: 2,
    number: '2',
    label: 'Высокая масштабируемость'
  },
  {
    id: 3,
    number: '3',
    label: 'Безотказность'
  },
  {
    id: 4,
    number: '4',
    label: 'Производительность'
  }
]

const goToDashboard = () => {
  router.push('/home')
}

const scrollToFeatures = () => {
  featuresRef.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div class="about-page">
    <!-- Специальный хедер для About страницы -->
    <AboutHeader />
    <!-- Hero секция -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">Lite Board</span>
          <br>Современные онлайн доски для командной работы
        </h1>
        <p class="hero-subtitle">
          Создавайте, редактируйте и делитесь идеями в реальном времени. 
          Простой и интуитивный инструмент для эффективной командной работы.
        </p>
        <div class="hero-buttons">
          <el-button type="primary" size="large" @click="goToDashboard">
            Начать работу
          </el-button>
          <el-button size="large" @click="scrollToFeatures">
            Узнать больше
          </el-button>
        </div>
      </div>
      <div class="hero-visual">
        <div class="board-preview">
          <div class="board-header">
            <div class="board-title">Проект дизайна</div>
            <div class="board-users">
              <div class="user-avatar" v-for="i in 3" :key="i"></div>
            </div>
          </div>
          <div class="board-content">
            <div class="drawing-area">
              <div class="drawing-element" v-for="i in 5" :key="i"></div>
            </div>
            <div class="text-notes">
              <div class="note" v-for="i in 3" :key="i"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Особенности -->
    <section class="features-section" ref="featuresRef">
      <div class="container">
        <h2 class="section-title">Почему выбирают Lite Board?</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">
              <el-icon :size="32">
                <component :is="feature.icon" />
              </el-icon>
            </div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Как это работает -->
    <section class="how-it-works-section">
      <div class="container">
        <h2 class="section-title">Как это работает</h2>
        <div class="steps-grid">
          <div class="step-card" v-for="(step, index) in steps" :key="step.id">
            <div class="step-number">{{ index + 1 }}</div>
            <div class="step-content">
              <h3 class="step-title">{{ step.title }}</h3>
              <p class="step-description">{{ step.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Статистика -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-item" v-for="stat in stats" :key="stat.id">
            <div class="stat-number">{{ stat.number }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA секция -->
    <section class="cta-section">
      <div class="container">
        <h2 class="cta-title">Готовы начать?</h2>
        <p class="cta-subtitle">
          Присоединяйтесь к тысячам команд, которые уже используют Lite Board
        </p>
        <el-button type="primary" size="large" @click="goToDashboard">
          Создать первую доску
        </el-button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Hero секция */
.hero-section {
  display: flex;
  align-items: center;
  min-height: 80vh;
  padding: 120px 20px 80px 20px; /* Увеличен отступ сверху для фиксированного хедера */
  color: white;
}

.hero-content {
  flex: 1;
  max-width: 600px;
  margin-right: 60px;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 24px;
}

.gradient-text {
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.6;
  margin-bottom: 40px;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 16px;
}

.hero-visual {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.board-preview {
  width: 400px;
  height: 300px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: float 6s ease-in-out infinite;
}

.board-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.board-title {
  font-weight: 600;
  color: #333;
}

.board-users {
  display: flex;
  gap: 8px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
}

.board-content {
  padding: 20px;
  height: calc(100% - 70px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.drawing-area {
  flex: 1;
  background: #f8f9fa;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.drawing-element {
  position: absolute;
  background: #667eea;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.drawing-element:nth-child(1) {
  width: 20px;
  height: 20px;
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.drawing-element:nth-child(2) {
  width: 15px;
  height: 15px;
  top: 60%;
  left: 70%;
  animation-delay: 0.5s;
}

.drawing-element:nth-child(3) {
  width: 25px;
  height: 25px;
  top: 40%;
  left: 50%;
  animation-delay: 1s;
}

.drawing-element:nth-child(4) {
  width: 12px;
  height: 12px;
  top: 80%;
  left: 30%;
  animation-delay: 1.5s;
}

.drawing-element:nth-child(5) {
  width: 18px;
  height: 18px;
  top: 30%;
  left: 80%;
  animation-delay: 2s;
}

.text-notes {
  display: flex;
  gap: 12px;
}

.note {
  flex: 1;
  height: 20px;
  background: #ffd700;
  border-radius: 4px;
  opacity: 0.7;
}

/* Особенности */
.features-section {
  padding: 100px 20px;
  background: white;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 60px;
  color: #333;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 40px;
}

.feature-card {
  text-align: center;
  padding: 40px 20px;
  border-radius: 12px;
  background: #f8f9fa;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  margin-bottom: 24px;
  color: #667eea;
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.feature-description {
  color: #666;
  line-height: 1.6;
}

/* Как это работает */
.how-it-works-section {
  padding: 100px 20px;
  background: #f8f9fa;
}

.steps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 24px;
  padding: 30px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.step-number {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  flex-shrink: 0;
}

.step-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
}

.step-description {
  color: #666;
  line-height: 1.6;
}

/* Статистика */
.stats-section {
  padding: 80px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  text-align: center;
}

.stat-number {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 12px;
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 1.1rem;
  opacity: 0.9;
}

/* CTA секция */
.cta-section {
  padding: 100px 20px;
  background: white;
  text-align: center;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #333;
}

.cta-subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 40px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* Анимации */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.1);
  }
}

/* Адаптивность */
@media (max-width: 768px) {
  .hero-section {
    flex-direction: column;
    text-align: center;
    padding: 60px 20px;
  }

  .hero-content {
    margin-right: 0;
    margin-bottom: 40px;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .board-preview {
    width: 300px;
    height: 250px;
  }

  .features-grid {
    grid-template-columns: 1fr;
  }

  .steps-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .step-card {
    flex-direction: column;
    text-align: center;
  }
}
</style>
