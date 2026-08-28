import { useState, useEffect } from 'react'

interface User {
  email: string
  password?: string
  username: string
  exp: number
  isAdmin?: boolean       // 是否為管理員
  isVerified?: boolean    // 是否為官方認證
}

interface Post {
  id: number
  title: string
  category: string
  date: string
  views: number
  likes: number
  likedBy: string[]
  desc: string
  content: string
  authorEmail: string
  authorName: string
  authorExp: number
  authorIsAdmin?: boolean
  authorIsVerified?: boolean
}

interface Achievement {
  id: string
  title: string
  desc: string
  icon: string
  unlocked: boolean
}

// 預設管理員帳號
const ADMIN_USER: User = {
  email: 'admin@poenmail.eu.cc',
  password: 'admin123',
  username: 'Poen (站長)',
  exp: 1500,
  isAdmin: true,
  isVerified: true
}

// 預設文章
const INITIAL_POSTS: Post[] = [
  { 
    id: 1, 
    title: '【Poen主題】網站優化與極速部署教學', 
    category: 'tech', 
    date: '2026-08-28', 
    views: 12, 
    likes: 1, 
    likedBy: ['dev@poenmail.eu.cc'],
    desc: '如何使用 Cloudflare Pages 與 React 打造極速回應的 Poen 風格前端介面...', 
    content: '這是 Poen 主題的詳細教學內容。利用 React + Cloudflare Pages 可以實現毫秒級別的載入速度！',
    authorEmail: 'admin@poenmail.eu.cc', 
    authorName: 'Poen (站長)',
    authorExp: 1500,
    authorIsAdmin: true,
    authorIsVerified: true
  },
  { 
    id: 2, 
    title: '2026 年前端開發最佳實踐指南', 
    category: 'tech', 
    date: '2026-08-25', 
    views: 8, 
    likes: 1, 
    likedBy: ['admin@poenmail.eu.cc'],
    desc: '探討 Vite、React 與現代化網頁建構工具的深度整合技巧。', 
    content: '前端生態系在 2026 年已經高度自動化。極簡、效能與模組化組件成為主流...',
    authorEmail: 'dev@poenmail.eu.cc', 
    authorName: '前端極客',
    authorExp: 250,
    authorIsAdmin: false,
    authorIsVerified: false
  },
]

