# 使用指南（中文）

## 📝 你只需要写简单的 Markdown 文件！

不需要手动填写复杂的 metadata！系统会自动帮你生成所有需要的字段。

---

## 🚀 最简单的用法

### 1. 创建 Markdown 文件

在 `content/` 目录下创建文件，系统会自动解析：

```
content/
├── en/              # 英文内容
│   ├── blog/
│   │   ├── my-post.md
│   │   └── another-post.md
│   └── products/
│       └── chatbot.md
├── zh/              # 中文内容
│   └── blog/
│       └── my-post.md
└── ja/              # 日文内容
    └── blog/
        └── my-post.md
```

### 2. 最简单的 Markdown 格式

**只需要写标题和内容！**

```markdown
---
title: 我的第一篇博客
---

# 我的第一篇博客

这是正文内容...
```

✅ **就这样！** 系统会自动生成：
- `id`: 根据文件路径自动生成
- `slug`: 从文件路径提取（`blog/my-post`）
- `language`: 从目录名检测（`zh`）
- `contentType`: 从目录名检测（`blog`）
- `excerpt`: 从正文自动提取
- `author`: 使用默认作者
- `publishedAt`: 使用文件创建时间
- `updatedAt`: 使用文件修改时间

---

## 📋 完整格式（可选字段）

如果你想自定义更多内容：

```markdown
---
title: 如何构建AI聊天机器人
excerpt: 这是自定义的摘要，如果不写会自动生成
category: AI技术
author: 张三
tags: [AI, 聊天机器人, 教程]
featuredImage: /images/chatbot.jpg
date: 2025-01-15
status: published
---

# 如何构建AI聊天机器人

正文内容...
```

### 支持的 Frontmatter 字段

| 字段 | 说明 | 必填 | 自动生成 |
|------|------|------|----------|
| `title` | 标题 | ✅ 是 | 从 `# 标题` 提取 |
| `excerpt` | 摘要 | ❌ 否 | ✅ 从正文提取 |
| `category` | 分类 | ❌ 否 | - |
| `author` | 作者 | ❌ 否 | ✅ 默认作者 |
| `tags` | 标签 | ❌ 否 | - |
| `featuredImage` | 特色图片 | ❌ 否 | - |
| `date` | 发布日期 | ❌ 否 | ✅ 文件创建时间 |
| `status` | 状态 | ❌ 否 | ✅ `published` |
| `language` | 语言 | ❌ 否 | ✅ 从目录检测 |
| `slug` | URL路径 | ❌ 否 | ✅ 从文件路径生成 |
| `contentType` | 内容类型 | ❌ 否 | ✅ 从目录检测 |

---

## 🌍 多语言内容

### 方法1：使用目录结构（推荐）

```
content/
├── en/blog/ai-guide.md      # 英文版
├── zh/blog/ai-guide.md      # 中文版
└── ja/blog/ai-guide.md      # 日文版
```

系统会**自动检测**同名文件的其他语言版本，并生成 `hreflang` 标签！

### 方法2：使用文件名后缀

```
content/blog/
├── ai-guide.en.md      # 英文版
├── ai-guide.zh.md      # 中文版
└── ai-guide.ja.md      # 日文版
```

---

## 🧪 测试自动解析器

运行测试脚本查看解析结果：

```bash
npm run test:parser
```

你会看到：

```
🔍 Testing Markdown Parser

============================================================

📚 Parsing all markdown files...

Found 3 published content items:

────────────────────────────────────────────────────────────
📄 File: blog/ai-chatbot-guide
   Language: en
   Content Type: blog
   Title: How to Build an AI Chatbot in 2025
   Excerpt: A comprehensive guide to building intelligent chatbots...
   Author: Sarah Chen
   Category: AI Technology
   Tags: AI, Chatbot, Tutorial
   Alternates: 1 language(s)
   Images: 1 image(s)
   Status: published

   🤖 Auto-generated fields:
      ID: a3f8c2d1b4e5
      Slug: blog/ai-chatbot-guide
      Published: 2025-01-15
      Updated: 2025-01-15
```

