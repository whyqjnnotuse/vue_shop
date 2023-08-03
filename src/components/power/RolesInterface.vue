<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <!-- 添加角色按钮区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addRolesDialogVisible = true" class="but">添加角色</el-button>
                </el-col>
            </el-row>
            <!-- 角色列表 -->
            <el-table :data="RolesList" stripe border>
                <!-- 扩展列 -->
                <el-table-column type="expand">
                    <template slot-scope="scope">

                        <el-row :class="['bdbottom', index === 0 ? 'bdtop' : '']"
                            v-for="(item, index) in scope.row.children" :key="item.id" :gutter="20">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row, item.id)">{{ item.authName }}</el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <el-row :class="[index2 === 0 ? '' : 'bdtop']" v-for="(item2, index2) in item.children"
                                    :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{
                                            item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag v-for="item3 in item2.children" :key="item3.id" type="warning" closable
                                            @close="removeRightById(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                        <pre>
                        <!-- {{ scope.row }} -->
                    </pre>
                    </template>

                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini" @click="editRoles(scope.row.id)">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteRoles(scope.row.id)">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini"
                            @click="showSetRightDialog(scope.row)">分配权限</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-card>
        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="setRightDialogClosed">
            <!-- 树形控件 -->
            <el-tree :data="rightslist" :props="treeProps" show-checkbox default-expand-all :default-checked-keys="defkeys"
                node-key="id" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 添加角色的对话框 -->
        <el-dialog title="添加角色" :visible.sync="addRolesDialogVisible" width="50%" @close="addhandleClose">
            <el-form :model="addruleForm" :rules="addruleFormRules" ref="addruleFormRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="addruleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="addruleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addRolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addRights">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 编辑角色对话框 -->
        <el-dialog title="编辑角色" :visible.sync="editRolesDialogVisible" width="50%" @close="edithandleClose">
            <el-form :model="editruleForm" :rules="editruleFormRules" ref="editruleFormRef" label-width="100px">
                <el-form-item label="角色名称" prop="roleName">
                    <el-input v-model="editruleForm.roleName"></el-input>
                </el-form-item>
                <el-form-item label="角色描述" prop="roleDesc">
                    <el-input v-model="editruleForm.roleDesc"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editRolesDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editRights">确 定</el-button>
            </span>
        </el-dialog>



    </div>
</template>
<script>
export default {
    data() {
        return {
            // 角色列表
            RolesList: [],
            // 控制分配权限对话框的显示与隐藏
            setRightDialogVisible: false,
            // 权限列表
            rightslist: [],
            // 树形控件的属性绑定
            treeProps: {
                label: 'authName',
                children: 'children'
            },
            // 默认选中的id值的数组
            defkeys: [],
            // 保存当前即将分配角色的id
            roleId: '',
            // 控制添加角色对话框的显示与隐藏
            addRolesDialogVisible: false,
            // 添加角色的表单
            addruleForm: {
                roleName: '',
                roleDesc: ''
            },
            addruleFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' }
                ]
            },
            // 编辑角色的表单
            editruleForm:{

            },
            // 控制编辑角色对话框的显示与隐藏
            editRolesDialogVisible : false,
            editruleFormRules: {
                roleName: [
                    { required: true, message: '请输入角色名称', trigger: 'blur' }
                ],
                roleDesc: [
                    { required: true, message: '请输入角色描述', trigger: 'blur' }
                ]
            },
        }

    },
    created() {
        this.getRolesList()
    },
    methods: {
        // 获取所有角色的列表
        async getRolesList() {
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
            this.RolesList = res.data
            console.log(this.RolesList);
        },
        // 根据id删除用户权限
        async removeRightById(role, rightId) {
            // 弹框提示是否删除

            const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if (confirmResult !== 'confirm') {
                return this.$message.info('已取消删除')
            }
            // console.log('确认了删除');
            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) {
                return this.$message.error('删除权限失败')
            }
            // this.getRolesList() 删除完成后权限部分区域会合起来
            role.children = res.data
        },
        // 展示分配权限的对话框
        async showSetRightDialog(role) {
            this.roleId = role.id
            const { data: res } = await this.$http.get('rights/tree')
            if (res.meta.status !== 200) {
                return this.$message.error('获取权限失败！')
            }
            // 把获取到的权限数据保存到data中
            this.rightslist = res.data
            console.log(this.rightslist);

            // 递归获取三级节点的id
            this.getLeafKeys(role, this.defkeys)
            console.log(this.defkeys);

            this.setRightDialogVisible = true
        },
        // 通过递归的形式，获取角色下所有三级权限的id，并保存到defkeys数组中
        getLeafKeys(node, arr) {
            // 如果当前node节点不包含children属性，则是三级节点
            if (!node.children) {
                return arr.push(node.id)
            }
            node.children.forEach(item => this.getLeafKeys(item, arr)
            );
        },
        // 监听分配权限对话框的关闭事件
        setRightDialogClosed() {
            console.log(1);
            this.defkeys = []
            console.log(this.defkeys);
        },
        // 点击确定按钮，完成分配权限的操作
        async allotRights() {
            // 获取所有被选中的节点的id
            const keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            const idStr = keys.join(',')
            console.log(idStr);
            // 发起请求，完成分配权限的操作
            const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
            if (res.meta.status !== 200) {
                return this.$message.error('分配权限失败！')
            }
            this.$message.success('分配权限成功！')
            this.getRolesList()
            this.setRightDialogVisible = false
        },
        // 添加角色
        addRights() {
            this.$refs.addruleFormRef.validate(async valid => {
                if (!valid) return
                const { data: res } = await this.$http.post('roles', this.addruleForm)
                if (res.meta.status !== 201) return this.$message.error('添加角色失败')
                this.$message.success('添加角色成功')
                this.getRolesList()
                this.addRolesDialogVisible = false
            })
        },
        // 关闭添加角色对话框
        addhandleClose(){
            this.$refs.addruleFormRef.resetFields()
            this.addRolesDialogVisible = false
        },
        // 删除角色
        async deleteRoles(id) {
            const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)
            if(!confirmResult) this.$message.info('已取消删除')
            const {data:res} = await this.$http.delete(`roles/${id}`)
            if(res.meta.status !== 200) return this.$message.error('删除角色失败')
            this.$message.success('删除角色成功')
            this.getRolesList()

        },
        // 编辑角色
        async editRoles(id){
            const {data:res} = await this.$http.get(`roles/${id}`)
            if(res.meta.status !== 200) return this.$message.error('获取角色信息失败')
            this.editruleForm = res.data
            this.editRolesDialogVisible = true   
        },
        editRights(){
            // 发起请求，更改角色信息
            this.$refs.editruleFormRef.validate(async valid => {
                if(!valid) return
                const {data:res} = await this.$http.put(`roles/${this.editruleForm.roleId}`,this.editruleForm)
                if(res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.$message.success('修改角色成功')
                this.editRolesDialogVisible = false
                this.getRolesList()
            })
            
        }
    }
}
</script>
<style lang="less" scoped>
.el-tag {
    margin: 10px 10px 15px 20px;
}

.bdtop {
    margin-left: 10px;
    border-top: 1px solid #eee;
}

.bdbottom {
    margin-left: 10px;
    border-bottom: 1px solid #eee;
}

.el-row {
    margin: 0;
}

.but {
    margin-bottom: 15px;
}
</style>