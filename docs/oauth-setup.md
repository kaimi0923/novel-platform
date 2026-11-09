# 第三方登入（Google / Facebook / Apple / LINE）開通手冊

> 網站程式碼已上線：註冊頁、登入頁都已出現四顆按鈕。
> 但**按鈕要能真正登入，還得在 Supabase 後台把四個供應商打開**，並在各平台申請金鑰。
> 沒開通前點按鈕，畫面會提示「此登入方式尚未開通」——這是正常的，照下面順序做即可。

---

## 0. 先做這一步：Supabase 的回跳網址

進 Supabase 專案 → 左側 **Authentication** → **URL Configuration**

- **Site URL** 填：`https://mywhimsy.work`
- **Redirect URLs** 按「Add URL」逐條加上：
  - `https://mywhimsy.work/auth/callback`
  - `https://mywhimsy.work/**`
  - `http://localhost:3000/auth/callback`（本機測試用，可略）

> 四個平台後台都要填的「回呼網址」是同一個，先複製記好：
> **`https://mmoqqcfguxvaxfkyrhmh.supabase.co/auth/v1/callback`**

Supabase 後台開關位置統一在：**Authentication → Providers**，點進某個供應商 → 打開 **Enable** → 貼上金鑰 → **Save**。

---

## 1. Google（免費，最快，建議先做）

1. 開 <https://console.cloud.google.com> ，右上「選取專案」→「新增專案」，名稱填 `whimsy`，建立。
2. 左側選單 **APIs & Services → Credentials** → 右上 **Create credentials → OAuth client ID**。
3. 第一次會先要你填「OAuth consent screen」：
   - User Type 選 **External**
   - App name 填 `鬼點子`
   - User support email、Developer contact email 都填你自己的信箱
   - 其餘一路 **Save and continue**
4. 回來建 OAuth client ID：
   - Application type：**Web application**
   - Name：`whimsy-web`
   - **Authorized JavaScript origins**：`https://mywhimsy.work`
   - **Authorized redirect URIs**：`https://mmoqqcfguxvaxfkyrhmh.supabase.co/auth/v1/callback`
5. 建立後跳出視窗，複製 **Client ID** 和 **Client secret**。
6. 回 Supabase → Authentication → Providers → **Google** → Enable → 貼上兩個值 → Save。

✅ 完成後，註冊頁點「Google」就會開 Google 選帳號視窗。

---

## 2. LINE（免費，台灣使用者最多，強烈建議）

Supabase 內建沒有 LINE，要用「自訂 OIDC 供應商」接。

**A. 先拿 LINE 的 Channel ID / Secret**

1. 開 <https://developers.line.biz/console/> ，用你的 LINE 帳號登入。
2. 建立 **Provider**（名稱隨便，例：`whimsy`）。
3. 在該 Provider 下 **Create a LINE Login channel**：
   - App name：`鬼點子`
   - App description：`原創小說投稿與閱讀平臺`
   - App category：任選（例：娛樂）
   - Email address：你的信箱
   - Region：**Taiwan**
4. 進入該 channel → **LINE Login** 分頁 → **Callback URL** 填：
   `https://mmoqqcfguxvaxfkyrhmh.supabase.co/auth/v1/callback`
5. 回到 **Basic settings** 分頁，複製 **Channel ID**；**Channel secret** 按「Issue」後複製。

**B. 回 Supabase 加自訂供應商**

Authentication → Providers → 找 **Custom OAuth/OIDC provider**（或「Add provider / Custom」）→ 選 **OIDC**，填：

| 欄位 | 填什麼 |
|---|---|
| Identifier | `line`（一定要小寫 line，網站程式已寫死 `custom:line`） |
| Name | `LINE` |
| Issuer URL | `https://access.line.me` |
| Client ID | LINE 的 Channel ID |
| Client Secret | LINE 的 Channel secret |
| Scopes | `openid profile`（若要抓 email 再加 `email`，但 LINE 後台需另外申請 Email 權限並審核） |
| Email optional | 建議打開（LINE 不一定回傳信箱） |

