import { useState, useEffect } from 'react'

interface User {
  email: string
  username: string
  exp: number
  isAdmin?: boolean
}

interface Post {
  id: number
  title: string
  category: string
  date: string
  views: number
  likes: number
  likedBy: string[] // 紀錄已點讚者的 Email 防止刷分
  desc: string
  content: string
  authorEmail: string
  authorName: string
  authorExp: number
  authorIsAdmin?: boolean
}

// 預設管理員與初始文章 (更新 Email 為 admin@poenmail.eu.cc)
const ADMIN_USER: User = {
  email: 'admin@poenmail.eu.cc',
  username: 'Poen (站長)',
  exp: 1500,
  isAdmin: true
}

const INITIAL_POSTS: Post[] = [
  { 
    id: 1, 
    title: '【子比主題】網站優化與極速部署教學', 
    category: 'tech', 
    date: '2026-08-28', 
    views: 1280, 
    likes: 96, 
    likedBy: [],
    desc: '如何使用 Cloudflare Pages 與 React 打造極速回應的子比風格前端介面...', 
    content: '這是子比主題的詳細教學內容。利用 React + Cloudflare Pages 可以實現毫秒級別的載入速度，並透過本地與遠端 API 完成全動態社群交互！',
    authorEmail: 'admin@poenmail.eu.cc', 
    authorName: 'Poen (站長)',
    authorExp: 1500,
    authorIsAdmin: true
  },
  { 
    id: 2, 
    title: '2026 年前端開發最佳實踐指南', 
    category: 'tech', 
    date: '2026-08-25', 
    views: 850, 
    likes: 42, 
    likedBy: [],
    desc: '探討 Vite、React 與現代化網頁建構工具的深度整合技巧。', 
    content: '前端生態系在 2026 年已經高度自動化。極簡、效能與模組化組件成為主流...',
    authorEmail: 'dev@zibll.com', 
    authorName: '前端極客',
    authorExp: 250,
    authorIsAdmin: false
  },
]

