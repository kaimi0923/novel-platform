import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服務條款 | 鬼點子",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">服務條款</h1>
      <p className="mt-1 text-xs text-slate-400">最後更新：2026 年 11 月 9 日</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            歡迎使用「鬼點子」（以下稱「本平臺」）。本平臺提供原創小說、插畫、漫畫與短劇的發表與閱讀服務。
            當你註冊帳號或使用本平臺任何功能，即表示你已閱讀、理解並同意本條款。若你不同意，請停止使用本平臺。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">一、帳號</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>你應提供真實、正確的註冊資料，並自行保管帳號密碼。</li>
            <li>帳號僅供本人使用，不得轉讓、出租或與他人共用。</li>
            <li>以他人名義註冊、冒充他人或使用不實資料者，本平臺得停權或刪除帳號。</li>
            <li>未成年人使用本平臺，應經法定代理人同意。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">二、內容規範</h2>
          <p>你發表的作品與留言，不得包含下列內容：</p>
          <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
            <li>涉及色情、猥褻或性剝削之內容，尤其不得涉及未成年人。</li>
            <li>有害兒童及少年身心健康之內容，包括過度描述暴力、自傷、犯罪手法。</li>
            <li>侵害他人著作權、商標權、肖像權或隱私之內容。</li>
            <li>誹謗、仇恨、歧視、騷擾或恐嚇他人之內容。</li>
            <li>詐騙、賭博、販毒、武器交易或其他違法行為之內容或廣告。</li>
            <li>未經授權的他人著作、影音素材、音樂或圖片。</li>
          </ul>
          <p className="mt-2">
            本平臺依台灣《電腦網路內容分級處理辦法》對短劇標示內容分級。標示為「限制級」者，未滿 18 歲不得觀賞；
            標示為「輔12」「輔15」「保護級」者，依各級規定限制觀賞年齡。你應於發表時誠實選擇分級，隱匿或偽報分級致生爭議者，本平臺得調整或下架內容。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">三、審核與下架</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>作品發表前須經人工審核，本平臺得不附理由退回或要求修改。</li>
            <li>已上架內容若經檢舉、權利人通知或主管機關告知違法，本平臺得先行下架並通知你。</li>
            <li>你可在收到通知後提出說明；經查無違法或誤判者，本平臺將恢復上架。</li>
            <li>反覆違規者，本平臺得限制其發表權限或終止帳號。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">四、著作權</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>你發表的作品，著作權仍歸你所有，本平臺不取得著作財產權。</li>
            <li>你同意授權本平臺在提供服務之必要範圍內，重製、公開傳輸、公開展示及以縮圖、節錄方式呈現你的作品（例如封面、試閱、分享卡片）。</li>
            <li>你保證發表之作品為自行創作或已取得合法授權，未侵害第三人權利。</li>
            <li>若你的作品侵害他人權利，你應自負法律責任並賠償本平臺因此所受之損害。</li>
            <li>你可隨時要求下架自己的作品，下架後本平臺將停止公開傳輸，但已備份或快取之副本不在此限。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">五、付費與廣告</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>本平臺目前免費提供閱讀。若未來推出付費內容或訂閱，將於購買頁面明確標示價格、內容範圍與退款規則。</li>
            <li>依台灣消費者保護法，通訊交易之數位內容經消費者同意即時提供者，不適用七日解除權；本平臺將於購買前請你確認。</li>
            <li>本平臺可能顯示第三方廣告，廣告內容由廣告商負責，本平臺不為其背書。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">六、服務變更與免責</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>本平臺得隨時新增、修改或停止部分功能，並盡力提前公告。</li>
            <li>因系統維護、第三方服務（如雲端主機、資料庫）中斷或不可抗力造成之暫停，本平臺不負賠償責任。</li>
            <li>你應自行備份作品原檔。本平臺雖盡力保存資料，但不保證資料永久不滅失。</li>
            <li>本平臺對使用者間之糾紛不負調解責任。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">七、準據法與管轄</h2>
          <p>
            本條款依中華民國（臺灣）法律解釋與適用。因本條款所生爭議，以臺灣臺北地方法院為第一審管轄法院。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">八、聯絡我們</h2>
          <p>
            對本條款有疑問，請來信 <span className="font-medium text-brand-700">support@mywhimsy.work</span>。
            本平臺保留修改本條款之權利，修改後將於本頁公告並更新日期；你於修改後繼續使用，視為同意修改後之條款。
          </p>
        </section>
      </div>
    </div>
  );
}
