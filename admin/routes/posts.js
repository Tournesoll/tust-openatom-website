const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const frontMatter = require('front-matter');
const axios = require('axios');
const router = express.Router();

// 中间件：检查认证
function requireAuth(req, res, next) {
  if (!req.session.githubToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// 获取所有文章
router.get('/', requireAuth, async (req, res) => {
  try {
    const postsDir = path.resolve(__dirname, '..', req.config.paths.postsDir);
    const files = await fs.readdir(postsDir);
    
    const posts = [];
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = frontMatter(content);
        
        posts.push({
          filename: file,
          title: parsed.attributes.title || '无标题',
          date: parsed.attributes.date || '',
          categories: parsed.attributes.categories || [],
          tags: parsed.attributes.tags || [],
          author: parsed.attributes.author || '',
          excerpt: parsed.attributes.excerpt || '',
          layout: parsed.attributes.layout || 'post',
        });
      }
    }
    
    // 按日期排序
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// 获取单篇文章
router.get('/:filename', requireAuth, async (req, res) => {
  try {
    const postsDir = path.resolve(__dirname, '..', req.config.paths.postsDir);
    const filePath = path.join(postsDir, req.params.filename);
    const content = await fs.readFile(filePath, 'utf8');
    const parsed = frontMatter(content);
    
    res.json({
      filename: req.params.filename,
      frontMatter: parsed.attributes,
      body: parsed.body,
    });
  } catch (error) {
    res.status(404).json({ error: 'Post not found' });
  }
});

// 创建文章
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, date, categories, tags, author, excerpt, body, layout } = req.body;
    
    // 生成文件名
    const dateStr = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const filename = `${dateStr}-${slug}.md`;
    
    // 构建 Front Matter
    const frontMatterContent = `---
layout: ${layout || 'post'}
title: "${title}"
date: ${date || new Date().toISOString()}
categories: [${categories || 'frontend'}]
tags: [${(tags || []).join(', ')}]
author: ${author || '技术社团'}
${excerpt ? `excerpt: "${excerpt}"` : ''}
---

${body || ''}
`;
    
    const postsDir = path.resolve(__dirname, '..', req.config.paths.postsDir);
    const filePath = path.join(postsDir, filename);
    
    await fs.writeFile(filePath, frontMatterContent, 'utf8');
    
    res.json({
      success: true,
      filename: filename,
      message: '文章创建成功',
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// 更新文章
router.put('/:filename', requireAuth, async (req, res) => {
  try {
    const { title, date, categories, tags, author, excerpt, body, layout } = req.body;
    
    // 构建 Front Matter
    const frontMatterContent = `---
layout: ${layout || 'post'}
title: "${title}"
date: ${date || new Date().toISOString()}
categories: [${categories || 'frontend'}]
tags: [${(tags || []).join(', ')}]
author: ${author || '技术社团'}
${excerpt ? `excerpt: "${excerpt}"` : ''}
---

${body || ''}
`;
    
    const postsDir = path.resolve(__dirname, '..', req.config.paths.postsDir);
    const filePath = path.join(postsDir, req.params.filename);
    
    await fs.writeFile(filePath, frontMatterContent, 'utf8');
    
    res.json({
      success: true,
      message: '文章更新成功',
    });
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// 删除文章
router.delete('/:filename', requireAuth, async (req, res) => {
  try {
    const postsDir = path.resolve(__dirname, '..', req.config.paths.postsDir);
    const filePath = path.join(postsDir, req.params.filename);
    
    await fs.unlink(filePath);
    
    res.json({
      success: true,
      message: '文章删除成功',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

module.exports = router;

