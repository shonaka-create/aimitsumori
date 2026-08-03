"use client";

import { useEffect, useMemo, useState } from "react";

const SEGMENTS: Record<string, { area: string; industry: string; pain: string; example: string; hero: string; lead: string; proof: string[] }> = {
  default: { area: "地域企業", industry: "事業会社", pain: "見積もりや業務改善", example: "受発注・日報・採用など", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["見積書の作成", "受発注の転記", "日報の集計", "採用記録の整理", "在庫の確認"] },
  "hiroshima-manufacturing": { area: "広島", industry: "製造業", pain: "見積もり・原価計算の属人化", example: "図面確認・原価計算・見積書作成", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["図面の確認", "原価計算", "見積書の作成", "納期の回答", "作業指示"] },
  "hiroshima-construction": { area: "広島", industry: "建設・設備工事", pain: "見積もり・現場管理の属人化", example: "見積積算・現場写真・協力会社との連絡", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["見積積算", "現場写真の整理", "協力会社への連絡", "進捗の共有", "報告書の作成"] },
  "hiroshima-wholesale": { area: "広島", industry: "卸売業", pain: "受発注と見積もりの手作業", example: "FAX受注・在庫確認・見積書作成", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["FAX受注の転記", "在庫の確認", "見積書の作成", "発注の依頼", "問い合わせ対応"] },
  "hiroshima-logistics": { area: "広島", industry: "物流・運送業", pain: "配車・連絡・実績管理の分断", example: "配車調整・運行報告・請求確認", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["配車の調整", "運行報告の回収", "ドライバーへの連絡", "請求の確認", "実績の集計"] },
  "hiroshima-care": { area: "広島", industry: "介護・福祉", pain: "記録・連絡・請求業務の負担", example: "ケア記録・申し送り・シフト・請求確認", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["ケア記録", "申し送り", "シフトの確認", "家族への連絡", "請求の確認"] },
  "hiroshima-travel": { area: "広島", industry: "旅行業", pain: "問い合わせ・手配・見積もり業務の属人化", example: "旅行見積もり・行程作成・手配状況の確認", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["旅行見積もりの作成", "行程表の作成", "手配状況の確認", "お客様への連絡", "精算・請求の確認"] },
  "kyoto-manufacturing": { area: "京都", industry: "製造業", pain: "見積もり・原価計算の属人化", example: "図面確認・原価計算・見積書作成", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["図面の確認", "原価計算", "見積書の作成", "納期の回答", "作業指示"] },
  "kyoto-construction": { area: "京都", industry: "建設・設備工事", pain: "見積もり・現場管理の属人化", example: "見積積算・現場写真・協力会社との連絡", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["見積積算", "現場写真の整理", "協力会社への連絡", "進捗の共有", "報告書の作成"] },
  "kyoto-wholesale": { area: "京都", industry: "卸売業", pain: "受発注と見積もりの手作業", example: "FAX受注・在庫確認・見積書作成", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["FAX受注の転記", "在庫の確認", "見積書の作成", "発注の依頼", "問い合わせ対応"] },
  "kyoto-logistics": { area: "京都", industry: "物流・運送業", pain: "配車・連絡・実績管理の分断", example: "配車調整・運行報告・請求確認", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["配車の調整", "運行報告の回収", "ドライバーへの連絡", "請求の確認", "実績の集計"] },
  "kyoto-care": { area: "京都", industry: "介護・福祉", pain: "記録・連絡・請求業務の負担", example: "ケア記録・申し送り・シフト・請求確認", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["ケア記録", "申し送り", "シフトの確認", "家族への連絡", "請求の確認"] },
  "kyoto-travel": { area: "京都", industry: "旅行業", pain: "問い合わせ・手配・見積もり業務の属人化", example: "旅行見積もり・行程作成・手配状況の確認", hero: "人が辞めても、仕事が止まらない会社へ。", lead: "見積もり・受発注・原価計算。担当者にしか分からない業務を、次の人へ渡せる仕組みに変えます。まずは、費用の目安を無料でお伝えします。", proof: ["旅行見積もりの作成", "行程表の作成", "手配状況の確認", "お客様への連絡", "精算・請求の確認"] },
};

