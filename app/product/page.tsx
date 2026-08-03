"use client";

import { useEffect, useMemo, useState } from "react";
import "./product.css";

type Menu = "ホーム" | "相談する" | "相談履歴" | "設定";
type Task = { key: string; label: string; title: string; detail: string; estimate: string; outcome: string };
type Draft = { issue: string; topic: string; selected: number };
type HistoryItem = Draft & { id: string; createdAt: number };
type Question = { prompt: string; hint: string; options: string[] };

const DRAFT_KEY = "totonoe-ai-draft-v1";
const HISTORY_KEY = "totonoe-ai-history-v1";
const SETTING_KEY = "totonoe-ai-save-on-device";
const menu: { label: Menu; icon: string }[] = [{ label: "ホーム", icon: "⌂" }, { label: "相談する", icon: "✦" }, { label: "相談履歴", icon: "◷" }, { label: "設定", icon: "⚙" }];
const tasks: Task[] = [
  { key: "estimate", label: "見積もり", title: "見積もりをそろえる", detail: "聞き取りから見積書まで。", estimate: "1〜2週間で型を整理", outcome: "誰でも同じ流れで見積もれる" },
  { key: "order", label: "受発注", title: "転記を減らす", detail: "同じ情報は一度だけ入力。", estimate: "帳票と入力項目を整理", outcome: "受注から発注まで追える" },
  { key: "report", label: "日報", title: "現場の状況をまとめる", detail: "報告を待たずに確認。", estimate: "報告方法を確認", outcome: "現場の状況がすぐ分かる" },
  { key: "handoff", label: "引き継ぎ", title: "引き継ぎの迷いを減らす", detail: "誰が見ても進められる形に。", estimate: "情報の置き場を整理", outcome: "担当が変わっても仕事が続く" },
];
const questionSets: Record<string, Question[]> = {
  "見積もり": [
    { prompt: "どこで手間がかかりますか？", hint: "いちばん近いものを選んでください。", options: ["過去の見積もりを探す", "条件を確認する", "原価を計算する", "見積書に転記する"] },
    { prompt: "いちばん困ることは？", hint: "現場で起きていることを選びます。", options: ["返事が遅れる", "担当者でやり方が違う", "引き継げない", "入力ミスが出る"] },
    { prompt: "最初に変えたいのは？", hint: "今の優先度で大丈夫です。", options: ["情報を一か所に集める", "入力項目をそろえる", "見積書をつくりやすくする", "まだ決められない"] },
  ],
  "受発注": [
    { prompt: "情報はどこから届きますか？", hint: "主な受け取り方を選んでください。", options: ["メール", "電話・FAX", "Excel", "複数に分かれている"] },
    { prompt: "何に時間がかかりますか？", hint: "日々の作業で近いものを選びます。", options: ["内容を転記する", "在庫を確認する", "担当者に確認する", "進捗を確認する"] },
    { prompt: "最初に変えたいのは？", hint: "今の優先度で大丈夫です。", options: ["一度だけ入力する", "確認を減らす", "状況を見える化する", "まだ決められない"] },
  ],
  "日報": [
    { prompt: "日報はどう集めていますか？", hint: "主な方法を選んでください。", options: ["紙", "LINE・チャット", "Excel", "担当者ごとに違う"] },
    { prompt: "何が困りますか？", hint: "いちばん近いものを選んでください。", options: ["集計に時間がかかる", "状況が見えない", "記入漏れがある", "確認が遅れる"] },
    { prompt: "最初に変えたいのは？", hint: "今の優先度で大丈夫です。", options: ["入力を簡単にする", "一覧で確認する", "報告の形をそろえる", "まだ決められない"] },
  ],
  "その他": [
    { prompt: "どんな場面の仕事ですか？", hint: "近いものを選んでください。", options: ["問い合わせ対応", "情報の転記", "予定・進捗の確認", "社内の引き継ぎ"] },
    { prompt: "何が困りますか？", hint: "いちばん近いものを選んでください。", options: ["時間がかかる", "人によって違う", "確認が多い", "状況が見えない"] },
    { prompt: "最初に変えたいのは？", hint: "今の優先度で大丈夫です。", options: ["情報を集める", "入力を減らす", "進め方をそろえる", "まだ決められない"] },
  ],
};

function recommend(issue: string, topic: string) {
  const source = `${issue} ${topic}`;
  const first = /受発注|転記|発注/.test(source) ? "order" : /日報|現場|報告/.test(source) ? "report" : /引き継ぎ|問い合わせ/.test(source) ? "handoff" : "estimate";
  return [...tasks].sort((a, b) => Number(b.key === first) - Number(a.key === first));
}
function date(value: number) { return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(value); }

