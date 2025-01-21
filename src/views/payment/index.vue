<template>
  <div class="maiin01" style="padding: 20px;">
    <div class="container">
      <el-form ref="formRef" :model="form" class="form">
        <el-form-item label="用户名" prop="username" :rules="[{ required: true, message: '请输入用户名', trigger: 'blur' }]">
          <el-input
            v-model="form.username"
            placeholder="请输入用户名"
            :min="6"
            @keydown="handleNamePasswordKeyPress"
            @input="handleNamePasswordInput"
          />
        </el-form-item>
      </el-form>

      <div class="amount-section">
        <el-form ref="formAmountRef" :model="form" class="amount-form">
          <el-form-item label="充值金额" prop="amount" :rules="[{ required: true, message: '请输入充值金额', trigger: 'blur' }]">
            <el-input-number
              v-model="form.amount"
              :min="0"
              :step="100"
              :controls-position="'right'"
              placeholder="请输入充值金额"
              @keypress="handleAmountKeyPress"
            />
          </el-form-item>
        </el-form>
      </div>

      <el-button type="primary" @click="openPasswordDialog">充值</el-button>
      <el-dialog title="管理员密码" :visible.sync="dialogVisible" @close="resetPassword">
        <el-input
          ref="passwordInput"
          v-model="password"
          type="password"
          placeholder="请输入密码"
          @keypress="handleNamePasswordKeyPress"
        />
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPayment">确认</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import { recharge } from '@/api/user' // 调整路径以正确指向 user.js
import { mapGetters } from 'vuex' // Vuex 的 helpers

export default {
  data() {
    return {
      form: {
        username: '',
        amount: 0
      },
      password: '',
      dialogVisible: false
    }
  },
  computed: {
    ...mapGetters(['token']) // 将 token getter 映射到组件的计算属性中
  },
  methods: {
    // 账户和密码框输入验证
    handleNamePasswordInput(event) {
      this.form.username = this.form.username.replace(/[^A-Za-z0-9]/g, '')
    },
    handleAmountKeyPress(event) {
      const charCode = event.charCode || event.keyCode
      if (charCode < 48 || charCode > 57) {
        event.preventDefault()
      }
    },
    handleNamePasswordKeyPress(event) {
      const char = event.key
      if (!/^[A-Za-z0-9]$/.test(char) && !['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(char)) {
        event.preventDefault()
      }
    },
    validateUsername() {
    // 检查用户名是否只包含英文字符和数字
      if (!/^[A-Za-z0-9]+$/.test(this.form.username) || this.form.username.length < 5) {
        this.$message.error('请检查用户名是否正确!')
        return false
      }
      return true
    },
    openPasswordDialog() {
      // 验证用户名是否有效
      if (!this.validateUsername()) {
        return // 返回如果验证失败
      }

      // 充值金额是否有效（或者可以直接检查金额是否被填写视需求而定）
      if (!this.form.amount) {
        this.$message.error('请输入有效的充值金额')
        return
      }

      // 如果所有条件都满足，打开密码输入对话框
      this.dialogVisible = true
    },
    resetPassword() {
      this.password = ''
    },
    async submitPayment() {
      // // 检查token
      // console.log('请求 Token:', this.token)

      if (!this.token) {
        this.$message.error('未登录或 Token 无效，请重新登录。')
        return
      }

      const requestBody = {
        target: this.form.username,
        amount: this.form.amount,
        password: this.password
      }

      try {
        const response = await recharge({
          data: requestBody,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.token}`
          }
        })

        // // 在这里查看完整的响应内容
        // console.log('完整响应:', response) // 观察原始响应对象

        // // 现在确认解析响应的正确性
        const { code, status, message } = response || {} // 防止直接解构 undefined

        // console.log('解析出的信息:', { code, status, message })

        // 确保该部分判断逻辑融合
        if (code === 200 && status) {
          this.$message.success(message) // 显示成功消息
          this.dialogVisible = false // 隐藏对话框
        } else {
          // 探讨失败原因
          this.$message.error(`充值失败: ${message || '未知错误'}`)
        }
      } catch (error) {
        // console.error('捕获到的错误:', error) // 打印错误信息
        this.$message.error('充值过程中发生错误，请重试。')
      }
    },
    resetForm() {
      this.form.username = ''
      this.form.amount = 0
    }
  }
}
</script>

<style scoped>
.container {
  max-width: 400px;
  /* margin: auto; */
  padding: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 5px;
  background-color: #f9f9f9;
}

.amount-section {
  margin-top: 20px;
}

.amount-form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
</style>