// 計算等級邏輯
const getLevelInfo = (exp: number) => {
  if (exp >= 1000) return { level: 5, name: 'LV5 站長', color: '#f59e0b', nextExp: 2000 }
  if (exp >= 600) return { level: 4, name: 'LV4 達人', color: '#ec4899', nextExp: 1000 }
  if (exp >= 300) return { level: 3, name: 'LV3 資深', color: '#a855f7', nextExp: 600 }
  if (exp >= 100) return { level: 2, name: 'LV2 新星', color: '#3b82f6', nextExp: 300 }
  return { level: 1, name: 'LV1 新手', color: '#10b981', nextExp: 100 }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('all')
  
  // 會員 State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('poen_user_v8')
    return saved ? JSON.parse(saved) : ADMIN_USER
  })

  // 用戶資料庫
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('poen_users_db_v8')
    return saved ? JSON.parse(saved) : [ADMIN_USER, { email: 'dev@poenmail.eu.cc', password: '123', username: '前端極客', exp: 250, isAdmin: false, isVerified: false }]
  })

  // 文章列表 State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('poen_posts_v8')
    return saved ? JSON.parse(saved) : INITIAL_POSTS
  })

  // Modals 與 狀態控制
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false) // 後台開關
  
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authUsername, setAuthUsername] = useState('')

  // 文章新增/編輯 Modal
  const [showPostModal, setShowPostModal] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ title: '', category: 'tech', desc: '', content: '' })

  // 成就系統 Modal
  const [showAchievementModal, setShowAchievementModal] = useState(false)

  // 同步 Save 到 LocalStorage
  useEffect(() => {
    localStorage.setItem('poen_posts_v8', JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    localStorage.setItem('poen_users_db_v8', JSON.stringify(registeredUsers))
  }, [registeredUsers])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('poen_user_v8', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('poen_user_v8')
    }
  }, [currentUser])

  // 成就系統計算
  const getAchievements = (user: User | null): Achievement[] => {
    if (!user) return []
    const userPostsCount = posts.filter(p => p.authorEmail === user.email).length
    const userLikesGivenCount = posts.filter(p => p.likedBy.includes(user.email)).length

    return [
      { id: '1', title: '初來乍到', desc: '成功註冊並登入 Poen 社群', icon: '🎖️', unlocked: true },
      { id: '2', title: '筆耕不輟', desc: '成功發布至少 1 篇文章', icon: '✍️', unlocked: userPostsCount >= 1 },
      { id: '3', title: '熱心交流', desc: '給予文章 3 次以上的點讚', icon: '🎉', unlocked: userLikesGivenCount >= 3 },
      { id: '4', title: '社群核心', desc: '等級達到 LV3 以上或成為管理員', icon: '👑', unlocked: !!user.isAdmin || user.exp >= 300 }
    ]
  }

  // 經驗值增加
  const addExp = (amount: number, reason: string) => {
    if (!currentUser) return
    const newExp = currentUser.exp + amount
    const updatedUser = { ...currentUser, exp: newExp }
    setCurrentUser(updatedUser)
    setRegisteredUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u))
    alert(`🎉 ${reason}！經驗值 +${amount} (總計: ${newExp} EXP)`)
  }

  // 登入 / 註冊
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault()
    if (!authEmail.includes('@')) return alert('請輸入有效的 Email 地址！')
    if (!authPassword) return alert('請輸入密碼！')

    const cleanEmail = authEmail.trim().toLowerCase()
    const existingUser = registeredUsers.find(u => u.email.toLowerCase() === cleanEmail)

    if (existingUser) {
      if (existingUser.password && existingUser.password !== authPassword) {
        return alert('❌ 密碼錯誤！請重新輸入。')
      }
      setCurrentUser(existingUser)
      alert(existingUser.isAdmin ? '👑 歡迎站長登入管理員後台！' : `👋 歡迎回來，${existingUser.username}！`)
    } else {
      const newUser: User = { 
        email: cleanEmail, 
        password: authPassword,
        username: authUsername.trim() || cleanEmail.split('@')[0], 
        exp: 50,
        isAdmin: false,
        isVerified: false
      }
      setRegisteredUsers([...registeredUsers, newUser])
      setCurrentUser(newUser)
      alert(`🎉 註冊成功！獲得 50 初始 EXP！`)
    }

    setShowAuthModal(false)
    setAuthEmail('')
    setAuthPassword('')
    setAuthUsername('')
  }

  // 發布/編輯文章
  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return alert('請先登入帳號！')
    if (!formData.title.trim()) return alert('請輸入標題！')

    if (editingPostId) {
      const updated = posts.map(p => {
        if (p.id === editingPostId) {
          return {
            ...p,
            title: formData.title,
            category: formData.category,
            desc: formData.desc,
            content: formData.content || formData.desc
          }
        }
        return p
      })
      setPosts(updated)
      if (selectedPost && selectedPost.id === editingPostId) {
        setSelectedPost({
          ...selectedPost,
          title: formData.title,
          category: formData.category,
          desc: formData.desc,
          content: formData.content || formData.desc
        })
      }
      alert('✏️ 文章修改成功！')
    } else {
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
        authorIsVerified: currentUser.isVerified,
      }
      setPosts([newPost, ...posts])
      addExp(50, '成功發布文章')
    }

    setShowPostModal(false)
    setEditingPostId(null)
    setFormData({ title: '', category: 'tech', desc: '', content: '' })
  }

  // 文章刪除 (管理員或作者)
  const handleDeletePost = (id: number) => {
    if (!confirm('⚠️ 確定要刪除這篇文章嗎？此操作無法恢復！')) return
    setPosts(posts.filter(p => p.id !== id))
    if (selectedPost?.id === id) setSelectedPost(null)
    alert('🗑️ 文章已成功刪除！')
  }

  // 點讚機制
  const handleLike = (post: Post, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!currentUser) return alert('請先登入帳號再進行點讚！')

    if (post.likedBy.includes(currentUser.email)) {
      return alert('⚠️ 您已經給這篇文章點過讚了！')
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

  // 【管理員後台功能】切換使用者管理員權限
  const toggleUserAdmin = (email: string) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email === email) return { ...u, isAdmin: !u.isAdmin }
      return u
    }))
  }

  // 【管理員後台功能】切換使用者官方認證
  const toggleUserVerified = (email: string) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email === email) return { ...u, isVerified: !u.isVerified }
      return u
    }))
  }

  // 【管理員後台功能】調整經驗值
  const updateUserExp = (email: string, newExp: number) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email === email) return { ...u, exp: newExp }
      return u
    }))
  }

  const openAuthorProfile = (email: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const target = registeredUsers.find(u => u.email === email) || {
      email, username: '未知用戶', exp: 0, isAdmin: false, isVerified: false
    }
    setProfileUser(target)
  }

  const openPostDetail = (post: Post) => {
    const updated = posts.map(p => p.id === post.id ? { ...p, views: p.views + 1 } : p)
    setPosts(updated)
    setSelectedPost({ ...post, views: post.views + 1 })
  }

  const filteredPosts = activeTab === 'all' 
    ? posts 
    : posts.filter(p => p.category === activeTab)

  const currentUserLevel = currentUser ? getLevelInfo(currentUser.exp) : null

  return (
    <div style={styles.container}>
      {/* 頂部導覽列 */}
      <header style={styles.navbar}>
        <div style={styles.navContent}>
          <div style={styles.logo} onClick={() => { setSelectedPost(null); setShowAdminDashboard(false); }}>
            <span style={styles.logoBadge}>Poen</span> Poen's Community
          </div>

          <div style={styles.userSection}>
            {currentUser ? (
              <div style={styles.userInfo}>
                {/* 管理員專用後台按鈕 */}
                {currentUser.isAdmin && (
                  <button 
                    style={{ ...styles.adminDashboardBtn, backgroundColor: showAdminDashboard ? '#d97706' : '#f59e0b' }} 
                    onClick={() => { setShowAdminDashboard(!showAdminDashboard); setSelectedPost(null); }}
                  >
                    ⚙️ 管理員後台
                  </button>
                )}
                <button style={styles.achieveBtn} onClick={() => setShowAchievementModal(true)}>
                  🏆 成就
                </button>
                <span 
                  style={{ ...styles.levelBadge, backgroundColor: currentUserLevel?.color }}
                  onClick={() => openAuthorProfile(currentUser.email)}
                >
                  {currentUserLevel?.name}
                </span>
                <span style={styles.userName} onClick={() => openAuthorProfile(currentUser.email)}>
                  {currentUser.username}
                  {currentUser.isAdmin && <span style={styles.adminRoleBadge} title="管理員">👑 管理員</span>}
                  {currentUser.isVerified && <span style={styles.verifiedIcon} title="官方認證">☑️</span>}
                </span>
                <button 
                  style={styles.createBtn} 
                  onClick={() => {
                    setEditingPostId(null)
                    setFormData({ title: '', category: 'tech', desc: '', content: '' })
                    setShowPostModal(true)
                  }}
                >
                  ✏️ 發文
                </button>
                <button style={styles.logoutBtn} onClick={() => { setCurrentUser(null); setShowAdminDashboard(false); alert('已成功登出！'); }}>登出</button>
              </div>
            ) : (
              <button style={styles.loginBtn} onClick={() => setShowAuthModal(true)}>
                👤 Email 註冊 / 登入
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 主要區域 */}
      <main style={styles.main}>
        {showAdminDashboard && currentUser?.isAdmin ? (
          /* ================= 管理員獨立後台 Dashboard ================= */
          <div style={styles.dashboardContainer}>
            <div style={styles.dashboardHeader}>
              <h1 style={{ margin: 0, color: '#f59e0b' }}>⚙️ 管理員控制台</h1>
              <button style={styles.backBtn} onClick={() => setShowAdminDashboard(false)}>← 返回社群前台</button>
            </div>

            {/* 後台數據統計卡片 */}
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>總註冊用戶</div>
                <div style={styles.statValue}>{registeredUsers.length} 人</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>總文章發表</div>
                <div style={styles.statValue}>{posts.length} 篇</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statTitle}>官方認證用戶</div>
                <div style={styles.statValue}>{registeredUsers.filter(u => u.isVerified).length} 人</div>
              </div>
            </div>

            {/* 後台會員管理 */}
            <section style={styles.adminSection}>
              <h2 style={styles.sectionTitle}>👥 會員權限與認證管理</h2>
              <table style={styles.adminTable}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>用戶暱稱</th>
                    <th>Email 帳號</th>
                    <th>經驗值 (EXP)</th>
                    <th>管理員身分</th>
                    <th>官方認證</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map(user => (
                    <tr key={user.email} style={styles.tableRow}>
                      <td style={{ fontWeight: 'bold' }}>{user.username}</td>
                      <td style={{ color: '#94a3b8' }}>{user.email}</td>
                      <td>
                        <input 
                          type="number" 
                          style={styles.tableInput} 
                          defaultValue={user.exp} 
                          onBlur={(e) => updateUserExp(user.email, Number(e.target.value))}
                        />
                      </td>
                      <td>
                        <button 
                          style={{ ...styles.toggleBtn, backgroundColor: user.isAdmin ? '#f59e0b' : '#334155' }}
                          onClick={() => toggleUserAdmin(user.email)}
                        >
                          {user.isAdmin ? '👑 管理員' : '一般用戶'}
                        </button>
                      </td>
                      <td>
                        <button 
                          style={{ ...styles.toggleBtn, backgroundColor: user.isVerified ? '#0284c7' : '#334155' }}
                          onClick={() => toggleUserVerified(user.email)}
                        >
                          {user.isVerified ? '☑️ 已認證' : '未認證'}
                        </button>
                      </td>
                      <td>
                        <button style={styles.smallBtn} onClick={() => openAuthorProfile(user.email)}>查看名片</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* 後台文章管理 */}
            <section style={styles.adminSection}>
              <h2 style={styles.sectionTitle}>📝 文章全站管理</h2>
              <table style={styles.adminTable}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>文章標題</th>
                    <th>作者</th>
                    <th>發布日期</th>
                    <th>觀看 / 點讚</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map(post => (
                    <tr key={post.id} style={styles.tableRow}>
                      <td>{post.title}</td>
                      <td>{post.authorName}</td>
                      <td style={{ color: '#94a3b8' }}>{post.date}</td>
                      <td>👁️ {post.views} / 👍 {post.likes}</td>
                      <td>
                        <button style={styles.dangerBtn} onClick={() => handleDeletePost(post.id)}>刪除文章</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        ) : selectedPost ? (
          /* ================= 文章內頁 ================= */
          <article style={styles.detailCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button style={styles.backBtn} onClick={() => setSelectedPost(null)}>← 返回文章列表</button>
              {(currentUser?.isAdmin || currentUser?.email === selectedPost.authorEmail) && (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={styles.editBtn} onClick={() => {
                    setEditingPostId(selectedPost.id)
                    setFormData({ title: selectedPost.title, category: selectedPost.category, desc: selectedPost.desc, content: selectedPost.content })
                    setShowPostModal(true)
                  }}>✏️ 編輯文章</button>
                  <button style={styles.dangerBtn} onClick={() => handleDeletePost(selectedPost.id)}>🗑️ 刪除</button>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={styles.postCategory}>{selectedPost.category === 'tech' ? '💻 技術' : '☕ 生活'}</span>
              <span style={styles.postDate}>{selectedPost.date}</span>
            </div>

            <h1 style={styles.detailTitle}>{selectedPost.title}</h1>

            <div style={styles.authorBar} onClick={(e) => openAuthorProfile(selectedPost.authorEmail, e)}>
              <div style={styles.authorAvatar}>{selectedPost.authorName.charAt(0)}</div>
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{selectedPost.authorName}</span>
                  {selectedPost.authorIsAdmin && <span style={styles.adminRoleBadge}>👑 管理員</span>}
                  {selectedPost.authorIsVerified && <span style={styles.verifiedIcon} title="官方認證">☑️</span>}
                  <span style={{ ...styles.levelBadgeMini, backgroundColor: getLevelInfo(selectedPost.authorExp).color }}>
                    {getLevelInfo(selectedPost.authorExp).name}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{selectedPost.authorEmail}</div>
              </div>
            </div>

            <div style={styles.detailContent}>{selectedPost.content}</div>

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
          /* ================= 文章列表頁 ================= */
          <>
            {currentUser && currentUserLevel && (
              <section style={styles.userCard}>
                <div style={styles.userCardHeader}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      👋 歡迎回來，{currentUser.username}
                      {currentUser.isAdmin && <span style={styles.adminRoleBadge}>👑 管理員</span>}
                      {currentUser.isVerified && <span style={styles.verifiedIcon} title="官方認證">☑️</span>}
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
                  <div style={{ ...styles.progressBar, width: `${Math.min(100, (currentUser.exp / currentUserLevel.nextExp) * 100)}%`, backgroundColor: currentUserLevel.color }} />
                </div>
              </section>
            )}

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

            <div style={styles.postList}>
              {filteredPosts.map(post => {
                const authorLvl = getLevelInfo(post.authorExp)
                const isLiked = currentUser && post.likedBy.includes(currentUser.email)

                return (
                  <article key={post.id} style={styles.postCard} onClick={() => openPostDetail(post)}>
                    <div style={styles.cardHeader}>
                      <span style={styles.postCategory}>{post.category === 'tech' ? '技術' : '生活'}</span>
                      <span style={styles.postDate}>{post.date}</span>
                    </div>

                    <h2 style={styles.postTitle}>{post.title}</h2>
                    <p style={styles.postDesc}>{post.desc}</p>

                    <div style={styles.cardAuthorRow} onClick={(e) => openAuthorProfile(post.authorEmail, e)}>
                      <span style={{ ...styles.authorLevelBadge, backgroundColor: authorLvl.color }}>
                        {authorLvl.name}
                      </span>
                      <span style={styles.authorName}>
                        ✍️ {post.authorName}
                        {post.authorIsAdmin && <span style={styles.adminRoleBadge}>👑 管理員</span>}
                        {post.authorIsVerified && <span style={styles.verifiedIcon} title="官方認證">☑️</span>}
                      </span>
                    </div>

                    <div style={styles.cardFooter}>
                      <span>👁️ {post.views} 次觀看</span>
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

      {/* 使用者名片 Modal */}
      {profileUser && (
        <div style={styles.modalOverlay} onClick={() => setProfileUser(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>👤 會員名片</h2>
            <div style={{ textAlign: 'center', margin: '1.2rem 0' }}>
              <div style={styles.profileAvatarBig}>{profileUser.username.charAt(0)}</div>
              <h3 style={{ color: '#fff', margin: '0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}>
                {profileUser.username}
                {profileUser.isAdmin && <span style={styles.adminRoleBadge}>👑 管理員</span>}
                {profileUser.isVerified && <span style={styles.verifiedIcon} title="官方認證">☑️</span>}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{profileUser.email}</p>
              <span style={{ ...styles.levelBadgeBig, backgroundColor: getLevelInfo(profileUser.exp).color, display: 'inline-block', marginTop: '0.5rem' }}>
                {getLevelInfo(profileUser.exp).name}
              </span>
              <div style={{ color: '#cbd5e1', marginTop: '0.8rem', fontSize: '0.9rem' }}>
                累積經驗值：<strong>{profileUser.exp} EXP</strong>
              </div>
            </div>
            <button style={{ ...styles.submitBtn, width: '100%' }} onClick={() => setProfileUser(null)}>關閉名片</button>
          </div>
        </div>
      )}

      {/* 成就 Modal */}
      {showAchievementModal && currentUser && (
        <div style={styles.modalOverlay} onClick={() => setShowAchievementModal(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>🏆 個人成就面板</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '1rem 0' }}>
              {getAchievements(currentUser).map(ach => (
                <div key={ach.id} style={{ ...styles.achieveCard, opacity: ach.unlocked ? 1 : 0.4 }}>
                  <div style={{ fontSize: '1.8rem' }}>{ach.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', color: ach.unlocked ? '#38bdf8' : '#64748b' }}>
                      {ach.title} {ach.unlocked && '✅'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ach.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ ...styles.submitBtn, width: '100%' }} onClick={() => setShowAchievementModal(false)}>關閉成就</button>
          </div>
        </div>
      )}

      {/* 登入 Modal */}
      {showAuthModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>📧 帳號登入 / 註冊</h2>
            <form onSubmit={handleAuth}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>Email 電子郵件</label>
                <input type="email" style={styles.input} value={authEmail} onChange={e => setAuthEmail(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>密碼</label>
                <input type="password" style={styles.input} value={authPassword} onChange={e => setAuthPassword(e.target.value)} required />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>會員暱稱 (首次註冊填寫)</label>
                <input type="text" style={styles.input} value={authUsername} onChange={e => setAuthUsername(e.target.value)} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowAuthModal(false)}>取消</button>
                <button type="submit" style={styles.submitBtn}>確認登入 / 註冊</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 文章 Modal */}
      {showPostModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>{editingPostId ? '✏️ 編輯文章' : '✏️ 發布新文章 (+50 EXP)'}</h2>
            <form onSubmit={handleSavePost}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>文章標題</label>
                <input type="text" style={styles.input} value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>分類</label>
                <select style={styles.input} value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                  <option value="tech">💻 技術幹貨</option>
                  <option value="life">☕ 隨筆隨想</option>
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>文章摘要</label>
                <input type="text" style={styles.input} value={formData.desc} onChange={e => setFormData({ ...formData, desc: e.target.value })} required />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={styles.label}>詳細內容</label>
                <textarea style={{ ...styles.input, height: '100px' }} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} required />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" style={styles.cancelBtn} onClick={() => setShowPostModal(false)}>取消</button>
                <button type="submit" style={styles.submitBtn}>{editingPostId ? '保存修改' : '立即發布'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: { minHeight: '100vh', backgroundColor: '#0c1017', color: '#e2e8f0', fontFamily: 'sans-serif' },
  navbar: { backgroundColor: '#161b26', borderBottom: '1px solid #222d3d', position: 'sticky', top: 0, zIndex: 100 },
  navContent: { maxWidth: '1100px', margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.2rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  logoBadge: { backgroundColor: '#2563eb', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' },
  adminRoleBadge: { backgroundColor: '#d97706', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' },
  verifiedIcon: { fontSize: '0.85rem' },
  userSection: { display: 'flex', alignItems: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
  userName: { fontWeight: '600', color: '#f1f5f9', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' },
  levelBadge: { color: '#fff', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  levelBadgeMini: { color: '#fff', fontSize: '0.65rem', padding: '0.15rem 0.4rem', borderRadius: '10px', fontWeight: 'bold' },
  levelBadgeBig: { color: '#fff', fontSize: '0.85rem', padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold' },
  adminDashboardBtn: { backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  achieveBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#334155', color: '#94a3b8', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  createBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  editBtn: { backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  dangerBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
  
  // 管理員後台樣式
  dashboardContainer: { display: 'flex', flexDirection: 'column', gap: '2rem' },
  dashboardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
  statCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '12px', padding: '1.2rem' },
  statTitle: { color: '#94a3b8', fontSize: '0.85rem', marginBottom: '0.5rem' },
  statValue: { color: '#f1f5f9', fontSize: '1.8rem', fontWeight: 'bold' },
  adminSection: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '12px', padding: '1.5rem' },
  sectionTitle: { margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#f1f5f9' },
  adminTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' },
  tableHeader: { borderBottom: '1px solid #334155', color: '#94a3b8' },
  tableRow: { borderBottom: '1px solid #1e293b' },
  tableInput: { width: '70px', padding: '0.2rem 0.4rem', backgroundColor: '#0c1017', border: '1px solid #334155', color: '#fff', borderRadius: '4px' },
  toggleBtn: { border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' },
  smallBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' },

  userCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' },
  userCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  progressBg: { width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '4px', overflow: 'hidden' },
  progressBar: { height: '100%', transition: 'width 0.3s ease' },
  tabContainer: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  tab: { backgroundColor: '#161b26', border: '1px solid #222d3d', color: '#94a3b8', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  tabActive: { backgroundColor: '#2563eb', border: '1px solid #2563eb', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  postList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  postCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  postCategory: { backgroundColor: '#1e293b', color: '#38bdf8', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px' },
  authorLevelBadge: { color: '#fff', fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' },
  authorName: { fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' },
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
  achieveCard: { backgroundColor: '#0c1017', border: '1px solid #222d3d', padding: '0.75rem 1rem', borderRadius: '10px', display: 'flex', gap: '1rem', alignItems: 'center' },
  profileAvatarBig: { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#2563eb', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize: '1.8rem', margin: '0 auto' },
  label: { display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0c1017', color: '#fff', boxSizing: 'border-box' },
  cancelBtn: { backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
}