<template>
    <el-container class="home-container">
        <!-- 头部区域 -->
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="iscollapse ? '64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 一级菜单 -->
                <el-menu background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" unique-opened :collapse="iscollapse" :collapse-transition="false" :router="true" :default-active="activePath">
                    <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconsObj[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{ item.authName }}</span>
                        </template>
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' +subitem.path " v-for="subitem in item.children" :key="subitem.id" @click="saveNavState('/' +subitem.path)">
                            <template slot="title">
                                <!-- 图标 -->
                                <i class="el-icon-menu"></i>
                                <!-- 文本 -->
                                <span>{{ subitem.authName }}</span>
                            </template>
                        </el-menu-item>
                    </el-submenu>

                </el-menu>
            </el-aside>
            <!-- 右侧主体区域 -->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>
<script>
export default {
    data() {
        return {
            // 左侧菜单数据
            menulist: [],
            iconsObj: {
                '125': 'iconfont icon-users',
                '103': 'iconfont icon-tijikongjian',
                '101': 'iconfont icon-shangpin',
                '102': 'iconfont icon-danju',
                '145': 'iconfont icon-baobiao',
            },
            iscollapse: false,
            // 被激活的链接地址
            activePath:''
        }
    },
    created() {
        this.getMenuList()
        // 只要没有点其他列表，再次刷新时，当前列表高亮
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods: {
        logout() {
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        // 获取所有菜单列表
        async getMenuList() {
            const { data: res } = await this.$http.get('menus')

            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.menulist = res.data
            console.log(res);
        },
        toggleCollapse(){
            this.iscollapse = !this.iscollapse
        },
        // 保持链接的激活状态
        saveNavState(activePath){
            window.sessionStorage.setItem('activePath',activePath)
        }
    }
}
</script>
<style lang="less" scoped>
.home-container {
    height: 100%;
}

.el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

    div {
        display: flex;
        align-items: center;

        span {
            margin-left: 15px;
        }
    }
}

.el-aside {
    background-color: #333744;

    // height: 100%;
    .toggle-button {
        background-color: #4a5064;
        font-size: 10px;
        line-height: 24px;
        text-align: center;
        color: #fff;
        cursor: pointer;
        letter-spacing: 0.2em;
    }

    .el-menu {
        border-right: 0;
    }
}

.el-main {
    background-color: #eaedf1;
    // height: 100%;
}

.iconfont {
    margin-right: 10px;
}</style>