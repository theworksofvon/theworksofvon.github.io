/**
 * Blog Loader - Handles loading and parsing markdown blog posts
 */

class BlogLoader {
    constructor() {
        this.posts = new Map();
        this.postList = [];
        this.initialized = false;
    }

    /**
     * Initialize the blog loader by fetching the post index
     */
    async init() {
        if (this.initialized) return;
        
        try {
            // Load the blog index to get list of available posts
            const response = await fetch('/blog/index.json');
            if (!response.ok) {
                console.warn('Blog index not found, using fallback post list');
                this.postList = this.getFallbackPosts();
            } else {
                this.postList = await response.json();
            }
            
            this.initialized = true;
        } catch (error) {
            console.warn('Failed to load blog index:', error);
            this.postList = this.getFallbackPosts();
            this.initialized = true;
        }
    }

    /**
     * Get fallback post list when index.json is not available
     */
    getFallbackPosts() {
        return [
            {
                id: 'event-driven',
                title: 'Event-Driven Architecture with NATS JetStream',
                date: '2024.12.20',
                category: 'Platform Engineering',
                readTime: '10 min read',
                excerpt: 'How we achieved zero event loss and real-time data processing by migrating to NATS JetStream across our microservices...'
            },
            {
                id: 'self-hosting',
                title: 'Self-Hosting AI Models on Kubernetes',
                date: '2024.11.08',
                category: 'DevOps',
                readTime: '12 min read',
                excerpt: 'A guide to deploying and scaling LLMs on your own K8s cluster, including resource optimization and cost analysis...'
            }
        ];
    }

    /**
     * Get list of all blog posts (metadata only)
     */
    async getPosts() {
        await this.init();
        return this.postList;
    }

    /**
     * Load a specific blog post by ID
     */
    async getPost(postId) {
        await this.init();
        
        // Check if post is already cached
        if (this.posts.has(postId)) {
            return this.posts.get(postId);
        }

        try {
            // Fetch the markdown file
            const response = await fetch(`/blog/posts/${postId}.md`);
            if (!response.ok) {
                throw new Error(`Post not found: ${postId}`);
            }

            const markdown = await response.text();
            const post = this.parseMarkdown(markdown, postId);
            
            // Cache the parsed post
            this.posts.set(postId, post);
            
            return post;
        } catch (error) {
            console.error('Failed to load blog post:', error);
            return null;
        }
    }

    /**
     * Parse markdown content and extract frontmatter
     */
    parseMarkdown(markdown, postId) {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = markdown.match(frontmatterRegex);
        
        if (!match) {
            return {
                id: postId,
                title: 'Untitled Post',
                content: this.markdownToHtml(markdown),
                date: 'Unknown',
                category: 'General',
                readTime: '5 min read'
            };
        }

        const [, frontmatterText, content] = match;
        const frontmatter = this.parseFrontmatter(frontmatterText);
        
        return {
            id: postId,
            ...frontmatter,
            content: this.markdownToHtml(content)
        };
    }

    /**
     * Parse YAML-like frontmatter
     */
    parseFrontmatter(text) {
        const frontmatter = {};
        const lines = text.trim().split('\n');
        
        for (const line of lines) {
            const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
            if (match) {
                const [, key, value] = match;
                frontmatter[key] = value.replace(/^"|"$/g, '');
            }
        }
        
        return frontmatter;
    }

    /**
     * Convert markdown to HTML (basic implementation)
     * For production, consider using a library like marked.js
     */
    markdownToHtml(markdown) {
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Code blocks
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Bold and italic
        html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        
        // Lists
        html = html.replace(/^\- (.*)$/gim, '<li>$1</li>');
        html = html.replace(/^\d+\. (.*)$/gim, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // Blockquotes
        html = html.replace(/^> (.*)$/gim, '<blockquote>$1</blockquote>');
        
        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        // Clean up empty paragraphs and fix nesting
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-6]>)/g, '$1');
        html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        
        return html;
    }
}

// Create global instance
window.blogLoader = new BlogLoader();