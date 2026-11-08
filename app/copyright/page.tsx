import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "著作權保護與侵權通知 | 鬼點子",
};

export default function CopyrightPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">著作權保護與侵權通知</h1>
      <p className="mt-1 text-xs text-slate-400">最後更新：2026 年 11 月 9 日</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            「鬼點子」重視著作權。本平臺上的小說、插畫、漫畫與短劇，著作權均屬各作者所有。
            除合理使用外，未經授權不得重製、轉載、改作或公開傳輸。
          </p>
          <p className="mt-2">
            本平臺依台灣《著作權法》第六章之一「網路服務提供者之責任限制」規定，
            於接獲權利人通知後，立即移除或使他人無法進入涉嫌侵權之內容，並將處理情形通知使用者。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">一、權利人如何提出通知</h2>
          <p>請寄送通知至 <span className="font-medium text-brand-700">copyright@mywhimsy.work</span>，並包含下列資訊：</p>
          <ol className="mt-1.5 list-decimal space-y-1.5 pl-5">
            <li>權利人之姓名或名稱、聯絡地址、電話與電子郵件。</li>
            <li>受侵害之著作名稱與說明（例如小說書名、短劇名稱、原始發表處）。</li>
            <li>涉嫌侵權內容在本平臺的網址（完整連結）或作品名稱、作者名稱。</li>
            <li>足以證明權利人享有著作權之資料（如原始發表紀錄、登記資料、授權文件）。</li>
            <li>聲明：通知內容真實，且你有權代表權利人提出。</li>
            <li>簽名或經確認之電子簽章。</li>
          </ol>
          <p className="mt-2">
            通知內容不完整者，我們可能無法即時處理，將請你補件。故意為不實通知者，應自負法律責任。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">二、我們的處理流程</h2>
          <ol className="list-decimal space-y-1.5 pl-5">
            <li>收到通知後 3 個工作日內確認內容，必要時聯繫權利人補件。</li>
            <li>確認屬實後，立即下架或移除該內容。</li>
            <li>以站內通知或電子郵件告知被檢舉之作者，並說明下架原因。</li>
            <li>留存通知與處理紀錄，備供主管機關或法院查核。</li>
          </ol>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">三、作者的異議（回復通知）</h2>
          <p>
            若你認為內容並未侵權（例如你有合法授權、屬合理使用、或通知內容有誤），
            請寄信至 <span className="font-medium text-brand-700">copyright@mywhimsy.work</span>，說明理由並檢附證據。
            我們審酌後，得恢復上架；若雙方爭議未決，得維持下架直到司法機關或主管機關認定。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">四、反覆侵權者</h2>
          <p>
            對同一帳號反覆接到有效侵權通知者，本平臺將限制其發表權限；
            情節重大者，終止其帳號並不再提供服務。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">五、聯絡方式</h2>
          <p>
            侵權通知與異議：<span className="font-medium text-brand-700">copyright@mywhimsy.work</span><br />
            其他問題：<span className="font-medium text-brand-700">support@mywhimsy.work</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            本頁為平台處理流程說明，不構成法律意見。涉及具體爭議時，建議諮詢律師。
          </p>
        </section>
      </div>
    </div>
  );
}
