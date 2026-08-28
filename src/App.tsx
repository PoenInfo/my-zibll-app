import { useState, useEffect } from 'react'

interface User {
  username: string
  exp: number
}

interface Post {
  id: number
  title: string
  category: string
  date: string
  views: number
  likes: number
  desc: string
  author: string
  authorLevel: number
}

const INITIAL_POSTS: Post[] = [
  { id: 1, title: '【子比主題】網站優化與極速部署教學', category: 'tech', date: '2026-08-28', views: 1280, likes: 96, desc: '如何使用 Cloudflare Pages 與 React 打造極速回應的子比風格前端介面...', author: 'Poen', authorLevel: 4 },
  { id: 2, title: '2026 年前端開發最佳實踐指南', category: 'tech', date: '2026-08-25', views: 850, likes: 42, desc: '探討 Vite、React 與現代化網頁建構工具的深度整合技巧。', author: 'Cloudflare迷', authorLevel: 2 },
]

// 計算等級邏輯
const getLevel = (exp: number) => {
  if (exp >= 600) return { level: 4, name: 'LV4 子比達人', color: '#ec4899', nextExp: 1000 }
  if (exp >= 300) return { level: 3, name: 'LV3 資深客官', color: '#a855f7', nextExp: 600 }
  if (exp >= 100) return { level: 2, name: 'LV2 漸入佳境', color: '#3b82f6', nextExp: 300 }
  return { level: 1, name: 'LV1 新手小白', color: '#10b981', nextExp: 100 }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('all')
  
  // 使用者帳號系統 State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zibll_user')
    return saved ? JSON.parse(saved) : null
  })

  // 文章清單 State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('zibll_posts_v2')
    return saved ? JSON.parse(saved) : INITIAL_POSTS
  })

  // Modal 彈窗 States
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register')
  const [authInput, setAuthInput] = useState('')

  const [showPostModal, setShowPostModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: 'tech', desc: '' })

  // 同步 Save 到 LocalStorage
  useEffect(() => {
    localStorage.setItem('zibll_posts_v2', JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('zibll_user', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('zibll_user')
    }
  }, [currentUser])

  // 增加經驗值
  const addExp = (amount: number, reason: string) => {
    if (!currentUser) return
    const newExp = currentUser.exp + amount
    setCurrentUser({ ...currentUser, exp: newExp })
    alert(`🎉 ${reason}！經驗值 +${amount}（當前 total: ${newExp} EXP）`)
  }

  // 處理註冊/登入
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authInput.trim()) return alert('請輸入使用者名稱！')

    if (authMode === 'register') {
      const newUser: User = { username: authInput, exp: 50 }
      setCurrentUser(newUser)
      alert(`🎉 註冊成功！歡迎加入，已贈送 50 新手 EXP！`)
    } else {
      setCurrentUser({ username: authInput, exp: 120 })
      alert(`歡迎回來，${authInput}！`)
    }
    setShowAuthModal(false)
    setAuthInput('')
  }

  // 登出
  const handleLogout = () => {
    setCurrentUser(null)
    alert('已成功登出！')
  }

  // 發布文章（增加 50 EXP）
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return alert('請先登入帳號！')
    if (!formData.title.trim()) return alert('請輸入標題！')

    const userLevelInfo = getLevel(currentUser.exp)
    const newPost: Post = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      date: new Date().toISOString().split('T')[0],
      views: 1,
      likes: 0,
      desc: formData.desc,
      author: currentUser.username,
      authorLevel: userLevelInfo.level,
    }

    setPosts([newPost, ...posts])
    setShowPostModal(false)
    setFormData({ title: '', category: 'tech', desc: '' })
    addExp(50, '成功發布文章')
  }

  // 文章點讚（增加 10 EXP）
  const handleLike = (id: number) => {
    setPosts(posts.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p))
    if (currentUser) {
      addExp(10, '文章互動點讚')
    }
  }

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(p => p.category === activeTab)

  const userLevel = currentUser ? getLevel(currentUser.exp) : null

  return (
    <div style={styles.container}>
      {/* 頂部 Zibll 導航欄 */}
      <header style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo}>
            <span style={styles.logoBadge}>ZIBLL</span> Poen's Community
          </div>

          <div style={styles.userSection}>
            {currentUser ? (
              <div style={styles.userInfo}>
                <span style={{ ...styles.levelBadge, backgroundColor: userLevel?.color }}>
                  {userLevel?.name}
                </span>
                <span style={styles.userName}>{currentUser.username}</span>
                <button style={styles.createBtn} onClick={() => setShowPostModal(true)}>
                  ✏️ 發文 (+50 EXP)
                </button>
                <button style={styles.logoutBtn} onClick={handleLogout}>登出</button>
              </div>
            ) : (
              <button style={styles.loginBtn} onClick={() => setShowAuthModal(true)}>
                👤 註冊 / 登入帳號
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主體區塊 */}
      <main style={styles.main}>
        {/* 會員等級個人面板 (若已登入) */}
        {currentUser && userLevel && (
          <section style={styles.userCard}>
            <div style={styles.userCardHeader}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>👋 嗨，{currentUser.username}！</h2>
                <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                  發文與點讚可獲得經驗值，解鎖更高階的會員稱號！
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ ...styles.levelBadgeBig, backgroundColor: userLevel.color }}>
                  {userLevel.name}
                </span>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                  經驗值: {currentUser.exp} / {userLevel.nextExp} EXP
                </div>
              </div>
            </div>
            {/* 經驗值進度條 */}
            <div style={styles.progressBg}>
              <div 
                style={{ 
                  ...styles.progressBar, 
                  width: `${Math.min(100, (currentUser.exp / userLevel.nextExp) * 100)}%`,
                  backgroundColor: userLevel.color 
                }} 
              />
            </div>
          </section>
        )}

        {/* 分類選單 */}
        <div style={styles.tabContainer}>
          <button style={activeTab === 'all' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('all')}>
            🔥 全部文章 ({posts.length})
          </button>
          <button style={activeTab === 'tech' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('tech')}>
            💻 技術幹貨 ({posts.filter(p=>p.category==='tech').length})
          </button>
          <button style={activeTab === 'life' ? styles.tabActive : styles.tab} onClick={() => setActiveTab('life')}>
            ☕ 隨筆隨想 ({posts.filter(p=>p.category==='life').length})
          </button>
        </div>

        {/* 文章列表 */}
        <div style={styles.postList}>
          {filteredPosts.map(post => {
            const authorLvl = getLevel(post.authorLevel * 150)
            return (
              <article key={post.id} style={styles.postCard}>
                <div style={styles.cardHeader}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={styles.postCategory}>
                      {post.category === 'tech' ? '技術' : '生活'}
                    </span>
                    <span style={{ ...styles.authorLevelBadge, backgroundColor: authorLvl.color }}>
                      LV{post.authorLevel}
                    </span>
                    <span style={styles.authorName}>{post.author}</span>
                  </div>
                  <span style={styles.postDate}>{post.date}</span>
                </div>
                <h2 style={styles.postTitle}>{post.title}</h2>
                <p style={styles.postDesc}>{post.desc}</p>
                <div style={styles.cardFooter}>
                  <span>👁️ {post.views} 次閱讀</span>
                  <button style={styles.likeBtn} onClick={() => handleLike(post.id)}>
                    👍 {post.likes} 點讚 (+10 EXP)
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      </main>

      {/* 註冊/登入 彈窗 Modal */}
      {showAuthModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>
              {authMode === 'register' ? '🚀 註冊新帳號' : '🔑 會員登入'}
            </h2>
            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>帳號名稱 (使用者暱稱)</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={authInput} 
                  onChange={e => setAuthInput(e.target.value)}
                  placeholder="請輸入暱稱..."
                  required 
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span 
                  style={{ color: '#38bdf8', fontSize: '0.85rem', cursor: 'pointer' }}
                  onClick={() => setAuthMode(authMode === 'register' ? 'login' : 'register')}
                >
                  {authMode === 'register' ? '已有帳號？點此登入' : '沒有帳號？免費註冊'}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" style={styles.cancelBtn} onClick={() => setShowAuthModal(false)}>取消</button>
                  <button type="submit" style={styles.submitBtn}>確認</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 發布文章 彈窗 Modal */}
      {showPostModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>✏️ 發布新文章 (+50 EXP)</h2>
            <form onSubmit={handleCreatePost}>
              <div style={{ marginBottom: '1rem' }}>
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
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>分類</label>
                <select 
                  style={styles.input}
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="tech">💻 技術幹貨</option>
                  <option value="life">☕ 隨筆隨想</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>文章內容摘要</label>
                <textarea 
                  style={{ ...styles.input, height: '80px' }} 
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="請輸入內文或摘要..."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowPostModal(false)}>取消</button>
                <button type="submit" style={styles.submitBtn}>立即發布</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// 專屬 CSS 樣式
const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', backgroundColor: '#0c1017', color: '#e2e8f0', fontFamily: 'sans-serif' },
  navbar: { backgroundColor: '#161b26', borderBottom: '1px solid #222d3d', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.2rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' },
  logoBadge: { backgroundColor: '#2563eb', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' },
  userSection: { display: 'flex', alignItems: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userName: { fontWeight: '600', color: '#f1f5f9' },
  levelBadge: { color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold' },
  levelBadgeBig: { color: '#fff', fontSize: '0.85rem', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#334155', color: '#94a3b8', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  createBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
  userCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' },
  userCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  progressBg: { width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' },
  progressBar: { height: '100%', transition: 'width 0.3s ease' },
  tabContainer: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  tab: { backgroundColor: '#161b26', border: '1px solid #222d3d', color: '#94a3b8', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  tabActive: { backgroundColor: '#2563eb', border: '1px solid #2563eb', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  postList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  postCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  postCategory: { backgroundColor: '#1e293b', color: '#38bdf8', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px' },
  authorLevelBadge: { color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' },
  authorName: { fontSize: '0.85rem', color: '#94a3b8' },
  postDate: { fontSize: '0.8rem', color: '#64748b' },
  postTitle: { fontSize: '1.15rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#f1f5f9' },
  postDesc: { fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 1.25rem 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' },
  likeBtn: { background: 'none', border: '1px solid #334155', color: '#38bdf8', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#161b26', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '450px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0c1017', color: '#fff', boxSizing: 'border-box' },
  cancelBtn: { backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
}