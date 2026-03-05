# GitHub Actions 自动部署配置指南

## 一、配置步骤

### 1. 在 GitHub 仓库中添加 Secrets

进入 GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

需要添加以下 Secrets：

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `SSH_PRIVATE_KEY` | SSH 私钥内容 | 见下方说明 |
| `REMOTE_HOST` | 服务器 IP 或域名 | `39.105.129.96` |
| `REMOTE_USER` | 服务器用户名 | `root` |
| `REMOTE_TARGET` | 部署目标路径 | `/var/www/hyperdimension-forum` |

### 2. 生成 SSH 密钥

在本地执行：

```bash
# 生成 SSH 密钥对
ssh-keygen -t rsa -b 4096 -C "github-actions" -f github-actions-key

# 会生成两个文件：
# github-actions-key (私钥) - 添加到 GitHub Secrets
# github-actions-key.pub (公钥) - 添加到服务器
```

### 3. 将公钥添加到服务器

```bash
# 登录服务器
ssh root@your-server

# 将公钥添加到 authorized_keys
echo "你的公钥内容" >> ~/.ssh/authorized_keys

# 设置权限
chmod 600 ~/.ssh/authorized_keys
```

### 4. 测试 SSH 连接

```bash
ssh -i github-actions-key root@your-server
```

---

## 二、工作流程说明

当你推送代码到 `main` 或 `master` 分支时，GitHub Actions 会自动：

1. **检出代码** - 拉取最新代码
2. **设置 Node.js** - 安装 Node.js 18
3. **安装依赖** - 执行 `npm ci`
4. **构建项目** - 执行 `npm run build`
5. **部署到服务器** - 通过 SSH 上传 `dist` 目录
6. **重载 Nginx** - 刷新 Nginx 配置

---

## 三、手动触发部署

在 GitHub 仓库页面：
1. 点击 **Actions** 标签
2. 选择 **Deploy to Server** 工作流
3. 点击 **Run workflow**

---

## 四、自定义配置

### 修改触发分支

编辑 `.github/workflows/deploy.yml`：

```yaml
on:
  push:
    branches:
      - main
      - develop  # 添加更多分支
```

### 添加构建前检查

```yaml
# 在构建步骤前添加
- name: Run lint
  run: npm run lint

- name: Run tests
  run: npm run test
```

### 部署到多个环境

创建多个工作流文件：
- `.github/workflows/deploy-staging.yml` - 测试环境
- `.github/workflows/deploy-production.yml` - 生产环境

---

## 五、常见问题

### 1. SSH 连接失败

检查：
- SSH 私钥格式是否正确（需要完整复制，包括开头和结尾）
- 服务器是否允许 SSH 连接
- 公钥是否正确添加到服务器

### 2. 权限问题

确保服务器上的部署目录有写入权限：

```bash
sudo chown -R $USER:$USER /var/www/hyperdimension-forum
```

### 3. Nginx 重载失败

确保用户有 sudo 权限且不需要密码：

```bash
# 编辑 sudoers
sudo visudo

# 添加以下行（替换 username）
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl reload nginx
```

---

## 六、通知配置（可选）

### 添加 Slack 通知

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    fields: repo,message,commit,author,action,eventName,ref,workflow
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

### 添加邮件通知

```yaml
- name: Send email
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USERNAME }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: Deploy Failed
    to: your-email@example.com
    from: GitHub Actions
    body: Deployment failed! Check the logs for details.
```

---

## 七、完整工作流文件结构

```
.github/
└── workflows/
    ├── deploy.yml           # 生产环境部署
    ├── deploy-staging.yml   # 测试环境部署（可选）
    └── test.yml             # 测试工作流（可选）
```
