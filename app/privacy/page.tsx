import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隱私政策 | 鬼點子",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">隱私政策</h1>
      <p className="mt-1 text-xs text-slate-400">最後更新：2026 年 11 月 9 日</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            「鬼點子」（以下稱「本平臺」）依台灣《個人資料保護法》蒐集、處理及利用你的個人資料。
            本政策說明我們蒐集哪些資料、如何使用、以及你可以行使的權利。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">一、我們蒐集的資料</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li><span className="font-medium">帳號資料</span>：電子郵件、使用者名稱、密碼（由身分驗證服務加密處理）。</li>
            <li><span className="font-medium">個人資料</span>：你自行填寫的暱稱、頭像、簡介。</li>
            <li><span className="font-medium">實名驗證資料</span>：若你申請成為認證作者，需上傳證件影像。該影像存放於非公開儲存空間，僅供管理員審核使用，審核完成後不作為其他用途。</li>
            <li><span className="font-medium">使用紀錄</span>：瀏覽紀錄、收藏、評分、留言、檢舉紀錄。</li>
            <li><span className="font-medium">技術資料</span>：IP 位址、裝置與瀏覽器類型、存取時間，用於安全防護與流量分析。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">二、蒐集目的與利用方式</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>提供帳號註冊、登入、發表作品、閱讀與互動功能。</li>
            <li>審核作品與實名驗證，維護內容品質。</li>
            <li>處理檢舉、侵權通知與違規下架。</li>
            <li>統計流量與改善服務（以去識別化方式進行）。</li>
            <li>寄送與帳號或服務相關的通知信件。</li>
          </ul>
          <p className="mt-2">
            我們不會將你的個人資料出售、出租或提供給無關第三人作行銷用途。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">三、委外服務</h2>
          <p>本平臺使用下列第三方服務處理資料，其資料可能儲存於境外：</p>
          <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
            <li>Supabase（資料庫與檔案儲存，伺服器位於海外）。</li>
            <li>Vercel（網站主機與內容傳遞）。</li>
            <li>Google（流量分析與廣告，如已啟用）。</li>
          </ul>
          <p className="mt-2">
            上述服務商依其自身隱私政策處理資料。你可能因跨境傳輸而適用不同國家之資料保護規範。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">四、Cookie 與本機儲存</h2>
          <p>
            本平臺使用 Cookie 與瀏覽器本機儲存（localStorage）維持登入狀態、記住閱讀進度與年齡確認結果。
            你可在瀏覽器設定中清除或封鎖，但部分功能可能因此無法使用。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">五、你的權利</h2>
          <p>依個人資料保護法第 3 條，你可以行使下列權利：</p>
          <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
            <li>查詢或請求閱覽你的個人資料。</li>
            <li>請求製給複製本。</li>
            <li>請求補充或更正。</li>
            <li>請求停止蒐集、處理或利用。</li>
            <li>請求刪除。</li>
          </ul>
          <p className="mt-2">
            你可於「個人設定」自行修改或刪除大部分資料，或來信
            <span className="font-medium text-brand-700">support@mywhimsy.work</span> 提出請求，我們將於 15 個工作日內回覆。
            刪除帳號後，相關個人資料將於合理期間內移除，但依法令或為處理爭議所需者，得保留必要紀錄。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">六、資料安全</h2>
          <p>
            我們以權限控管、加密傳輸與最小化蒐集原則保護資料。惟網路傳輸與儲存無法保證絕對安全，
            如發生資料外洩，我們將依法通知受影響使用者並通報主管機關。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">七、未成年人</h2>
          <p>
            未滿 12 歲之兒童，應由法定代理人代為註冊或同意。我們不會主動蒐集兒童的敏感資料；
            若發現未經同意蒐集，將儘速刪除。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">八、政策修改</h2>
          <p>
            本政策修改時將於本頁公告並更新日期。涉及重大權利變更者，我們會以站內通知或電子郵件提醒你。
          </p>
        </section>
      </div>
    </div>
  );
}
