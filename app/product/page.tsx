"use client";

import { useState } from "react";
import "./product.css";

type Task = {
  label: string;
  title: string;
  detail: string;
  level: "優先" | "次に" | "保留";
};

const tasks: Task[] = [
  { label: "見積もり", title: "見積もり作成の流れをそろえる", detail: "案件情報の聞き取りから見積書作成まで、担当者ごとの差をなくします。", level: "優先" },
  { label: "受発注", title: "受発注の転記を減らす", detail: "メール・Excel・紙に散らばる情報を一度だけ入力する形に整理します。", level: "次に" },
  { label: "日報", title: "現場の日報をまとめる", detail: "現場の報告を集約し、進捗がひと目で分かる状態をつくります。", level: "保留" },
];

const nav = ["ホーム", "業務を整理する", "相談履歴", "設定"];

export default function ProductPage() {
  const [active, setActive] = useState("業務を整理する");
  const [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState(false);
  const task = tasks[selected];

  return (
    <main className="productShell">
      <aside className="productSidebar">
        <a className="productBrand" href="/" aria-label="ととのえAI トップへ">
          <span>整</span><strong>ととのえAI<small>業務を、次に進める形へ。</small></strong>
        </a>
        <nav aria-label="プロダクトメニュー">
          {nav.map((item, index) => <button key={item} className={active === item ? "active" : ""} onClick={() => setActive(item)}><i>{["⌂", "✦", "◷", "⚙"][index]}</i>{item}</button>)}
        </nav>
        <div className="sidebarHelp"><b>困ったときは</b><span>入力途中でも、いつでも相談できます。</span><button>サポートを見る　→</button></div>
        <div className="profile"><span>KA</span><div><b>株式会社かわせみ</b><small>管理者</small></div><i>⌄</i></div>
      </aside>

      <section className="productMain">
        <header className="productHeader"><div><p>おかえりなさい、株式会社かわせみさん</p><h1>次に整える仕事を、決めましょう。</h1></div><div className="headerActions"><button className="notice" aria-label="お知らせ">●</button><button className="help">？ <span>使い方</span></button></div></header>

        <div className="progressLine" aria-label="業務整理の進捗"><span className="done"><i>✓</i> 困りごとを聞く</span><b></b><span className="now"><i>2</i> 業務を整理する</span><b></b><span><i>3</i> 次の一手を決める</span></div>

        <div className="productGrid">
          <section className="conversation" aria-label="業務の相談">
            <div className="sectionTitle"><div><p>業務の相談</p><h2>まず、何に時間がかかっていますか？</h2></div><span>約3分</span></div>
            <div className="message assistant"><i>整</i><div><b>ととのえAI</b><p>答えられるところだけで大丈夫です。今、いちばん手間に感じる仕事を教えてください。</p></div></div>
            <div className="quickChoices"><button>見積もり作成</button><button>受発注の転記</button><button>現場の日報</button><button>その他</button></div>
            <label className="messageBox"><textarea defaultValue="案件ごとに担当者がExcelで見積もりをつくっていて、過去の見積もりを探す時間もかかっています。" aria-label="困っていることを入力"/><button onClick={() => setSaved(true)} aria-label="内容を送信">↑</button></label>
            {saved && <p className="saved">保存しました。内容をもとに、整理案を更新しています。</p>}
          </section>

          <aside className="overview">
            <div className="overviewHead"><div><p>整理の途中経過</p><h2>いま分かっていること</h2></div><button aria-label="編集する">編集</button></div>
            <dl><div><dt>困っている場面</dt><dd>見積もり作成・過去案件の確認</dd></div><div><dt>関わる人</dt><dd>営業 3名／事務 2名</dd></div><div><dt>最初に目指す状態</dt><dd>誰でも同じ流れで見積もれる</dd></div></dl>
            <div className="confidence"><span>整理の進み具合</span><strong>60<small>%</small></strong><div><i></i></div><p>あと2つ答えると、概算の目安をお伝えできます。</p></div>
          </aside>
        </div>

        <section className="proposal" aria-label="提案の候補">
          <div className="proposalHead"><div><p>ととのえAIからの提案</p><h2>最初に整えるなら、この3つです。</h2></div><span>必要なら順番は変えられます</span></div>
          <div className="taskList">
            {tasks.map((item, index) => <button key={item.label} className={selected === index ? "task active" : "task"} onClick={() => setSelected(index)}><span className={`level ${item.level}`}>{item.level}</span><div><small>{item.label}</small><b>{item.title}</b><p>{item.detail}</p></div><i>{selected === index ? "✓" : "→"}</i></button>)}
          </div>
        </section>

        <section className="nextAction"><div><span>選択中の提案</span><h2>{task.title}</h2><p>この業務から始めた場合の、進め方・費用の目安・完成画面のイメージを確認できます。</p></div><button onClick={() => setSaved(true)}>この内容で提案を見る <b>→</b></button></section>
      </section>
    </main>
  );
}