---

## 💻 在代码中使用

### 基本用法

```javascript
const MarkdownContentSource = require('./src/lib/content/markdown-content-source');

// 初始化
const contentSource = new MarkdownContentSource({
  contentDir: './content',        // Markdown 文件目录
  defaultLanguage: 'zh',          // 默认语言
  defaultAuthor: 'Seasalt.AI'     // 默认作者
});

// 获取所有已发布内容
const allContent = await contentSource.getAllPublished();

// 获取特定文章
const post = await contentSource.getBySlug('blog/my-post', 'zh');

// 按分类获取
const aiPosts = await contentSource.getByCategory('AI技术');

// 按标签获取
const tutorials = await contentSource.getByTag('教程');

// 按语言获取
const zhContent = await contentSource.getByLanguage('zh');
```

### 生成 SEO 标签

```javascript
const MetaTagEngine = require('./src/lib/seo/meta-tag-engine');

const metaEngine = new MetaTagEngine({
  baseUrl: 'https://seasalt.ai'
});

// 解析的内容会自动包含所有需要的字段
const metaData = metaEngine.generate(post);

// metaData 包含：
// - title: "如何构建AI聊天机器人 | Seasalt.AI 博客"
// - description: 自动截断到合适长度（中文80字符）
// - canonical: https://seasalt.ai/zh/blog/my-post
// - hreflang: 自动生成的语言链接
// - openGraph: Facebook分享卡片
// - twitter: Twitter分享卡片
// - schema: 结构化数据
```

### 在 Next.js 中使用

```jsx
// pages/blog/[slug].js
import SEOHead from '../../src/components/SEOHead';
import MarkdownRenderer from '../../src/components/markdown/MarkdownRenderer';
import MarkdownContentSource from '../../src/lib/content/markdown-content-source';
import MetaTagEngine from '../../src/lib/seo/meta-tag-engine';

export default function BlogPost({ post, metaData }) {
  return (
    <>
      <SEOHead metaData={metaData} />

      <article>
        <h1>{post.title}</h1>
        <p>作者：{post.author.name} • {post.category}</p>

        {/* 自动渲染 Markdown */}
        <MarkdownRenderer content={post.body} />
      </article>
    </>
  );
}

export async function getStaticProps({ params }) {
  // 1. 从 Markdown 文件获取内容
  const contentSource = new MarkdownContentSource({
    contentDir: './content'
  });
  const post = await contentSource.getBySlug(params.slug, 'zh');

  // 2. 生成 SEO 标签
  const metaEngine = new MetaTagEngine({
    baseUrl: 'https://seasalt.ai'
  });
  const metaData = metaEngine.generate(post);

  return { props: { post, metaData } };
}
```

---

## 🎯 实际例子

### 例子1：极简博客文章

```markdown
---
title: AI的未来
---

# AI的未来

人工智能正在改变世界...
```

✅ 系统自动生成：
- ID: `d4e5f6a7b8c9`
- Slug: `blog/ai-future`
- Language: `zh` (从目录检测)
- Content Type: `blog` (从目录检测)
- Excerpt: "人工智能正在改变世界..."
- Author: "Seasalt.AI" (默认)

### 例子2：完整博客文章

```markdown
---
title: 深度学习完全指南
excerpt: 从零开始学习深度学习的完整教程
category: 机器学习
author: 李明
tags: [深度学习, PyTorch, 教程]
featuredImage: /images/deep-learning.jpg
---

# 深度学习完全指南

本教程将带你从零开始...

## 什么是深度学习

深度学习是机器学习的一个分支...

```javascript
import torch
import torch.nn as nn

class NeuralNetwork(nn.Module):
    def __init__(self):
        super().__init__()
        self.layer1 = nn.Linear(10, 5)
```

## 总结

通过本教程，你已经学会了...
```

### 例子3：产品页面

```markdown
---
title: Seasalt 聊天机器人平台
excerpt: 使用我们强大的AI平台构建智能聊天机器人
category: 产品
author: Seasalt.AI
featuredImage: /images/chatbot-platform.jpg
---

# Seasalt 聊天机器人平台

我们的聊天机器人平台让你能够...
```

