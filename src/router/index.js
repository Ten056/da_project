import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/TestView.vue')
  },
  {
    path: '/booklist',
    name: 'booklist',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('../views/BookList.vue')
  },
  {
    path: '/bookInfo/:id',
    name: 'bookInfo',
    component: () => import('../views/BookInfoView.vue')
  },
  {
    path: '/bookInfo/:id/:status',
    name: 'bookInfo_unscheduled',
    component: () => import('../views/UnscheduledTest.vue')
  },
  {
    path: '/finishReading',
    name: 'finishReading',
    component: () => import('../views/FinishReading.vue')
  },
  // {
  //   path: '/users/:id',
  //   name: 'bookinfo_id',
  //   component: () => import('../views/BookInfoView.vue')
  // }

]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
