# 部署指南

本指南详细介绍了如何将番茄钟应用部署到GitHub Pages。

## 部署到GitHub Pages

### 方法一：使用GitHub Actions（推荐）

1. 创建一个新的GitHub仓库
2. 将项目文件推送到仓库的main分支
3. 在仓库中创建`.github/workflows/gh-pages.yml`文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'

    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

4. 提交并推送更改，GitHub Actions会自动部署应用

### 方法二：手动部署

1. 创建一个新的GitHub仓库
2. 将项目文件添加到仓库：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

3. 在GitHub仓库设置中启用GitHub Pages：
   - 进入仓库的Settings
   - 向下滚动到Pages部分
   - Source选择"Deploy from a branch"
   - Branch选择"main"并选择"/ (root)"文件夹
   - 点击Save

### 方法三：使用gh-pages工具

1. 安装gh-pages工具：

```bash
npm install -g gh-pages
```

2. 在项目根目录执行：

```bash
gh-pages -d . -r https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git -b gh-pages
```

## 部署后验证

部署完成后，访问 `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY` 即可使用应用。

## 自定义域名（可选）

如果要使用自定义域名：

1. 在项目根目录创建CNAME文件，内容为您的域名
2. 在DNS设置中添加CNAME记录指向YOUR_USERNAME.github.io
3. 在GitHub仓库设置的Pages部分配置自定义域名

## 注意事项

- 确保所有文件路径使用相对路径
- 所有功能都应在GitHub Pages环境中测试
- 应用不依赖任何后端服务，完全静态运行
- 本地存储功能在GitHub Pages上完全可用