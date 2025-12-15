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
          <el-form :model="form" class="login-form" size="large" label-position="top">
            
            <el-form-item label="手机号" class="custom-label">
              <el-input 
                v-model="form.username" 
                placeholder="请输入手机号" 
                class="custom-input"
              />
            </el-form-item>

            <el-form-item label="密码" class="custom-label">
              <el-input 
                v-model="form.password" 
                type="password" 
                placeholder="请输入身份证后六位" 
                show-password 
                class="custom-input"
              />
            </el-form-item>

            <el-form-item>
              <el-button 
                type="danger" 
                class="submit-btn" 
                :loading="loading" 
                @click="handleLogin"
              >
                登 录
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

    <el-dialog
      v-model="dialogVisible"
      title="找回账号"
      width="400px"
      align-center
    >
      <div class="dialog-content">
        <p class="dialog-tip">请输入您的真实姓名和身份证号以查询账号。</p>
        <el-form :model="recoverForm" label-width="80px">
          <el-form-item label="姓名">
            <el-input v-model="recoverForm.name" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="身份证">
            <el-input v-model="recoverForm.idCard" placeholder="请输入完整身份证号" />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleRecover" :loading="recovering">
            查询账号
          </el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)

// 登录表单数据
const form = reactive({
  username: '',
  password: ''
})

// 找回账号相关数据
const dialogVisible = ref(false)
const recovering = ref(false)
const recoverForm = reactive({
  name: '',
  idCard: ''
})

// 登录逻辑
const handleLogin = () => {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  loading.value = true
  axios.post('/api/teacher/login', form)
    .then(res => {
      // ✅ 正确的新逻辑
      // 1. 打印看看后端到底回了啥
      console.log('登录响应数据:', res.data)

      // 2. 只要返回的数据里有 id，就说明登录成功了
      // (因为如果失败，后端会抛 500 错误进入 catch，不会进这里)
      if (res.data && res.data.id) {
        ElMessage.success('登录成功')

        // 3. 存入缓存
        localStorage.setItem('user', JSON.stringify(res.data))

        // 4. 跳转
        router.push('/books')
      } else {
        // 防御性代码：虽然是 200，但数据不对
        ElMessage.warning('登录异常：未获取到用户信息')
      }
    })
    .catch(err => {
      // 获取后端抛出的错误信息
      const msg = err.response?.data?.message || '登录失败'
      
      // 🕵️‍♂️ 判断：如果是“多条数据”的严重错误，弹窗显示！
      if (msg.includes('多个账号') || msg.includes('系统提示')) {
        ElMessageBox.alert(msg, '账号异常拦截', {
          confirmButtonText: '我知道了',
          type: 'error',       // 显示红色叉叉图标
          draggable: true,     // 允许拖动弹窗
          showClose: false,    // 不显示右上角关闭，强迫点确定
        })
      } else {
        // 普通错误（如密码错），还是用原来的轻提示
        ElMessage.error(msg)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

// 【新增】找回账号逻辑
const handleRecover = () => {
  if(!recoverForm.name || !recoverForm.idCard) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  recovering.value = true
  // 发送请求给后端
  axios.post('/api/teacher/findAccount', recoverForm)
    .then(res => {
      // 成功查到，弹出提示框显示账号
      ElMessageBox.alert(
        `您的账号（手机号）是：<strong>${res.data}</strong>`, 
        '查询成功', 
        {
          dangerouslyUseHTMLString: true,
          confirmButtonText: '去登录',
          callback: () => {
            // 用户点确定后，自动帮他填到登录框里
            form.username = res.data
            dialogVisible.value = false
          }
        }
      )
    })
    .catch(err => {
      ElMessage.error(err.response?.data?.message || '查询失败，信息不匹配')
    })
    .finally(() => {
      recovering.value = false
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