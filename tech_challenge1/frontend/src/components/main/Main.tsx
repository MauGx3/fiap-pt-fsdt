import React, { useState, useEffect } from "react";
import styles from "./Main.module.css";
import { postsAPI } from "../../api";
import LoadingSpinner from "../LoadingSpinner";
import ErrorPage from "../ErrorPage";
import toast, { Toaster } from "react-hot-toast";

interface Post {
  _id: string;
  title: string;
  content: string;
  author: string;
  tags?: string[];
  createdAt: string;
}

export default function Main() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPost, setNewPost] = useState({ title: '', content: '', tags: '' })
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editPost, setEditPost] = useState({ title: '', content: '', tags: '' })

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    try {
      const tags = newPost.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag);
      const createdPost = await postsAPI.create({
        title: newPost.title,
        content: newPost.content,
        tags: tags.length > 0 ? tags : undefined,
      });

      setPosts((prev) => [createdPost, ...prev]);
      setNewPost({ title: "", content: "", tags: "" });
      setShowCreateForm(false);
      toast.success("Post created successfully!");
    } catch (err: any) {
      console.error("Error creating post:", err);
      if (
        err.code === "ECONNREFUSED" ||
        err.message?.includes("Network Error")
      ) {
        // Mock post creation for demo
        const mockPost: Post = {
          _id: Date.now().toString(),
          title: newPost.title,
          content: newPost.content,
          author: "Demo User",
          tags: newPost.tags
            .split(",")
            .map((tag: string) => tag.trim())
            .filter((tag: string) => tag),
          createdAt: new Date().toISOString(),
        };
        setPosts((prev) => [mockPost, ...prev]);
        setNewPost({ title: "", content: "", tags: "" });
        setShowCreateForm(false);
        toast.success("Post created (demo mode)!");
      } else {
        toast.error("Failed to create post");
      }
    }
  };

  const handleEditPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPost.title.trim() || !editPost.content.trim()) {
      toast.error('Title and content are required')
      return
    }

    try {
      const tags = editPost.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      const updatedPost = await postsAPI.update(editingPostId!, {
        title: editPost.title,
        content: editPost.content,
        tags: tags.length > 0 ? tags : undefined
      })

      setPosts(prev => prev.map(p => p._id === editingPostId ? { ...p, ...updatedPost } : p))
      setEditingPostId(null)
      setEditPost({ title: '', content: '', tags: '' })
      toast.success('Post updated successfully!')
    } catch (err: any) {
      console.error('Error updating post:', err)
      if (err.code === 'ECONNREFUSED' || err.message?.includes('Network Error')) {
        // Mock post update for demo
        setPosts(prev => prev.map(p => p._id === editingPostId ? {
          ...p,
          title: editPost.title,
          content: editPost.content,
          tags: editPost.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
        } : p))
        setEditingPostId(null)
        setEditPost({ title: '', content: '', tags: '' })
        toast.success('Post updated (demo mode)!')
      } else {
        toast.error('Failed to update post')
      }
    }
  }

  const startEdit = (post: Post) => {
    setEditingPostId(post._id)
    setEditPost({
      title: post.title,
      content: post.content,
      tags: post.tags?.join(', ') || ''
    })
  }

  const cancelEdit = () => {
    setEditingPostId(null)
    setEditPost({ title: '', content: '', tags: '' })
  }

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postsAPI.getAll();
        setPosts(data);
        toast.success("Posts loaded successfully!");
      } catch (err: any) {
        console.error("Error fetching posts:", err);

        // Fallback to mock data if backend is not available
        if (
          err.code === "ECONNREFUSED" ||
          err.message?.includes("Network Error")
        ) {
          console.log("Backend not available, using mock data");
          setPosts([
            {
              _id: "1",
              title: "Welcome to FIAP Blog",
              content:
                "This is a sample post to demonstrate the blog functionality. The backend API is not currently running, but you can see how the UI works with mock data.",
              author: "System",
              tags: ["welcome", "demo"],
              createdAt: new Date().toISOString(),
            },
            {
              _id: "2",
              title: "Getting Started with React and TypeScript",
              content:
                "React with TypeScript provides excellent developer experience with type safety and modern JavaScript features.",
              author: "Developer",
              tags: ["react", "typescript", "frontend"],
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
          ]);
          toast("Using demo data - backend not available", { icon: "ℹ️" });
        } else {
          setError("Failed to load posts");
          toast.error("Failed to load posts. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <main className={styles.main}>
      <Toaster position="top-right" />
      <div className={styles.header}>
        <h2>Posts</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={styles.createButton}
        >
          {showCreateForm ? "Cancel" : "Create Post"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreatePost} className={styles.createForm}>
          <div>
            <input
              type="text"
              placeholder="Post title"
              value={newPost.title}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, title: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <textarea
              placeholder="Post content"
              value={newPost.content}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={4}
              required
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={newPost.tags}
              onChange={(e) =>
                setNewPost((prev) => ({ ...prev, tags: e.target.value }))
              }
            />
          </div>
          <button type="submit">Create Post</button>
        </form>
      )}

      {loading && <LoadingSpinner />}
      {error && (
        <ErrorPage message={error} onRetry={() => window.location.reload()} />
      )}
      {!loading && !error && (
        <div>
          {posts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className={styles.post}>
                {editingPostId === post._id ? (
                  <form onSubmit={handleEditPost} className={styles.editForm}>
                    <div>
                      <input
                        type="text"
                        placeholder="Post title"
                        value={editPost.title}
                        onChange={(e) => setEditPost(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Post content"
                        value={editPost.content}
                        onChange={(e) => setEditPost(prev => ({ ...prev, content: e.target.value }))}
                        rows={4}
                        required
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Tags (comma separated)"
                        value={editPost.tags}
                        onChange={(e) => setEditPost(prev => ({ ...prev, tags: e.target.value }))}
                      />
                    </div>
                    <div className={styles.editButtons}>
                      <button type="submit">Save</button>
                      <button type="button" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    <small>By {post.author} on {new Date(post.createdAt).toLocaleDateString()}</small>
                    {post.tags && post.tags.length > 0 && (
                      <div className={styles.tags}>
                        {post.tags.map((tag, index) => (
                          <span key={index} className={styles.tag}>{tag}</span>
                        ))}
                      </div>
                    )}
                    <button 
                      className={styles.editButton}
                      onClick={() => startEdit(post)}
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
      <hr />
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </main>
  );
}