保存为：`content/zh/products/chatbot-platform.md`

---

## 🔄 生成站点地图

所有解析的 Markdown 都会自动包含在站点地图中：

```bash
npm run generate:sitemap
```

生成的站点地图会包含：
- 所有语言版本
- 正确的 hreflang 链接
- 自动计算的优先级
- 图片站点地图

---

## ⚡ 性能优化

### 缓存

系统会自动缓存解析结果（5分钟）：

```javascript
const contentSource = new MarkdownContentSource({
  contentDir: './content',
  cacheTimeout: 600000  // 10分钟缓存
});

// 清除缓存
contentSource.clearCache();
```

### 增量更新

只在文件修改时重新解析：

```javascript
// 在 Next.js 中使用 revalidate
export async function getStaticProps() {
  // ...
  return {
    props: { post, metaData },
    revalidate: 3600  // 每小时重新验证
  };
}
```

---

## 🎨 Markdown 功能

支持的 Markdown 语法：

### 基础格式

```markdown
**粗体** *斜体* `代码`

[链接](https://seasalt.ai)

![图片](/images/example.jpg)
```

### 代码块（带语法高亮）

````markdown
```javascript
const greeting = 'Hello, World!';
console.log(greeting);
```
````

### 表格

```markdown
| 功能 | 说明 |
|------|------|
| 自动解析 | ✅ |
| SEO优化 | ✅ |
```

### 列表

```markdown
- 项目 1
- 项目 2
  - 子项目 2.1
  - 子项目 2.2

1. 第一步
2. 第二步
```

### 自定义组件

```markdown
<Callout type="info">
这是一个信息提示框
</Callout>

<Callout type="warning">
这是一个警告提示框
</Callout>
```

---

## 📁 推荐的文件结构

```
content/
├── en/                    # 英文内容
│   ├── blog/
│   │   ├── 2025-01-15-ai-guide.md
│   │   └── 2025-01-20-chatbot.md
│   ├── products/
│   │   └── chatbot-platform.md
│   └── docs/
│       └── getting-started.md
│
├── zh/                    # 中文内容
│   ├── blog/
│   │   ├── 2025-01-15-ai-guide.md
│   │   └── 2025-01-20-chatbot.md
│   └── products/
│       └── chatbot-platform.md
│
└── ja/                    # 日文内容
    └── blog/
        └── 2025-01-15-ai-guide.md
```

**建议：**
- 用日期作为文件名前缀（便于排序）
- 保持各语言版本的文件名一致
- 使用有意义的文件名（不是 `post1.md`，而是 `ai-chatbot-guide.md`）

---

## 🔧 常见问题

### Q: 我可以不写 frontmatter 吗？

**A:** 可以！只写正文也行：

```markdown
# 我的文章标题

这是内容...
```

所有字段都会自动生成。

### Q: 如何设置草稿状态？

**A:** 添加 `status: draft` 或 `draft: true`：

```markdown
---
title: 草稿文章
status: draft
---
```

### Q: 如何自定义 slug？

**A:** 在 frontmatter 中指定：

```markdown
---
title: 我的文章
slug: custom-url-path
---
```

### Q: 如何链接多语言版本？

**A:** 系统会自动检测！只要保持文件名和路径一致：

```
content/en/blog/guide.md  ← 自动链接
content/zh/blog/guide.md  ← 自动链接
content/ja/blog/guide.md  ← 自动链接
```

---

## ✅ 总结

你只需要：

1. **创建 Markdown 文件** 在 `content/` 目录
2. **写内容** 用最简单的格式
3. **运行** `npm run test:parser` 查看解析结果

系统会自动：
- ✅ 生成所有 metadata
- ✅ 检测语言
- ✅ 提取摘要
- ✅ 创建 slug
- ✅ 链接多语言版本
- ✅ 生成 SEO 标签
- ✅ 创建站点地图

**就是这么简单！** 🎉
