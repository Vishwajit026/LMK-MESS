const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const db = require('../db/db');
const { verifyAdmin } = require('../middleware/auth');

// 1. Get All Blogs (Public)
router.get('/', async (req, res) => {
  try {
    let blogs = [];
    if (db.useLocalDb) {
      blogs = db.getLocalData('blogs');
    } else {
      blogs = await Blog.find();
    }
    
    // Sort by date descending
    blogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(blogs);
  } catch (error) {
    console.error('Fetch blogs error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 2. Get Single Blog (Public)
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    let blog = null;
    if (db.useLocalDb) {
      const blogs = db.getLocalData('blogs');
      blog = blogs.find(b => b._id === id);
    } else {
      blog = await Blog.findById(id);
    }

    if (!blog) {
      return res.status(404).json({ message: 'Insight post not found.' });
    }
    res.json(blog);
  } catch (error) {
    console.error('Fetch single blog error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 3. Create Blog (Admin Only)
router.post('/', verifyAdmin, async (req, res) => {
  const { title, summary, content, image, category, author, readTime } = req.body;

  if (!title || !summary || !content) {
    return res.status(400).json({ message: 'Title, summary, and content are required.' });
  }

  try {
    let newBlog = null;
    if (db.useLocalDb) {
      const blogs = db.getLocalData('blogs');
      newBlog = {
        _id: 'blog_' + Date.now().toString(),
        title,
        summary,
        content,
        image: image || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600',
        category: category || 'Blog',
        author: author || 'KPC Insights Team',
        readTime: readTime || '5 min read',
        createdAt: new Date().toISOString()
      };
      blogs.push(newBlog);
      db.saveLocalData('blogs', blogs);
    } else {
      newBlog = await Blog.create({
        title,
        summary,
        content,
        image,
        category,
        author,
        readTime
      });
    }

    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Create blog error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 4. Update Blog (Admin Only)
router.put('/:id', verifyAdmin, async (req, res) => {
  const { title, summary, content, image, category, author, readTime } = req.body;
  const { id } = req.params;

  try {
    if (db.useLocalDb) {
      const blogs = db.getLocalData('blogs');
      const blogIndex = blogs.findIndex(b => b._id === id);
      if (blogIndex === -1) {
        return res.status(404).json({ message: 'Insight post not found.' });
      }

      blogs[blogIndex] = {
        ...blogs[blogIndex],
        title: title !== undefined ? title : blogs[blogIndex].title,
        summary: summary !== undefined ? summary : blogs[blogIndex].summary,
        content: content !== undefined ? content : blogs[blogIndex].content,
        image: image !== undefined ? image : blogs[blogIndex].image,
        category: category !== undefined ? category : blogs[blogIndex].category,
        author: author !== undefined ? author : blogs[blogIndex].author,
        readTime: readTime !== undefined ? readTime : blogs[blogIndex].readTime
      };

      db.saveLocalData('blogs', blogs);
      return res.json(blogs[blogIndex]);
    } else {
      const blog = await Blog.findByIdAndUpdate(
        id,
        { title, summary, content, image, category, author, readTime },
        { new: true }
      );
      if (!blog) {
        return res.status(404).json({ message: 'Insight post not found.' });
      }
      return res.json(blog);
    }
  } catch (error) {
    console.error('Update blog error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// 5. Delete Blog (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (db.useLocalDb) {
      const blogs = db.getLocalData('blogs');
      const filteredBlogs = blogs.filter(b => b._id !== id);
      if (blogs.length === filteredBlogs.length) {
        return res.status(404).json({ message: 'Insight post not found.' });
      }
      db.saveLocalData('blogs', filteredBlogs);
      return res.json({ message: 'Insight post deleted successfully.' });
    } else {
      const blog = await Blog.findByIdAndDelete(id);
      if (!blog) {
        return res.status(404).json({ message: 'Insight post not found.' });
      }
      return res.json({ message: 'Insight post deleted successfully.' });
    }
  } catch (error) {
    console.error('Delete blog error:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
