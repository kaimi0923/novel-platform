# 鬼点子 · 阿里云大陆部署 + ICP 备案 全流程

> 目标：网站放在阿里云大陆服务器，国内直连不用翻墙；域名 mywhimsy.work 完成 ICP 备案。
> 全程约：部署 1 天 + 备案审核 7–20 个工作日。

---

## 一、先确认你已经有的东西

| 项目 | 状态 |
|---|---|
| 域名 mywhimsy.work | 已购买 |
| 域名信息模板实名 | ✅ 已通过（截图确认） |
| 台湾居民居住证 | 已有（主体证件） |
| Supabase 项目 | 已有（网址 + Publishable key） |
| GitHub 代码仓库 | 已有（kaimi0923/novel-platform） |
| **阿里云大陆服务器** | ❌ 需要买 |
| **ICP 备案** | ❌ 需要申请 |

---

## 二、买服务器（10 分钟）

阿里云控制台 → 产品 → **轻量应用服务器**。

- 地域：**华南 1（深圳）** 或 **华南 2（广州）**（离广东、湖南都近，延迟低）
- 镜像：**Ubuntu 22.04**
- 配置：**2 核 2G、40G 系统盘、峰值带宽 3–5Mbps**
- 价格：新用户首年约 ¥60–120/月区间，选"包年"更便宜
- 买完记下：**公网 IP**

> 不要买"香港/海外"节点，海外节点不能备案。
> 带宽选 3Mbps 起步即可，视频走 OSS，不占服务器带宽。

---

## 三、备案材料清单（提前拍照存手机）

1. 台湾居民居住证 **正面 + 反面**（清晰、四角完整、不反光）
2. 本人手机号（用于接收工信部核验短信，24 小时内必须点确认）
3. 常用邮箱
4. 网站名称：**鬼点子**
5. 网站服务内容：**个人作品展示**（或"其他"）
6. 域名：mywhimsy.work
7. 服务器实例（刚买的那台）

⚠️ 网站名称规则（很容易被驳回）：
- 不能带「网」「平台」「社区」「在线」「论坛」「博客」等字样
- 不能与已备案网站重名
- 纯名称「鬼点子」最稳

---

## 四、部署网站到服务器（约 1 小时）

### 1. 连上服务器

阿里云控制台 → 轻量应用服务器 → 远程连接（Workbench），或用你 Mac 的终端：

```bash
ssh root@你的服务器公网IP
```

### 2. 装环境（一次性，复制整段）

```bash
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx
node -v   # 应显示 v20.x
```

### 3. 拉代码 + 配环境变量

```bash
mkdir -p /var/www && cd /var/www
git clone https://github.com/kaimi0923/novel-platform.git
cd novel-platform
```

创建环境变量文件（把值换成你自己的）：

```bash
cat > .env.local <<'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://mmoqqcfguxvaxfkyrhmh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=你的PublishableKey
EOF
```

> 这是公开仓库，**不要把 Secret key 写进任何提交到 GitHub 的文件**；本机的 `.env.local` 已在 .gitignore 里。

### 4. 安装依赖并构建

```bash
npm install
npm run build
```

### 5. 用 PM2 常驻运行

```bash
npm i -g pm2
pm2 start npm --name "guidianzi" -- start
pm2 save
pm2 startup    # 按提示复制它输出的那行命令再执行一次，实现开机自启
```

验证：`curl -I http://127.0.0.1:3000` 应返回 200。

### 6. Nginx 反向代理

```bash
cat > /etc/nginx/sites-available/guidianzi <<'EOF'
server {
    listen 80;
    server_name mywhimsy.work www.mywhimsy.work;

    client_max_body_size 60m;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

ln -s /etc/nginx/sites-available/guidianzi /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### 7. 域名解析

阿里云域名控制台 → 解析 → 添加记录：

| 记录类型 | 主机记录 | 记录值 |
|---|---|---|
| A | @ | 你的服务器公网 IP |
| A | www | 你的服务器公网 IP |

> 备案审核期间，未备案域名访问大陆服务器**可能被拦截**。如果被拦：
> - 初审阶段用 `http://服务器IP` 访问，确保网站能打开、内容和填写的一致；
> - 备案通过后再启用域名解析，正常访问。

---

## 五、提交 ICP 备案（手机/电脑都能操作）

入口：阿里云控制台 → 备案（beian.aliyun.com）→ 开始备案。

### 逐项填写

**第 1 步 基础信息**
- 备案类型：**个人**
- 主办单位性质：个人
- 证件类型：**台湾居民居住证**
- 证件号码、姓名、地址：照证件原样填（地址为证件上的广东省惠州市惠东县…）
- 手机号：本人实名手机号

**第 2 步 网站信息**
- 域名：mywhimsy.work
- 网站名称：**鬼点子**
- 服务内容：**其他**（备注写"个人原创作品展示"）
- 网站负责人：本人

**第 3 步 上传材料**
- 居住证正反面
- 按提示在线签署《网站备案信息真实性核验单》

**第 4 步 人脸核验**
- 下载「阿里云」App → 扫脸活体检测，本人出镜

**第 5 步 提交**
- 阿里云初审 1–2 个工作日（会打电话核实，保持手机畅通）
- 初审通过 → 提交广东省通信管理局
- 管局审核 7–20 个工作日
- 收到工信部短信 → **24 小时内点确认**（超时要重新排队）
- 通过后拿到「粤ICP备2026XXXXXX号」

**第 6 步 挂备案号**
- 网站底部必须显示：`粤ICP备XXXXXXXX号`，并链接到 https://beian.miit.gov.cn

---

## 六、备案通过后：HTTPS + 视频存储

### 1. 免费 HTTPS

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d mywhimsy.work -d www.mywhimsy.work
```

按提示输入邮箱、同意协议，自动续期。

### 2. 视频改放 OSS

- OSS Bucket 地域选「华南 1（深圳）」
- Bucket → 域名管理 → 绑定自定义域名（如 `v.mywhimsy.work`，需该域名已备案）
- 开启 CDN 加速，CNAME 指向 CDN 分配的域名
- 代码侧只需要把上传接口的存储桶换成 OSS，剧集表里 `video_url` 换成 OSS 地址，其余不变

---

## 七、风险提示（重要，别忽略）

**个人备案 + 用户投稿/评论功能，存在被管局要求"企业备案"的可能。**

个人备案网站的内容范围有限制，涉及用户注册、投稿、留言互动时，部分省份管局会：
- 要求补充说明网站功能
- 要求去掉互动功能
- 直接驳回并要求企业主体备案

如果被驳回，可选：
1. 先按"个人作品展示"定位上线，投稿功能仅自己使用（隐藏公开入口），备案通过后再逐步开放；
2. 注册个体工商户/公司（成本更低的是个体户），走企业备案，后续做付费、广告也合规。

**不要做的事**：备案信息与实际内容不符、网站名称与实际不符，被抽查到会注销备案。

---

## 八、时间表

| 阶段 | 耗时 |
|---|---|
| 买服务器 + 部署 | 半天到 1 天 |
| 提交备案 | 1 小时 |
| 阿里云初审 | 1–2 个工作日 |
| 管局审核 | 7–20 个工作日 |
| 合计 | 约 2–4 周 |

备案期间网站代码可以继续开发，短剧功能不受影响。
