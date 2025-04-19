const Blog = require("../models/Blog");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Comment = require("../models/Comment");

// Configure upload directory
const uploadFolder = path.join(__dirname, "../uploads/blogs");
if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed (jpg, jpeg, png)"), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single("image"); // Field name should be "image" in Postman

// Create Blog with Image Upload
exports.createBlog = (req, res) => {
    upload(req, res, async (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { title, content, category } = req.body;
            console.log("my req.body is:", req.body);
            
            if (!title || !content || !category) {
                // Delete uploaded file if validation fails
                if (req.file) {
                    fs.unlinkSync(path.join(uploadFolder, req.file.filename));
                }
                return res.status(400).json({ message: "Title and content and category are required" });
            }

            const imageUrl = req.file 
                ? `/uploads/blogs/${req.file.filename}` 
                : null;

            const blog = new Blog({
                title,
                content,
                category,
                imageUrl
            });

            await blog.save();
            res.status(201).json({
                message: "Blog created successfully",
                blog: {
                    _id: blog._id,
                    title: blog.title,
                    content: blog.content,
                    imageUrl: blog.imageUrl,
                    category: blog.category,
                    createdAt: blog.createdAt
                }
            });
        } catch (error) {
            console.error("Error creating blog:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
};

// Get All Blogs
exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ createdAt: -1 });
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get Single Blog
exports.getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }
        res.status(200).json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Update Blog
exports.updateBlog = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        try {
            const { title, content, category } = req.body;
            const blog = await Blog.findById(req.params.id);

            if (!blog) {
                // Delete newly uploaded file if blog doesn't exist
                if (req.file) {
                    fs.unlinkSync(path.join(uploadFolder, req.file.filename));
                }
                return res.status(404).json({ message: "Blog not found" });
            }

            // Delete old image if new image is uploaded
            if (req.file) {
                if (blog.imageUrl) {
                    const oldImagePath = path.join(__dirname, "..", blog.imageUrl);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
                blog.imageUrl = `/uploads/blogs/${req.file.filename}`;
            }

            blog.title = title || blog.title;
            blog.content = content || blog.content;
            blog.category = category || blog.category;
            await blog.save();

            res.status(200).json({
                message: "Blog updated successfully",
                blog
            });
        } catch (error) {
            console.error("Error updating blog:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
};

// Delete Blog
exports.deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        // Delete associated image
        if (blog.imageUrl) {
            const imagePath = path.join(__dirname, "..", blog.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.status(200).json({ message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getBlogsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const blogs = await Blog.find({ category }).sort({ createdAt: -1 });

        if (blogs.length === 0) {
            return res.status(404).json({ message: "No blogs found in this category" });
        }

        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching blogs by category:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.postComment = async (req, res) => {
    try {
        const { name, email, number, message } = req.body;
        const { blogId } = req.params;

        if (!name || !message) {
            return res.status(400).json({ message: "Name and message are required" });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found" });
        }

        const comment = new Comment({
            blogId,
            name,
            email,
            number,
            message
        });

        await comment.save();

        res.status(201).json({
            message: "Comment posted successfully",
            comment
        });
    } catch (error) {
        console.error("Error posting comment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

exports.getCommentsByBlogId = async (req, res) => {
    try {
        const { blogId } = req.params;

        const comments = await Comment.find({ blogId }).sort({ createdAt: -1 });

        if (comments.length === 0) {
            return res.status(404).json({ message: "No comments found for this blog" });
        }

        res.status(200).json(comments);
    } catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};