> ⚠️ 若 Supabase 後台找不到「Custom OAuth/OIDC provider」入口，代表你的方案不支援這個功能，需要升級 Supabase Pro（約 US$25/月）。先做 Google、Facebook，LINE 再決定。

---

## 3. Facebook（免費，但要審核才對外開放）

1. 開 <https://developers.facebook.com/apps/> → **Create app** → 用途選「其他」→ 類型選「網站」。
2. 左側 **新增產品 → Facebook 登入（Facebook Login）**。
3. 進入 **Facebook 登入 → 設定**，在「有效 OAuth 重新導向 URI」填：
   `https://mmoqqcfguxvaxfkyrhmh.supabase.co/auth/v1/callback`
4. 左側 **應用程式設定 → 基本**：複製 **應用程式編號（App ID）** 和 **應用程式密鑰（App Secret，按「顯示」）**。
5. 回 Supabase → Providers → **Facebook** → Enable → 貼上 → Save。
6. 注意：新 App 處於「開發模式」，**只有你自己和加進「角色」的測試帳號能登入**。要讓所有人都能登入，得完成「應用程式審查」，並在設定裡填隱私政策網址（可填 `https://mywhimsy.work/privacy`）。

---

## 4. Apple（最麻煩，要付費開發者帳號 US$99/年）

沒有 Apple Developer 付費帳號之前，**這顆按鈕先別開**，做了也拿不到金鑰。有帳號後：

1. 開 <https://developer.apple.com/account> → **Certificates, Identifiers & Profiles → Identifiers**。
2. 先建一個 **App ID**（若還沒有），再按 **+** 建 **Services ID**（例：`work.mywhimsy.web`）。
3. 點該 Services ID → 勾 **Sign in with Apple** → **Configure**：
   - Primary App ID 選剛剛那個 App ID
   - **Domains and Subdomains**：`mmoqqcfguxvaxfkyrhmh.supabase.co`
   - **Return URLs**：`https://mmoqqcfguxvaxfkyrhmh.supabase.co/auth/v1/callback`
4. **Keys → +** 新建一把金鑰，勾 **Sign in with Apple**，下載 `.p8` 檔（**只能下載一次**，收好）。
5. 記下三個值：**Team ID**（右上角）、**Key ID**（金鑰頁面）、**.p8 檔內容**（文字編輯器打開全選複製）。
6. 回 Supabase → Providers → **Apple** → Enable，填：
   - Service ID（就是第 2 步的 `work.mywhimsy.web`）
   - Team ID
   - Key ID
   - Private Key（.p8 全文，含 BEGIN/END 那兩行）

---

## 5. 建議順序與成本

| 順序 | 供應商 | 費用 | 大概時間 | 備註 |
|---|---|---|---|---|
| 1 | Google | 免費 | 10 分鐘 | 最穩，審核最寬 |
| 2 | LINE | 免費 | 20 分鐘 | 台灣主力，但要 Supabase 支援自訂供應商 |
| 3 | Facebook | 免費 | 30 分鐘＋審核 | 未審核前只有測試帳號能登 |
| 4 | Apple | US$99/年 | 1～2 小時 | 沒有付費帳號就先關著 |

---

## 6. 接好之後怎麼驗收

1. 開無痕視窗 → `https://mywhimsy.work/signup`
2. 點「Google」→ 應該跳出 Google 選帳號 → 選完自動回到網站並已登入。
3. 到「我的」→ 個人資料，確認筆名已被自動填入（取自 Google／LINE 的暱稱，可自行改）。
4. 若跳出「redirect_uri_mismatch」之類錯誤，代表某個平台後台的「回呼網址」跟 `https://mmoqqcfguxvaxfkyrhmh.supabase.co/auth/v1/callback` 不一致，逐字核對。
