<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <el-row :gutter="20">
                <el-col :span="10">
                    <el-input placeholder="请输入内容" clearable v-model="queryInfo.query" @clear="getOrderList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrderList"></el-button>
                    </el-input>
                </el-col>
            </el-row>

            <!-- 表格 -->
            <el-table border stripe :data="orderList">
                <el-table-column type="index"></el-table-column>
                <el-table-column label="订单编号" prop="order_number" width="330px"></el-table-column>
                <el-table-column label="订单价格" prop="order_price">
                </el-table-column>
                <el-table-column label="是否付款" prop="pay_status">
                    <template slot-scope="scope">
                        <el-tag type="danger" v-if="scope.row.pay_status === '0'">未付款</el-tag>
                        <el-tag type="success" v-else>已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="是否发货" prop="is_send">
                </el-table-column>
                <el-table-column label="下单时间" prop="create_time" width="195px">
                    <template slot-scope="scope">
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                    <template>
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="address"></el-button>
                        <el-button type="success" icon="el-icon-location" size="mini" @click="showProgressBox"></el-button>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total" class="fy">
            </el-pagination>
        </el-card>

        <!-- 编辑对话框 -->
        <el-dialog title="修改地址" :visible.sync="addressdialogVisible" width="50%" @close="addressDialogClosed">
            <el-form :model="addressForm" :rules="addressrules" ref="addressFormRef" label-width="100px">
                <el-form-item label="省市区/县" prop="address1">
                    <el-cascader v-model="addressForm.address1" :options="cityData" :props="{ expandTrigger: 'hover' }">
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="addressForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addressdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addressdialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 物流进度对话框 -->
        <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%" >
            <span>
               暂无物流信息
            </span>
            
        </el-dialog>
    </div>
</template>
<script>
import cityData from './citydata.js'
export default {
    data() {
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10
            },
            total: 0,
            orderList: [],
            addressdialogVisible: false,
            addressForm: {
                // 因为是级联选择器，所以这里的值是一个数组
                address1: [],
                address2: ''
            },
            addressrules: {
                address1: [
                    { required: true, message: '请选择省市区/县', trigger: 'change' }
                ],
                address2: [
                    { required: true, message: '请输入详细地址', trigger: 'blur' }
                ]
            },
            // 省市区/县的数据 因为属性名和属性值是一样的，所以可以简写
            cityData,
            progressVisible: false,
            progressInfo: []
        }
    },
    created() {
        this.getOrderList()
    },
    methods: {
        async getOrderList() {
            const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error('获取订单列表失败')
            console.log(res);
            this.total = res.data.total
            this.orderList = res.data.goods
        },
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrderList()
        },
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrderList()
        },
        address() {
            this.addressdialogVisible = true
        },
        addressDialogClosed(){
            this.$refs.addressFormRef.resetFields()
        },
        showProgressBox(){
            // const {data:res} = await this.$http.get(`/kuaidi/804909574412544580`)
            // if(res.meta.status !== 200) return this.$message.error('获取物流进度失败')
            // this.progressInfo = res.data
            this.progressVisible = true
            // console.log(this.progressInfo);
        }
    }
}
</script>
<style lang="less" scoped>
.el-cascader{
    width: 100%;
}
.fy{
    margin-top: 20px;
}
</style>