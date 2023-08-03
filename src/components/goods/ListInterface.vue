<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" clearable @clear="getGoodsList" v-model="queryInfo.query">
                        <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="goAddpage">添加商品</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <el-table stripe border :data="goodsList">
                <el-table-column type="index"></el-table-column>
                <el-table-column label="商品名称" prop="goods_name"></el-table-column>
                <el-table-column label="商品价格（元）" prop="goods_price" width="119px"></el-table-column>
                <el-table-column label="商品重量" prop="goods_weight" width="80px"></el-table-column>
                <el-table-column label="创建时间" prop="add_time" width="180px">
                    <template slot-scope="scope">
                        {{ scope.row.add_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="180px">
                    <template slot-scope="scope">
                        <el-button type="primary" size="mini" icon="el-icon-edit" @click="editGoods(scope.row.goods_id)">编辑</el-button>
                        <el-button type="danger" size="mini" icon="el-icon-delete"
                            @click="removeById(scope.row.goods_id)">删除</el-button>
                    </template>
                </el-table-column>


            </el-table>
            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" background class="page">
            </el-pagination>
        </el-card>

        
    </div>
</template>
<script>
export default {
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            // 商品列表数据
            goodsList: [],
            // 总条数
            total: 0,

        }

    },
    created() {
        this.getGoodsList()
    },
    methods: {
        // 根据分页获取商品列表
        async getGoodsList() {
            const { data: res } = await this.$http.get(`goods`, {
                params: this.queryInfo
            })
            if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
            console.log(res.data);
            this.goodsList = res.data.goods
            this.total = res.data.total
        },
        // 每页条数发生改变
        handleSizeChange(newsize) {
            this.queryInfo.pagesize = newsize
            this.getGoodsList()
        },
        // 当前页码发生改变
        handleCurrentChange(newpage) {
            this.queryInfo.pagenum = newpage
            this.getGoodsList()
        },
        // 删除商品
        async removeById(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(confirmResult !== 'confirm') return this.$message.info('已取消删除')
            const {data:res} = await this.$http.delete(`goods/${id}`)
            if(res.meta.status !== 200) return this.$message.error('删除商品失败')
            this.$message.success('删除商品成功')
            this.getGoodsList()
        },
        // 编程式导航跳转到添加商品页面
        goAddpage(){
            this.$router.push('/goods/add')
        },
        // 编辑商品
        editGoods(id){
            this.$router.push('/goods/edit/'+ id)
            
        }

    }
}
</script>
<style lang="less" scoped>
.page {
    margin-top: 40px;
}
</style>