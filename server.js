const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const subscriptions = [];

const css = `
*{box-sizing:border-box}
body{margin:0;background:#070a0f;color:#fff;font-family:Arial,sans-serif}
body:before{content:"";position:fixed;inset:0;background:radial-gradient(circle at 80% 0%,#1b2d18,transparent 35%);pointer-events:none}
.container{max-width:1100px;margin:auto;padding:30px}
.nav{height:70px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #202733}
.logo{font-size:25px;font-weight:900}
.logo span{color:#a8e85a}
.badge{font-size:11px;color:#a8e85a;border:1px solid #314a24;padding:6px 10px;border-radius:20px}
.hero{padding:55px 0 30px}
.hero small{color:#a8e85a;letter-spacing:3px}
.hero h1{font-size:48px;margin:12px 0}
.hero p{color:#8993a5;line-height:1.8}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:#0d1118;border:1px solid #202733;border-radius:20px;padding:25px}
.card h2{margin-top:0}
.number{font-size:35px;font-weight:900;margin:10px 0}
button,.btn{display:inline-block;background:#a8e85a;color:#101508;border:0;padding:13px 18px;border-radius:12px;font-weight:bold;text-decoration:none;cursor:pointer}
input,textarea{width:100%;background:#080b10;color:#fff;border:1px solid #29313e;border-radius:12px;padding:13px;margin:7px 0 16px;font-size:14px}
textarea{min-height:180px}
table{width:100%;border-collapse:collapse}
td,th{padding:15px;text-align:right;border-bottom:1px solid #202733}
.muted{color:#778294}
.subbox{background:#090d13;border:1px solid #26303d;border-radius:15px;padding:15px;word-break:break-all;margin:15px 0;color:#b9f477}
.status{color:#a8e85a;font-weight:bold}
@media(max-width:700px){
.grid{grid-template-columns:1fr}
.hero h1{font-size:38px}
.container{padding:18px}
}
`;

function page(title, content) {
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Mamooti Panel</title>
<style>${css}</style>
</head>
<body>
<div class="container">
<div class="nav">
<div class="logo">Mamooti <span>Panel</span></div>
<div class="badge">ONLINE</div>
</div>
${content}
</div>
</body>
</html>`;
}

app.get("/", (req, res) => {
  res.send(page("Dashboard", `
<section class="hero">
<small>MAMOOTI CONTROL CENTER</small>
<h1>ماموتی پنل 🦣</h1>
<p>مدیریت اشتراک‌ها با رابط کاربری مدرن و مناسب موبایل.</p>
<a class="btn" href="/new">＋ ساخت اشتراک</a>
</section>

<div class="grid">
<div class="card">
<div class="muted">کل اشتراک‌ها</div>
<div class="number">${subscriptions.length}</div>
</div>

<div class="card">
<div class="muted">اشتراک فعال</div>
<div class="number">${subscriptions.filter(x => x.active).length}</div>
</div>

<div class="card">
<div class="muted">وضعیت پنل</div>
<div class="number">ONLINE</div>
</div>
</div>

<br>

<div class="card">
<h2>اشتراک‌های اخیر</h2>

${
  subscriptions.length
    ? subscriptions.map(s => `
      <div class="subbox">
        <b>${escapeHtml(s.name)}</b><br>
        <span class="muted">
        وضعیت:
        <span class="status">${s.active ? "فعال" : "غیرفعال"}</span>
        </span>
        <br><br>
        <span class="muted">${s.url}</span>
      </div>
    `).join("")
    : `<p class="muted">هنوز اشتراکی ساخته نشده.</p>`
}
</div>
`));
});

app.get("/new", (req, res) => {
  res.send(page("New Subscription", `
<section class="hero">
<small>NEW SUBSCRIPTION</small>
<h1>ساخت اشتراک</h1>
<p>نام و محتوای اشتراک را وارد کنید.</p>
</section>

<div class="card">
<form method="POST" action="/new">

<label>نام اشتراک</label>
<input name="name" placeholder="مثلاً Mamooti VIP" required>

<label>محتوای Subscription</label>
<textarea
name="content"
placeholder="Subscription content..."
required></textarea>

<button type="submit">ساخت لینک</button>

</form>
</div>
`));
});

app.post("/new", (req, res) => {
  const token = crypto.randomBytes(24).toString("hex");

  const base =
    process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get("host")}`;

  const sub = {
    id: Date.now(),
    name: req.body.name,
    content: req.body.content,
    token,
    active: true,
    createdAt: new Date().toISOString(),
    url: `${base}/sub/${token}`
  };

  subscriptions.push(sub);

  res.send(page("Subscription Created", `
<section class="hero">
<small>CREATED SUCCESSFULLY</small>
<h1>اشتراک ساخته شد ✓</h1>
<p>لینک اختصاصی اشتراک آماده است.</p>
</section>

<div class="card">

<h2>${escapeHtml(sub.name)}</h2>

<div class="subbox">
${sub.url}
</div>

<button onclick="navigator.clipboard.writeText('${sub.url}')">
کپی لینک
</button>

<br><br>

<a class="btn" href="/">بازگشت به پنل</a>

</div>
`));
});

app.get("/sub/:token", (req, res) => {
  const sub = subscriptions.find(
    x => x.token === req.params.token
  );

  if (!sub) {
    return res
      .status(404)
      .type("text")
      .send("Subscription not found");
  }

  if (!sub.active) {
    return res
      .status(403)
      .type("text")
      .send("Subscription disabled");
  }

  res
    .type("text/plain")
    .send(sub.content);
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    panel: "Mamooti Panel"
  });
});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Mamooti Panel running on port ${PORT}`);
});
