import { useState, useEffect } from 'react'

interface User {
  email: string
  password?: string
  username: string
  avatar?: string          // 個人頭像 (Emoji 或 Base64/URL 圖片)
  bio?: string             // 個人簡介
  role?: string            // 職業 / 身份 (如：前端工程師)
  location?: string        // 所在地 (可手動填寫或自動偵測帶入)
  ip?: string              // 偵測到的 IP 地址
  country?: string         // 偵測到的國家/地區
  city?: string            // 偵測到的城市
  exp: number
  isAdmin?: boolean        // 是否為管理員
  isVerified?: boolean     // 是否為官方認證 (FB 藍勾)
  lastCheckInDate?: string // 上次簽到日期
  appliedVerification?: boolean // 是否已申請認證
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
  authorAvatar?: string
  authorCountry?: string
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

// 預設可選頭像清單
const PRESET_AVATARS = ['🐱', '🚀', '💻', '🌊', '⚡', '🦄', '🤖', '👑']

// 預設管理員帳號
const ADMIN_USER: User = {
  email: 'admin@poenmail.eu.cc',
  password: 'admin123',
  username: 'Poen (站長)',
  avatar: '👑',
  bio: 'Poen 社群創辦人兼站長，歡迎大家交流討論！',
  role: '全棧開發者 & 站長',
  location: '台灣 (Taiwan)',
  ip: '127.0.0.1',
  country: '台灣 (Taiwan)',
  city: '台北',
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
    authorAvatar: '👑',
    authorCountry: '台灣 (Taiwan)',
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
    authorAvatar: '💻',
    authorCountry: '香港 (Hong Kong)',
    authorExp: 250,
    authorIsAdmin: false,
    authorIsVerified: false
  },
]

// FB 風格的官方藍勾認證組件
const FbVerifiedBadge = ({ size = '16px' }: { size?: string }) => (
  <span 
    title="官方認證帳號" 
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0866ff',
      color: '#ffffff',
      borderRadius: '50%',
      width: size,
      height: size,
      fontSize: `calc(${size} * 0.65)`,
      fontWeight: 'bold',
      lineHeight: 1,
      userSelect: 'none',
      flexShrink: 0
    }}
  >
    ✓
  </span>
)

