<template>
  <div class="book-manager-page">
    <header class="page-header">
      <div class="header-left">
        <img src="https://img.icons8.com/color/96/university.png" alt="校徽" class="logo">
        <h1 class="header-title">江苏师范大学科研教育平台</h1>
      </div>
      <div class="header-right">
        <el-button link class="logout-btn" @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <main class="main-content">
      <div class="content-container">
        
        <section class="info-card">
          <div class="info-item"><span class="label">姓名：</span><span class="value">{{ userInfo.name }}</span></div>
          <div class="info-item"><span class="label">学校：</span><span class="value">{{ userInfo.school }}</span></div>
          <div class="info-item"><span class="label">手机号：</span><span class="value">{{ userInfo.phone }}</span></div>
          <div class="info-item"><span class="label">证书编号：</span><span class="value">{{ userInfo.certificateNo }}</span></div>
          <div class="info-item"><span class="label">课程成绩：</span><span class="value">{{ userInfo.score }}</span></div>
          <div class="info-item"><span class="label">成绩等级：</span><span class="value">{{ userInfo.grade }}</span></div>
        </section>

        <section class="image-card">
          <div class="image-wrapper paper-effect" v-loading="loadingPreview" element-loading-text="证书生成中...">
            
            <img 
              :src="previewUrl || defaultImg" 
              class="cert-image"
              alt="证书预览"
            >

          </div>
          
          <div class="action-area">
            <el-button type="primary" class="action-btn preview-btn" @click="handlePreview(false)">
              <el-icon><Refresh /></el-icon> 刷新预览
            </el-button>
            
            <el-button type="danger" class="action-btn download-btn" @click="handleDownload">
              <el-icon><Download /></el-icon> 下载证书
            </el-button>
          </div>
        </section>

      </div>
    </main>
    
    <footer class="page-footer">版权所有 © 2024 江苏师范大学 | 授权码：JSNU-2024-XYZ</footer>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { Refresh, Download } from '@element-plus/icons-vue'

const router = useRouter()
const loadingPreview = ref(false)
const previewUrl = ref('')
const defaultImg = 'https://img.freepik.com/free-photo/view-electronic-product-with-futuristic-design_23-2151073307.jpg'

const userInfo = reactive({
  name: '', school: '', phone: '', certificateNo: '', score: '', grade: ''
})

onMounted(() => {
  const userStr = localStorage.getItem('user')
  if (!userStr) {
    router.push('/') 
  } else {
    try {
      const userData = JSON.parse(userStr)
      userInfo.name = userData.name || '未知'
      userInfo.school = userData.category || '暂无'
      userInfo.phone = userData.phone || '暂无'
      userInfo.certificateNo = userData.certificateNo || '暂无'
      userInfo.score = userData.score || '暂无'
      userInfo.grade = userData.level || '暂无'

      if (userInfo.phone) handlePreview(true)
    } catch (e) {
      router.push('/')
    }
  }
})

const handlePreview = async (isAuto = false) => {
  if (!userInfo.phone) return
  loadingPreview.value = true
  // 仅在手动刷新时清空，避免闪烁
  if (!isAuto) previewUrl.value = '' 

  try {
    // 请求后端 (后端现在返回的是图片流)
    const res = await axios.get(`/api/teacher/previewCertificate?phone=${userInfo.phone}`, {
      responseType: 'blob'
    })
    
    // 这里 type 改为 image/png
    const blob = new Blob([res.data], { type: 'image/png' })
    
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(blob)
    
    if (!isAuto) ElMessage.success('预览刷新成功')
  } catch (err) {
    console.error(err)
    if (!isAuto) ElMessage.error('证书预览加载失败')
  } finally {
    loadingPreview.value = false
  }
}

const handleDownload = () => {
  if (!userInfo.phone) return
  ElMessage.success('正在请求下载...')
  const link = document.createElement('a')
  link.href = `/api/teacher/downloadCertificate?phone=${userInfo.phone}`
  link.target = '_blank'
  link.click()
}

const handleLogout = () => {
  localStorage.removeItem('user')
  router.push('/')
}
</script>

<style scoped>
.book-manager-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  font-family: "Microsoft YaHei", sans-serif;
}
.page-header {
  height: 80px;
  background-color: #1f2d3d;
  display: flex; justify-content: space-between; align-items: center; padding: 0 50px; color: white;
}
.header-left { display: flex; align-items: center; }
.logo { height: 48px; margin-right: 20px; }
.header-title { font-size: 24px; font-weight: bold; margin: 0; }
.logout-btn { color: #fff; font-size: 14px; }

.main-content { 
  flex: 1; 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  padding: 40px; 
}

.content-container {
  display: flex; 
  width: 1000px; 
  min-height: 520px;
  background-color: #dcecf9; 
  border-radius: 12px; 
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
  border: 4px solid #c0d4ea;
}

.info-card { flex: 1; padding: 50px; display: flex; flex-direction: column; justify-content: center; }
.info-item { margin-bottom: 20px; font-size: 20px; color: #1a2a3a; display: flex; align-items: baseline; }
.label { font-weight: bold; margin-right: 10px; min-width: 100px; text-align: right; }
.value { font-family: monospace; font-weight: 500; }

.image-card {
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  padding: 40px;
  background: rgba(255,255,255,0.2);
}

.image-wrapper {
  width: 100%;
  aspect-ratio: 1.414 / 1; 
  height: auto; 
  
  border: 1px solid #dcdfe6; 
  border-radius: 4px; 
  overflow: hidden;
  
  margin-bottom: 25px;
  background: white;
  
  /* 弹性布局，确保图片居中 */
  display: flex;
  justify-content: center;
  align-items: center;
}

.cert-image {
  width: 100%;
  height: 100%;
  /* 关键属性：让图片包含在容器内，不裁剪，留白部分透明（或白底） */
  object-fit: contain; 
  display: block;
}

.action-area { width: 100%; display: flex; gap: 15px; }
.action-btn { 
  flex: 1; 
  height: 48px; 
  font-size: 16px; 
  font-weight: bold; 
  border-radius: 8px; 
  box-shadow: none;
}
.preview-btn { background-color: #409EFF; border-color: #409EFF; }
.preview-btn:hover { background-color: #66b1ff; border-color: #66b1ff; }
.download-btn { background-color: #b71c1c; border-color: #b71c1c; }
.download-btn:hover { background-color: #d32f2f; border-color: #d32f2f; }

.page-footer { height: 50px; background-color: #1f2d3d; color: #909399; display: flex; justify-content: center; align-items: center; font-size: 12px; }
</style>