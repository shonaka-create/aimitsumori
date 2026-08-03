"use client";

import { useEffect, useMemo, useState } from "react";
import "./product.css";

type Task = { key: string; label: string; title: string; detail: string; level: "優先" | "次に" | "保留"; estimate: string; outcome: string };
type StoredDraft = { issue: string; topic: string; selected: number };

const STORAGE_KEY = "totonoe-ai-draft-v1";
const nav = ["ホーム", "業務を整理する", "相談履歴", "設定"];
const baseTasks: Task[] = [
  { key: "estimate", label: "見積もり", title: "見積もり作成の流れをそろえる", detail: "案件情報の聞き取りから見積書作成まで、担当者ごとの差をなくします。", level: "優先", estimate: "まずは1〜2週間で、入力項目と見積もりの型を整理", outcome: "案件情報を一度入力すれば、必要な確認・見積書作成へ進める状態" },
  { key: "order", label: "受発注", title: "受発注の転記を減らす", detail: "メール・Excel・紙に散らばる情報を一度だけ入力する形に整理します。", level: "次に", estimate: "既存の帳票を見ながら、必要な情報を整理", outcome: "受注から発注まで、同じ情報を見ながら進められる状態" },
  { key: "report", label: "日報", title: "現場の日報をまとめる", detail: "現場の報告を集約し、進捗がひと目で分かる状態をつくります。", level: "保留", estimate: "現場の報告方法を確認して、無理のない入力方法を検討", outcome: "報告の集計を待たずに、現場の状況を確認できる状態" },
];

function recommend(issue: string, topic: string) {
  const lower = `${issue} ${topic}`;
  const first = lower.includes("受発注") || lower.includes("転記") || lower.includes("発注") ? "order" : lower.includes("日報") || lower.includes("現場") || lower.includes("報告") ? "report" : "estimate";
  const sorted = [...baseTasks].sort((a, b) => Number(b.key === first) - Number(a.key === first));
  return sorted.map((task, index) => ({ ...task, level: index === 0 ? "優先" as const : index === 1 ? "次に" as const : "保留" as const }));
}

function currentGoal(issue: string) {
  if (!issue.trim()) return "困りごとを送ると、ここに目標が表示されます";
  if (/受発注|転記|発注/.test(issue)) return "入力が重ならず、受発注の状況を確認できる";
  if (/日報|現場|報告/.test(issue)) return "現場の状況を、集計を待たずに把握できる";
  return "誰でも同じ流れで、見積もりをつくれる";
}