const GOOGLE_FORM_URL = "https://forms.gle/pfphjZEzovXUQpCD9";
const GOOGLE_FORM_EMBED_URL = "https://docs.google.com/forms/d/e/1FAIpQLSc4mPrn7i6S2IGwwZSRzD9ZGEecsxO4sjWz3lkMehgR5skIGg/viewform?embedded=true";

const USE_CASES: Record<string, { from: string; to: string }> = {
  "製造業": { from: "図面を見られる人が限られ、見積もりの返事が遅れる", to: "見積条件をそろえ、過去案件をもとに概算を出す仕組み" },
  "建設・設備工事": { from: "現場写真や協力会社とのやりとりが散らばり、積算に時間がかかる", to: "現場情報と見積条件をまとめ、確認しやすくする仕組み" },
  "卸売業": { from: "FAX・電話の受注を転記し、在庫を確認してから見積もりを出している", to: "受注内容・在庫・見積もりをつなぎ、確認を減らす仕組み" },
  "物流・運送業": { from: "配車や運行報告が電話と紙に散らばり、状況確認に時間がかかる", to: "配車・連絡・実績を一つの流れで確認できる仕組み" },
  "介護・福祉": { from: "記録・申し送り・シフトの確認が重なり、利用者対応の時間が減っている", to: "必要な記録と連絡を整理し、現場の確認を減らす仕組み" },
  "旅行業": { from: "見積もり・行程作成・手配状況の確認が担当者ごとに分かれている", to: "旅行相談から手配・精算までの情報をつなぐ仕組み" },
  "事業会社": { from: "見積もりや受発注のやり方が担当者ごとに違い、引き継ぎに時間がかかる", to: "いつもの仕事を整理し、次の人へ渡せる仕組み" },
};

