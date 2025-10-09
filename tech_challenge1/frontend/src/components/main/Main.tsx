import React, { useState, useEffect } from 'react'
import styles from './Main.module.css'
import { postsAPI } from '../../api'

interface Post {
  _id: string
  title: string
  content: string
  author: string
  tags?: string[]
  createdAt: string
}

export default function Main() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await postsAPI.getAll()
        setPosts(data)
      } catch (err) {
        setError('Failed to load posts')
        console.error('Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  return (
    <main className={styles.main}>
      <h2>Posts</h2>
      {loading && <p>Loading posts...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {!loading && !error && (
        <div>
          {posts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            posts.map((post) => (
              <div key={post._id} className={styles.post}>
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
              </div>
            ))
          )}
        </div>
      )}
      <hr />
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </main>
  )
}
