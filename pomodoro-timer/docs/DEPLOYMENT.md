# 部署到GitHub Pages

## 方法一：使用GitHub Actions自动部署

1. 在项目根目录创建 `.github/workflows/gh-pages.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
        publish_branch: gh-pages
```

## 方法二：手动部署

1. 创建一个GitHub仓库（例如：`pomodoro-timer`）
2. 将项目文件推送到仓库
3. 进入仓库设置页面
4. 在 "Pages" 部分选择源码分支（通常是main或master）
5. 选择 `/ (root)` 作为部署源
6. 点击 "Save" 保存设置

## 配置自定义域名（可选）

如果要使用自定义域名：

1. 在项目根目录创建 `CNAME` 文件
2. 文件内容写入您的域名（例如：`pomodoro.yourdomain.com`）
3. 在GitHub仓库设置中配置自定义域名

## 注意事项

- 确保所有文件路径都是相对路径
- 所有功能都基于客户端，不需要服务器端支持
- 应用完全兼容GitHub Pages的静态文件服务
- 本地存储功能在GitHub Pages上正常工作