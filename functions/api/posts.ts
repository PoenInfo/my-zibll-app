interface Env {
  DB: D1Database;
}

// GET: 抓取所有文章
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { results } = await context.env.DB.prepare(
      "SELECT posts.*, users.username as authorName, users.avatar as authorAvatar, users.country as authorCountry, users.isAdmin as authorIsAdmin, users.isVerified as authorIsVerified FROM posts LEFT JOIN users ON posts.authorEmail = users.email ORDER BY posts.id DESC"
    ).all();
    
    // 解析 likedBy 欄位 (從 JSON 字串轉陣列)
    const formattedResults = results.map((post: any) => ({
      ...post,
      likedBy: post.likedBy ? JSON.parse(post.likedBy) : []
    }));

    return new Response(JSON.stringify(formattedResults), {
      headers: { "content-type": "application/json;charset=UTF-8" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

// POST: 新增或更新文章
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body: any = await context.request.json();
    
    if (body.action === 'like') {
      // 處理點讚
      const { id, likedBy, likes } = body;
      await context.env.DB.prepare(
        "UPDATE posts SET likes = ?, likedBy = ? WHERE id = ?"
      ).bind(likes, JSON.stringify(likedBy), id).run();
    } else {
      // 處理新增文章
      const { title, category, date, desc, content, authorEmail } = body;
      await context.env.DB.prepare(
        "INSERT INTO posts (title, category, date, desc, content, authorEmail, views, likes, likedBy) VALUES (?, ?, ?, ?, ?, ?, 1, 0, '[]')"
      ).bind(title, category, date, desc, content, authorEmail).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};