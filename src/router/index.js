import Vue from 'vue'
import Router from 'vue-router'
// import Login from '../components/loginInterface.vue'
const Login = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/loginInterface.vue')
// import Home from '../components/homeInterface.vue'
const Home = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/homeInterface.vue')
// import Welcome from '../components/welcomeInterface.vue'
const Welcome = () => import(/* webpackChunkName:"login_home_welcome" */ '../components/welcomeInterface.vue')


// import Users from '../components/user/UsersInterface.vue'
const Users = () => import(/* webpackChunkName:"users_rights_roles" */ '../components/user/UsersInterface.vue')
// import Rights from '../components/power/RightInterface.vue'
const Rights = () => import(/* webpackChunkName:"users_rights_roles" */ '../components/power/RightInterface.vue')
// import Roles from '../components/power/RolesInterface.vue'
const Roles = () => import(/* webpackChunkName:"users_rights_roles" */ '../components/power/RolesInterface.vue')

// import Cate from '../components/goods/CateInterface.vue'
const Cate = () => import(/* webpackChunkName:"cate_params" */ '../components/goods/CateInterface.vue')
// import Params from '../components/goods/ParamsInterface.vue'
const Params = () => import(/* webpackChunkName:"cate_params" */ '../components/goods/ParamsInterface.vue')

// import GoodsList from '../components/goods/ListInterface.vue'
const GoodsList = () => import(/* webpackChunkName:"goodslist_add" */ '../components/goods/ListInterface.vue')
// import Add from '../components/goods/AddInterface.vue'
const Add = () => import(/* webpackChunkName:"goodslist_add" */ '../components/goods/AddInterface.vue')


// import Order from '../components/order/OrderInterface.vue'
const Order = () => import(/* webpackChunkName:"order_report" */ '../components/order/OrderInterface.vue')
// import Report from '../components/report/ReportInterface.vue'
const Report = () => import(/* webpackChunkName:"order_report" */ '../components/report/ReportInterface.vue')

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
        { path:'/reports',component:Report},
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