// 通用頭像組件 (支援圖片 URL 或 Emoji/文字)
const UserAvatar = ({ avatar, name, size = '36px' }: { avatar?: string; name: string; size?: string }) => {
  const isImage = avatar && (avatar.startsWith('data:image') || avatar.startsWith('http'))
  return (
    <div 
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: '#2563eb',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontWeight: 'bold',
        fontSize: `calc(${size} * 0.5)`,
        overflow: 'hidden',
        flexShrink: 0
      }}
    >
      {isImage ? (
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        avatar || name.charAt(0)
      )}
    </div>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('all')
  
  // 會員 State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('poen_user_v11')
    return saved ? JSON.parse(saved) : ADMIN_USER
  })

  // 用戶資料庫
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('poen_users_db_v11')
    return saved ? JSON.parse(saved) : [ADMIN_USER, { email: 'dev@poenmail.eu.cc', password: '123', username: '前端極客', avatar: '💻', bio: '專注前端開發與使用者體驗設計', role: 'UI/UX 設計師', location: '香港', exp: 250, isAdmin: false, isVerified: false }]
  })

  // 文章列表 State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('poen_posts_v11')
    return saved ? JSON.parse(saved) : INITIAL_POSTS
  })

  // Modals 與 頁面視圖控制
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [showAdminDashboard, setShowAdminDashboard] = useState(false) 
  const [showUserCenter, setShowUserCenter] = useState(false) // 個人使用者中心 Modal
  
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authUsername, setAuthUsername] = useState('')

  // 個人資料編輯表單 State
  const [editUsername, setEditUsername] = useState('')
  const [editBioText, setEditBioText] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editAvatar, setEditAvatar] = useState('')

  // 文章新增/編輯 Modal
  const [showPostModal, setShowPostModal] = useState(false)
  const [editingPostId, setEditingPostId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ title: '', category: 'tech', desc: '', content: '' })

  // 同步 Save 到 LocalStorage
  useEffect(() => {
    localStorage.setItem('poen_posts_v11', JSON.stringify(posts))
  }, [posts])

  useEffect(() => {
    localStorage.setItem('poen_users_db_v11', JSON.stringify(registeredUsers))
  }, [registeredUsers])

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('poen_user_v11', JSON.stringify(currentUser))
    } else {
      localStorage.removeItem('poen_user_v11')
    }
  }, [currentUser])

  // 🌐 自動偵測 IP 與 國家/地區
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.ip) {
          const detectedCountry = `${data.country_name} (${data.country_code})`
          const detectedCity = data.city || ''
          
          if (currentUser) {
            // 自動更新當前使用者的 IP 與 國家地點資訊
            const updatedUser = {
              ...currentUser,
              ip: data.ip,
              country: detectedCountry,
              city: detectedCity,
              location: currentUser.location || `${detectedCity}, ${detectedCountry}`
            }
            setCurrentUser(updatedUser)
            setRegisteredUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u))
          }
        }
      })
      .catch(() => console.log('IP 偵測 API 暫時無法連線'))
  }, [])

  // 成就系統計算
  const getAchievements = (user: User | null): Achievement[] => {
    if (!user) return []
    const userPostsCount = posts.filter(p => p.authorEmail === user.email).length
    const userLikesGivenCount = posts.filter(p => p.likedBy.includes(user.email)).length

    return [
      { id: '1', title: '初來乍到', desc: '成功註冊並登入 Poen 社群', icon: '🎖️', unlocked: true },
      { id: '2', title: '持之以恆', desc: '完成至少 1 次每日簽到', icon: '📅', unlocked: !!user.lastCheckInDate },
      { id: '3', title: '筆耕不輟', desc: '成功發布至少 1 篇文章', icon: '✍️', unlocked: userPostsCount >= 1 },
      { id: '4', title: '熱心交流', desc: '給予文章 3 次以上的點讚', icon: '🎉', unlocked: userLikesGivenCount >= 3 },
      { id: '5', title: '藍勾認證', desc: '獲得官方 Facebook 風格藍勾認證', icon: '🟦', unlocked: !!user.isVerified }
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

  // 每日簽到機制
  const handleCheckIn = () => {
    if (!currentUser) return
    const today = new Date().toISOString().split('T')[0]
    if (currentUser.lastCheckInDate === today) {
      return alert('📅 您今天已經完成簽到了，明天再來吧！')
    }

    const updatedUser = {
      ...currentUser,
      exp: currentUser.exp + 20,
      lastCheckInDate: today
    }
    setCurrentUser(updatedUser)
    setRegisteredUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u))
    alert('✅ 簽到成功！獲得 +20 EXP！')
  }

  // 上傳頭像處理 (Base64)
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) return alert('⚠️ 圖片大小不能超過 2MB！')

    const reader = new FileReader()
    reader.onloadend = () => {
      setEditAvatar(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 保存個人資料設定
  const handleSaveProfile = () => {
    if (!currentUser) return
    const updatedUser: User = { 
      ...currentUser, 
      username: editUsername.trim() || currentUser.username,
      bio: editBioText,
      role: editRole,
      location: editLocation,
      avatar: editAvatar || currentUser.avatar
    }
    setCurrentUser(updatedUser)
    setRegisteredUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u))
    
    // 更新舊文章作者資料
    setPosts(prev => prev.map(p => p.authorEmail === currentUser.email ? { 
      ...p, 
      authorName: updatedUser.username,
      authorAvatar: updatedUser.avatar,
      authorCountry: updatedUser.country || updatedUser.location
    } : p))
    
    alert('✅ 個人資料已成功保存！')
  }

  // 申請官方藍勾認證
  const handleApplyVerification = () => {
    if (!currentUser) return
    if (currentUser.isVerified) return alert('您已經是官方認證用戶！')
    if (currentUser.appliedVerification) return alert('您已提交過申請，請等待站長審核！')

    const updatedUser = { ...currentUser, appliedVerification: true }
    setCurrentUser(updatedUser)
    setRegisteredUsers(prev => prev.map(u => u.email === currentUser.email ? updatedUser : u))
    alert('📩 藍勾認證申請已成功送出！請等待站長於後台審核。')
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
      alert(existingUser.isAdmin ? '👑 歡迎站長登入！' : `👋 歡迎回來，${existingUser.username}！`)
    } else {
      const newUser: User = { 
        email: cleanEmail, 
        password: authPassword,
        username: authUsername.trim() || cleanEmail.split('@')[0], 
        avatar: '🐱',
        bio: '這個人很懶，什麼都沒留下...',
        role: '社群成員',
        location: '未知區域',
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
        authorAvatar: currentUser.avatar,
        authorCountry: currentUser.country || currentUser.location,
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

  // 文章刪除
  const handleDeletePost = (id: number) => {
    if (!confirm('⚠️ 確定要刪除這篇文章嗎？')) return
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

  // 切換使用者管理員權限
  const toggleUserAdmin = (email: string) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email === email) return { ...u, isAdmin: !u.isAdmin }
      return u
    }))
  }

  // 切換使用者官方認證 (給予/撤銷藍勾)
  const toggleUserVerified = (email: string) => {
    setRegisteredUsers(prev => prev.map(u => {
      if (u.email === email) return { ...u, isVerified: !u.isVerified, appliedVerification: false }
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

  const isTodayCheckedIn = currentUser?.lastCheckInDate === new Date().toISOString().split('T')[0]

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

                {/* 個人中心點擊 */}
                <div 
                  style={styles.avatarTrigger} 
                  onClick={() => {
                    setEditUsername(currentUser.username || '')
                    setEditBioText(currentUser.bio || '')
                    setEditRole(currentUser.role || '')
                    setEditLocation(currentUser.location || '')
                    setEditAvatar(currentUser.avatar || '')
                    setShowUserCenter(true)
                  }}
                  title="點擊打開個人中心與設定"
                >
                  <UserAvatar avatar={currentUser.avatar} name={currentUser.username} size="38px" />
                  <span style={styles.userNameHeader}>{currentUser.username}</span>
                  {currentUser.isVerified && <FbVerifiedBadge size="16px" />}
                </div>

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
                <div style={styles.statTitle}>藍勾官方認證</div>
                <div style={styles.statValue}>{registeredUsers.filter(u => u.isVerified).length} 人</div>
              </div>
            </div>

            {/* 後台會員與認證審核管理 */}
            <section style={styles.adminSection}>
              <h2 style={styles.sectionTitle}>👥 會員權限與 IP 國家/地區記錄</h2>
              <table style={styles.adminTable}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>用戶</th>
                    <th>Email 帳號</th>
                    <th>IP 與 國家/地區</th>
                    <th>管理員</th>
                    <th>FB 藍勾</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredUsers.map(user => (
                    <tr key={user.email} style={styles.tableRow}>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                        <UserAvatar avatar={user.avatar} name={user.username} size="28px" />
                        {user.username}
                      </td>
                      <td style={{ color: '#94a3b8' }}>{user.email}</td>
                      <td style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                        🌐 {user.country || user.location || '未知'}<br/>
                        <span style={{ color: '#64748b' }}>IP: {user.ip || '未紀錄'}</span>
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
                          style={{ ...styles.toggleBtn, backgroundColor: user.isVerified ? '#0866ff' : '#334155' }}
                          onClick={() => toggleUserVerified(user.email)}
                        >
                          {user.isVerified ? '🟦 已獲得藍勾' : '未認證'}
                        </button>
                      </td>
                      <td>
                        {user.appliedVerification && !user.isVerified && (
                          <span style={{ color: '#f59e0b', fontSize: '0.8rem', marginRight: '0.5rem' }}>📩 申請認證中</span>
                        )}
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
              <UserAvatar avatar={selectedPost.authorAvatar} name={selectedPost.authorName} size="42px" />
              <div>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#f1f5f9' }}>{selectedPost.authorName}</span>
                  {selectedPost.authorIsAdmin && <span style={styles.adminRoleBadge}>👑 管理員</span>}
                  {selectedPost.authorIsVerified && <FbVerifiedBadge size="16px" />}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {selectedPost.authorEmail} • 🌐 {selectedPost.authorCountry || '未知區域'}
                </div>
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
                      <UserAvatar avatar={post.authorAvatar} name={post.authorName} size="28px" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={styles.authorName}>
                          {post.authorName}
                          {post.authorIsAdmin && <span style={styles.adminRoleBadge}>👑 管理員</span>}
                          {post.authorIsVerified && <FbVerifiedBadge size="15px" />}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          🌐 {post.authorCountry || '未知國家/地區'}
                        </span>
                      </div>
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

      {/* 個人中心 Modal (個人資料編輯、IP偵測、簽到、成就) */}
      {showUserCenter && currentUser && (
        <div style={styles.modalOverlay} onClick={() => setShowUserCenter(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '540px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>⚙️ 個人資料與設定</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', margin: '1rem 0', maxHeight: '70vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              
              {/* 🌐 IP 與 國家/地區自動偵測卡片 */}
              <div style={{ ...styles.userCenterBox, borderLeft: '4px solid #38bdf8' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.2rem' }}>網路與位置資訊 (自動偵測)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#f1f5f9' }}>
                  🌐 國家/地區：{currentUser.country || '偵測中...'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                  當前 IP：{currentUser.ip || '獲取中...'} {currentUser.city ? `(${currentUser.city})` : ''}
                </div>
              </div>

              {/* 頭像選擇與上傳 */}
              <div style={styles.userCenterBox}>
                <label style={styles.label}>個人大頭貼</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem' }}>
                  <UserAvatar avatar={editAvatar || currentUser.avatar} name={currentUser.username} size="60px" />
                  <label style={styles.uploadBtn}>
                    📷 上傳自訂圖片
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>快速選用 Emoji 頭像：</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PRESET_AVATARS.map(emoji => (
                    <button 
                      key={emoji} 
                      style={{ 
                        ...styles.avatarOptionBtn, 
                        borderColor: editAvatar === emoji ? '#38bdf8' : '#334155',
                        backgroundColor: editAvatar === emoji ? '#1e293b' : '#0c1017'
                      }}
                      onClick={() => setEditAvatar(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* 編輯個人詳細資料 */}
              <div style={styles.userCenterBox}>
                <label style={{ ...styles.label, color: '#38bdf8', fontWeight: 'bold', marginBottom: '0.8rem' }}>📝 填寫詳細個人資料</label>
                
                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={styles.label}>暱稱 (Username)</label>
                  <input type="text" style={styles.input} value={editUsername} onChange={e => setEditUsername(e.target.value)} />
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={styles.label}>頭銜 / 職業 (Role)</label>
                  <input type="text" style={styles.input} value={editRole} onChange={e => setEditRole(e.target.value)} placeholder="例如：前端工程師 / 學生" />
                </div>

                <div style={{ marginBottom: '0.8rem' }}>
                  <label style={styles.label}>居住地 (Location)</label>
                  <input type="text" style={styles.input} value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="例如：台北市, 台灣" />
                </div>

                <div>
                  <label style={styles.label}>個人簡介 (Bio)</label>
                  <textarea 
                    style={{ ...styles.input, height: '65px' }} 
                    value={editBioText} 
                    onChange={e => setEditBioText(e.target.value)}
                    placeholder="介紹一下你自己吧..."
                  />
                </div>
              </div>

              {/* 每日簽到與積分資訊 */}
              <div style={styles.userCenterBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>目前累積積分</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#38bdf8' }}>{currentUser.exp} EXP</div>
                  </div>
                  <button 
                    style={{ ...styles.checkInBtn, padding: '0.6rem 1rem', backgroundColor: isTodayCheckedIn ? '#334155' : '#10b981', color: isTodayCheckedIn ? '#94a3b8' : '#fff' }} 
                    onClick={handleCheckIn}
                  >
                    {isTodayCheckedIn ? '✅ 今日已簽到' : '📅 每日簽到 (+20)'}
                  </button>
                </div>
              </div>

              {/* 成就面板 */}
              <div style={styles.userCenterBox}>
                <label style={styles.label}>🏆 成就解鎖進度</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '130px', overflowY: 'auto' }}>
                  {getAchievements(currentUser).map(ach => (
                    <div key={ach.id} style={{ ...styles.achieveCardSmall, opacity: ach.unlocked ? 1 : 0.4 }}>
                      <span style={{ fontSize: '1.2rem' }}>{ach.icon}</span>
                      <div style={{ flex: 1, fontSize: '0.85rem' }}>
                        <strong style={{ color: ach.unlocked ? '#38bdf8' : '#94a3b8' }}>{ach.title}</strong>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{ach.desc}</div>
                      </div>
                      {ach.unlocked && <span>✅</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* 官方 FB 藍勾認證 */}
              <div style={styles.userCenterBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      官方藍勾認證 <FbVerifiedBadge size="16px" />
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      {currentUser.isVerified 
                        ? '您已獲得官方藍勾認證' 
                        : currentUser.appliedVerification 
                        ? '審核中...' 
                        : '提升社群公信力'}
                    </div>
                  </div>
                  {!currentUser.isVerified && (
                    <button 
                      style={{ 
                        ...styles.smallBtn, 
                        backgroundColor: currentUser.appliedVerification ? '#334155' : '#0866ff',
                        cursor: currentUser.appliedVerification ? 'not-allowed' : 'pointer'
                      }}
                      onClick={handleApplyVerification}
                      disabled={currentUser.appliedVerification}
                    >
                      {currentUser.appliedVerification ? '審核中' : '申請認證'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button style={styles.cancelBtn} onClick={() => setShowUserCenter(false)}>取消</button>
              <button style={styles.submitBtn} onClick={() => { handleSaveProfile(); setShowUserCenter(false); }}>保存所有資料</button>
            </div>
          </div>
        </div>
      )}

      {/* 使用者名片 Modal */}
      {profileUser && (
        <div style={styles.modalOverlay} onClick={() => setProfileUser(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: '#f1f5f9' }}>👤 會員名片</h2>
            <div style={{ textAlign: 'center', margin: '1.2rem 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                <UserAvatar avatar={profileUser.avatar} name={profileUser.username} size="70px" />
              </div>
              <h3 style={{ color: '#fff', margin: '0.5rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem' }}>
                {profileUser.username}
                {profileUser.isAdmin && <span style={styles.adminRoleBadge}>👑 管理員</span>}
                {profileUser.isVerified && <FbVerifiedBadge size="18px" />}
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0.2rem 0' }}>{profileUser.role || 'Poen 社群會員'}</p>
              
              <div style={{ display: 'inline-block', backgroundColor: '#1e293b', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', marginTop: '0.4rem' }}>
                🌐 {profileUser.country || profileUser.location || '未知國家/地區'}
              </div>

              <div style={{ backgroundColor: '#0c1017', padding: '0.8rem', borderRadius: '8px', color: '#cbd5e1', marginTop: '1rem', fontSize: '0.875rem', textAlign: 'left', border: '1px solid #222d3d' }}>
                <strong>簡介：</strong> {profileUser.bio || '這個人很懶，什麼都沒留下...'}
              </div>

              <div style={{ color: '#38bdf8', marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                累積經驗值：{profileUser.exp} EXP
              </div>
            </div>
            <button style={{ ...styles.submitBtn, width: '100%' }} onClick={() => setProfileUser(null)}>關閉名片</button>
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
  navContent: { maxWidth: '1100px', margin: '0 auto', padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '1.2rem', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' },
  logoBadge: { backgroundColor: '#2563eb', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' },
  adminRoleBadge: { backgroundColor: '#d97706', color: '#fff', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' },
  userSection: { display: 'flex', alignItems: 'center' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '0.8rem' },
  avatarTrigger: { display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', backgroundColor: '#0c1017', padding: '0.3rem 0.6rem', borderRadius: '20px', border: '1px solid #222d3d' },
  userNameHeader: { fontWeight: '600', color: '#f1f5f9', fontSize: '0.9rem' },
  checkInBtn: { border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  adminDashboardBtn: { backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' },
  loginBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  logoutBtn: { backgroundColor: '#334155', color: '#94a3b8', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  createBtn: { backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  editBtn: { backgroundColor: '#f59e0b', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem' },
  dangerBtn: { backgroundColor: '#ef4444', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' },
  main: { maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' },
  
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
  toggleBtn: { border: 'none', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' },
  smallBtn: { backgroundColor: '#3b82f6', color: '#fff', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' },

  userCenterBox: { backgroundColor: '#0c1017', border: '1px solid #222d3d', borderRadius: '10px', padding: '1rem' },
  uploadBtn: { backgroundColor: '#1e293b', color: '#38bdf8', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer', border: '1px solid #334155' },
  avatarOptionBtn: { width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #334155', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  achieveCardSmall: { backgroundColor: '#161b26', border: '1px solid #222d3d', padding: '0.4rem 0.6rem', borderRadius: '6px', display: 'flex', gap: '0.6rem', alignItems: 'center' },

  tabContainer: { display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' },
  tab: { backgroundColor: '#161b26', border: '1px solid #222d3d', color: '#94a3b8', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  tabActive: { backgroundColor: '#2563eb', border: '1px solid #2563eb', color: '#fff', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' },
  postList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' },
  postCard: { backgroundColor: '#161b26', border: '1px solid #222d3d', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  postCategory: { backgroundColor: '#1e293b', color: '#38bdf8', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px' },
  authorName: { fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' },
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
  detailContent: { fontSize: '1.05rem', lineHeight: '1.8', color: '#cbd5e1', marginBottom: '2rem', whiteSpace: 'pre-line' },
  detailFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222d3d', paddingTop: '1.5rem', color: '#64748b' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.75)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#161b26', border: '1px solid #334155', borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '480px' },
  label: { display: 'block', fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' },
  input: { width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#0c1017', color: '#fff', boxSizing: 'border-box' },
  cancelBtn: { backgroundColor: '#1e293b', color: '#94a3b8', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
}