# 天阙教程 - Hexo 博客

这是基于 Hexo 框架和 Fluid 主题构建的"天阙教程"技术博客。

## 🚀 快速开始

### 环境要求

- Node.js (推荐 16.x 或更高版本)
- Git
- pnpm (推荐) 或 npm

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/tianquege/tianquege.github.io.git
cd hexo-blog

# 安装依赖
pnpm install
```

### 本地预览

```bash
# 清理缓存
hexo clean

# 生成静态文件
hexo generate

# 启动本地服务器
hexo server
```

访问 `http://localhost:4000` 预览网站。

## 📝 写作指南

### 创建新文章

```bash
# 创建新文章
hexo new "文章标题"

# 创建新页面
hexo new page "页面名称"
```

### 文章 Front-matter 配置

```yaml
---
title: 文章标题
date: 2025-08-20 10:00:00
categories: 
  - 教程
tags:
  - Android
  - 客户端
sticky: 1  # 置顶权重，数字越大越靠前
---
```

### 支持的分类和标签

**分类 (Categories):**
- 教程
- 技术分享
- 工具推荐

**标签 (Tags):**
- Android
- 客户端
- 编程
- 学习

## 🎨 主题配置

本博客使用 [Fluid](https://github.com/fluid-dev/hexo-theme-fluid) 主题，主要配置在 `_config.fluid.yml` 文件中。

### 主要配置项

```yaml
# 网站标题
navbar:
  blog_title: "天阙教程"

# 首页副标题
index:
  slogan:
    text: "欢迎来到天阙教程"

# 统计功能
footer:
  statistics:
    enable: true
    source: "busuanzi"
```

### 导航菜单

当前配置的菜单项：
- 天阙官网 - https://www.tianque.cc
- 首页
- 归档
- 分类
- 标签
- 关于

## 🚀 部署

### 自动部署到 GitHub Pages

```bash
# 清理 + 生成 + 部署
hexo clean && hexo generate && hexo deploy
```

网站将自动部署到：https://tianquege.github.io

### 部署配置

部署配置在 `_config.yml` 文件中：

```yaml
deploy:
  type: git
  repo: https://github.com/tianquege/tianquege.github.io.git
  branch: main
```

## 📁 项目结构

```
hexo-blog/
├── source/
│   ├── _posts/          # 文章目录
│   ├── about/           # 关于页面
│   └── img/            # 图片资源
├── themes/
│   └── fluid/          # Fluid 主题
├── _config.yml         # Hexo 主配置
├── _config.fluid.yml   # Fluid 主题配置
└── package.json        # 依赖配置
```

## ⚙️ 常用命令

```bash
# 创建新文章
hexo new "文章标题"

# 创建新页面
hexo new page "页面名称"

# 清理缓存
hexo clean

# 生成静态文件
hexo generate
# 或简写
hexo g

# 启动本地服务器
hexo server
# 或简写
hexo s

# 部署到远程
hexo deploy
# 或简写
hexo d

# 一键部署（推荐）
hexo clean && hexo g && hexo d
```

## 🔧 自定义配置

### 修改网站信息

编辑 `_config.yml` 文件：

```yaml
# Site
title: 天阙教程
subtitle: '技术教程分享'
description: '分享技术教程和学习心得'
keywords: 技术,教程,编程,学习
author: 天阙
language: zh-CN
url: https://tianquege.github.io
```

### 修改主题配置

编辑 `_config.fluid.yml` 文件来自定义：
- 首页标题和副标题
- 导航菜单
- 页脚信息
- 统计功能
- 评论系统
- 社交链接

### 添加新页面

```bash
# 创建关于页面
hexo new page about

# 创建友链页面
hexo new page links

# 创建分类页面
hexo new page categories
```

## 📊 功能特性

- ✅ 响应式设计，支持移动端
- ✅ 代码高亮
- ✅ 数学公式支持
- ✅ 访问统计（不蒜子）
- ✅ 搜索功能
- ✅ 文章置顶
- ✅ 分类和标签
- ✅ 自动部署到 GitHub Pages

## 🐛 常见问题

### 1. 部署权限问题

如果遇到权限错误，请检查：
- GitHub Personal Access Token 是否有效
- Token 是否有 repo 权限
- Git 用户配置是否正确

### 2. 主题样式问题

如果样式不正常，尝试：
```bash
hexo clean
pnpm install
hexo generate
```

### 3. 高亮样式错误

如果看到 highlightjs 样式错误，可以在 `_config.fluid.yml` 中修改：
```yaml
code:
  highlight:
    style: "github"
    style_dark: "github-dark"
```

## 📚 参考资源

- [Hexo 官方文档](https://hexo.io/docs/)
- [Fluid 主题文档](https://hexo.fluid-dev.com/docs/)
- [Markdown 语法指南](https://markdown.com.cn/)
- [GitHub Pages 文档](https://docs.github.com/en/pages)

## 📞 联系方式

- 官网：https://www.tianque.cc
- GitHub：https://github.com/tianquege

## 📄 许可证

本项目基于 MIT 许可证开源。

---

🌟 **感谢使用天阙教程博客模板！** 如果觉得有用，请给个 Star ⭐
