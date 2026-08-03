"use client";

import { useEffect, useMemo, useState } from "react";
import "./product.css";

type Menu = "ホーム" | "業務を整理する" | "相談履歴" | "設定";
type Task = { key: string; label: string; title: string; detail: string; level: "優先" | "次に" | "保留"; estimate: string; outcome: string };
type StoredDraft = { issue: string; topic: string; selected: number };
type HistoryItem = StoredDraft & { id: string; createdAt: number };

const STORAGE_KEY = "totonoe-ai-draft-v1";
const HISTORY_KEY = "totonoe-ai-history-v1";
const SETTING_KEY = "totonoe-ai-save-on-device";
const menu: { label: Menu; icon: string }[] = [{ label: "ホーム", icon: "⌂" }, { label: "業務を整理する", icon: "✦" }, { label: "相談履歴", icon: "◷" }, { label: "設定", icon: "⚙" }];
const baseTasks: Task[] = [
  { key: "estimate", label: "見積もり", title: "見積もり作成の流れをそろえる", detail: "案件情報の聞き取りから見積書作成まで、担当者ごとの差をなくします。", level: "優先", estimate: "まずは1〜2週間で、入力項目と見積もりの型を整理", outcome: "案件情報を一度入力すれば、必要な確認・見積書作成へ進める状態" },
  { key: "order", label: "受発注", title: "受発注の転記を減らす", detail: "メール・Excel・紙に散らばる情報を一度だけ入力する形に整理します。", level: "次に", estimate: "既存の帳票を見ながら、必要な情報を整理", outcome: "受注から発注まで、同じ情報を見ながら進められる状態" },
  { key: "report", label: "日報", title: "現場の日報をまとめる", detail: "現場の報告を集約し、進捗がひと目で分かる状態をつくります。", level: "保留", estimate: "現場の報告方法を確認して、無理のない入力方法を検討", outcome: "報告の集計を待たずに、現場の状況を確認できる状態" },
];

function recommend(issue: string, topic: string) {
  const source = `${issue} ${topic}`;
  const first = /受発注|転記|発注/.test(source) ? "order" : /日報|現場|報告/.test(source) ? "report" : "estimate";
  return [...baseTasks].sort((a, b) => Number(b.key === first) - Number(a.key === first)).map((task, index) => ({ ...task, level: index === 0 ? "優先" as const : index === 1 ? "次に" as const : "保留" as const }));
}
function currentGoal(issue: string) {
  if (!issue.trim()) return "困りごとを送ると、ここに目標が表示されます";
  if (/受発注|転記|発注/.test(issue)) return "入力が重ならず、受発注の状況を確認できる";
  if (/日報|現場|報告/.test(issue)) return "現場の状況を、集計を待たずに把握できる";
  return "誰でも同じ流れで、見積もりをつくれる";
}
function formatDate(value: number) { return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(value); }

