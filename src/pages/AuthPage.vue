<template>
  <div class="auth-container">
    <el-card class="auth-card">
      <template #header>
        <div class="card-header">
          <span>{{ isLoginMode ? 'Login' : 'Register' }}</span>
        </div>
      </template>

      <el-form ref="formRef" :model="{ email, password }" :rules="formRules" @submit.prevent="handleSubmit">
        <el-form-item label="Email" prop="email">
          <el-input v-model="email" type="text" placeholder="Enter your email" />
        </el-form-item>

        <el-form-item label="Password" prop="password">
          <el-input v-model="password" type="password" placeholder="Enter your password" />
        </el-form-item>

        <el-button type="primary" native-type="submit">
          {{ isLoginMode ? 'Login' : 'Register' }}
        </el-button>

        <el-link
          type="primary"
          class="toggle-mode-link"
          @click="toggleMode"
        >
          {{ isLoginMode ? 'Create account' : 'Already have account?' }}
        </el-link>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'
import {
  ElButton,
  ElCard,
  ElInput,
  ElForm,
  ElFormItem,
  ElLink,
  ElMessage,
  type FormItemRule,
  type FormInstance
} from 'element-plus'


const router = useRouter()
const userStore = useUserStore()
const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const formRef = ref<FormInstance | null>(null)

// Правила валидации для формы
const formRules: Record<string, FormItemRule[]> = {
  email: [
    { required: true, message: 'Please enter your email address', trigger: 'blur' },
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please enter your password', trigger: 'blur' }
  ]
}

// Смена режима (Login/Registration)
const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
}

// Обработчик отправки формы
const handleSubmit = async () => {
  const form = formRef.value // Получаем ссылку на форму
  form?.validate(async (valid: boolean) => { // Проверяем форму
    if (valid) {
      // Моковая авторизация
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
      const mockEmail = email.value || 'user@example.com'

      userStore.login(mockToken, mockEmail)
      await router.push('/home')
    } else {
      // Используем ElMessage для вывода ошибки
      ElMessage.error('Форма заполнена неверно!')
    }
  })
}
</script>

<style scoped lang="scss">
.auth-container {
  display: flex;
  justify-content: center;
  padding: 2rem;

  .auth-card {
    max-width: 400px;
    width: 90%;
    padding: 20px;

    .toggle-mode-link {
      margin-left: 10px;
      cursor: pointer;
    }

    .card-header {
      text-align: center;
      font-size: 1.2rem;
    }
  }
}
</style>
