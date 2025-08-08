# Blog System

This portfolio uses a simple markdown-based blog system that loads posts dynamically.

## Structure

```
blog/
├── README.md          # This file
├── index.json         # Blog post index with metadata
├── blog-loader.js     # JavaScript module for loading posts
└── posts/             # Individual blog post markdown files
    ├── agentic-systems.md
    ├── event-driven.md
    └── self-hosting.md
```

## Adding a New Blog Post

1. **Create the markdown file** in `blog/posts/` with the filename `your-post-id.md`

2. **Add frontmatter** at the top of your markdown file:
   ```markdown
   ---
   title: "Your Post Title"
   date: "2025.01.20"
   category: "Your Category"
   readTime: "5 min read"
   excerpt: "A brief description of your post that appears in the blog list..."
   ---

   # Your Post Title

   Your content here in markdown format...
   ```

3. **Update the index** by adding an entry to `blog/index.json`:
   ```json
   {
     "id": "your-post-id",
     "title": "Your Post Title",
     "date": "2025.01.20",
     "category": "Your Category",
     "readTime": "5 min read",
     "excerpt": "A brief description of your post..."
   }
   ```

## Supported Markdown Features

The built-in markdown parser supports:

- Headers (`#`, `##`, `###`)
- **Bold** and *italic* text
- `inline code`
- Code blocks with syntax highlighting
- Lists (both numbered and bulleted)
- > Blockquotes
- Paragraphs

## Local Development

Since the blog system loads files via fetch(), you'll need to serve the files through a web server (not just open `index.html` directly). You can use:

```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# Or any other static file server
```

Then visit `http://localhost:8000` to see your portfolio with the blog system working.

## Fallback System

If `blog/index.json` is not accessible, the system will fall back to a hardcoded list of posts defined in `blog-loader.js`. This ensures the blog works even in environments where file loading might fail.