// 計算等級與頭銜邏輯
const getLevelInfo = (exp: number, isAdmin?: boolean) => {
  if (isAdmin) return { level: 5, name: '👑 站長管理員', color: '#f59e0b', nextExp: 2000 }
  if (exp >= 600) return { level: 4, name: 'LV4 子比達人', color: '#ec4899', nextExp: 1000 }
  if (exp >= 300) return { level: 3, name: 'LV3 資深客官', color: '#a855f7', nextExp: 600 }
  if (exp >= 100) return { level: 2, name: 'LV2 漸入佳境', color: '#3b82f6', nextExp: 300 }
  return { level: 1, name: 'LV1 新手小白', color: '#10b981', nextExp: 100 }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('all')
  
  // 登入會員系統 State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zibll_user_v4')
    return saved ? JSON.parse(saved) : ADMIN_USER // 預設登入站長
  })

  // 文章列表 State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('zibll_posts_v4')
    return saved ? JSON.parse(saved) : INITIAL_POSTS
  })

  // Modals 與 頁面 State
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authUsername, setAuthUsername] = useState('')

  const [showPostModal, setShowPostModal] = useState(false)
  const [formData, setFormData] = useState({ title: '', category: 'tech', desc: '', content: '' })

  // 同步 Save 到 LocalStorage
  useEffect(() => {
    localStorage.setItem('zibll_posts_v4', JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('zibll_user_v4', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('zibll_user_v4')
    }
  }, [currentUser])

  // 經驗值獎勵機制
  const addExp = (amount: number, reason: string) => {
    if (!currentUser) return
    const newExp = currentUser.exp + amount
    const updatedUser = { ...currentUser, exp: newExp }
    setCurrentUser(updatedUser)
    alert(`🎉 ${reason}！經驗值 +${amount} (總計: ${newExp} EXP)`)
  }

  // Email 註冊與登入
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail.includes('@')) return alert('請輸入有效的 Email 地址！')
    
    // 如果是管理員 Email
    if (authEmail.toLowerCase() === 'admin@poenmail.eu.cc') {
      setCurrentUser(ADMIN_USER)
      alert('👑 歡迎站長管理員登入！')
    } else {
      const newUser: User = { 
        email: authEmail, 
        username: authUsername || authEmail.split('@')[0], 
        exp: 50,
        isAdmin: false
      }
      setCurrentUser(newUser)
      alert(`🎉 註冊/登入成功！獲得 50 初始 EXP！`)
    }
    setShowAuthModal(false)
    setAuthEmail('')
    setAuthUsername('')
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

    const newPost: Post = {
      id: Date.now(),
      title: formData.title,
      category: formData.category,
      date: new Date().toISOString().split('T')[0],
      views: 1,
      likes: 0,
      likedBy: [],
      desc: formData.desc,
      content: formData.content || formData.desc,
      authorEmail: currentUser.email,
      authorName: currentUser.username,
      authorExp: currentUser.exp,
      authorIsAdmin: currentUser.isAdmin,
    }

    setPosts([newPost, ...posts])
    setShowPostModal(false)
    setFormData({ title: '', category: 'tech', desc: '', content: '' })
    addExp(50, '成功發布文章')
  }

  // 防重複刷分點讚機制
  const handleLike = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation() // 防止觸發開啟內頁
    if (!currentUser) return alert('請先登入帳號再進行點讚！')

    if (post.likedBy.includes(currentUser.email)) {
      return alert('⚠️ 您已經給這篇文章點過讚了，無法重複刷分！')
    }

    const updatedPosts = posts.map(p => {
      if (p.id === post.id) {
        return {
          ...p,
          likes: p.likes + 1,
          likedBy: [...p.likedBy, currentUser.email]
        }
      }
      return p
    })

    setPosts(updatedPosts)
    if (selectedPost && selectedPost.id === post.id) {
      setSelectedPost({
        ...selectedPost,
        likes: selectedPost.likes + 1,
        likedBy: [...selectedPost.likedBy, currentUser.email]
      })
    }
    addExp(10, '文章點讚互動')
  }

  // 開啟作者個人資料 Modal
  const openAuthorProfile = (email: string, name: string, exp: number, isAdmin?: boolean, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setProfileUser({ email, username: name, exp, isAdmin })
  }

  // 開啟文章內頁並增加閱讀量
  const openPostDetail = (post: Post) => {
    const updated = posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p)
    setPosts(updated)
    setSelectedPost({ ...post, views: post.views + 1 })
  }

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(p => p.category === activeTab)

  const currentUserLevel = currentUser ? getLevelInfo(currentUser.exp, currentUser.isAdmin) : null

  return (
    <div style={styles.container}>
      {/* 頂部 Zibll 導航欄 */}
      <header style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo} onClick={() => setSelectedPost(null)}>
            <span style={styles.logoBadge}>ZIBLL</span> Poen's Community
          </div>

          <div style={styles.userSection}>
            {currentUser ? (
              <div style={styles.userInfo}>
                <span 
                  style={{ ...styles.levelBadge, backgroundColor: currentUserLevel?.color }}
                  onClick={() => setProfileUser(currentUser)}
                >
                  {currentUserLevel?.name}
                </span>
                <span style={styles.userName} onClick={() => setProfileUser(currentUser)}>
                  {currentUser.username}
                </span>
                <button style={styles.createBtn} onClick={() => setShowPostModal(true)}>
                  ✏️ 發文 (+50 EXP)
                </button>
                <button style={styles.logoutBtn} onClick={handleLogout}>登出</button>
              </div>
            ) : (
              <button style={styles.loginBtn} onClick={() => setShowAuthModal(true)}>
                👤 Email 註冊 / 登入
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主要內容區域 */}
      <main style={styles.main}>
        {/* 如果選中了文章，顯示文章詳細內頁 */}
        {selectedPost ? (
          <article style={styles.detailCard}>
            <button style={styles.backBtn} onClick={() => setSelectedPost(null)}>← 返回文章列表</button>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={styles.postCategory}>
                {selectedPost.category === 'tech' ? '💻 技術' : '☕ 生活'}
              </span>
              <span style={styles.postDate}>{selectedPost.date}</span>
            </div>

            <h1 style={styles.detailTitle}>{selectedPost.title}</h1>

            {/* 作者欄位 (可點擊查看個人名片) */}
            <div 
              style={styles.authorBar} 
              onClick={(e) => openAuthorProfile(selectedPost.authorEmail, selectedPost.authorName, selectedPost.authorExp, selectedPost.authorIsAdmin, e)}
            >
              <div style={styles.authorAvatar}>
                {selectedPost.authorName.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{selectedPost.authorName}</span>
                  <span style={{ ...styles.levelBadge, backgroundColor: getLevelInfo(selectedPost.authorExp, selectedPost.authorIsAdmin).color }}>
                    {getLevelInfo(selectedPost.authorExp, selectedPost.authorIsAdmin).name}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedPost.authorEmail}</div>
              </div>
            </div>

            {/* 文章內文 */}
            <div style={styles.detailContent}>
              {selectedPost.content}
            </div>

            {/* 底部互動按鈕 */}
            <div style={styles.detailFooter}>
              <span>👁️ {selectedPost.views} 次閱讀</span>
              <button 
                style={{ 
                  ...styles.likeBtn, 
                  backgroundColor: currentUser && selectedPost.likedBy.includes(currentUser.email) ? '#334155' : '#2563eb',
                  color: '#ffffff'
                }} 
                onClick={(e) => handleLike(selectedPost, e)}
              >
                👍 {selectedPost.likes} {currentUser && selectedPost.likedBy.includes(currentUser.email) ? '已點讚' : '點讚文章 (+10 EXP)'}
              </button>
            </div>
          </article>
        ) : (
          /* 文章列表頁面 */
          <>
            {/* 會員卡片 (如果已登入) */}
            {currentUser && currentUserLevel && (
              <section style={styles.userCard}>
                <div style={styles.userCardHeader}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                      👋 歡迎回來，{currentUser.username} {currentUser.isAdmin && '👑'}
                    </h2>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                      帳號 Email：{currentUser.email}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ ...styles.levelBadgeBig, backgroundColor: currentUserLevel.color }}>
                      {currentUserLevel.name}
                    </span>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                      經驗值: {currentUser.exp} / {currentUserLevel.nextExp} EXP
                    </div>
                  </div>
                </div>
                <div style={styles.progressBg}>
                  <div 
                    style={{ 
                      ...styles.progressBar, 
                      width: `${Math.min(100, (currentUser.exp / currentUserLevel.nextExp) * 100)}%`,
                      backgroundColor: currentUserLevel.color 
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
                const authorLvl = getLevelInfo(post.authorExp, post.authorIsAdmin)
                const isLiked = currentUser && post.likedBy.includes(currentUser.email)
                return (
                  <article key={post.id} style={styles.postCard} onClick={() => openPostDetail(post)}>
                    <div style={styles.cardHeader}>
                      <span style={styles.postCategory}>
                        {post.category === 'tech' ? '技術' : '生活'}
                      </span>
                      <span style={styles.postDate}>{post.date}</span>
                    </div>

                    <h2 style={styles.postTitle}>{post.title}</h2>
                    <p style={styles.postDesc}>{post.desc}</p>

                    {/* 可點擊作者資訊 */}
                    <div 
                      style={styles.cardAuthorRow}
                      onClick={(e) => openAuthorProfile(post.authorEmail, post.authorName, post.authorExp, post.authorIsAdmin, e)}
                    >
                      <span style={{ ...styles.authorLevelBadge, backgroundColor: authorLvl.color }}>
                        {authorLvl.name}
                      </span>
                      <span style={styles.authorName}>✍️ {post.authorName}</span>
                    </div>

                    <div style={styles.cardFooter}>
                      <span>👁️ {post.views}</span>
                      <button 
                        style={{
                          ...styles.likeBtn,
                          backgroundColor: isLiked ? '#1e293b' : 'transparent',
                          borderColor: isLiked ? '#334155' : '#38bdf8',
                          color: isLiked ? '#64748b' : '#38bdf8'
                        }} 
                        onClick={(e) => handleLike(post, e)}
                      >
                        👍 {post.likes} {isLiked ? '已讚' : '點讚'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </main>

      {/* 作者名片 Modal */}
      {profileUser && (
        <div style={styles.modalOverlay} onClick={() => setProfileUser(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>👤 會員個人名片</h2>
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
              <div style={styles.profileAvatarBig}>
                {profileUser.username.charAt(0)}
              </div>
              <h3 style={{ color: '#fff', margin: '0.5rem 0' }}>
                {profileUser.username} {profileUser.isAdmin && '👑'}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{profileUser.email}</p>
              <span style={{ ...styles.levelBadgeBig, backgroundColor: getLevelInfo(profileUser.exp, profileUser.isAdmin).color, display: 'inline-block', marginTop: '0.5rem' }}>
                {getLevelInfo(profileUser.exp, profileUser.isAdmin).name}
              </span>
              <div style={{ color: '#cbd5e1', marginTop: '1rem', fontSize: '0.9rem' }}>
                累積經驗值：<strong>{profileUser.exp} EXP</strong>
              </div>
            </div>
            <button style={{ ...styles.submitBtn, width: '100%' }} onClick={() => setProfileUser(null)}>關閉名片</button>
          </div>
        </div>
      )}

      {/* Email 註冊/登入 Modal */}
      {showAuthModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>📧 Email 帳號登入 / 註冊</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              站長測試帳號 Email：<code>admin@poenmail.eu.cc</code>
            </p>
            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Email 電子郵件</label>
                <input 
                  type="email" 
                  style={styles.input} 
                  value={authEmail} 
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="name@example.com"
                  required 
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>會員暱稱 (選填)</label>
                <input 
                  type="text" 
                  style={styles.input} 
                  value={authUsername} 
                  onChange={e => setAuthUsername(e.target.value)}
                  placeholder="請輸入欲顯示的暱稱"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowAuthModal(false)}>取消</button>
                <button type="submit" style={styles.submitBtn}>確認登入</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 發布文章 Modal */}
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
                <label style={styles.label}>文章摘要 (卡片展示)</label>
                <input 
                  type="text"
                  style={styles.input} 
                  value={formData.desc}
                  onChange={e => setFormData({ ...formData, desc: e.target.value })}
                  placeholder="一句話簡介..."
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>詳細內容 (內頁)</label>
                <textarea 
                  style={{ ...styles.input, height: '100px' }} 
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  placeholder="完整的文章內容..."
                  required
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowPostModal(false)}>取消</button>
                <button type="submit" style={styles.submitBtn}>靜態發布</button>
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
  logo: { fontSize: '1.2rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  logoBadge: { backgroundColor: '#2563eb', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' },
  userSection: { display: 'flex', alignItems: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userName: { fontWeight: '600', color: '#f1f5f9', cursor: 'pointer' },
  levelBadge: { color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
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
  postCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'border-color 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  postCategory: { backgroundColor: '#1e293b', color: '#38bdf8', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px' },
  authorLevelBadge: { color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' },
  authorName: { fontSize: '0.85rem', color: '#94a3b8' },
  cardAuthorRow: { display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', cursor: 'pointer' },
  postDate: { fontSize: '0.8rem', color: '#64748b' },
  postTitle: { fontSize: '1.15rem', fontWeight: '700', margin: '0 0 0.5rem 0', color: '#f1f5f9' },
  postDesc: { fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 1rem 0' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '0.75rem', fontSize: '0.85rem', color: '#64748b' },
  likeBtn: { background: 'none', border: '1px solid #334155', color: '#38bdf8', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  detailCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '16px', padding: '2rem' },
  backBtn: { backgroundColor: '#1e293b', color: '#38bdf8', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' },
  detailTitle: { fontSize: '2rem', margin: '1rem 0', color: '#fff' },
  authorBar: { display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: '#0c1017', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', cursor: 'pointer' },
  authorAvatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem' },
  detailContent: { fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '2rem', whiteSpace: 'pre-line' },
  detailFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222d3d', paddingTop: '1.5rem', color: '#64748b' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#161b26', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '450px' },
  profileAvatarBig: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.8rem', margin: '0 auto' },
  label: { display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0c1017', color: '#fff', boxSizing: 'border-box' },
  cancelBtn: { backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
}