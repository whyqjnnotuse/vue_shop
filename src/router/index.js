import Vue from 'vue'
import Router from 'vue-router'
import Login from '../components/loginInterface.vue'
import Home from '../components/homeInterface.vue'
import Welcome from '../components/welcomeInterface.vue'
import Users from '../components/user/UsersInterface.vue'
import Rights from '../components/power/RightInterface.vue'
import Roles from '../components/power/RolesInterface.vue'
import Cate from '../components/goods/CateInterface.vue'
import Params from '../components/goods/ParamsInterface.vue'
import GoodsList from '../components/goods/ListInterface.vue'
import Add from '../components/goods/AddInterface.vue'
import Order from '../components/order/OrderInterface.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home',
      component: Home, 
      redirect: '/welcome', 
      children: [
        { path: '/welcome', component: Welcome},
        { path:'/users',component:Users},
        { path:'/rights',component:Rights},
        { path:'/roles',component:Roles},
        { path:'/categories',component:Cate},
        { path:'/params',component:Params},
        { path:'/goods',component:GoodsList},
        { path:'/goods/add',component:Add},
        { path:'/orders',component:Order},
      ] 
    }
  ]
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from代表从哪个路径跳转而来
  // next是一个函数，表示放行
  // next（）放行  next（‘/login’） 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
