import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import BookManager from '../views/BookManager.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/books',
    name: 'BookManager',
    component: BookManager
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router