export default function ProductPage() {
  const [active, setActive] = useState<Menu>("ホーム");
  const [issue, setIssue] = useState("");
  const [submittedIssue, setSubmittedIssue] = useState("");
  const [topic, setTopic] = useState("見積もり作成");
  const [selected, setSelected] = useState(0);
  const [notice, setNotice] = useState("");
  const [proposalOpen, setProposalOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saveOnDevice, setSaveOnDevice] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const recommendations = useMemo(() => recommend(submittedIssue || issue, topic), [submittedIssue, issue, topic]);
  const task = recommendations[Math.min(selected, recommendations.length - 1)];
  const isSubmitted = Boolean(submittedIssue);
  const titles: Record<Menu, { eyebrow: string; title: string }> = {
    "ホーム": { eyebrow: "ととのえAIへようこそ", title: "いまの業務を、少しずつ整えましょう。" },
    "業務を整理する": { eyebrow: "業務を整理する", title: "次に整える仕事を、決めましょう。" },
    "相談履歴": { eyebrow: "相談履歴", title: "これまでの整理内容を確認できます。" },
    "設定": { eyebrow: "設定", title: "保存方法を管理します。" },
  };

  useEffect(() => {
    try {
      const saving = window.localStorage.getItem(SETTING_KEY) !== "false";
      setSaveOnDevice(saving);
      if (saving) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        const savedHistory = window.localStorage.getItem(HISTORY_KEY);
        if (saved) { const draft = JSON.parse(saved) as StoredDraft; setIssue(draft.issue || ""); setSubmittedIssue(draft.issue || ""); setTopic(draft.topic || "見積もり作成"); setSelected(Math.max(0, Math.min(draft.selected || 0, 2))); }
        if (savedHistory) { const parsed = JSON.parse(savedHistory) as HistoryItem[]; setHistory(Array.isArray(parsed) ? parsed.slice(0, 20) : []); }
      }
    } catch { /* Local storage is optional. */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SETTING_KEY, String(saveOnDevice));
    if (!saveOnDevice) return;
    if (submittedIssue) window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ issue: submittedIssue, topic, selected }));
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [hydrated, saveOnDevice, submittedIssue, topic, selected, history]);

  const saveIssue = () => {
    const text = issue.trim();
    if (!text) { setNotice("まず、困っている仕事を入力してください。"); return; }
    setSubmittedIssue(text); setSelected(0); setProposalOpen(false);
    const entry: HistoryItem = { id: `${Date.now()}`, issue: text, topic, selected: 0, createdAt: Date.now() };
    setHistory((items) => [entry, ...items.filter((item) => item.issue !== text)].slice(0, 20));
    setNotice(saveOnDevice ? "内容を保存し、優先度つきの整理案を更新しました。" : "この画面を開いている間だけ、整理案を更新しました。");
  };
  const chooseTopic = (choice: string) => { setTopic(choice); setIssue(choice === "その他" ? "" : `${choice}に時間がかかっています。今のやり方を見直したいです。`); setNotice(""); };
  const openHistory = (item: HistoryItem) => { setIssue(item.issue); setSubmittedIssue(item.issue); setTopic(item.topic); setSelected(item.selected); setProposalOpen(false); setActive("業務を整理する"); setNotice("保存した相談内容を開きました。"); };
  const removeHistory = (id: string) => { setHistory((items) => items.filter((item) => item.id !== id)); setNotice("相談履歴を削除しました。"); };
  const clearAll = () => { [STORAGE_KEY, HISTORY_KEY].forEach((key) => window.localStorage.removeItem(key)); setHistory([]); setSubmittedIssue(""); setIssue(""); setTopic("その他"); setSelected(0); setProposalOpen(false); setNotice("この端末に保存していた内容を消去しました。"); };
  const changeSaving = (enabled: boolean) => { setSaveOnDevice(enabled); if (!enabled) { [STORAGE_KEY, HISTORY_KEY].forEach((key) => window.localStorage.removeItem(key)); setHistory([]); } setNotice(enabled ? "この端末への保存を有効にしました。" : "端末への保存を停止し、既存の保存内容を消去しました。"); };

  const Header = () => <header className="productHeader"><div><p>{titles[active].eyebrow}</p><h1>{titles[active].title}</h1></div><div className="headerActions"><button type="button" className="notice" onClick={() => setNotice("すべての入力内容は、この端末のブラウザ内だけに保存されます。")} aria-label="保存について">●</button><button type="button" className="help" onClick={() => { setActive("業務を整理する"); setNotice("困っている仕事を入力して送ると、内容に合わせて整理案が入れ替わります。"); }}>？ <span>使い方</span></button></div></header>;

  return <main className="productShell">
    <aside className="productSidebar">
      <a className="productBrand" href="/" aria-label="ととのえAI トップへ"><span>整</span><strong>ととのえAI<small>業務を、次に進める形へ。</small></strong></a>
      <nav aria-label="プロダクトメニュー">{menu.map((item) => <button type="button" key={item.label} className={active === item.label ? "active" : ""} onClick={() => { setActive(item.label); setNotice(""); }}><i>{item.icon}</i>{item.label}</button>)}</nav>
      <div className="sidebarHelp"><b>困ったときは</b><span>入力途中でも、いつでも相談できます。</span><button type="button" onClick={() => { setActive("業務を整理する"); setNotice("まずは、いちばん手間に感じる仕事を一つだけ入力してください。"); }}>業務を整理する　→</button></div>
      <div className="profile"><span>体</span><div><b>無料デモ</b><small>{saveOnDevice ? "ローカル保存モード" : "この画面だけで利用中"}</small></div><i>⌄</i></div>
    </aside>

    <section className="productMain"><Header />
      {notice && <p className="globalNotice" role="status">{notice}</p>}
      {active === "ホーム" && <section className="dashboardView">
        <div className="dashboardHero"><div><span>いまの整理状況</span><h2>{isSubmitted ? "次に進める準備ができています。" : "まずは、困っている仕事を一つ教えてください。"}</h2><p>{isSubmitted ? "入力内容から、最初に整える仕事と進め方を確認できます。" : "仕様書や正確な費用が分からなくても大丈夫です。答えられるところから始められます。"}</p></div><button type="button" onClick={() => setActive("業務を整理する")}>{isSubmitted ? "整理案を確認する" : "業務を整理する"}<b>→</b></button></div>
        <div className="dashboardStats"><article><small>整理の進み具合</small><strong>{proposalOpen ? "100" : isSubmitted ? "60" : "0"}<i>%</i></strong><span>{proposalOpen ? "進め方を確認済み" : isSubmitted ? "提案を確認できます" : "まだ入力がありません"}</span></article><article><small>保存した相談</small><strong>{history.length}<i>件</i></strong><span>{saveOnDevice ? "この端末に保存中" : "端末保存はオフです"}</span></article><article><small>最初に整える仕事</small><strong className="statTask">{isSubmitted ? task.label : "―"}</strong><span>{isSubmitted ? "優先度：優先" : "入力後に表示されます"}</span></article></div>
        <div className="dashboardGrid"><article className="dashboardPrimary"><p>いま取り組むこと</p><h2>{isSubmitted ? task.title : "困っている仕事を書き出す"}</h2><span>{isSubmitted ? task.detail : "「見積もり」「受発注」「日報」など、思いつく言葉だけでも始められます。"}</span><button type="button" onClick={() => setActive("業務を整理する")}>{isSubmitted ? "整理内容を開く" : "入力を始める"} →</button></article><article className="dashboardHistory"><p>最近の相談</p>{history.length ? <><strong>{history[0].topic}</strong><span>{history[0].issue}</span><button type="button" onClick={() => setActive("相談履歴")}>すべての履歴を見る　→</button></> : <><strong>まだ保存された相談はありません</strong><span>入力して送信すると、ここからいつでも再開できます。</span></>}</article></div>
      </section>}

      {active === "業務を整理する" && <>
        <div className="progressLine" aria-label="業務整理の進捗"><span className={isSubmitted ? "done" : "now"}><i>{isSubmitted ? "✓" : "1"}</i> 困りごとを聞く</span><b></b><span className={isSubmitted ? "now" : ""}><i>2</i> 業務を整理する</span><b></b><span className={proposalOpen ? "done" : ""}><i>{proposalOpen ? "✓" : "3"}</i> 次の一手を決める</span></div>
        <div className="productGrid"><section className="conversation" aria-label="業務の相談"><div className="sectionTitle"><div><p>業務の相談</p><h2>まず、何に時間がかかっていますか？</h2></div><span>約3分</span></div><div className="message assistant"><i>整</i><div><b>ととのえAI</b><p>答えられるところだけで大丈夫です。今、いちばん手間に感じる仕事を教えてください。</p></div></div><div className="quickChoices" aria-label="相談の例">{["見積もり作成", "受発注の転記", "現場の日報", "その他"].map((choice) => <button type="button" key={choice} className={topic === choice ? "chosen" : ""} onClick={() => chooseTopic(choice)}>{choice}</button>)}</div><label className="messageBox"><textarea value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="例：担当者によって見積もりの作り方が違い、引き継ぎに時間がかかる" aria-label="困っていることを入力"/><button type="button" onClick={saveIssue} aria-label="内容を送信">↑</button></label></section>
          <aside className="overview"><div className="overviewHead"><div><p>整理の途中経過</p><h2>いま分かっていること</h2></div><button type="button" onClick={() => document.querySelector<HTMLTextAreaElement>(".messageBox textarea")?.focus()}>編集</button></div><dl><div><dt>困っている場面</dt><dd>{isSubmitted ? topic : "まだ入力されていません"}</dd></div><div><dt>入力した内容</dt><dd>{isSubmitted ? submittedIssue : "困りごとを送ると、ここに整理されます"}</dd></div><div><dt>最初に目指す状態</dt><dd>{currentGoal(submittedIssue || issue)}</dd></div></dl><div className="confidence"><span>整理の進み具合</span><strong>{proposalOpen ? 100 : isSubmitted ? 60 : 20}<small>%</small></strong><div><i style={{ width: proposalOpen ? "100%" : isSubmitted ? "60%" : "20%" }}></i></div><p>{proposalOpen ? "最初の進め方を確認できます。" : isSubmitted ? "提案を選ぶと、最初の進め方を確認できます。" : "困っている仕事を送ると、整理案を作成します。"}</p></div></aside></div>
        <section className="proposal" aria-label="提案の候補"><div className="proposalHead"><div><p>ととのえAIからの整理案</p><h2>{isSubmitted ? "最初に整えるなら、この順番です。" : "入力すると、ここに整理案が表示されます。"}</h2></div><span>優先度はいつでも変えられます</span></div><div className="taskList">{isSubmitted ? recommendations.map((item, index) => <button type="button" key={item.key} className={selected === index ? "task active" : "task"} onClick={() => { setSelected(index); setProposalOpen(false); }}><span className={`level ${item.level}`}>{item.level}</span><div><small>{item.label}</small><b>{item.title}</b><p>{item.detail}</p></div><i>{selected === index ? "✓" : "→"}</i></button>) : <div className="emptyState"><i>整</i><strong>困っている仕事を送ると、整理案を表示します。</strong><span>入力内容に応じて、最初に取り組む仕事の順番を提案します。</span></div>}</div></section>
        <section className="nextAction"><div><span>選択中の提案</span><h2>{isSubmitted ? task.title : "まず、困っている仕事を入力してください。"}</h2><p>{isSubmitted ? "この業務から始めた場合の、進め方・費用の目安・完成画面のイメージを確認できます。" : "入力内容はこの端末にだけ保存され、外部へ送信されません。"}</p></div><button type="button" disabled={!isSubmitted} onClick={() => { setProposalOpen(true); setNotice("選択した業務の進め方を表示しました。"); }}>この内容で提案を見る <b>→</b></button></section>
        {proposalOpen && <section className="proposalDetail" aria-live="polite"><div><p>最初の進め方</p><h2>{task.title}</h2><span>{task.estimate}</span></div><ol><li><b>01</b><div><strong>いまの流れを確認する</strong><span>使っている帳票・Excel・連絡方法を、ありのまま整理します。</span></div></li><li><b>02</b><div><strong>必要な項目を絞る</strong><span>最初から全部は変えず、効果が見えやすい部分に絞ります。</span></div></li><li><b>03</b><div><strong>形にして試す</strong><span>{task.outcome}</span></div></li></ol><button type="button" onClick={() => setProposalOpen(false)}>提案を閉じる</button></section>}
      </>}

      {active === "相談履歴" && <section className="historyView"><div className="viewIntro"><span>この端末に保存された内容</span><p>保存した相談を選ぶと、業務整理を途中から再開できます。</p></div>{history.length ? <div className="historyList">{history.map((item) => <article key={item.id}><div><span>{formatDate(item.createdAt)}　／　{item.topic}</span><h2>{item.issue}</h2></div><div className="historyActions"><button type="button" onClick={() => openHistory(item)}>開く　→</button><button type="button" className="delete" onClick={() => removeHistory(item.id)} aria-label="この相談を削除">×</button></div></article>)}</div> : <div className="emptyView"><i>◷</i><strong>まだ保存した相談はありません。</strong><span>業務を整理する画面から入力を送ると、ここに履歴が追加されます。</span><button type="button" onClick={() => setActive("業務を整理する")}>業務を整理する　→</button></div>}</section>}

      {active === "設定" && <section className="settingsView"><article><div><span>データの保存</span><h2>この端末に入力内容を保存する</h2><p>オンにすると、ページを閉じても相談内容と提案の選択をこのブラウザに保存します。情報が外部に送信されることはありません。</p></div><label className="switch"><input type="checkbox" checked={saveOnDevice} onChange={(event) => changeSaving(event.target.checked)} /><i></i><b>{saveOnDevice ? "オン" : "オフ"}</b></label></article><article><div><span>保存済みのデータ</span><h2>相談履歴をすべて消去する</h2><p>この端末に保存された相談内容・選択した提案を削除します。この操作は元に戻せません。</p></div><button type="button" className="danger" onClick={clearAll}>すべて消去する</button></article><aside><b>無料デモについて</b><p>このデモはブラウザ内だけで動作します。共有・チーム利用・本格的なAI分析は、次の開発段階で追加できます。</p></aside></section>}
    </section>
  </main>;
}