export default function Home({ initialTarget }: { initialTarget?: string }) {
  const [segmentKey, setSegmentKey] = useState("default");
  const [floatVisible, setFloatVisible] = useState(false);
  const [floatPulse, setFloatPulse] = useState(false);
  const [floatDismissed, setFloatDismissed] = useState(false);

  useEffect(() => { const key = initialTarget || new URLSearchParams(window.location.search).get("target") || "default"; if (SEGMENTS[key]) setSegmentKey(key); }, [initialTarget]);
  useEffect(() => {
    if (sessionStorage.getItem("ai-estimate:float-dismissed") === "1") { setFloatDismissed(true); return; }
    const footer = document.querySelector("footer"); let footerVisible = false; let lastPulse = 0; let timer: ReturnType<typeof setTimeout>;
    const sync = () => setFloatVisible(window.scrollY > 600 && !footerVisible);
    const onScroll = () => { sync(); if (window.scrollY > 600 && !footerVisible && !matchMedia("(prefers-reduced-motion: reduce)").matches && Date.now() - lastPulse > 900) { lastPulse = Date.now(); setFloatPulse(true); clearTimeout(timer); timer = setTimeout(() => setFloatPulse(false), 240); } };
    const observer = footer ? new IntersectionObserver(([entry]) => { footerVisible = entry.isIntersecting; sync(); }, { rootMargin: "0px 0px -10% 0px" }) : null;
    if (footer && observer) observer.observe(footer); window.addEventListener("scroll", onScroll, { passive: true }); sync();
    return () => { window.removeEventListener("scroll", onScroll); observer?.disconnect(); clearTimeout(timer); };
  }, []);

  const segment = useMemo(() => SEGMENTS[segmentKey], [segmentKey]);
  const useCase = USE_CASES[segment.industry] || USE_CASES["事業会社"];
  const caseExamples = [
    { category: "見積もり・判断", issue: useCase.from, proposal: useCase.to },
    { category: "情報の整理", issue: `${segment.proof[0]}と${segment.proof[1]}の確認に時間がかかり、対応状況が見えにくい。`, proposal: `${segment.proof[0]}と${segment.proof[1]}を、同じ流れで確認できる仕組み。` },
    { category: "引き継ぎ", issue: `${segment.proof[2]}の手順が担当者ごとに違い、次の人へ渡しにくい。`, proposal: `${segment.proof[2]}の手順をそろえ、誰でも確認できる仕組み。` },
  ];
  return <main>
    <header className="siteHeader"><div className="nav wrap"><a className="brand" href="#top" aria-label="会話型AI見積もりツール ホーム"><span className="brandMark" aria-hidden="true">AI</span><span>会話型AI見積もり<small>CONVERSATIONAL AI ESTIMATE</small></span></a><nav aria-label="ページ内メニュー"><a href="#benefits">相談でわかること</a><a href="#challenge">課題</a><a href="#solution">解決方法</a><a href="#flow">進め方</a><a href="#comparison">他との違い</a><a href="#faq">よくある質問</a><a className="navCta" href="#contact">無料で相談する <b>→</b></a></nav></div></header>

    <section className="hero" id="top"><div className="heroGlow" /><div className="wrap heroGrid"><div className="heroCopy"><p className="eyebrow">{segment.area} × {segment.industry}の業務改善</p><h1>{SEGMENTS.default.hero}</h1><p className="lead">まずは、お困りの業務を教えてください。AIと人が、仕組みにできる仕事・最初に整える業務・費用の目安を無料で整理します。</p><div className="trust"><span>✓ 相談無料</span><span>✓ 入力は約3分</span><span>✓ しつこい営業なし</span></div><p className="micro">何を作るか決まっていなくても、相談できます。</p></div><div className="googleEmbed" id="contact"><iframe title="無料相談フォーム" src={GOOGLE_FORM_EMBED_URL} loading="lazy" scrolling="yes" frameBorder="0">読み込んでいます…</iframe></div></div></section>

    <section className="benefits" id="benefits"><div className="wrap"><p className="eyebrow dark">無料相談で整理できること</p><h2>次に進むための、<em>3つの見通し</em>をつくります。</h2><div className="benefitGrid"><article><span>01</span><h3>業務の詰まりどころ</h3><p>時間がかかる作業や、特定の人に判断が集中している場面を整理します。</p></article><article><span>02</span><h3>最初に整える業務</h3><p>すべてを変えるのではなく、効果が出やすい一歩目を一緒に考えます。</p></article><article><span>03</span><h3>おおよその費用</h3><p>内容に応じて、無理なく始める場合の概算費用を幅をもってお伝えします。</p></article></div></div></section>

    <section className="proof"><div className="wrap proofInner"><div className="proofLabel"><p>まずは、困っている仕事を整理します</p><h2>{segment.area}の{segment.industry}なら、<em>{segment.example}</em>から見直せます。</h2></div><div className="proofTags">{segment.proof.map((item, index) => <div key={item}><b>0{index + 1}</b><span>{item}</span></div>)}</div></div></section>

    <section className="storyLead wrap section" id="challenge"><p className="eyebrow dark">今の業務を見直す</p><h2>こんな仕事が、<em>人に頼りきり</em>になっていませんか？</h2><p className="sectionLead">{segment.example}。いつもの仕事ほど、やり方が決まっているようで、実は担当者の経験に支えられています。まずは、時間がかかる仕事・確認が必要な仕事を整理します。</p></section>

    <section className="future section"><div className="wrap"><p className="eyebrow">そのままにすると</p><h2>仕事が<em>特定の人に残り続けます。</em></h2><div className="riskGrid"><article><span>01 / 返事が遅れる</span><h3>確認する人がいないと、次の対応へ進めない。</h3><p>担当者が不在だと見積もりや回答が止まり、対応のスピードが落ちます。</p></article><article><span>02 / 引き継げない</span><h3>経験で回していた仕事は、次の人へ渡りにくい。</h3><p>Excelや口頭に隠れたルールは、引き継ぎのたびに説明が必要になります。</p></article><article><span>03 / 改善が進まない</span><h3>目の前の仕事に追われ、仕組みを整える時間がない。</h3><p>忙しい状態が続くほど、改善したい仕事は後回しになります。</p></article></div></div></section>

    <section className="solutionStory wrap section" id="solution"><p className="eyebrow dark">私たちがすること</p><h2>まずは、<em>困っている仕事</em>を聞かせてください。</h2><p className="sectionLead">「何を作るか」が決まっていなくても大丈夫です。AIと人が、業務の流れと必要な機能を整理します。必要に応じて、画面イメージと概算費用もご提示します。</p><div className="uiShowcase"><figure><img src="/ai-image1.png" alt="AIが業務の困りごとを聞く会話画面" /><figcaption><b>01 / AIヒアリング</b><span>答えるほど、課題の輪郭が見えてきます</span></figcaption></figure><figure><img src="/ai-image2.png" alt="ヒアリング結果として概算見積もりと画面案が表示される結果画面" /><figcaption><b>02 / ご提案イメージ</b><span>概算費用と完成後の画面を確認できます</span></figcaption></figure></div><div className="caseLabel"><p>ご相談の例</p><h3>{segment.area}の{segment.industry}で想定する、最初の仕組み化</h3></div><div className="caseCarousel" aria-label="ご相談の例"><div className="caseTrack">{[...caseExamples, ...caseExamples].map((item, index) => <article className="caseCard" key={`${item.category}-${index}`} aria-hidden={index >= caseExamples.length}><span>{item.category}</span><p>「{item.issue}」</p><i>→</i><div><b>最初のご提案例</b><strong>{item.proposal}</strong></div></article>)}</div></div></section>

    <section className="flow section" id="flow"><div className="wrap"><p className="eyebrow">ご相談から提案までの流れ</p><h2>答えるだけで、解決のかたちが見えてくる。</h2><div className="steps timeline"><article><span>STEP 01</span><div className="stepIcon">？</div><h3>困りごとを教える</h3><p>業種や人数、いまの作業を選択式で回答。まとまった仕様書は不要です。</p></article><div className="flowArrow" aria-hidden="true"><i />→</div><article><span>STEP 02</span><div className="stepIcon">✦</div><h3>AIと人が整理する</h3><p>業務の流れを確認し、AIでできること・人が担うことを整理します。</p></article><div className="flowArrow" aria-hidden="true"><i />→</div><article><span>STEP 03</span><div className="stepIcon">¥</div><h3>概算と画面案を受け取る</h3><p>初期費用の目安と、完成後の画面イメージをご提案します。</p></article></div></div></section>

    <section className="comparison section" id="comparison"><div className="wrap"><p className="eyebrow dark">他の選択肢との違い</p><h2>既存の選択肢では、<em>相談の入口</em>が埋まらない。</h2><p className="sectionLead">何を作るか説明できる人向けのサービスはあります。けれど、困りごとを話すところから始め、要件・費用・画面案まで受け取れる選択肢は多くありません。</p><div className="landscapeFlow"><article><p>見積もりSaaS</p><h3>仕様を入力して、工数を出す。</h3><small>最初から必要な機能を整理できる会社向け。</small></article><article><p>AI開発サービス</p><h3>会話から、開発へ進む。</h3><small>業務に合わせた要件整理や伴走は、別途必要になりやすい。</small></article><article><p>簡易見積もりLP</p><h3>フォーム入力で、概算を出す。</h3><small>入力項目が決まっており、壁打ちや画面案には届きにくい。</small></article></div><div className="gapStatement"><div className="gapCopy"><span>困りごとを話すところから、一緒に整理します</span><strong>話してみる。<em>次にやること</em>が見えてくる。</strong></div><ul className="gapJourney"><li><i>話</i><div><b>困りごとを話す</b><p>仕様書がなくても大丈夫です。</p></div></li><li><i>整</i><div><b>業務を整理する</b><p>必要なことを、分かりやすくまとめます。</p></div></li><li><i>決</i><div><b>進め方を決める</b><p>費用の目安と、最初の一歩を確認します。</p></div></li></ul></div><p className="comparisonNote">※ 一般的な提供形態をもとにした整理です。各サービスの内容は変更される場合があります。</p></div></section>

    <section className="promise section"><div className="wrap promiseGrid"><div className="promiseIntro"><p className="eyebrow">ご相談で大切にすること</p><h2><em>業務に合う形</em>を、一緒に考えます。</h2><p>AIだけで結論を出しません。現場で使えるかを人が確認し、無理なく始められる形をご提案します。</p><a href="#contact">無料で困りごとを相談する <b>→</b></a></div><ol className="promiseReasons"><li><span>01</span><div><b>費用は、幅を持ってお伝えします。</b><p>要件で変わる費用を、最初からレンジでお伝えします。</p></div></li><li><span>02</span><div><b>人が、現場に合うかを確認します。</b><p>AIの提案を鵜呑みにせず、実際の業務で使えるかを一緒に確かめます。</p></div></li><li><span>03</span><div><b>小さな仕事から始められます。</b><p>大きな開発は前提にせず、効果が見えやすい業務から始めます。</p></div></li></ol></div></section>

    <section className="consultation section" id="consultation"><div className="wrap"><p className="eyebrow dark">ご相談の進め方</p><h2>まずは、<em>業務の話</em>を聞かせてください。</h2><div className="consultationGrid"><article><span>01</span><h3>約30分、お話を伺います</h3><p>困っている作業や、今のやり方をお聞きします。仕様書の準備は不要です。</p></article><article><span>02</span><h3>できることを整理します</h3><p>仕組みにする仕事、AIで補えること、概算費用の考え方を一緒に整理します。</p></article><article><span>03</span><h3>進め方は内容を見て決められます</h3><p>開発の依頼は必須ではありません。詳しい業務の共有前に、NDAを含めた進め方もご相談いただけます。</p></article></div><p className="operatorNote">オンラインで全国対応。現場確認が必要な場合は、地域に応じてご相談ください。</p></div></section>

    <section className="faq section" id="faq"><div className="wrap"><p className="eyebrow dark">よくあるご質問</p><h2>ご相談の前に</h2>{[["本当に無料ですか？", "初回のヒアリング、課題整理、概算見積もりまでは無料です。開発を依頼するかは、内容を見てから決められます。"],["まだ何を作りたいか決まっていません。", "問題ありません。「どの作業が大変か」から伺い、ツール化すべきかも含めて一緒に考えます。"],["地方でも対応できますか？", "オンラインで全国対応しています。現場確認が必要な場合は、地域に応じて個別にご相談します。"],["相談後に営業されませんか？", "ご希望のない継続的な営業連絡は行いません。見積もりだけのご相談も歓迎です。"]].map(([q, a]) => <details key={q} open><summary><b>Q.</b><span>{q}</span></summary><p><b>A.</b><span>{a}</span></p></details>)}</div></section>

    <section className="bottomCta"><div className="wrap"><p>課題がまとまっていなくても、大丈夫です。</p><h2>{segment.pain}を、一度整理してみませんか。</h2><a href={GOOGLE_FORM_URL} target="_blank" rel="noreferrer">無料相談を申し込む <b>→</b></a><small>入力は約3分・相談だけでもOK</small></div></section>
    {!floatDismissed && <aside className={`yFloat ${floatVisible ? "isVisible" : ""} ${floatPulse ? "isPulse" : ""}`} aria-label="無料相談へのご案内"><a className="floatLink floatContact" href={GOOGLE_FORM_URL} target="_blank" rel="noreferrer"><small>入力は約3分・相談無料</small><strong>無料相談を申し込む <b>→</b></strong></a><button className="floatClose" type="button" aria-label="バナーを閉じる" onClick={() => { setFloatVisible(false); setFloatDismissed(true); sessionStorage.setItem("ai-estimate:float-dismissed", "1"); }}>✕</button></aside>}
    <footer><div className="wrap footerInner"><div><a className="brand" href="#top">会話型AI見積もり <small>CONVERSATIONAL AI ESTIMATE</small></a><p>地域企業のための、伴走型AI業務改善</p></div><nav className="footerLinks" aria-label="フッターメニュー"><a href="#benefits">相談でわかること</a><a href="#challenge">課題</a><a href="#solution">解決方法</a><a href="#flow">進め方</a><a href="#comparison">他との違い</a><a href="#consultation">ご相談の進め方</a><a href="#faq">よくある質問</a><a href="#contact">無料相談</a></nav></div></footer>
  </main>;
}
