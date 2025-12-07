const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// 中间件：检查认证
function requireAuth(req, res, next) {
  if (!req.session.githubToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// 获取配置文件路径
const getConfigPath = () => {
  return path.resolve(__dirname, '..', '..', '_config.yml');
};

// 读取配置文件
async function readConfig() {
  try {
    const configPath = getConfigPath();
    const content = await fs.readFile(configPath, 'utf8');
    return content;
  } catch (error) {
    console.error('Error reading config:', error);
    throw error;
  }
}

// 写入配置文件
async function writeConfig(content) {
  try {
    const configPath = getConfigPath();
    await fs.writeFile(configPath, content, 'utf8');
  } catch (error) {
    console.error('Error writing config:', error);
    throw error;
  }
}

// 解析YAML配置（简单解析）
function parseConfig(content) {
  const config = {
    categories: [],
    popularTags: []
  };
  
  // 解析分类
  const categoryMatch = content.match(/categories:\s*\n((?:\s*-\s*[^\n]+\n?)+)/);
  if (categoryMatch) {
    const categories = categoryMatch[1].match(/-\s*([^\n]+)/g);
    if (categories) {
      config.categories = categories.map(c => c.replace(/^-\s*/, '').trim());
    }
  }
  
  // 解析热门标签
  const tagsMatch = content.match(/popular_tags:\s*\n((?:\s*-\s*[^\n]+\n?)+)/);
  if (tagsMatch) {
    const tags = tagsMatch[1].match(/-\s*([^\n]+)/g);
    if (tags) {
      config.popularTags = tags.map(t => t.replace(/^-\s*/, '').trim());
    }
  }
  
  return config;
}

// 更新YAML配置
function updateConfig(content, updates) {
  let newContent = content;
  
  // 更新分类
  if (updates.categories !== undefined) {
    const categorySection = `categories:\n${updates.categories.map(c => `  - ${c}`).join('\n')}\n`;
    if (content.includes('categories:')) {
      newContent = newContent.replace(/categories:\s*\n((?:\s*-\s*[^\n]+\n?)+)/, categorySection);
    } else {
      // 在defaults之前插入
      const defaultsIndex = newContent.indexOf('defaults:');
      if (defaultsIndex !== -1) {
        newContent = newContent.slice(0, defaultsIndex) + categorySection + '\n' + newContent.slice(defaultsIndex);
      } else {
        newContent += '\n' + categorySection;
      }
    }
  }
  
  // 更新热门标签
  if (updates.popularTags !== undefined) {
    const tagsSection = `popular_tags:\n${updates.popularTags.map(t => `  - ${t}`).join('\n')}\n`;
    if (content.includes('popular_tags:')) {
      newContent = newContent.replace(/popular_tags:\s*\n((?:\s*-\s*[^\n]+\n?)+)/, tagsSection);
    } else {
      // 在defaults之前插入
      const defaultsIndex = newContent.indexOf('defaults:');
      if (defaultsIndex !== -1) {
        newContent = newContent.slice(0, defaultsIndex) + tagsSection + '\n' + newContent.slice(defaultsIndex);
      } else {
        newContent += '\n' + tagsSection;
      }
    }
  }
  
  return newContent;
}

// 获取所有分类
router.get('/categories', requireAuth, async (req, res) => {
  try {
    const content = await readConfig();
    const config = parseConfig(content);
    res.json({ categories: config.categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 添加分类
router.post('/categories', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    
    const content = await readConfig();
    const config = parseConfig(content);
    
    if (config.categories.includes(name)) {
      return res.status(400).json({ error: 'Category already exists' });
    }
    
    config.categories.push(name);
    const newContent = updateConfig(content, { categories: config.categories });
    await writeConfig(newContent);
    
    res.json({ success: true, categories: config.categories });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

// 删除分类
router.delete('/categories/:name', requireAuth, async (req, res) => {
  try {
    const { name } = req.params;
    const content = await readConfig();
    const config = parseConfig(content);
    
    config.categories = config.categories.filter(c => c !== name);
    const newContent = updateConfig(content, { categories: config.categories });
    await writeConfig(newContent);
    
    res.json({ success: true, categories: config.categories });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// 获取热门标签
router.get('/popular', requireAuth, async (req, res) => {
  try {
    const content = await readConfig();
    const config = parseConfig(content);
    res.json({ tags: config.popularTags || [] });
  } catch (error) {
    console.error('Error fetching popular tags:', error);
    res.status(500).json({ error: 'Failed to fetch popular tags' });
  }
});

// 设置热门标签
router.put('/popular', requireAuth, async (req, res) => {
  try {
    const { tags } = req.body;
    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }
    
    const content = await readConfig();
    const newContent = updateConfig(content, { popularTags: tags });
    await writeConfig(newContent);
    
    res.json({ success: true, tags });
  } catch (error) {
    console.error('Error updating popular tags:', error);
    res.status(500).json({ error: 'Failed to update popular tags' });
  }
});

// 获取所有标签（从文章中提取）
router.get('/all', requireAuth, async (req, res) => {
  try {
    const postsDir = path.resolve(__dirname, '..', req.config.paths.postsDir);
    const files = await fs.readdir(postsDir);
    const frontMatter = require('front-matter');
    
    const allTags = new Set();
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(postsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const parsed = frontMatter(content);
        
        if (parsed.attributes.tags) {
          const tags = Array.isArray(parsed.attributes.tags) 
            ? parsed.attributes.tags 
            : [parsed.attributes.tags];
          tags.forEach(tag => allTags.add(tag));
        }
      }
    }
    
    res.json({ tags: Array.from(allTags).sort() });
  } catch (error) {
    console.error('Error fetching all tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

module.exports = router;




