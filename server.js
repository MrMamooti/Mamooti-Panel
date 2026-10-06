const express = require("express");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const subscriptions = [];

const css = `
*{box-sizing:border-box}
body{
  margin:0;
  background:#06080d;
  color:#f5f7fb;
  font-family:Arial,sans-serif;
}
body:before{
  content:"";
  position:fixed;
  inset:0;
  background:
    radial-gradient(circle at 15% 10%,rgba(110,120,255,.18),transparent 28%),
    radial-gradient(circle at 85% 0%,rgba(85,220,160,.12),transparent 25%);
  pointer-events:none;
}
.container{
  max-width:1120px;
  margin:auto;
  padding:24px;
}
.nav{
  height:72px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  border-bottom:1px solid #202635;
}
.logo{
  font-size:25px;
  font-weight:900;
}
.logo span{
  color:#7d8cff;
}
.badge{
  font-size:11px;
  color:#8dffbd;
  border:1px solid #24543a;
  padding:7px 11px;
  border-radius:999px;
  background:#0a1510;
}
.hero{
  padding:62px 0 30px;
}
.kicker{
  color:#8d99ff;
  letter-spacing:3px;
  font-size:11px;
  font-weight:800;
}
h1{
  font-size:52px;
  margin:12px 0 10px;
}
.hero p{
  color:#8d96a8;
  line-height:1.8;
  max-width:650px;
}
.grid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
}
.card{
  background:rgba(13,17,26,.92);
  border:1px solid #222a3a;
  border-radius:22px;
  padding:24px;
}
.number{
  font-size:36px;
  font-weight:900;
  margin-top:8px;
}
.muted{
  color:#7f899c;
}
.btn,button{
  display:inline-block;
  border:0;
  background:#7d8cff;
  color:#fff;
  padding:13px 18px;
  border-radius:13px;
  font-weight:800;
  text-decoration:none;
  cursor:pointer;
}
.btn.secondary{
  background:#171d2a;
  border:1px solid #2a3345;
}
input,textarea{
  width:100%;
  background:#090c12;
  color:#fff;
  border:1px solid #293246;
  border-radius:13px;
  padding:13px;
  margin:7px 0 17px;
  font-size:14px;
}
textarea{
  min-height:190px;
  resize:vertical;
}
.subbox{
  background:#090d14;
  border:1px solid #293246;
  border-radius:15px;
  padding:15px;
  word-break:break-all;
  margin:15px 0;
  color:#b5c0ff;
}
.status{
  color:#8dffbd;
  font-weight:800;
}
.actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}
.item{
  border-bottom:1px solid #202635;
  padding:18px 0;
}
.item:last-child{
  border-bottom:0;
}
@media(max-width:700px){
  .grid{
    grid-template-columns:1fr;
  }
  h1{
    font-size:38px;
  }
  .container{
    padding:17px;
  }
}
`;

function esc(v){
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function page(title, content){
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Mamooti Panel</title>
<style>${css}</style>
</head>
<body>
<div class="container">
<div class="nav">
<div class="logo">Mamooti <span>Panel</span></div>
<div class="badge">AMSTERDAM · ONLINE</div>
</div>
${content}
</div>
</body>
</html>`;
}

app.get("/", (req, res) => {
  const active = subscriptions.filter(x => x.active).length;

  const list = subscriptions.length
    ? subscriptions.map(s => `
      <div class="item">
        <b>${esc(s.name)}</b><br>
        <span class="muted">Config: Mamooti VIP</span><br>
        <span class="status">
          ${s.active ? "● ACTIVE" : "● DISABLED"}
        </span>
        <div class="subbox">${esc(s.url)}</div>
        <div class="actions">
          <a class="btn secondary" href="/sub/${s.token}">
            مشاهده Subscription
          </a>
        </div>
      </div>
    `).join("")
    : `<p class="muted">هنوز هیچ Subscription ساخته نشده.</p>`;

  res.send(page("Dashboard", `
    <section class="hero">
      <div class="kicker">MAMOOTI CONTROL CENTER</div>
      <h1>Mamooti Panel 🦣</h1>
      <p>
        پنل مدرن مدیریت Subscription با لینک اختصاصی
        و رابط کاربری تاریک و حرفه‌ای.
      </p>

      <a class="btn" href="/new">
        ＋ ساخت Subscription
      </a>
    </section>

    <div class="grid">
      <div class="card">
        <div class="muted">کل اشتراک‌ها</div>
        <div class="number">${subscriptions.length}</div>
      </div>

      <div class="card">
        <div class="muted">اشتراک فعال</div>
        <div class="number">${active}</div>
      </div>

      <div class="card">
        <div class="muted">نام کانفیگ</div>
        <div class="number" style="font-size:24px">
          Mamooti VIP
        </div>
      </div>
    </div>

    <br>

    <div class="card">
      <h2>Subscription های اخیر</h2>
      ${list}
    </div>
  `));
});

app.get("/new", (req, res) => {
  res.send(page("New Subscription", `
    <section class="hero">
      <div class="kicker">MAMOOTI VIP</div>
      <h1>ساخت Subscription</h1>
      <p>
        اطلاعات Subscription ارائه‌دهنده مجاز خودت را وارد کن.
      </p>
    </section>

    <div class="card">
      <form method="POST" action="/new">

        <label>نام اشتراک</label>
        <input
          name="name"
          placeholder="Mamooti VIP - 30GB"
          required
        >

        <label>محتوای Subscription</label>
        <textarea
          name="content"
          placeholder="Subscription content..."
          required
        ></textarea>

        <button type="submit">
          ساخت لینک اختصاصی
        </button>

      </form>
    </div>
  `));
});

app.post("/new", (req, res) => {
  const token = crypto.randomBytes(24).toString("hex");

  const base =
    process.env.PUBLIC_BASE_URL ||
    `${req.protocol}://${req.get("host")}`;

  const subscription = {
    id: crypto.randomUUID(),
    name: req.body.name,
    content: req.body.content,
    token,
    active: true,
    createdAt: new Date().toISOString(),
    url: `${base}/sub/${token}`
  };

  subscriptions.push(subscription);

  res.send(page("Created", `
    <section class="hero">
      <div class="kicker">MAMOOTI VIP</div>
      <h1>اشتراک ساخته شد ✓</h1>
    </section>

    <div class="card">
      <h2>${esc(subscription.name)}</h2>

      <div class="subbox">
        ${esc(subscription.url)}
      </div>

      <div class="actions">
        <button
          onclick="navigator.clipboard.writeText(${JSON.stringify(subscription.url)})"
        >
          کپی لینک
        </button>

        <a class="btn secondary" href="/">
          بازگشت
        </a>
      </div>
    </div>
  `));
});

app.get("/sub/:token", (req, res) => {
  const subscription = subscriptions.find(
    x => x.token === req.params.token
  );

  if (!subscription) {
    return res
      .status(404)
      .type("text")
      .send("Subscription not found");
  }

  if (!subscription.active) {
    return res
      .status(403)
      .type("text")
      .send("Subscription disabled");
  }

  res
    .type("text/plain")
    .send(subscription.content);
});

app.get("/health", (req, res) => {
  res.json({
    status: "online",
    panel: "Mamooti Panel",
    config: "Mamooti VIP",
    region: "Amsterdam"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Mamooti Panel running on port ${PORT}`
  );
});
