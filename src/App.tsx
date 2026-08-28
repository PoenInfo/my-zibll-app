import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)
  const [liked, setLiked] = useState(false)

  return (
    <div style={styles.container}>
      {/* 頂部 Header */}
      <header style={styles.header}>
        <div style={styles.badge}>🚀 Cloudflare Pages 順利運行中</div>
        <h1 style={styles.title}>歡迎來到 Poen 的個人空間</h1>
        <p style={styles.subtitle}>
          這是透過 React + Vite + Cloudflare Pages 構建的高效能 Web 應用程式。
        </p>
      </header>

      {/* 主要內容卡片區 */}
      <main style={styles.cardContainer}>
        {/* 卡片 1：點擊計數器 */}
        <div style={styles.card}>
          <div style={styles.icon}>⚡</div>
          <h3 style={styles.cardTitle}>互動體驗測試</h3>
          <p style={styles.cardDesc}>測試 State 狀態管理與即時渲染效能。</p>
          <button 
            style={styles.primaryButton}
            onClick={() => setCount((c) => c + 1)}
          >
            點擊次數：{count}
          </button>
        </div>

        {/* 卡片 2：讚數/按鈕狀態 */}
        <div style={styles.card}>
          <div style={styles.icon}>💖</div>
          <h3 style={styles.cardTitle}>給這個專案點讚</h3>
          <p style={styles.cardDesc}>極速部署，打造流暢的使用者體驗。</p>
          <button 
            style={{
              ...styles.secondaryButton,
              backgroundColor: liked ? '#ef4444' : '#3b82f6',
              color: '#ffffff'
            }}
            onClick={() => setLiked(!liked)}
          >
            {liked ? '❤️ 已收藏' : '🤍 收藏專案'}
          </button>
        </div>
      </main>

      {/* 底部 頁腳 */}
      <footer style={styles.footer}>
        <p>© 2026 Poen. Built with React & Vite.</p>
      </footer>
    </div>
  )
}

// 行內樣式 (Inline Styles)，無需額外設定 CSS 即可直接生效
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '2rem',
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '3rem',
    maxWidth: '600px'
  },
  badge: {
    display: 'inline-block',
    padding: '0.4rem 1rem',
    borderRadius: '9999px',
    backgroundColor: '#1e293b',
    border: '1px solid #334155',
    color: '#38bdf8',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '1rem'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0.5rem 0 1rem 0',
    background: 'linear-gradient(to right, #38bdf8, #818cf8)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  subtitle: {
    fontSize: '1.125rem',
    color: '#94a3b8',
    lineHeight: '1.6',
    margin: 0
  },
  cardContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    width: '100%',
    maxWidth: '700px',
    marginBottom: '3rem'
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '1rem',
    padding: '1.75rem',
    border: '1px solid #334155',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
  },
  icon: {
    fontSize: '2rem',
    marginBottom: '0.75rem'
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    margin: '0 0 0.5rem 0',
    color: '#f1f5f9'
  },
  cardDesc: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.5'
  },
  primaryButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    backgroundColor: '#0284c7',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  secondaryButton: {
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  footer: {
    color: '#64748b',
    fontSize: '0.875rem'
  }
}