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
          <div class="batch-selector" v-if="userList.length > 1">
            <span class="label">选择期数：</span>
            <el-select 
              v-model="currentIndex" 
              placeholder="请选择" 
              @change="handleBatchChange"
              size="large"
              style="width: 200px;"
            >
              <el-option
                v-for="(item, index) in userList"
                :key="item.id"
                :label="item.sessions || ('第' + (index + 1) + '条记录')"
                :value="index"
              />
            </el-select>
          </div>
          
          <div class="info-item"><span class="label">姓名：</span><span class="value">{{ currentUser.name }}</span></div>
          <div class="info-item"><span class="label">期数：</span><span class="value">{{ currentUser.sessions || '默认' }}</span></div>
          <div class="info-item"><span class="label">证书编号：</span><span class="value">{{ currentUser.certificateNo }}</span></div>
          <div class="info-item"><span class="label">课程成绩：</span><span class="value">{{ currentUser.score }}</span></div>
          <div class="info-item"><span class="label">成绩等级：</span><span class="value">{{ currentUser.level }}</span></div>
          <div class="info-item"><span class="label">学校/单位：</span><span class="value">{{ currentUser.category }}</span></div>
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
    
    <footer class="page-footer">版权所有 © 2025 江苏师范大学</footer>
  </div>
</template>

<script setup>
import { reactive, onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { Refresh, Download } from '@element-plus/icons-vue'

const router = useRouter()
const loadingPreview = ref(false)
const previewUrl = ref('')
// 默认图片
const defaultImg = 'https://img.freepik.com/free-photo/view-electronic-product-with-futuristic-design_23-2151073307.jpg'

// 核心数据
const userList = ref([]) // 存所有期的数据
const currentIndex = ref(0) // 当前选的是第几个

// 计算属性：永远指向当前选中的那一条
const currentUser = computed(() => {
  return userList.value[currentIndex.value] || {}
})

onMounted(() => {
  // 1. 从 localStorage 读取登录时存进去的列表
  const listStr = localStorage.getItem('userList')
  
  if (!listStr) {
    router.push('/') 
  } else {
    try {
      userList.value = JSON.parse(listStr)
      
      // 恢复上次选中的 index (如果有)
      const savedIndex = localStorage.getItem('currentUserIndex')
      if (savedIndex) {
        currentIndex.value = parseInt(savedIndex)
      }
      
      // 自动加载第一张图
      if (userList.value.length > 0) {
        handlePreview(true)
      }
    } catch (e) {
      console.error(e)
      router.push('/')
    }
  }
})

// 切换期数
const handleBatchChange = (val) => {
  // 记住所选位置
  localStorage.setItem('currentUserIndex', val)
  // 清空旧图，加载新图
  previewUrl.value = ''
  handlePreview(true)
}

// 预览逻辑
const handlePreview = async (isAuto = false) => {
  // 🔥 关键修改：判断 id 是否存在
  const uid = currentUser.value.id
  if (!uid) return

  loadingPreview.value = true
  // 手动点击时才清空，防止自动加载闪烁
  if (!isAuto) previewUrl.value = '' 

  try {
    // 🔥 关键修改：参数改为 id
    const res = await axios.get(`/api/teacher/previewCertificate?id=${uid}`, {
      responseType: 'blob'
    })
    
    const blob = new Blob([res.data], { type: 'image/png' })
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = URL.createObjectURL(blob)
    
    if (!isAuto) ElMessage.success('预览刷新成功')
  } catch (err) {
    console.error(err)
    if (!isAuto) ElMessage.error('加载失败，请检查后台日志')
  } finally {
    loadingPreview.value = false
  }
}

// 下载逻辑
const handleDownload = () => {
  const uid = currentUser.value.id
  if (!uid) {
    ElMessage.warning('数据异常，无法下载')
    return
  }
  ElMessage.success('正在请求下载...')
  
  // 🔥 关键修改：参数改为 id
  const link = document.createElement('a')
  link.href = `/api/teacher/downloadCertificate?id=${uid}`
  link.target = '_blank'
  link.click()
}

const handleLogout = () => {
  localStorage.removeItem('userList')
  localStorage.removeItem('currentUserIndex')
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
.info-item { margin-bottom: 20px; font-size: 18px; color: #1a2a3a; display: flex; align-items: baseline; }
.label { font-weight: bold; margin-right: 10px; min-width: 100px; text-align: right; }
.value { font-family: monospace; font-weight: 500; }

.batch-selector {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.5);
  padding: 10px;
  border-radius: 8px;
}

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
  display: flex;
  justify-content: center;
  align-items: center;
}

.cert-image {
  width: 100%;
  height: 100%;
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