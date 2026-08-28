import { useState } from 'react'

export default function App() {
  const [activeTab, setActiveTab] = useState('all')

  const posts = [
    { id: 1, title: '【子比主題】網站優化與極速部署教學', category: 'tech', date: '2026-08-28', views: 1280, likes: 96, desc: '如何使用 Cloudflare Pages 與 React 打造極速回應的子比風格前端介面...' },
    { id: 2, title: '2026 年前端開發最佳實踐指南', category: 'tech', date: '2026-08-25', views: 850, likes: 42, desc: '探討 Vite、React 與現代化網頁建構工具的深度整合技巧。' },
    { id: 3, title: '個人獨立站營運與內容創作心得紀錄', category: 'life', date: '2026-08-20', views: 2300, likes: 180, desc: '從零開始搭建專屬的個人知識庫，分享這些年來的網站運營思考。' },
  ]

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
          <nav style={styles.navMenu}>
            <span style={styles.navItemActive}>首頁</span>
            <span style={styles.navItem}>文章列表</span>
            <span style={styles.navItem}>關於我</span>
          </nav>
        </div>
      </header>

      {/* 主體區塊 */}
      <main style={styles.main}>
        {/* Banner 橫幅廣告/宣告 */}
        <section style={styles.heroBanner}>
          <h1 style={styles.heroTitle}>歡迎來到 Poen 的子比主題展示站</h1>
          <p style={styles.heroSub}>基於 React + Vite + Cloudflare Pages 構建的高效能 Web 應用</p>
        </section>

        {/* 分類選單（Tab） */}
        <div style={styles.tabContainer}>
          <button 
            style={activeTab === 'all' ? styles.tabActive : styles.tab} 
            onClick={() => setActiveTab('all')}
          >
            🔥 全部文章
          </button>
          <button 
            style={activeTab === 'tech' ? styles.tabActive : styles.tab} 
            onClick={() => setActiveTab('tech')}
          >
            💻 技術幹貨
          </button>
          <button 
            style={activeTab === 'life' ? styles.tabActive : styles.tab} 
            onClick={() => setActiveTab('life')}
          >
            ☕ 隨筆隨想
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
                <span>👁️ {post.views} 次閱讀</span>
                <span>👍 {post.likes} 點贊</span>
              </div>
            </article>
          ))}
        </div>
      </main>

      {/* 頁腳 */}
      <footer style={styles.footer}>
        <p>© 2026 Poen. Powered by Zibll Style UI on Cloudflare Pages.</p>
      </footer>
    </div>
  )
}

// 子比風格專屬 CSS 樣式
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0c1017',
    color: '#e2e8f0',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
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
  navMenu: {
    display: 'flex',
    gap: '1.5rem',
    fontSize: '0.95rem',
  },
  navItemActive: {
    color: '#38bdf8',
    fontWeight: '600',
    cursor: 'pointer',
  },
  navItem: {
    color: '#94a3b8',
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
    padding: '2.5rem',
    marginBottom: '2rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
  },
  heroTitle: {
    fontSize: '2rem',
    fontWeight: '800',
    margin: '0 0 0.5rem 0',
    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSub: {
    color: '#94a3b8',
    margin: 0,
    fontSize: '1rem',
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
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  postCategory: {
    backgroundColor: '#1e293b',
    color: '#38bdf8',
    fontSize: '0.75rem',
    padding: '0.2rem 0.6rem',
    borderRadius: '4px',
    fontWeight: '600',
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
    lineHeight: '1.4',
  },
  postDesc: {
    fontSize: '0.875rem',
    color: '#94a3b8',
    lineHeight: '1.5',
    margin: '0 0 1.25rem 0',
  },
  cardFooter: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.8rem',
    color: '#64748b',
    borderTop: '1px solid #1e293b',
    paddingTop: '0.75rem',
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