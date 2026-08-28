interface Env {
  DB: D1Database;
}

// GET: 獲取會員列表
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM users").all();
    return new Response(JSON.stringify(results), {
      headers: { "content-type": "application/json;charset=UTF-8" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

// POST: 註冊 / 更新會員資料
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user: any = await context.request.json();
    
    // 檢查使用者是否存在，存在就更新，不存在就新增
    await context.env.DB.prepare(`
      INSERT INTO users (email, password, username, avatar, bio, role, location, ip, country, city, exp, isAdmin, isVerified, lastCheckInDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        username=excluded.username,
        avatar=excluded.avatar,
        bio=excluded.bio,
        role=excluded.role,
        location=excluded.location,
        ip=excluded.ip,
        country=excluded.country,
        city=excluded.city,
        exp=excluded.exp,
        isAdmin=excluded.isAdmin,
        isVerified=excluded.isVerified,
        lastCheckInDate=excluded.lastCheckInDate
    `).bind(
      user.email, user.password || '', user.username, user.avatar || '🐱',
      user.bio || '', user.role || '', user.location || '', user.ip || '',
      user.country || '', user.city || '', user.exp || 50,
      user.isAdmin ? 1 : 0, user.isVerified ? 1 : 0, user.lastCheckInDate || ''
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};