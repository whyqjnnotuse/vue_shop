<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <el-form :model="loginForm" ref="ruleForm" :rules="rules" label-width="0px" class="login_form">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input v-model="loginForm.username" prefix-icon="iconfont icon-user"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input v-model="loginForm.password" prefix-icon="iconfont icon-3702mima" type="password"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm: {
                username: 'admin',
                password: '123456'
            },
            //校验规则 
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }
        }
    },
    methods:{
        resetLoginForm(){
            // console.log(this);
            this.$refs.ruleForm.resetFields()
        },
        login(){
            this.$refs.ruleForm.validate(async valid =>{
                if(!valid) return;
                // 对返回来的数据进行解构
                const {data:res} = await this.$http.post("login",this.loginForm)
                console.log(res);
                if(res.meta.status !== 200) return this.$message.error("登录失败");
                this.$message.success("登录成功");
                // 1.将登录成功后的token保存到客户端的sessionStorage中
                // 1.1项目中除了登录之外的其他API接口,必须在登录之后才能访问
                // 1.2 token只应在当前网站打开期间生效,所以将token保存在sessionStorage中
                window.sessionStorage.setItem("token",res.data.token)
                this.$router.push("/home")
            })
        }
    }
}
</script>
<style lang="less" scoped>
.login_container {
    height: 100%;
    background-color: #3d5a80;
}

.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
}

.avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px 2px #ddd;
    // text-align: center;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        // margin-top: 8px;
        background-color: #eee;
    }
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 20px;
    box-sizing: border-box;
}

.btns {
    display: flex;
    justify-content: flex-end;
}

// .el-input__prefix{
//     left: 8px;
// }
</style>