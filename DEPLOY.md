# 超次元论坛前端部署指南

## 一、环境要求

- Node.js 18+
- Nginx（服务器端）
- 后端 API 服务已部署

## 二、本地构建

```bash
# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build
```

构建完成后会生成 `dist` 目录。

## 三、服务器部署

### 方式一：手动部署

#### 1. 上传文件

```bash
# 使用 scp 上传
scp -r dist/* user@your-server:/var/www/hyperdimension-forum/

# 或使用 rsync（推荐）
rsync -avz --delete dist/ user@your-server:/var/www/hyperdimension-forum/
```

#### 2. 配置 Nginx

```bash
# 复制配置文件
sudo cp nginx.conf.example /etc/nginx/sites-available/hyperdimension-forum

# 修改配置文件中的域名
sudo nano /etc/nginx/sites-available/hyperdimension-forum

# 创建软链接
sudo ln -s /etc/nginx/sites-available/hyperdimension-forum /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 3. 配置 HTTPS（推荐）

```bash
# 安装 certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期测试
sudo certbot renew --dry-run
```

### 方式二：使用部署脚本

```bash
# 给脚本执行权限
chmod +x deploy.sh

# 执行部署
./deploy.sh your-server-ip root /var/www/hyperdimension-forum
```

## 四、Nginx 配置说明

### 关键配置项

1. **History 模式路由**
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

2. **API 代理**
```nginx
location /api {
    proxy_pass http://39.105.129.96:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

3. **静态资源缓存**
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 五、常见问题

### 1. 页面刷新 404

确保 Nginx 配置了 `try_files $uri $uri/ /index.html;`

### 2. API 请求跨域

确保 Nginx 正确配置了 `/api` 的代理。

### 3. 静态资源加载失败

检查 `dist` 目录是否完整上传，检查文件权限。

## 六、更新部署

```bash
# 重新构建
npm run build

# 上传更新
rsync -avz --delete dist/ user@your-server:/var/www/hyperdimension-forum/
```

## 七、后端 API 地址

当前配置的后端 API 地址：`http://39.105.129.96:3000`

如需修改，请编辑 `vite.config.js` 中的 `proxy.target` 配置。
