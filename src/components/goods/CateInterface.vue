<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>

        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <el-row>
                <el-col>
                    <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
                </el-col>
            </el-row>
            <!-- 表格 -->
            <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false"
                show-index index-text="#" border :show-row-hover="false">
                <template slot="isok" slot-scope="scope">
                    <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen;"></i>
                    <i class="el-icon-error" v-else style="color: red;"></i>
                </template>
                <template slot="order" slot-scope="scope">
                    <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag type="warning" size="mini" v-else>三级</el-tag>
                </template>
                <template slot="opt" slot-scope="scope">
                    <el-button size="mini" icon="el-icon-edit" type="primary"
                        @click="eidtCateDialog(scope.row)">编辑</el-button>
                    <el-button size="mini" icon="el-icon-delete" type="danger"
                        @click="removeCayeById(scope.row.cat_id)">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[3, 5, 10, 15]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
            <!-- 添加分类的表单 -->
            <el-form :rules="addCateFormRules" ref="addCateFormRef" :model="addCateForm" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类：">
                    <!-- options 用来指定数据源 -->
                    <!-- props 用来指定配置对象 -->
                    <el-cascader :props="cascaderProps" v-model="selectedKeys" :options="parentCateList" clearable
                        @change="parentCateChanged">
                    </el-cascader>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addCate">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改分类的对话框 -->
        <el-dialog title="修改分类" :visible.sync="editCatedialogVisible" width="50%" @close="editCateDialogClosed">
            <el-form :rules="editCateFormRules" ref="editCateFormRef" :model="editCateForm" label-width="100px">
                <el-form-item label="分类名称：" prop="cat_name">
                    <!-- options 用来指定数据源 -->
                    <!-- props 用来指定配置对象 -->
                    <!-- <el-cascader :props="editcascaderProps" v-model="Keys" :options="CateList" clearable
                        @change="CateChanged" :placeholder="editCateForm.cat_name">
                    </el-cascader> -->
                    <el-input v-model="editCateForm.cat_name" @input="changeEdit"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editCatedialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="eidtCate">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 查询条件
            queryInfo: {
                // 表示显示三层分类列表
                type: 3,
                // 当前页码值
                pagenum: 1,
                // 每页显示的条数
                pagesize: 5
            },
            // 商品分类的数据列表，默认为空
            catelist: [],
            // 总条数
            total: 0,
            // 为table指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name',
                },
                {
                    label: '是否有效',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 指定模板的名称
                    template: 'isok'
                },
                {
                    label: '排序',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 指定模板的名称
                    template: 'order'
                },
                {
                    label: '操作',
                    // 表示将当前列定义为模板列
                    type: 'template',
                    // 指定模板的名称
                    template: 'opt'
                },
            ],
            // 添加分类的对话框是否显示
            addCateDialogVisible: false,
            // 添加分类的表单对象
            addCateForm: {
                // 父级分类的Id
                cat_pid: 0,
                // 将要添加的分类的名称
                cat_name: '',
                // 分类的等级，默认要添加的是1级分类
                cat_level: 0
            },
            // 添加分类的验证规则对象
            addCateFormRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' }
                ]
            },
            // 父级分类的列表
            parentCateList: [],
            // 指定级联选择器的配置对象
            cascaderProps:
            {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: "true",
                expandTrigger: "hover"
            },
            // 选中的父级分类的Id数组
            selectedKeys: [],
            // 修改分类的对话框是否显示
            editCatedialogVisible: false,
            // 修改分类的表单对象
            editCateForm: {
            },
            // 修改分类的列表
            // CateList: [],
            // 修改分类的Id数组
            // Keys: [],
            // 编辑分类的级联选择器的配置对象（为了避免重置表单不起作用）
            // editcascaderProps: {
            //     value: 'cat_id',
            //     label: 'cat_name',
            //     children: 'children',
            //     checkStrictly: "true",
            //     expandTrigger: "hover"
            // },
            // editCateFormRules: {
            //     cat_name: [
            //         { required: true, message: '请输入分类名称', trigger: 'blur' }
            //     ]
            // },
            // 监听修改分类的input是否改变
            changeEditValue: false
        }

    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取商品分类数据
        async getCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: this.queryInfo
            })
            if (res.meta.status !== 200) return this.$message.error('获取商品分类数据失败！')
            this.catelist = res.data.result
            this.total = res.data.total
        },
        // 每页条数
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 当前页码
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        showAddCateDialog() {
            // 先获取父级分类的列表
            this.getParentCateList()
            // 再打开对话框
            this.addCateDialogVisible = true
        },
        // 显示父级分类的下拉列表
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', {
                params: { type: 2 }
            })
            if (res.meta.status !== 200) return this.$message.error('获取父级分类列表失败！')
            this.parentCateList = res.data
        },
        // 选项发生变化触发
        parentCateChanged() {
            console.log(this.selectedKeys)

            if (this.selectedKeys.length > 0) {
                // 为父级分类的Id 赋值
                this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]

                // 为当前分类的等级赋值
                this.addCateForm.cat_level = this.selectedKeys.length

                return
            } else {
                // 如果selectedKeys数组的长度为0，表示用户取消了选中的父级分类
                this.addCateForm.cat_pid = 0
                this.addCateForm.cat_level = 0
            }
        },
        // 点击按钮，添加新的分类
        addCate() {
            // 对表单进行校验
            this.$refs.addCateFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post(
                    'categories',
                    this.addCateForm
                )

                if (res.meta.status !== 201) {
                    return this.$message.error('添加分类失败！')
                }

                this.$message.success('添加分类成功！')
                this.getCateList()
                this.addCateDialogVisible = false
            })

        },
        // 关闭添加分类表单，重置数据
        addCateDialogClosed() {
            this.$refs.addCateFormRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_pid = 0
            this.addCateForm.cat_level = 0
            this.addCateDialogVisible = false
            console.log(this.addCateForm)
        },
        // 编辑表单
        /*  async eidtCateDialog(id) {
             // console.log(id)
             // 获取当前分类的数据
             const { data: res } = await this.$http.get('categories/' + id)
             if (res.meta.status !== 200) return this.$message.error('获取分类数据失败！')
             this.editCateForm = res.data
             console.log(this.editCateForm);
 
             // 获取分类的列表
             const { data: res2 } = await this.$http.get('categories', {
                 params: { type: 2 }
             })
             if (res2.meta.status !== 200) return this.$message.error('获取父级分类列表失败！')
             this.CateList = res2.data
             console.log(this.CateList);
 
             this.editCatedialogVisible = true
 
         }, */
        eidtCateDialog(cate) {
            this.editCatedialogVisible = true
            this.editCateForm = cate
        },
        // 监听input的改变
        changeEdit() {
            this.changeEditValue = true
        },
        // 预检验
        eidtCate() {
            // 先进行验证
            this.$refs.editCateFormRef.validate(async valid => {
                if (!valid) return
                if (this.changeEditValue) {
                    // 发起请求
                    const { data: res } = await this.$http.put(`categories/${this.editCateForm.cat_id}`, { cat_name: this.editCateForm.cat_name })
                    if (res.meta.status !== 200) return this.$message.error('修改分类失败！')
                    this.$message.success('修改分类成功！')

                    this.getCateList()
                    this.editCatedialogVisible = false
                } else {
                    this.$message.error('请修改分类名称！')
                }

            })
        },
        // 显示修改分类的下拉列表
        /* CateChanged() {
            console.log("keys:" + this.Keys)

            if (this.Keys.length > 0) {
                // 为父级分类的Id 赋值
                this.editCateForm.cat_pid = this.Keys[this.Keys.length - 1]
                // 为当前分类的等级赋值
                this.editCateForm.cat_level = this.Keys.length
                return
            }
        }, */
        // 关闭修改分类表单，重置数据
        /* editCateDialogClosed() {
            this.editCateForm = {}
            this.$refs.editCateFormRef.resetFields()
            this.keys = []
            // this.editCateForm.cat_name = ''
            // this.editCateForm.cat_level = 0
            // this.editCateForm.cat_pid = 0
            // this.editCateForm.cat_id = 0
            console.log(this.editCateForm.cat_name);
            this.editCatedialogVisible = false

        } */
        // 删除分类
        async removeCayeById(id) {
            // const id = row.cat_id
            console.log(id);
            // 弹窗询问是否删除数据
            const confirmResult = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') return this.$message.info("已经取消了删除")
            const { data: res } = await this.$http.delete('categories/' + id)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)
            this.getCateList()
            this.editCatedialogVisible = false
        }
    }
}
</script>
<style lang="less" scoped>
.treeTable {
    margin-bottom: 20px;
}

.el-cascader {
    width: 100%;
}
</style>