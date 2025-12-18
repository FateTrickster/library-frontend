<template>
  <div class="login-page">
    <header class="page-header">
      <img 
        src="https://img.icons8.com/color/96/university.png" 
        alt="校徽" 
        class="logo"
      >
      <div class="header-title">江苏师范大学科研教育平台</div>
    </header>

    <main class="main-content">
      <div class="login-box">
        
        <div class="left-panel">
          <div class="panel-content">
            <h2 class="panel-title">科技融合风 (EdTech Fusion)<br>核心理念：</h2>
            <p class="panel-text">
              在保留学校红色的基础上，引入“科技蓝”，体现教育与技术的交叉学科特点。适合实验室主页、科研成果展示。
            </p>
          </div>
          <div class="bg-decoration"></div>
        </div>

        <div class="right-panel">
          <el-form 
            ref="loginFormRef" 
            :model="form" 
            :rules="loginRules" 
            class="login-form" 
            size="large" 
            label-position="top"
          >
            <h2 class="title">教师登录</h2>
            
            <el-form-item prop="username">
              <el-input 
                v-model="form.username" 
                placeholder="请输入手机号码" 
                prefix-icon="User"
                size="large"
                class="custom-input"
              />
            </el-form-item>

            <el-form-item prop="password">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请输入密码 (身份证后六位)" 
                prefix-icon="Lock"
                show-password 
                size="large"
                class="custom-input"
              />
            </el-form-item>

            <el-form-item>
              <el-button 
                type="danger" 
                :loading="loading" 
                class="submit-btn login-btn" 
                @click="handleLogin(loginFormRef)"
                size="large"
              >
                立即登录
              </el-button>
            </el-form-item>
            
            <div class="form-footer">
              <span class="find-account" @click="dialogVisible = true">找回账号</span>
            </div>
          </el-form>
        </div>

      </div>
    </main>

    <footer class="page-footer">
      版权所有 © 2024 江苏师范大学 | 授权码：JSNU-2024-XYZ
    </footer>

    <el-dialog v-model="dialogVisible" title="找回账号" width="400px" align-center>
      <div class="dialog-content">
        <p class="dialog-tip">请输入您的真实姓名和身份证号以查询账号。</p>
        <el-form 
          ref="recoverFormRef" 
          :model="recoverForm" 
          :rules="recoverRules" 
          label-width="80px"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="recoverForm.name" placeholder="请输入真实姓名" />
          </el-form-item>
          <el-form-item label="身份证" prop="idCard">
            <el-input v-model="recoverForm.idCard" placeholder="请输入身份证号码" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRecover(recoverFormRef)" :loading="recovering">
            查询
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const loading = ref(false)
const dialogVisible = ref(false)

// === 定义表单引用 ===
const loginFormRef = ref()
const recoverFormRef = ref()

// === 数据模型 ===
const form = reactive({ username: '', password: '' })
const recoverForm = reactive({ name: '', idCard: '' })

// === 🔥 核心：验证规则定义 ===
const loginRules = reactive({
  username: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确 (11位数字)', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
})

const recoverRules = reactive({
  name: [ { required: true, message: '请输入姓名', trigger: 'blur' } ],
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证号码格式不正确', trigger: 'blur' }
  ]
})

// === 🔥 修改：登录逻辑 (先校验再请求) ===
const handleLogin = async (formEl) => {
  if (!formEl) return
  
  // validate 方法会检查所有输入框是否符合 rules
  await formEl.validate((valid, fields) => {
    if (valid) {
      // ✅ 校验通过，才发送请求
      performLogin()
    } else {
      // ❌ 校验失败，震动提示或不处理
      ElMessage.warning('请检查输入格式是否正确')
    }
  })
}

const performLogin = () => {
  loading.value = true
  axios.post('/api/teacher/login', form)
    .then(res => {
      const data = res.data
      if (Array.isArray(data) && data.length > 0) {
        ElMessage.success('登录成功')
        localStorage.setItem('userList', JSON.stringify(data))
        localStorage.setItem('currentUserIndex', 0)
        router.push('/books')
      } else {
        ElMessage.warning('登录异常：未获取到用户信息')
      }
    })
    .catch(err => {
      const msg = err.response?.data?.message || '登录失败'
      ElMessage.error(msg)
    })
    .finally(() => {
      loading.value = false
    })
}

// === 🔥 修改：找回账号逻辑 (先校验再请求) ===
const handleRecover = async (formEl) => {
  if (!formEl) return
  
  await formEl.validate((valid) => {
    if (valid) {
      axios.post('/api/teacher/findAccount', recoverForm)
        .then(res => {
          ElMessageBox.alert(`您的登录账号(手机号)是：${res.data}`, '查询结果', {
            confirmButtonText: '去登录',
            callback: () => {
              dialogVisible.value = false
              form.username = res.data
            }
          })
        })
        .catch(err => {
          ElMessage.error(err.response?.data?.message || '查询失败')
        })
    }
  })
}
</script>

<style scoped>
/* 原有的样式保持不变 */
.login-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  font-family: "Microsoft YaHei", "Heiti SC", sans-serif;
  overflow: hidden;
}
.page-header {
  height: 80px;
  background-color: #1f2d3d;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 10px rgba(0,0,0,0.2);
  z-index: 10;
}
.logo {
  height: 48px;
  margin-right: 15px;
}
.header-title {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 1px;
}
.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-box {
  display: flex;
  width: 900px;
  height: 450px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
}
.left-panel {
  width: 55%;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}
.panel-title {
  font-size: 26px;
  color: #0d47a1;
  margin-bottom: 24px;
  font-weight: 800;
  line-height: 1.4;
}
.panel-text {
  font-size: 18px;
  color: #37474f;
  line-height: 1.8;
  text-align: justify;
  z-index: 2;
}
.bg-decoration {
  position: absolute;
  bottom: -30px;
  right: -30px;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255,255,255,0.5) 10%, transparent 10%);
  background-size: 20px 20px;
  opacity: 0.6;
}
.right-panel {
  width: 45%;
  background-color: white;
  padding: 40px 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
:deep(.el-form-item__label) {
  font-weight: 700;
  color: #333;
  font-size: 16px;
  line-height: 1.5;
  padding-bottom: 0;
}
.custom-input :deep(.el-input__wrapper) {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  box-shadow: none;
  border-radius: 4px;
  padding: 5px 12px;
}
.custom-input :deep(.el-input__wrapper.is-focus) {
  border-color: #c0392b;
}
.custom-input :deep(.el-input__inner) {
  height: 40px;
  font-size: 16px;
}
.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 18px;
  letter-spacing: 4px;
  background-color: #b71c1c;
  border-color: #b71c1c;
  margin-top: 15px;
  border-radius: 6px;
  font-weight: bold;
}
.submit-btn:hover {
  background-color: #d32f2f;
  border-color: #d32f2f;
}
.form-footer {
  text-align: center;
  margin-top: 10px;
}
.find-account {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}
.find-account:hover {
  color: #b71c1c;
  text-decoration: underline;
}
.page-footer {
  height: 50px;
  background-color: #1f2d3d;
  color: #909399;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  letter-spacing: 1px;
}

/* 弹窗样式 */
.dialog-tip {
  margin-bottom: 20px;
  color: #666;
  font-size: 14px;
}
</style>