<template>
    <div>
        <!-- 面包屑区域 -->
        <el-breadcrumb>
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>编辑商品</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 卡片区域 -->
        <el-card>
            <el-alert title="修改商品信息" type="info" center show-icon>
            </el-alert>
            <!-- active决定进行到哪一步 -0将字符串改为数字 -->
            <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center class="bzt">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <!-- tab栏区域 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px" label-position="top">
                <!-- 两个模块公用一个数据源，实现联动 -->
                <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeTabLeave"
                    @tab-click="tabClicked">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="editForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品价格" prop="goods_price">
                            <el-input v-model="editForm.goods_price" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品重量" prop="goods_weight">
                            <el-input v-model="editForm.goods_weight" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品数量" prop="goods_number">
                            <el-input v-model="editForm.goods_number" type="number"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <el-cascader v-model="editForm.goods_cat" :options="Catelist" :props="cateProps"
                                @change="handleChange"></el-cascader>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <!-- 渲染表单的Item项 -->
                        <el-form-item :label="item.attr_name" v-for="item in manyTabData" :key="item.attr_id">
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in onlyTabData" :key="item.attr_id">
                            <el-input v-model="item.attr_vals"></el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <!-- action 表示图片要上传到后台的API地址 -->
                        <el-upload :action="uploadURL" :headers="headerObj" :on-success="handleSuccess"
                            :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" show-file-list>
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="editForm.goods_introduce">
                        </quill-editor>
                        <el-button type="primary" class="editBtn" @click="edit">修改商品</el-button>
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>
        <!-- 图片预览的对话框 -->
        <el-dialog title="图片预览" :visible.sync="dialogVisible" width="50%">
            <img :src="previewPath" class="img">
        </el-dialog>
    </div>
