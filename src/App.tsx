import { useState, useEffect } from 'react'

interface Post {
  id: number
  title: string
  category: string
  date: string
  views: number
  likes: number
  desc: string
}

const INITIAL_POSTS: Post[] = [
  { id: 1, title: '【子比主題】網站優化與極速部署教學', category: 'tech', date: '2026-08-28', views: 1280, likes: 96, desc: '如何使用 Cloudflare Pages 與 React 打造極速回應的子比風格前端介面...' },
  { id: 2, title: '2026 年前端開發最佳實踐指南', category: 'tech', date: '2026-08-25', views: 850, likes: 42, desc: '探討 Vite、React 與現代化網頁建構工具的深度整合技巧。' },
  { id: 3, title: '個人獨立站營運與內容創作心得紀錄', category: 'life', date: '2026-08-20', views: 2300, likes: 180, desc: '從零開始搭建專屬的個人知識庫，分享這些年來的網站運營思考。' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('all')
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('zibll_posts')
    return saved ? JSON.parse(saved) : INITIAL_POSTS
  })

  // 編輯與新增模態框 State
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ title: '', category: 'tech', desc: '' })

  useEffect(() => {
    localStorage.setItem('zibll_posts', JSON.stringify(posts))
  }, [posts])

  // 開啟新增文章模態框
  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ title: '', category: 'tech', desc: '' })
    setShowModal(true)
  }

  // 開啟編輯文章模態框
  const handleOpenEdit = (post: Post) => {
    setEditingId(post.id)
    setFormData({ title: post.title, category: post.category, desc: post.desc })
    setShowModal(true)
  }

  // 儲存文章（新增或更新）
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return alert('請輸入文章標題！')

    if (editingId) {
      setPosts(posts.map(p => p.id === editingId ? { ...p, ...formData } : p))
    } else {
      const newPost: Post = {
        id: Date.now(),
        title: formData.title,
        category: formData.category,
        date: new Date().toISOString().split('T')[0],
        views: 1,
        likes: 0,
        desc: formData.desc,
      }
      setPosts([newPost, ...posts])
    }
    setShowModal(false)
  }

  // 刪除文章
  const handleDelete = (id: number) => {
    if (confirm('確定要刪除這篇文章嗎？')) {
      setPosts(posts.filter(p => p.id !== id))
    }
  }

  // 點讚
  const handleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
  }

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(p => p.category === activeTab)

  return (
    <div style={styles.container}>
      {/* 頂部 Zibll 導航欄 */}
      <header style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={styles.logoBadge}>ZIBLL</span> Poen's Blog
          </div>
          <button style={styles.createBtn} onClick={handleOpenAdd}>
            ✏️ 發布新文章
          </button>
        </div>
      </header>

      {/* 主體區塊 */}
      <main style={styles.main}>
        {/* Banner 橫幅 */}
        <section style={styles.heroBanner}>
          <h1 style={styles.heroTitle}>Poen 的子比主題線上編輯展示站</h1>
          <p style={styles.heroSub}>支援線上即時發布、編輯內容與分類篩選（資料會自動儲存於瀏覽器）</p>
        </section>

        {/* 分類選單（Tab） */}
        <div style={styles.tabContainer}>
          <button 
            style={activeTab === 'all' ? styles.tabActive : styles.tab} 
            onClick={() => setActiveTab('all')}
          >
            🔥 全部文章 ({posts.length})
          </button>
          <button 
            style={activeTab === 'tech' ? styles.tabActive : styles.tab} 
            onClick={() => setActiveTab('tech')}
          >
            💻 技術幹貨 ({posts.filter(p=>p.category==='tech').length})
          </button>
          <button 
            style={activeTab === 'life' ? styles.tabActive : styles.tab} 
            onClick={() => setActiveTab('life')}
          >
            ☕ 隨筆隨想 ({posts.filter(p=>p.category==='life').length})
          </button>
        </div>

        {/* 子比卡片式文章列表 */}
        <div style={styles.postList}>
          {filteredPosts.map(post => (
            <article key={post.id} style={styles.postCard}>
              <div style={styles.cardHeader}>
                <span style={styles.postCategory}>
                  {post.category === 'tech' ? '技術' : '生活'}
                </span>
                <span style={styles.postDate}>{post.date}</span>
              </div>
              <h2 style={styles.postTitle}>{post.title}</h2>
              <p style={styles.postDesc}>{post.desc}</p>
              
              <div style={styles.cardFooter}>
                <div style={styles.stats}>
                  <span>👁️ {post.views}</span>
                  <button style={styles.likeBtn} onClick={() => handleLike(post.id)}>
                    👍 {post.likes}
                  </button>
                </div>
                <div style={styles.actions}>
                  <button style={styles.actionBtn} onClick={() => handleOpenEdit(post)}>編輯</button>
                  <button style={styles.deleteBtn} onClick={() => handleDelete(post.id)}>刪除</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* 線上編輯/新增模態框 Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={styles.modalTitle}>{editingId ? '📝 編輯文章' : '✏️ 發布新文章'}</h2>
            <form onSubmit={handleSave}>
              <div style={styles.formGroup}>
                <label style={styles.label}>文章標題</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="請輸入文章標題"
                  required 
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>文章分類</label>
                <select 
                  style={styles.select}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="tech">💻 技術幹貨</option>
                  <option value="life">☕ 隨筆隨想</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>文章摘要/內容</label>
                <textarea 
                  style={styles.textarea} 
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="請輸入文章簡介或詳細內容..."
                  rows={4}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowModal(false)}>取消</button>
                <button type="submit" style={styles.submitBtn}>儲存發布</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer style={styles.footer}>
        <p>© 2026 Poen. Online Dynamic Zibll System on Cloudflare Pages.</p>
      </footer>
    </div>
  )
}

// 樣式表
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0c1017',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  navbar: {
    backgroundColor: '#161b26',
    borderBottom: '1px solid #222d3d',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navContent: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  logoBadge: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
  },
  createBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  heroBanner: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '2rem 2.5rem',
    marginBottom: '2rem',
  },
  heroTitle: {
    fontSize: '1.8rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    color: '#94a3b8',
    margin: 0,
  },
  tabContainer: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  tab: {
    backgroundColor: '#161b26',
    border: '1px solid #222d3d',
    color: '#94a3b8',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  tabActive: {
    backgroundColor: '#2563eb',
    border: '1px solid #2563eb',
    color: '#ffffff',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  postList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  postCard: {
    backgroundColor: '#161b26',
    border: '1px solid #222d3d',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  postCategory: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    fontSize: '0.75rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
  },
  postDate: {
    fontSize: '0.8rem',
    color: '#64748b',
  },
  postTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
    color: '#f1f5f9',
  },
  postDesc: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: '0 0 1.25rem 0',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #1e293b',
    paddingTop: '0.75rem',
  },
  stats: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  likeBtn: {
    background: 'none',
    border: 'none',
    color: '#38bdf8',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionBtn: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    border: 'none',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  deleteBtn: {
    backgroundColor: '#451a1a',
    color: '#f87171',
    border: 'none',
    padding: '0.3rem 0.6rem',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.75rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#161b26',
    border: '1px solid #334155',
    borderRadius: '16px',
    padding: '2rem',
    width: '90%',
    maxWidth: '500px',
  },
  modalTitle: {
    margin: '0 0 1.5rem 0',
    color: '#f1f5f9',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.875rem',
    color: '#94a3b8',
    marginBottom: '0.5rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0c1017',
    color: '#ffffff',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0c1017',
    color: '#ffffff',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '8px',
    border: '1px solid #334155',
    backgroundColor: '#0c1017',
    color: '#ffffff',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  cancelBtn: {
    backgroundColor: '#1e293b',
    color: '#94a3b8',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    padding: '0.6rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
  },
  footer: {
    textAlign: 'center',
    padding: '2rem',
    color: '#64748b',
    fontSize: '0.875rem',
    borderTop: '1px solid #161b26',
    marginTop: '3rem',
  },
}