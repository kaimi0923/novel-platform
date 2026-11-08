// 全站介面文案字典：以繁體中文為基準，其餘語言對照
// 注意：分類、標籤、作品名稱等「資料」不翻譯，僅翻譯介面文字

export type Lang = "zh-TW" | "zh-CN" | "en" | "ja";

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: "zh-TW", label: "繁體中文", short: "繁" },
  { code: "zh-CN", label: "简体中文", short: "简" },
  { code: "en", label: "English", short: "EN" },
  { code: "ja", label: "日本語", short: "日" },
];

export const DEFAULT_LANG: Lang = "zh-TW";

export const LANG_COOKIE = "lang";

type Entry = Record<Lang, string>;

export const DICT: Record<string, Entry> = {
  // ---------- 頁面標題（瀏覽器分頁 / 分享預覽） ----------
  "meta.title": {
    "zh-TW": "鬼點子 · 原創小說投稿與閱讀平臺",
    "zh-CN": "鬼点子 · 原创小说投稿与阅读平台",
    en: "Guǐdiǎnzi · Original fiction publishing & reading",
    ja: "鬼點子・オリジナル小説の投稿と閲覧",
  },
  "meta.desc": {
    "zh-TW": "一個開放的原創小說投稿與閱讀平臺：作者自由投稿，讀者線上閱讀。",
    "zh-CN": "一个开放的原创小说投稿与阅读平台：作者自由投稿，读者在线阅读。",
    en: "An open platform for original fiction: authors publish freely, readers read online.",
    ja: "誰でも投稿できるオリジナル小説のプラットフォーム。作者は自由に投稿し、読者はオンラインで読めます。",
  },

  // ---------- 頂欄 ----------
  "nav.home": { "zh-TW": "首頁", "zh-CN": "首页", en: "Home", ja: "ホーム" },
  "nav.art": { "zh-TW": "插畫", "zh-CN": "插画", en: "Illustration", ja: "イラスト" },
  "nav.comic": { "zh-TW": "漫畫", "zh-CN": "漫画", en: "Comic", ja: "漫画" },
  "nav.novel": { "zh-TW": "小說", "zh-CN": "小说", en: "Novel", ja: "小説" },
  "nav.drama": { "zh-TW": "短劇", "zh-CN": "短剧", en: "Short Drama", ja: "ショートドラマ" },
  "nav.create": { "zh-TW": "+ 創作", "zh-CN": "+ 创作", en: "+ Create", ja: "+ 創作" },
  "nav.admin": { "zh-TW": "稽核後臺", "zh-CN": "审核后台", en: "Admin", ja: "管理画面" },
  "nav.login": { "zh-TW": "登入", "zh-CN": "登录", en: "Log in", ja: "ログイン" },
  "nav.signup": { "zh-TW": "註冊", "zh-CN": "注册", en: "Sign up", ja: "新規登録" },

  // ---------- 底部導覽 ----------
  "bottom.home": { "zh-TW": "首頁", "zh-CN": "首页", en: "Home", ja: "ホーム" },
  "bottom.search": { "zh-TW": "搜尋", "zh-CN": "搜索", en: "Search", ja: "検索" },
  "bottom.create": { "zh-TW": "創作", "zh-CN": "创作", en: "Create", ja: "創作" },
  "bottom.notify": { "zh-TW": "通知", "zh-CN": "通知", en: "Alerts", ja: "通知" },
  "bottom.me": { "zh-TW": "我的", "zh-CN": "我的", en: "Me", ja: "マイページ" },

  // ---------- 使用者選單 ----------
  "menu.stats": { "zh-TW": "資料分析", "zh-CN": "数据分析", en: "Analytics", ja: "分析" },
  "menu.works": { "zh-TW": "我的作品", "zh-CN": "我的作品", en: "My works", ja: "マイ作品" },
  "menu.favorites": { "zh-TW": "我的收藏", "zh-CN": "我的收藏", en: "Favorites", ja: "お気に入り" },
  "menu.history": { "zh-TW": "瀏覽記錄", "zh-CN": "浏览记录", en: "History", ja: "閲覧履歴" },
  "menu.following": { "zh-TW": "我關注的作者", "zh-CN": "我关注的作者", en: "Following", ja: "フォロー中" },
  "menu.comments": { "zh-TW": "我的留言", "zh-CN": "我的留言", en: "My comments", ja: "コメント" },
  "menu.notifications": { "zh-TW": "通知", "zh-CN": "通知", en: "Notifications", ja: "通知" },
  "menu.verify": { "zh-TW": "實名認證", "zh-CN": "实名认证", en: "Verification", ja: "本人認証" },
  "menu.profile": { "zh-TW": "個人設定", "zh-CN": "个人设置", en: "Settings", ja: "設定" },
  "menu.admin": { "zh-TW": "稽核後臺", "zh-CN": "审核后台", en: "Admin panel", ja: "管理画面" },
  "menu.logout": { "zh-TW": "登出", "zh-CN": "退出登录", en: "Log out", ja: "ログアウト" },

  // ---------- 頁腳 ----------
  "footer.brand": {
    "zh-TW": "鬼點子 · 原創小說投稿與閱讀平臺",
    "zh-CN": "鬼点子 · 原创小说投稿与阅读平台",
    en: "Guǐdiǎnzi · Original fiction publishing platform",
    ja: "鬼點子・オリジナル小説の投稿・閲覧プラットフォーム",
  },
  "footer.notice": {
    "zh-TW": "作者投稿經審核後上架 · 內容依台灣法規分級與管理",
    "zh-CN": "作者投稿经审核后上架 · 内容依台湾法规分级与管理",
    en: "Works are published after review · Rated per Taiwan regulations",
    ja: "投稿は審査後に公開・台湾の法令に基づく年齢区分表示",
  },
  "footer.terms": { "zh-TW": "服務條款", "zh-CN": "服务条款", en: "Terms of Service", ja: "利用規約" },
  "footer.privacy": { "zh-TW": "隱私政策", "zh-CN": "隐私政策", en: "Privacy Policy", ja: "プライバシーポリシー" },
  "footer.copyright": { "zh-TW": "著作權保護", "zh-CN": "著作权保护", en: "Copyright", ja: "著作権について" },
  "footer.ratingNote": {
    "zh-TW": "內容分級依《電腦網路內容分級處理辦法》標示 · 檢舉請於播放頁提出",
    "zh-CN": "内容分级依《电脑网路内容分级处理办法》标示 · 举报请于播放页提出",
    en: "Content rated under Taiwan's Internet Content Rating Rules · Report from the player",
    ja: "年齢区分は台湾のインターネット内容区分規則に基づく・通報はプレーヤーから",
  },

  // ---------- 首頁 ----------
  "home.drama": { "zh-TW": "短劇", "zh-CN": "短剧", en: "Short Drama", ja: "ショートドラマ" },
  "home.allDrama": { "zh-TW": "全部短劇 →", "zh-CN": "全部短剧 →", en: "All short dramas →", ja: "すべてのドラマ →" },
  "home.categories": { "zh-TW": "作品分類", "zh-CN": "作品分类", en: "Categories", ja: "カテゴリ" },
  "home.popular": { "zh-TW": "🔥 人氣榜", "zh-CN": "🔥 人气榜", en: "🔥 Trending", ja: "🔥 人気ランキング" },
  "home.hotTags": { "zh-TW": "熱門標籤", "zh-CN": "热门标签", en: "Popular tags", ja: "人気タグ" },
  "home.allTags": { "zh-TW": "全部標籤 →", "zh-CN": "全部标签 →", en: "All tags →", ja: "すべてのタグ →" },
  "home.latest": { "zh-TW": "最新上架", "zh-CN": "最新上架", en: "Latest", ja: "新着" },
  "home.viewAll": { "zh-TW": "檢視全部 →", "zh-CN": "查看全部 →", en: "View all →", ja: "すべて見る →" },
  "home.episodes": { "zh-TW": "共 {n} 集", "zh-CN": "共 {n} 集", en: "{n} episodes", ja: "全 {n} 話" },
  "home.chapters": { "zh-TW": "{n} 章", "zh-CN": "{n} 章", en: "{n} ch.", ja: "全 {n} 章" },
  "home.emptyDrama.title": {
    "zh-TW": "短劇頻道已開通",
    "zh-CN": "短剧频道已开通",
    en: "Short drama is live",
    ja: "ショートドラマ公開中",
  },
  "home.emptyDrama.desc": {
    "zh-TW": "還沒有作品，作者可以投稿豎屏短劇，稽核透過後出現在這裡",
    "zh-CN": "还没有作品，作者可以投稿竖屏短剧，审核通过后出现在这里",
    en: "No titles yet — authors can submit vertical short dramas; approved works appear here.",
    ja: "まだ作品がありません。縦型ショートドラマを投稿でき、審査通過後にここに表示されます。",
  },
  "home.emptyDrama.link": { "zh-TW": "去看看 →", "zh-CN": "去看看 →", en: "Take a look →", ja: "見てみる →" },
  "home.emptyPopular": {
    "zh-TW": "還沒有上榜作品，快去投稿吧",
    "zh-CN": "还没有上榜作品，快去投稿吧",
    en: "No ranked works yet — be the first to publish.",
    ja: "ランキング作品はまだありません。ぜひ投稿してください。",
  },
  "home.emptyLatest": {
    "zh-TW": "還沒有作品上架，來發布第一本吧",
    "zh-CN": "还没有作品上架，来发布第一本吧",
    en: "Nothing published yet — be the first.",
    ja: "まだ作品がありません。最初の一作を公開しましょう。",
  },
  "home.emptyCta": { "zh-TW": "立即投稿", "zh-CN": "立即投稿", en: "Publish now", ja: "今すぐ投稿" },

  // ---------- 作品卡片與通用 ----------
  "card.read": { "zh-TW": "{n} 閱讀", "zh-CN": "{n} 阅读", en: "{n} views", ja: "{n} 回閲覧" },
  "card.noRating": { "zh-TW": "暫無評分", "zh-CN": "暂无评分", en: "No rating", ja: "評価なし" },
  "card.words": { "zh-TW": "{n} 字", "zh-CN": "{n} 字", en: "{n} words", ja: "{n} 字" },
  "card.favorites": { "zh-TW": "{n} 收藏", "zh-CN": "{n} 收藏", en: "{n} saves", ja: "{n} お気に入り" },
  "card.serial": { "zh-TW": "連載中", "zh-CN": "连载中", en: "Ongoing", ja: "連載中" },
  "card.completed": { "zh-TW": "已完結", "zh-CN": "已完结", en: "Completed", ja: "完結" },
  "card.author": { "zh-TW": "作者：{name}", "zh-CN": "作者：{name}", en: "By {name}", ja: "作者：{name}" },
  "card.anonymous": { "zh-TW": "佚名", "zh-CN": "佚名", en: "Anonymous", ja: "匿名" },
  "card.noDesc": {
    "zh-TW": "（暫無簡介）",
    "zh-CN": "（暂无简介）",
    en: "(No description)",
    ja: "（紹介なし）",
  },
  "card.chapterCount": { "zh-TW": "{n} 章", "zh-CN": "{n} 章", en: "{n} ch.", ja: "全 {n} 章" },
  "card.images": { "zh-TW": "{n} 張圖", "zh-CN": "{n} 张图", en: "{n} images", ja: "{n} 点の画像" },
  "card.zeroWords": { "zh-TW": "0 字", "zh-CN": "0 字", en: "No text", ja: "0 字" },
  "card.wanWords": { "zh-TW": "{n} 萬字", "zh-CN": "{n} 万字", en: "{n}k words", ja: "{n} 万字" },
  "card.qianWords": { "zh-TW": "{n} 千字", "zh-CN": "{n} 千字", en: "{n}k words", ja: "{n} 千字" },
  "card.ended": { "zh-TW": "已完結", "zh-CN": "已完结", en: "Completed", ja: "完結" },
  "card.ongoing": { "zh-TW": "連載中", "zh-CN": "连载中", en: "Ongoing", ja: "連載中" },

  // ---------- 分類（對應資料庫原值） ----------
  "cat.都市": { "zh-TW": "都市", "zh-CN": "都市", en: "Urban", ja: "都市" },
  "cat.言情": { "zh-TW": "言情", "zh-CN": "言情", en: "Romance", ja: "恋愛" },
  "cat.玄幻": { "zh-TW": "玄幻", "zh-CN": "玄幻", en: "Fantasy", ja: "ファンタジー" },
  "cat.仙俠": { "zh-TW": "仙俠", "zh-CN": "仙侠", en: "Xianxia", ja: "仙侠" },
  "cat.懸疑": { "zh-TW": "懸疑", "zh-CN": "悬疑", en: "Mystery", ja: "ミステリー" },
  "cat.科幻": { "zh-TW": "科幻", "zh-CN": "科幻", en: "Sci-Fi", ja: "SF" },
  "cat.歷史": { "zh-TW": "歷史", "zh-CN": "历史", en: "Historical", ja: "歴史" },
  "cat.校園": { "zh-TW": "校園", "zh-CN": "校园", en: "Campus", ja: "学園" },
  "cat.遊戲": { "zh-TW": "遊戲", "zh-CN": "游戏", en: "Gaming", ja: "ゲーム" },
  "cat.短篇": { "zh-TW": "短篇", "zh-CN": "短篇", en: "Short story", ja: "短編" },
  "cat.其他": { "zh-TW": "其他", "zh-CN": "其他", en: "Other", ja: "その他" },

  // ---------- 型別 ----------
  "type.novel": { "zh-TW": "小說", "zh-CN": "小说", en: "Novel", ja: "小説" },
  "type.art": { "zh-TW": "插畫", "zh-CN": "插画", en: "Illustration", ja: "イラスト" },
  "type.comic": { "zh-TW": "漫畫", "zh-CN": "漫画", en: "Comic", ja: "漫画" },
  "type.drama": { "zh-TW": "短劇", "zh-CN": "短剧", en: "Short Drama", ja: "ショートドラマ" },

  // ---------- 分級 ----------
  "rating.general": { "zh-TW": "普遍級", "zh-CN": "普遍级", en: "General", ja: "全年齢" },
  "rating.protected": { "zh-TW": "保護級", "zh-CN": "保护级", en: "Protected", ja: "保護" },
  "rating.pg12": { "zh-TW": "輔12級", "zh-CN": "辅12级", en: "PG-12", ja: "12歳以上" },
  "rating.pg15": { "zh-TW": "輔15級", "zh-CN": "辅15级", en: "PG-15", ja: "15歳以上" },
  "rating.restricted": { "zh-TW": "限制級", "zh-CN": "限制级", en: "Restricted", ja: "18禁" },

  // ---------- 登入 / 註冊 ----------
  "auth.loginTitle": { "zh-TW": "登入", "zh-CN": "登录", en: "Log in", ja: "ログイン" },
  "auth.signupTitle": { "zh-TW": "註冊", "zh-CN": "注册", en: "Create account", ja: "新規登録" },
  "auth.email": { "zh-TW": "電子郵件", "zh-CN": "电子邮箱", en: "Email", ja: "メールアドレス" },
  "auth.password": { "zh-TW": "密碼", "zh-CN": "密码", en: "Password", ja: "パスワード" },
  "auth.username": { "zh-TW": "使用者名稱", "zh-CN": "用户名", en: "Username", ja: "ユーザー名" },
  "auth.noAccount": { "zh-TW": "還沒有帳號？", "zh-CN": "还没有账号？", en: "No account yet?", ja: "アカウントをお持ちでない方" },
  "auth.hasAccount": { "zh-TW": "已有帳號？", "zh-CN": "已有账号？", en: "Already registered?", ja: "すでにアカウントをお持ちの方" },
  "auth.forgot": { "zh-TW": "忘記密碼", "zh-CN": "忘记密码", en: "Forgot password", ja: "パスワードを忘れた" },
  "auth.login": { "zh-TW": "登入", "zh-CN": "登录", en: "Log in", ja: "ログイン" },
  "auth.loginBrand": { "zh-TW": "登入鬼點子", "zh-CN": "登录鬼点子", en: "Log in to Guǐdiǎnzi", ja: "鬼點子にログイン" },
  "auth.signupBrand": { "zh-TW": "註冊鬼點子", "zh-CN": "注册鬼点子", en: "Join Guǐdiǎnzi", ja: "鬼點子に登録" },
  "auth.signup": { "zh-TW": "註冊", "zh-CN": "注册", en: "Sign up", ja: "登録" },
  "auth.signingUp": { "zh-TW": "註冊中…", "zh-CN": "注册中…", en: "Signing up…", ja: "登録中…" },
  "auth.loggingIn": { "zh-TW": "登入中…", "zh-CN": "登录中…", en: "Logging in…", ja: "ログイン中…" },
  "auth.invalid": {
    "zh-TW": "郵箱或密碼不正確",
    "zh-CN": "邮箱或密码不正确",
    en: "Incorrect email or password",
    ja: "メールアドレスまたはパスワードが正しくありません",
  },
  "auth.emailTaken": {
    "zh-TW": "該郵箱已註冊，請直接登入",
    "zh-CN": "该邮箱已注册，请直接登录",
    en: "This email is already registered — please log in",
    ja: "このメールアドレスは登録済みです。ログインしてください",
  },
  "auth.verifyNotice": {
    "zh-TW": "註冊成功！請前往郵箱點選確認連結後登入。",
    "zh-CN": "注册成功！请前往邮箱点击确认链接后登录。",
    en: "Account created — check your inbox and confirm the link to log in.",
    ja: "登録が完了しました。メール内の確認リンクをクリックしてログインしてください。",
  },
  "auth.passwordPh": { "zh-TW": "請輸入密碼", "zh-CN": "请输入密码", en: "Enter your password", ja: "パスワードを入力" },
  "auth.passwordMin": { "zh-TW": "至少 6 位", "zh-CN": "至少 6 位", en: "At least 6 characters", ja: "6文字以上" },
  "auth.usernameLabel": { "zh-TW": "筆名 / 使用者名稱", "zh-CN": "笔名 / 用户名", en: "Pen name / Username", ja: "ペンネーム / ユーザー名" },
  "auth.usernamePh": { "zh-TW": "你的筆名", "zh-CN": "你的笔名", en: "Your pen name", ja: "ペンネームを入力" },
  "auth.signupNow": { "zh-TW": "立即註冊", "zh-CN": "立即注册", en: "Sign up now", ja: "今すぐ登録" },
  "auth.loginNow": { "zh-TW": "直接登入", "zh-CN": "直接登录", en: "Log in", ja: "ログインへ" },

  // ---------- 通用 ----------
  "common.back": { "zh-TW": "返回", "zh-CN": "返回", en: "Back", ja: "戻る" },
  "common.cancel": { "zh-TW": "取消", "zh-CN": "取消", en: "Cancel", ja: "キャンセル" },
  "common.submit": { "zh-TW": "送出", "zh-CN": "提交", en: "Submit", ja: "送信" },
  "common.save": { "zh-TW": "儲存", "zh-CN": "保存", en: "Save", ja: "保存" },
  "common.loading": { "zh-TW": "載入中…", "zh-CN": "加载中…", en: "Loading…", ja: "読み込み中…" },
  "common.search": { "zh-TW": "搜尋", "zh-CN": "搜索", en: "Search", ja: "検索" },
  "common.language": { "zh-TW": "語言", "zh-CN": "语言", en: "Language", ja: "言語" },

  // ---------- 短劇播放器 ----------
  "player.episodes": { "zh-TW": "選集", "zh-CN": "选集", en: "Episodes", ja: "エピソード" },
  "player.follow": { "zh-TW": "追劇", "zh-CN": "追剧", en: "Follow", ja: "フォロー" },
  "player.followed": { "zh-TW": "已追", "zh-CN": "已追", en: "Following", ja: "フォロー中" },
  "player.share": { "zh-TW": "分享", "zh-CN": "分享", en: "Share", ja: "共有" },
  "player.report": { "zh-TW": "檢舉", "zh-CN": "举报", en: "Report", ja: "通報" },
  "player.reportTitle": { "zh-TW": "檢舉此內容", "zh-CN": "举报此内容", en: "Report this content", ja: "このコンテンツを通報" },
  "player.reportDetail": { "zh-TW": "補充說明（選填）", "zh-CN": "补充说明（选填）", en: "Details (optional)", ja: "詳細（任意）" },
  "player.reportSent": { "zh-TW": "已收到檢舉，我們會盡快處理", "zh-CN": "已收到举报，我们会尽快处理", en: "Report received. We'll review it soon.", ja: "通報を受け取りました。順次対応します。" },
  "player.restrictedTitle": { "zh-TW": "此內容為限制級", "zh-CN": "此内容为限制级", en: "Restricted content", ja: "18禁コンテンツ" },
  "player.restrictedBody": {
    "zh-TW": "依台灣《電腦網路內容分級處理辦法》，未滿 18 歲者不得觀賞本內容。",
    "zh-CN": "依台湾《电脑网路内容分级处理办法》，未满 18 岁者不得观赏本内容。",
    en: "Under Taiwan's Internet Content Rating Rules, this content is not for anyone under 18.",
    ja: "台湾のインターネット内容区分規則により、18歳未満の方は視聴できません。",
  },
  "player.ageConfirm": { "zh-TW": "我已滿 18 歲，繼續觀看", "zh-CN": "我已满 18 岁，继续观看", en: "I'm 18 or older, continue", ja: "18歳以上です。視聴する" },
  "player.leave": { "zh-TW": "離開", "zh-CN": "离开", en: "Leave", ja: "退出" },
  "player.episodeCount": { "zh-TW": "全 {n} 集", "zh-CN": "全 {n} 集", en: "{n} episodes", ja: "全 {n} 話" },
  "player.episodeNo": { "zh-TW": "第 {n} 集", "zh-CN": "第 {n} 集", en: "Ep. {n}", ja: "第 {n} 話" },
};

export function translate(lang: Lang, key: string, vars?: Record<string, string | number>): string {
  const entry = DICT[key];
  if (!entry) {
    // 分類 / 標籤類 key 找不到時回退為原始中文值（資料本身不翻譯）
    if (key.startsWith("cat.") || key.startsWith("tag.")) return key.slice(4);
    if (key.startsWith("type.")) return key.slice(5);
    return key;
  }
  let text = entry?.[lang] ?? entry?.[DEFAULT_LANG] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return text;
}
