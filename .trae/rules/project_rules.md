# 项目规则

## 代码注释规范

### 强制要求
- **每个函数必须写注释**：说明函数的功能、参数、返回值
- **每个宏定义/常量必须写注释**：说明其用途
- **注释语言**：使用中文注释（与用户语言一致）

### 注释格式示例

#### JavaScript/TypeScript 函数注释
```javascript
/**
 * 用户登录
 * @param {Object} loginData - 登录数据
 * @param {string} loginData.username - 用户名
 * @param {string} loginData.password - 密码
 * @returns {Promise<Object>} 登录结果，包含用户信息和token
 */
const login = async (loginData) => {
  // ...
}
```

#### 常量/宏定义注释
```javascript
// Token存储的本地键名
const TOKEN_KEY = 'token'

// 默认请求超时时间（毫秒）
const REQUEST_TIMEOUT = 10000
```

#### Vue 组件注释
```vue
<script setup>
/**
 * 登录页面组件
 * 功能：用户登录、表单验证、登录状态管理
 */
</script>
```

### 长期记忆
此规则适用于本项目所有后续开发，AI助手必须严格遵守。