</template>
<script>
import _ from 'lodash'
export default {
    data() {
        return {
            // 传递过来的 商品id
            id: this.$route.params.id,
            activeIndex: '0',
            editForm: {
            },
            editFormRules: {
                goods_name: [{
                    required: true,
                    message: '请输入商品名称',
                    trigger: 'blur'
                }],
                goods_price: [{
                    required: true,
                    message: '请输入商品价格',
                    trigger: 'blur'
                }],
                goods_weight: [{
                    required: true,
                    message: '请输入商品重量',
                    trigger: 'blur'
                }],
                goods_number: [{
                    required: true,
                    message: '请输入商品数量',
                    trigger: 'blur'
                }],
                goods_cat: [{
                    required: true,
                    message: '请选择商品分类',
                    trigger: 'change'
                }]
            },
            // 商品分类列表
            Catelist: [

            ],
            // 级联选择器
            cateProps: {
                label: 'cat_name',
                value: 'cat_id',
                children: 'children',
                expandTrigger: 'hover'
            },
            // 动态参数列表
            manyTabData: [],
            // 静态属性列表
            onlyTabData: [],
            // 图片上传路径
            uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
            // 手动为图片上传请求头添加token
            headerObj: {
                Authorization: window.sessionStorage.getItem('token')
            },
            // 图片路径
            previewPath: '',
            // 控制图片预览对话框的显示和隐藏
            dialogVisible: false,
            // 上传过的图片的列表
            uploadedList: []
        }
    },
    created() {
        this.getCateList()
        this.getParams()
    },
    methods: {
        async getParams() {
            const { data: res } = await this.$http.get(`goods/${this.id}`)
            if (res.meta.status !== 200) return this.$message.error('获取商品数据失败')
            console.log('data');
            console.log(res.data);
            this.editForm = res.data
            console.log(this.editForm);
            // 设置级联选择器绑定值
            const tempList = res.data.goods_cat.split(',')
            // 这里必须重新赋值为空数组，再赋值，否则v-model不能实现默认值回显
            this.editForm.goods_cat = []
            tempList.forEach(item => {
                // item - 0是把数据类型转换为数字，以与cateList 数据类型一致，否则不能正确回显默认值
                this.editForm.goods_cat.push(item - 0)
            })
            this.editForm.pics.forEach(item => {
                const obj =
                {
                    url: item.pics_sma
                }
                this.uploadedList.push(obj)
                // this.editForm.pics = this.uploadedList
                console.log('this.uploadedList');
                console.log(this.uploadedList);
            })
            // // this.$message.success('获取商品信息成功!')
        },
        async getCateList() {
            const { data: res } = await this.$http.get('categories')
            if (res.meta.status !== 200) return this.$message.error('获取商品分类失败')
            this.Catelist = res.data
            console.log(this.Catelist);
        },
        // 级联选择器的change事件
        handleChange() {
            console.log(this.editForm.goods_cat);
            if (this.editForm.goods_cat.length !== 3) {
                this.editForm.goods_cat = []
                this.$message.warning('只允许选择第三级分类！')
            }
        },
        // 控制tab栏不能随意切换
        beforeTabLeave(activeName, oldActiveName) {
            // console.log('将要离开的标签页名称：', oldActiveName);
            // console.log('当前标签页名称：', activeName);
            if (this.editForm.goods_cat.length !== 3 && oldActiveName === '0') {
                this.$message.error('请先选择商品分类')
                return false
            }
        },

        async tabClicked() {
            // console.log(this.activeIndex);
            // 访问的是动态参数面板
            if (this.activeIndex === '1') {
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: 'many'
                    }
                })
                if (res.meta.status !== 200) return this.$message.error('获取动态参数失败')
                // console.log(this.manyTabDeta);
                res.data.forEach(item => {
                    item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
                });
                this.manyTabData = res.data

            } else if (this.activeIndex === '2') {
                // 访问的是静态属性面板
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {
                    params: {
                        sel: 'only'
                    }
                })
                if (res.meta.status !== 200) return this.$message.error('获取静态属性列表失败')
                this.onlyTabData = res.data
                console.log(res.data);

            }
        },
        // 处理图片预览效果
        handlePreview(file) {
            console.log(file);
            if (file.response) {
                this.previewPath = file.response.data.url
            } else {
                this.previewPath = file.url
            }
            this.dialogVisible = true
        },
        // 处理移除图片的操作
        handleRemove(file) {
            console.log(file);
            if (file.response) {
                // 1.获取将要删除的图片的临时路径
                const filePath = file.response.data.tmp_path
                // 2.从pics数组中，找到这个图片对应的索引值
                const i = this.editForm.pics.findIndex(x => x.pic === filePath)
                // 3. 调用数组的 splice 方法，把图片信息对象，从 pics 数组中移除
                this.editForm.pics.pics.splice(i, 1)
            } else {
                // 则是一开始就有图片
                const Url = file.url
                const i = this.editForm.pics.findIndex(x =>
                    x.pics_sma_url === Url)
                this.editForm.pics.splice(i, 1)
            }

        },
        // 监听图片上传成功的事件
        handleSuccess(response) {
            console.log(response);
            // 1.拼接得到一个图片信息对象
            const picInfo = {
                pic: response.data.tmp_path
            }
            // 2.将图片信息对象添加到数组
            this.editForm.pics.push(picInfo)
            console.log(this.editForm);
        },
        // 添加商品
        edit() {
            this.$refs.editFormRef.validate(async valid => {
                if (!valid) return this.$message.error('请检查表单数据是否正确')
                // 执行添加商etur品的逻辑操作
                // lodash 是一个第三方的包，提供了一个方法，可以用来简化对象的深拷贝
                // cloneDeep(obj) 可以对一个对象进行深拷贝
                const form = _.cloneDeep(this.editForm)
                form.goods_cat = form.goods_cat.join(',')

                // 处理动态参数
                this.manyTabData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals.join(',')
                    }
                    this.editForm.attrs.push(newInfo)
                })
                // 处理静态属性
                this.onlyTabData.forEach(item => {
                    const newInfo = {
                        attr_id: item.attr_id,
                        attr_value: item.attr_vals
                    }
                    this.editForm.attrs.push(newInfo)
                })
                form.attrs = this.editForm.attrs
                console.log(form);
                // 发起请求，添加商品
                // 商品的名称必须是唯一的
                const { data: res } = await this.$http.put('goods/' + form.goods_id, form)
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                this.$message.success('修改商品成功')
                this.$router.push('/goods')
                console.log(res.data);
            })
        }

    },
    computed: {
        cateId() {
            if (this.editForm.goods_cat.length === 3) {
                return this.editForm.goods_cat[2]
            }
            return null

        }
    }
}
</script>
<style lang="less" scoped>
.el-checkbox {
    margin-right: 10px;
}

.el-checkbox:first-child {
    margin-left: 10px;
}

.img {
    width: 100%;
}

.editBtn {
    margin-top: 15px;
}
</style>