<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="userList" stripe border>
                <el-table-column type="index"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <!-- {{scope.row}} -->
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="175px">
                    <template slot-scope="scope">
                        <!-- 编辑按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini"
                            @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini"
                            @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色按钮 -->
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"
                                @click="setRole(scope.row)"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>

            <!-- 添加用户的对话框 -->
            <el-dialog title="添加新用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClose">
                <!-- 内容主体区域 -->
                <el-form :model="addForm" :rules="addFromRules" ref="addFormRef" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="addForm.username"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" prop="password">
                        <el-input v-model="addForm.password"></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="addForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                        <el-input v-model="addForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 修改用户的对话框 -->
            <el-dialog title="修改用户信息" :visible.sync="editDialogVisible" width="50%">
                <!-- 内容主体区域 -->
                <el-form :model="editForm" :rules="editFromRules" ref="editFormRef" label-width="70px"
                    @close="editDialogClose">
                    <el-form-item label="用户名" prop="username">
                        <el-input v-model="editForm.username" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                        <el-input v-model="editForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                        <el-input v-model="editForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
                <!-- 底部区域 -->
                <span slot="footer" class="dialog-footer">
                    <el-button @click="editDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="editUser">确 定</el-button>
                </span>
            </el-dialog>

            <!-- 分配角色对话框 -->
            <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
                <div>
                    <p>当前用户：{{ userInfo.username }}</p>
                    <p>当前角色：{{ userInfo.role_name }}</p>
                    <p>分配新角色：
                        <el-select v-model="selectedRoleId" placeholder="请选择">
                            <el-option v-for="item in roleList" :key="item.id" :label="item.roleName" :value="item.id">
                            </el-option>
                        </el-select>
                    </p>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>
<script>
export default {
    data() {
        // 验证邮箱的规则
        var checkEmail = (rule, value, callback) => {
            const regEmail = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            if (regEmail.test(value)) {
                // 邮箱合法 验证通过
                return callback();
            }
            callback(new Error('请输入合法的邮箱'));
        }
        // 验证手机号的规则
        var checkMobile = (rule, value, callback) => {
            const regMobile = /^1[3456789]\d{9}$/
            if (regMobile.test(value)) {
                // 手机号合法 验证通过
                return callback();
            }
            callback(new Error('请输入合法的手机号'));
        }
        return {
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 2
            },
            userList: [],
            total: 0,
            // 控制添加用户对话框的显示与隐藏
            addDialogVisible: false,
            // 添加用户的表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            // 添加表单的验证规则对象
            addFromRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在3-10个字符之间', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 12, message: '长度在6-12个字符之间', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' },
                    { validator: checkEmail, trigger: 'blur' }
                    // {pattern:/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,message:'请输入正确的邮箱格式',trigger:'blur'}
                ],
                mobile: [
                    { required: true, message: '请输入手机号码', trigger: 'blur' },
                    { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 控制修改用户对话框的显示与隐藏
            editDialogVisible: false,
            // 修改用户的表单数据
            editForm: {
                // username:'',
                // email:'',
                // mobile:''
            },
            // 修改表单的验证规则对象
            editFromRules: {
                email: [
                    { required: true, message: '请输入邮箱', triggle: 'blur' },
                    { validator: checkEmail, triggle: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机号码', triggle: 'blur' },
                    { validator: checkMobile, triggle: 'blur' }
                ]
            },
            // 控制添加用户对话框的显示与隐藏
            setRoleDialogVisible: false,
            // 需要被分配角色的用户信息
            userInfo: {},
            // 所有角色的数据列表
            roleList: [],
            // 已选中的角色id值
            selectedRoleId: '',
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        async getUserList() {
            const { data: res } = await this.$http.get('users', { params: this.queryInfo });
            console.log(res)
            if (res.meta.status !== 200) return this.$message.error('获取用户列表失败')
            this.userList = res.data.users
            this.total = res.data.total
        },
        // 监听pagesize改变的事件
        handleSizeChange(newSize) {
            // console.log(newSize);
            this.queryInfo.pagesize = newSize
            this.getUserList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            // console.log(newPage);
            this.queryInfo.pagenum = newPage
            this.getUserList()
        },
        // 监听用户状态改变的事件
        async userStateChanged(userinfo) {
            // console.log(userinfo);
            const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
            // console.log(res);
            if (res.meta.status !== 200) {
                userinfo.status = !userinfo.status
                return this.$message.error('修改用户状态失败')
            }
            this.$message.success('修改用户状态成功')
        },
        // 监听对话用户框的关闭事件
        addDialogClose() {
            this.$refs.addFormRef.resetFields()
        },
        // 预校验
        addUser() {
            this.$refs.addFormRef.validate(async valid => {
                if (!valid) return
                // 可以发起网络请求
                const { data: res } = await this.$http.post('users', this.addForm)
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.$message.success('添加用户成功')
                this.addDialogVisible = false
                this.getUserList()
            })

        },
        // 监听编辑按钮的点击事件
        async showEditDialog(id) {
            this.editDialogVisible = true
            console.log(id);
            // 根据id获取用户的信息
            const { data: res } = await this.$http.get('users/' + id)
            if (res.meta.status !== 200) return this.$message.error('获取用户信息失败')
            // this.editForm.username = res.data.username
            // this.editForm.email = res.data.email
            // this.editForm.mobile = res.data.mobile
            this.editForm = res.data
        },
        // 监听编辑对话框的关闭事件
        editDialogClose() {
            this.$refs.editFormRef.resetFields()
        },
        // 预检验
        editUser() {
            this.$refs.editFormRef.validate(async valid => {
                console.log(valid);
                if (!valid) return
                // 可以发起网络请求
                const { data: res } = await this.$http.put('users/' + this.editForm.id, this.editForm)
                if (res.meta.status !== 200) return this.$message.error('修改用户信息失败')
                this.$message.success('修改用户信息成功')
                this.editDialogVisible = false
                this.getUserList()

            })
        },
        // 根据id删除对应的用户信息
        async removeUserById(id) {
            console.log(id);
            const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            // 如果不捕获错误，点取消的时候就会报错

            // 如果用户确认删除，则返回字符串confirm，否则返回字符串cancel
            // console.log(confirmResult);
            if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
            // console.log('删除');

            const { data: res } = await this.$http.delete('users/' + id)
            if (res.meta.status !== 200) return this.$message.error('删除用户失败！')
            this.$message.success('删除用户成功！')
            this.getUserList()
        },
        async setRole(userInfo) {
            this.userInfo = userInfo
            // 在打开对话框之前，获取所有的角色列表
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) {
                return this.$message.error('获取角色列表失败！')
            }
            this.roleList = res.data
            this.setRoleDialogVisible = true
        },
        // 点击按钮，分配角色
        async saveRoleInfo() {
            if (!this.selectedRoleId) return this.$message.error('必须选择一个角色！')

            const { data: res } = await this.$http.put(
                `users/${this.userInfo.id}/role`,
                {
                    rid: this.selectedRoleId
                }
            )
            if (res.meta.status !== 200) return this.$message.error('更新角色失败！')
            this.$message.success('更新角色成功！')
            this.getUserList()
            this.setRoleDialogVisible = false
        },
        // 监听分配角色对话框的关闭事件
        setRoleDialogClosed() {
            this.userInfo = {}
            this.selectedRoleId = ''
            this.setRoleDialogVisible = false
        }
    }
}

</script>
<style lang="less" scoped></style>