export default function ProductPage() {
  const [active, setActive] = useState<Menu>("ホーム");
  const [issue, setIssue] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [topic, setTopic] = useState("");
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [freeInput, setFreeInput] = useState("");
  const [selected, setSelected] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saveOnDevice, setSaveOnDevice] = useState(true);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const suggestions = useMemo(() => recommend(submitted || issue, topic), [submitted, issue, topic]);
  const current = suggestions[Math.min(selected, suggestions.length - 1)];
  const hasDraft = Boolean(submitted);
  const questions = questionSets[topic] || [];
  const currentQuestion = questions[questionIndex];
  const answerSummary = answers.length ? answers : (submitted.split("：")[1]?.split("／") || []);

  useEffect(() => {
    try {
      const canSave = window.localStorage.getItem(SETTING_KEY) !== "false";
      setSaveOnDevice(canSave);
      if (canSave) {
        const draft = window.localStorage.getItem(DRAFT_KEY);
        const records = window.localStorage.getItem(HISTORY_KEY);
        if (draft) { const data = JSON.parse(draft) as Draft; setIssue(data.issue || ""); setSubmitted(data.issue || ""); setTopic(data.topic || "見積もり"); setSelected(Math.max(0, Math.min(data.selected || 0, tasks.length - 1))); }
        if (records) { const data = JSON.parse(records) as HistoryItem[]; setHistory(Array.isArray(data) ? data : []); }
      }
    } catch { /* Local storage is optional. */ }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(SETTING_KEY, String(saveOnDevice));
    if (!saveOnDevice) return;
    if (submitted) window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ issue: submitted, topic, selected }));
    else window.localStorage.removeItem(DRAFT_KEY);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [hydrated, saveOnDevice, submitted, topic, selected, history]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(""), 2800); return () => window.clearTimeout(timer); }, [toast]);

  const detectTopic = (text: string) => /受発注|発注|転記|注文/.test(text) ? "受発注" : /日報|現場|報告/.test(text) ? "日報" : /見積|原価|案件/.test(text) ? "見積もり" : "その他";
  const startInterview = (text: string) => {
    const entry = text.trim();
    if (!entry) { setToast("困っている仕事を入力してください"); return; }
    setTopic(detectTopic(entry)); setQuestionIndex(0); setAnswers([entry]); setFreeInput(""); setIssue(""); setSubmitted(""); setSelected(0); setSaved(false);
  };
  const answerQuestion = (answer: string) => {
    const nextAnswers = [...answers, answer];
    if (questionIndex < questions.length - 1) { setAnswers(nextAnswers); setQuestionIndex((value) => value + 1); return; }
    const summary = `${topic}：${nextAnswers.join("／")}`;
    setAnswers(nextAnswers); setIssue(summary); setSubmitted(summary); setSelected(0); setSaved(false);
    const item: HistoryItem = { id: String(Date.now()), issue: summary, topic, selected: 0, createdAt: Date.now() };
    setHistory((items) => [item, ...items.filter((entry) => entry.issue !== summary)].slice(0, 20));
    setToast(saveOnDevice ? "整理しました" : "整理しました（この画面を閉じると消えます）");
  };
  const goBack = () => {
    if (questionIndex > 0) { setAnswers((value) => value.slice(0, -1)); setQuestionIndex((value) => value - 1); return; }
    setTopic(""); setQuestionIndex(-1); setAnswers([]);
  };
  const restart = () => { setTopic(""); setQuestionIndex(-1); setAnswers([]); setFreeInput(""); setIssue(""); setSubmitted(""); setSaved(false); };
  const open = (item: HistoryItem) => { setIssue(item.issue); setSubmitted(item.issue); setTopic(item.topic); setQuestionIndex(-1); setAnswers([]); setSelected(item.selected); setSaved(false); setActive("相談する"); };
  const clearAll = () => { [DRAFT_KEY, HISTORY_KEY].forEach((key) => window.localStorage.removeItem(key)); setHistory([]); restart(); setToast("消去しました"); };
  const changeSaving = (enabled: boolean) => { setSaveOnDevice(enabled); if (!enabled) { [DRAFT_KEY, HISTORY_KEY].forEach((key) => window.localStorage.removeItem(key)); setHistory([]); } setToast(enabled ? "この端末に保存します" : "端末保存を停止しました"); };
  const title: Record<Menu, string> = { "ホーム": "次にやること", "相談する": "相談する", "相談履歴": "相談履歴", "設定": "設定" };

  return <main className="productShell">
    <aside className="productSidebar"><a className="productBrand" href="/" aria-label="ととのえAI トップへ"><img src="/favicon.svg" alt="" /><b>ととのえAI</b></a><nav>{menu.map((item) => <button type="button" key={item.label} className={active === item.label ? "active" : ""} onClick={() => setActive(item.label)}><i>{item.icon}</i>{item.label}</button>)}</nav><small className="localStatus">{saveOnDevice ? "この端末に保存中" : "保存しない"}</small></aside>
    <section className="productMain"><header className="productHeader"><h1>{title[active]}</h1><button type="button" className="help" onClick={() => { setActive("相談する"); setToast("選択肢を選ぶだけで相談できます"); }}>？</button></header>
      {active === "ホーム" && <section className="homeView"><div className="homeHero"><span>{hasDraft ? "いま決めること" : "はじめる"}</span><h2>{hasDraft ? current.title : "困っている仕事を、ひとつ。"}</h2><p>{hasDraft ? current.detail : "仕様書はいりません。"}</p><button type="button" onClick={() => setActive("相談する")}>{hasDraft ? "続きを開く" : "相談を始める"}<b>→</b></button></div><div className="homeGrid"><article><span>進み具合</span><strong>{saved ? "100" : hasDraft ? "60" : "0"}<i>%</i></strong></article><article><span>保存した相談</span><strong>{history.length}<i>件</i></strong></article><article><span>まずやること</span><strong className="word">{hasDraft ? current.label : "―"}</strong></article></div>{history.length > 0 && <button type="button" className="recent" onClick={() => setActive("相談履歴")}><span>最近の相談</span><b>{history[0].topic}</b><i>→</i></button>}</section>}
      {active === "相談する" && <section className="workView">
        {!hasDraft && <div className="consultation">
          <div className="consultationTop"><span>AIヒアリング</span>{topic && <button type="button" onClick={goBack}>← 戻る</button>}</div>
          <div className="chatLog">
            <div className="botBubble"><i>整</i><p>こんにちは。まず、困っている仕事をそのまま教えてください。</p></div>
            {answers[0] && <div className="userBubble">{answers[0]}</div>}
            {questions.slice(0, Math.max(0, questionIndex)).map((question, index) => <div className="chatPair" key={question.prompt}><div className="botBubble"><i>整</i><p>{question.prompt}</p></div><div className="userBubble">{answers[index + 1]}</div></div>)}
            {topic && currentQuestion && <div className="currentQuestion"><div className="botBubble"><i>整</i><div><p>{currentQuestion.prompt}</p><small>{currentQuestion.hint}</small></div></div><div className="chatChoices">{currentQuestion.options.map((option) => <button type="button" key={option} onClick={() => answerQuestion(option)}>{option}</button>)}</div></div>}
          </div>
          {!topic && <div className="chatInput"><textarea value={freeInput} onChange={(event) => setFreeInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); startInterview(freeInput); } }} placeholder="例：受発注の転記に時間がかかっている" aria-label="困っている仕事を入力" /><button type="button" onClick={() => startInterview(freeInput)}>送信</button><div>{["見積もり作成", "受発注の転記", "日報の集計", "引き継ぎ"].map((example) => <button type="button" key={example} onClick={() => startInterview(example)}>{example}</button>)}</div></div>}
          {topic && <div className="chatStatus"><span>ヒアリング {questionIndex + 1} / {questions.length}</span><i style={{ width: `${((questionIndex + 1) / questions.length) * 100}%` }} /></div>}
        </div>}
        {hasDraft && <div className="diagnosis"><header><div><span>診断結果</span><h2>まずやることを、整理しました。</h2></div><button type="button" className="restart" onClick={restart}>別の相談をする</button></header><div className="answerSummary"><span>今回のお困りごと</span><b>{topic || "仕事の相談"}</b><p>{answerSummary.length ? answerSummary.join("　›　") : submitted}</p></div><div className="diagnosisGrid"><article className="diagnosisMain"><span>最初に始めるなら</span><h3>{current.title}</h3><p>{current.detail}</p><strong>{current.estimate}</strong><small>※ 正式な費用・期間は無料相談後にご案内します。</small></article><article className="diagnosisFeatures"><span>こう変えられます</span><ul><li>情報の確認場所を減らす</li><li>担当者ごとの差を小さくする</li><li>{current.outcome}</li></ul></article></div><section className="otherStarts"><span>ほかの始め方</span><div>{suggestions.map((item, index) => <button type="button" key={item.key} className={selected === index ? "active" : ""} onClick={() => { setSelected(index); setSaved(false); }}><b>{item.title}</b><small>{selected === index ? "選択中" : "切り替える"}</small></button>)}</div></section><section className="mockProposal"><div><span>画面モック案</span><h3>実際に使う画面のイメージ</h3><p>ご相談内容に合わせた画面案を、無料相談でご提案します。</p><button type="button" onClick={() => setToast("画面モック案は、無料相談でご提案します")}>画面モック案を出す（準備中）</button></div><div className="mockTiles"><b>入力</b><b>確認</b><b>一覧</b></div></section><div className="diagnosisActions"><a href="/?from=product-consultation#contact">無料相談を予約する <b>→</b></a><a href="/?from=product-pdf#contact">見積書PDFを受け取る <b>→</b></a></div></div>}
      </section>}
      {active === "相談履歴" && <section className="historyView">{history.length ? <div className="historyList">{history.map((item) => <button type="button" key={item.id} onClick={() => open(item)}><span>{date(item.createdAt)}　{item.topic}</span><b>{item.issue}</b><i>→</i></button>)}</div> : <div className="empty"><i>◷</i><b>まだありません</b><button type="button" onClick={() => setActive("相談する")}>相談を始める　→</button></div>}</section>}
      {active === "設定" && <section className="settingsView"><div><span>データの保存</span><label className="switch"><b>この端末に保存する</b><input type="checkbox" checked={saveOnDevice} onChange={(event) => changeSaving(event.target.checked)} /><i></i></label></div><div><span>保存したデータ</span><button type="button" className="danger" onClick={clearAll}>すべて消去する</button></div></section>}
      {toast && <p className="toast" role="status">{toast}</p>}
    </section>
  </main>;
}
