<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>分类参数</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!--  -->
            <el-alert show-icon title="注意：只允许为第三级分类设置相关参数" :closable="false" type="warning">
            </el-alert>
            <!-- 选择商品分类区域 -->
            <el-row class="cat_opt">
                <el-col>
                    <span>选择商品分类</span>
                    <!-- 级联选择器 -->
                    <el-cascader v-model="selectedCateKeys" :options="cateList" :props="cascaderProps"
                        @change="handleChange"></el-cascader>
                </el-col>
            </el-row>
            <!-- tab 页签区域 -->
            <el-tabs v-model="activeName" @tab-click="handleTabClick">
                <!-- 添加动态参数的按钮 -->
                <el-tab-pane label="动态参数" name="many">
                    <!-- 添加参数的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="addDialogVisible = true"
                        class="button">添加参数</el-button>
                    <!-- 动态参数表格 -->
                    <el-table :data="manyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 标签 -->
                                <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable class="tag" @close="handleClose(i, scope.row)">
                                    {{ item }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New
                                    Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

                <!-- 添加静态属性的按钮 -->
                <el-tab-pane label="静态属性" name="only">
                    <!-- 添加属性的按钮 -->
                    <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                        @click="addDialogVisible = true" class="button">添加属性</el-button>
                    <!-- 静态属性表格 -->
                    <el-table :data="onlyTableData" border stripe>
                        <!-- 展开行 -->
                        <el-table-column type="expand">
                            <template slot-scope="scope">
                                <!-- 标签 -->
                                <el-tag :key="i" v-for="(item, i) in scope.row.attr_vals" closable class="tag" @close="handleClose(i, scope.row)">
                                    {{ item }}
                                </el-tag>
                                <el-input class="input-new-tag" v-if="scope.row.inputVisible" v-model="scope.row.inputValue"
                                    ref="saveTagInput" size="small" @keyup.enter.native="handleInputConfirm(scope.row)"
                                    @blur="handleInputConfirm(scope.row)">
                                </el-input>
                                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New
                                    Tag</el-button>
                            </template>
                        </el-table-column>
                        <!-- 索引列 -->
                        <el-table-column type="index"></el-table-column>
                        <el-table-column label="属性名称" prop="attr_name"></el-table-column>
                        <el-table-column label="操作">
                            <template slot-scope="scope">
                                <el-button type="primary" size="mini" icon="el-icon-edit"
                                    @click="showEditDialog(scope.row.attr_id)">编辑</el-button>
                                <el-button type="danger" size="mini" icon="el-icon-delete"
                                    @click="removeParams(scope.row.attr_id)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>

            </el-tabs>
        </el-card>

        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="editForm.attr_name"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editParams">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 分类列表的数据
            cateList: [],
            cascaderProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: "true",
                expandTrigger: "hover"
            },
            // 级联选择器选中的值
            selectedCateKeys: [],
            // tab选中的值
            activeName: 'many',
            // 动态参数的数据
            manyTableData: [],
            // 静态属性的数据
            onlyTableData: [],
            // 添加参数的对话框
            addDialogVisible: false,
            // 添加参数的表单数据
            addForm: {
                attr_name: ''
            },
            // 添加参数的表单验证规则
            addFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            // 修改参数的对话框
            editDialogVisible: false,
            // 修改参数的表单数据
            editForm: {},
            // 修改参数的表单验证规则
            editFormRules: {
                attr_name: [
                    { required: true, message: '请输入参数名称', trigger: 'blur' }
                ]
            },
            // 是否显示输入框
            inputVisible: false,
            // 输入框的值
            inputValue: ''
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        // 获取所有的分类列表
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) return this.$message.error('获取分类列表失败！')
            this.cateList = res.data
        },
        // 选择器变化时触发
        async handleChange() {
            this.getParamsData()

        },
        // 点击tab时触发
        handleTabClick() {
            this.getParamsData()
            console.log(this.activeName);
        },
        // 获取参数列表数据
        async getParamsData() {
            // 判断是否为第三级分类
            if (this.selectedCateKeys.length !== 3) {
                this.$message.warning('只允许为第三级分类设置相关参数！')
                this.selectedCateKeys = [];
                this.manyTableData = [];
                this.omlyTableData = [];
                return
            }
            // console.log(this.selectedCateKeys);

            // 根据所分类的id，和当前所处的面板，获取对应的参数列表
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
            console.log(res.data);
            // 将每一项中的attr_vals转换为数组
            res.data.forEach(item => {
                // 判断他是否为空
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                // 控制文本框的显示与隐藏
                item.inputVisible = false
                // 文本框中输入的值
                item.inputValue = ''
            });
            if (this.activeName === 'many') {
                this.manyTableData = res.data
            } else {
                this.onlyTableData = res.data
            }
        },
        // 关闭参数对话框时触发
        addDialogClosed() {
            this.$refs.addFormRef.resetFields()
            // this.addDialogVisible = false
        },
        // 添加参数
        addParams() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return

                const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, {
                    attr_name: this.addForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.$message.success('添加参数成功！')
                this.getParamsData()
                this.addDialogVisible = false

            })
        },
        // 点击按钮展示修改参数的对话框
        async showEditDialog(attr_id) {
            // 查询当前参数的信息
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, { params: { attr_sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error('获取参数信息失败！')
            this.editForm = res.data
            this.editDialogVisible = true
        },
        // 关闭修改参数的对话框时触发
        editDialogClosed() {
            this.$refs.editFormRef.resetFields()

        },
        // 点击按钮，修改参数信息
        editParams() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
                    attr_name: this.editForm.attr_name,
                    attr_sel: this.activeName
                })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success('修改参数成功！')
                this.getParamsData()
                this.editDialogVisible = false
            })
        },
        // 删除参数
        async removeParams(attr_id) {
            console.log(attr_id);
            const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            console.log(confirmResult);

            if (confirmResult !== 'confirm') return this.$message.info('已取消删除！')

            const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
            if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
            this.$message.success('删除参数成功！')
            this.getParamsData()
        },
        // 松开回车或者失去焦点时触发
        async handleInputConfirm(row) {
            if (row.inputValue.trim().length === 0) {
                row.inputValue = ''
                this.inputVisible = false
                return
            }
            // 如果没有return，则证明输入的内容需要做处理
            row.attr_vals.push(row.inputValue.trim())
            row.inputValue = ''
            row.inputVisible = false
            // 需要发起请求，将数据提交到服务器
            this.saveAttrVals(row);

        },
        // 将对 attr_vals 的操作，保存到数据库
        async saveAttrVals(row){
            const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
                attr_name:row.attr_name,
                attr_sel:row.attr_sel,
                attr_vals:row.attr_vals.join(',')
            })
            if(res.meta.status !== 200) return this.$message.error('修改参数失败！')
            this.$message.success('修改参数成功！')
        },
        // 删除对应的标签
        handleClose(i,row){
            row.attr_vals.splice(i,1)
            this.saveAttrVals(row)
        },
        // 点击按钮，显示输入框
        showInput(row) {
            row.inputVisible = true

            // $nextTick方法的作用，就是当页面上的元素被重新渲染之后，才会执行该方法中的代码
            // 让文本框自动获得焦点
            this.$nextTick(() => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        }
    },
    // 计算属性
    computed: {
        // 如果按钮需要被禁用，则返回true，否则返回false
        isBtnDisabled() {
            if (this.selectedCateKeys.length !== 3) {
                return true
            }
            return false
        },
        // 选中的分类的id
        cateId() {
            if (this.selectedCateKeys.length === 3) {
                return this.selectedCateKeys[2]
            }
            return null
        },
        // 
        titleText() {
            if (this.activeName === 'many') {
                return '动态参数'
            } else {
                return '静态属性'
            }
        }
    }
}
</script>
<style lang="less" scoped>
.cat_opt {
    margin: 15px 0;
}

.button {
    margin: 5px 0 15px 0;
}

.tag {
    margin: 10px;
}

.input-new-tag {
    width: 130px;
    margin-left: 10px;
}
</style>