export default function ProductPage() {
  const [active, setActive] = useState("業務を整理する");
  const [issue, setIssue] = useState("");
  const [submittedIssue, setSubmittedIssue] = useState("");
  const [topic, setTopic] = useState("見積もり作成");
  const [selected, setSelected] = useState(0);
  const [notice, setNotice] = useState("");
  const [proposalOpen, setProposalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const recommendations = useMemo(() => recommend(submittedIssue || issue, topic), [submittedIssue, issue, topic]);
  const task = recommendations[Math.min(selected, recommendations.length - 1)];
  const isSubmitted = Boolean(submittedIssue);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as StoredDraft;
        setIssue(draft.issue || issue);
        setSubmittedIssue(draft.issue || "");
        setTopic(draft.topic || "見積もり作成");
        setSelected(Math.max(0, Math.min(draft.selected || 0, 2)));
      }
    } catch { /* Local-only storage is optional. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !submittedIssue) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ issue: submittedIssue, topic, selected }));
  }, [hydrated, submittedIssue, topic, selected]);

  const saveIssue = () => {
    const text = issue.trim();
    if (!text) { setNotice("まず、困っている仕事を入力してください。"); return; }
    setSubmittedIssue(text);
    setSelected(0);
    setProposalOpen(false);
    setNotice("内容を保存しました。優先度つきの整理案を更新しました。");
  };
  const chooseTopic = (choice: string) => {
    setTopic(choice);
    setIssue(choice === "その他" ? "" : `${choice}に時間がかかっています。今のやり方を見直したいです。`);
    setNotice("");
  };
  const clearDraft = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setSubmittedIssue(""); setIssue(""); setTopic("その他"); setSelected(0); setProposalOpen(false);
    setNotice("この端末に保存していた内容を消去しました。");
  };

  return <main className="productShell">
    <aside className="productSidebar">
      <a className="productBrand" href="/" aria-label="ととのえAI トップへ"><span>整</span><strong>ととのえAI<small>業務を、次に進める形へ。</small></strong></a>
      <nav aria-label="プロダクトメニュー">{nav.map((item, index) => <button type="button" key={item} className={active === item ? "active" : ""} onClick={() => setActive(item)}><i>{["⌂", "✦", "◷", "⚙"][index]}</i>{item}</button>)}</nav>
      <div className="sidebarHelp"><b>この画面でできること</b><span>入力内容はこの端末だけに保存されます。外部へ送信されません。</span><button type="button" onClick={clearDraft}>保存内容を消去　→</button></div>
      <div className="profile"><span>体</span><div><b>無料デモ</b><small>ローカル保存モード</small></div><i>⌄</i></div>
    </aside>

    <section className="productMain">
      <header className="productHeader"><div><p>{active === "業務を整理する" ? "業務を整理する" : active}</p><h1>次に整える仕事を、決めましょう。</h1></div><div className="headerActions"><button type="button" className="notice" aria-label="お知らせ">●</button><button type="button" className="help" onClick={() => setNotice("困っている仕事を入力して送ると、内容に合わせて整理案が入れ替わります。")}>？ <span>使い方</span></button></div></header>

      <div className="progressLine" aria-label="業務整理の進捗"><span className={isSubmitted ? "done" : "now"}><i>{isSubmitted ? "✓" : "1"}</i> 困りごとを聞く</span><b></b><span className={isSubmitted ? "now" : ""}><i>2</i> 業務を整理する</span><b></b><span className={proposalOpen ? "done" : ""}><i>{proposalOpen ? "✓" : "3"}</i> 次の一手を決める</span></div>

      <div className="productGrid">
        <section className="conversation" aria-label="業務の相談">
          <div className="sectionTitle"><div><p>業務の相談</p><h2>まず、何に時間がかかっていますか？</h2></div><span>約3分</span></div>
          <div className="message assistant"><i>整</i><div><b>ととのえAI</b><p>答えられるところだけで大丈夫です。今、いちばん手間に感じる仕事を教えてください。</p></div></div>
          <div className="quickChoices" aria-label="相談の例">{["見積もり作成", "受発注の転記", "現場の日報", "その他"].map(choice => <button type="button" key={choice} className={topic === choice ? "chosen" : ""} onClick={() => chooseTopic(choice)}>{choice}</button>)}</div>
          <label className="messageBox"><textarea value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="例：担当者によって見積もりの作り方が違い、引き継ぎに時間がかかる" aria-label="困っていることを入力"/><button type="button" onClick={saveIssue} aria-label="内容を送信">↑</button></label>
          {notice && <p className="saved" role="status">{notice}</p>}
        </section>

        <aside className="overview">
          <div className="overviewHead"><div><p>整理の途中経過</p><h2>いま分かっていること</h2></div><button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>(".messageBox textarea")?.focus()}>編集</button></div>
          <dl><div><dt>困っている場面</dt><dd>{isSubmitted ? topic : "まだ入力されていません"}</dd></div><div><dt>入力した内容</dt><dd>{isSubmitted ? submittedIssue : "困りごとを送ると、ここに整理されます"}</dd></div><div><dt>最初に目指す状態</dt><dd>{currentGoal(submittedIssue || issue)}</dd></div></dl>
          <div className="confidence"><span>整理の進み具合</span><strong>{proposalOpen ? 100 : isSubmitted ? 60 : 20}<small>%</small></strong><div><i style={{ width: proposalOpen ? "100%" : isSubmitted ? "60%" : "20%" }}></i></div><p>{proposalOpen ? "最初の進め方を確認できます。" : isSubmitted ? "提案を選ぶと、最初の進め方を確認できます。" : "困っている仕事を送ると、整理案を作成します。"}</p></div>
        </aside>
      </div>

      <section className="proposal" aria-label="提案の候補">
        <div className="proposalHead"><div><p>ととのえAIからの整理案</p><h2>{isSubmitted ? "最初に整えるなら、この順番です。" : "入力すると、ここに整理案が表示されます。"}</h2></div><span>優先度はいつでも変えられます</span></div>
        <div className="taskList">{isSubmitted ? recommendations.map((item, index) => <button type="button" key={item.key} className={selected === index ? "task active" : "task"} onClick={() => { setSelected(index); setProposalOpen(false); }}><span className={`level ${item.level}`}>{item.level}</span><div><small>{item.label}</small><b>{item.title}</b><p>{item.detail}</p></div><i>{selected === index ? "✓" : "→"}</i></button>) : <div className="emptyState"><i>整</i><strong>困っている仕事を送ると、整理案を表示します。</strong><span>入力内容に応じて、最初に取り組む仕事の順番を提案します。</span></div>}</div>
      </section>

      <section className="nextAction"><div><span>選択中の提案</span><h2>{isSubmitted ? task.title : "まず、困っている仕事を入力してください。"}</h2><p>{isSubmitted ? "この業務から始めた場合の、進め方・費用の目安・完成画面のイメージを確認できます。" : "入力内容はこの端末にだけ保存され、外部へ送信されません。"}</p></div><button type="button" disabled={!isSubmitted} onClick={() => { setProposalOpen(true); setNotice("選択した業務の進め方を表示しました。"); }}>この内容で提案を見る <b>→</b></button></section>
      {proposalOpen && <section className="proposalDetail" aria-live="polite"><div><p>最初の進め方</p><h2>{task.title}</h2><span>{task.estimate}</span></div><ol><li><b>01</b><div><strong>いまの流れを確認する</strong><span>使っている帳票・Excel・連絡方法を、ありのまま整理します。</span></div></li><li><b>02</b><div><strong>必要な項目を絞る</strong><span>最初から全部は変えず、効果が見えやすい部分に絞ります。</span></div></li><li><b>03</b><div><strong>形にして試す</strong><span>{task.outcome}</span></div></li></ol><button type="button" onClick={() => setProposalOpen(false)}>提案を閉じる</button></section>}
    </section>
  </main>;
}
