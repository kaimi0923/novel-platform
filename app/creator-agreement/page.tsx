import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "成人內容創作規範 | 鬼點子",
};

export default function CreatorAgreementPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">成人內容創作規範</h1>
      <p className="mt-1 text-xs text-slate-400">最後更新：2026 年 11 月 12 日</p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-700">
        <section>
          <p>
            本規範適用於本平臺上標示為「限制級（18+）」的小說、插畫、漫畫與短劇。
            當你將作品分級設為「限制級」，即表示你已閱讀並同意本規範全部內容，
            並願意就作品內容承擔全部法律責任。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">一、絕對禁止的內容</h2>
          <p>下列內容不得發表，一經發現立即下架並停權，必要時通報主管機關：</p>
          <ul className="mt-1.5 list-disc space-y-1.5 pl-5">
            <li>
              <strong>任何涉及未滿 18 歲人物之性內容</strong>
              ，包括性行為描述、性暗示、裸露、性器官描繪，
              不論為真人、動漫、AI 生成或文字描述。
            </li>
            <li>
              性器官特寫、性行為過程特寫、性虐待、性暴力、人獸性交等情節
              （即司法實務所稱「硬蕊」猥褻內容）。
            </li>
            <li>未經當事人同意的真人裸露、性影像或私密影像。</li>
            <li>以誘騙、脅迫、下藥、復仇等方式呈現的性內容。</li>
            <li>涉及性交易、性剝削、人口販運之招募或廣告。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">二、允許的內容範圍</h2>
          <p>
            本平臺允許「軟性」成人內容：以成年人為對象的情感、情慾、曖昧情節，
            可以有性暗示與煽情描寫，但不得出現性器官裸露或性行為細節描寫。
            所有限制級作品必須進入限制級分級，並由未滿 18 歲者不得瀏覽的機制保護。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">三、你必須保證的事</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>作品為你原創，或你已取得所有必要的著作權授權。</li>
            <li>
              使用之人物影像（含 AI 生成之擬真人物）不得以真實人物為原型，
              或已取得該真實人物之書面同意。
            </li>
            <li>不使用未授權的音樂、字體、圖片素材。</li>
            <li>在作品頁正確標示分級，不將限制級內容標為普遍級以規避檢查。</li>
            <li>主動配合本平臺的內容審查與下架要求。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">四、平臺的處置權</h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>接到檢舉後，本平臺會在 24 小時內完成初步檢視。</li>
            <li>經認定違規者，本平臺得逕行下架作品、凍結收益、暫停或永久停權帳號。</li>
            <li>
              涉及未成年人性內容者，本平臺將立即下架、保存相關紀錄，
              並依法通報 iWIN 或警政機關，不另行通知作者。
            </li>
            <li>本平臺得要求作者限期改善，逾期未改善者視為違規。</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">五、責任歸屬</h2>
          <p>
            作品內容之法律責任由作者自負。若因作者發表之內容導致本平臺受主管機關裁罰、
            或遭第三人請求損害賠償，本平臺得向作者追償，並得暫停其帳號權限。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">六、申訴</h2>
          <p>
            若你認為作品被誤判下架，可寄信至{" "}
            <a href="mailto:support@mywhimsy.work" className="text-brand-600 underline">
              support@mywhimsy.work
            </a>
            提出申訴，信中請附作品連結與說明。本平臺會在 7 個工作日內回覆。
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-base font-semibold text-slate-900">七、法規依據</h2>
          <p>
            本規範依中華民國《電腦網路內容分級處理辦法》、《兒童及少年福利與權益保障法》、
            《兒童及少年性剝削防制條例》及《刑法》第 235 條等相關規定訂定。
            本規範未盡事宜，依本平臺
            <Link href="/terms" className="mx-1 text-brand-600 underline">
              服務條款
            </Link>
            辦理。
          </p>
        </section>
      </div>
    </div>
  );
}
