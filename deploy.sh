#!/bin/bash

# 超次元论坛前端部署脚本
# 使用方法: ./deploy.sh [服务器IP] [用户名] [部署路径]

# 配置变量
SERVER_IP=${1:-"your-server-ip"}
SERVER_USER=${2:-"root"}
DEPLOY_PATH=${3:-"/var/www/hyperdimension-forum"}

echo "=========================================="
echo "  超次元论坛前端部署脚本"
echo "=========================================="

# 1. 安装依赖
echo "[1/4] 安装依赖..."
npm install

# 2. 构建生产版本
echo "[2/4] 构建生产版本..."
npm run build

if [ ! -d "dist" ]; then
    echo "错误: 构建失败，dist 目录不存在"
    exit 1
fi

# 3. 创建服务器目录
echo "[3/4] 创建服务器目录..."
ssh ${SERVER_USER}@${SERVER_IP} "mkdir -p ${DEPLOY_PATH}"

# 4. 上传文件
echo "[4/4] 上传文件到服务器..."
rsync -avz --delete dist/ ${SERVER_USER}@${SERVER_IP}:${DEPLOY_PATH}/

echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "请确保服务器已配置 Nginx，配置文件示例："
echo ""
cat << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/hyperdimension-forum;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://39.105.129.96:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
EOF
