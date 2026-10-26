"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowDownToLine, ArrowRight, ArrowUpRight, BookOpen, Bookmark, CalendarDays, Check, ChevronDown, CircleHelp, CodeXml, Compass, Copy, ExternalLink, EyeOff, Globe2, Layers3, Lightbulb, Menu, Search, Share2, Shield, Sparkles, Undo2, X } from "lucide-react";
import { categories, topicLabel, zones, type TopicId } from "@/lib/taxonomy";
import { categoryLabel, filterKnowledge, getArchiveDates, shareUrl, type KnowledgeCard } from "@/lib/knowledge";
import { hideCard, toggleSaved } from "@/lib/preferences";
import { downloadPoster } from "@/lib/poster";
import { usePreferences } from "@/hooks/use-preferences";

const zoneIcons = { ai: Sparkles, defense: Shield, context: Globe2 };

function KnowledgeOrbit() {
  return <svg className="knowledge-orbit" viewBox="0 0 240 180" aria-hidden="true">
    <ellipse cx="120" cy="90" rx="101" ry="43" transform="rotate(-28 120 90)" />
    <ellipse cx="120" cy="90" rx="101" ry="43" transform="rotate(28 120 90)" />
    <ellipse cx="120" cy="90" rx="43" ry="78" />
    <circle cx="120" cy="90" r="27" className="orbit-center" />
    <path d="M108 80h9c3 0 4 2 4 4v20c-2-3-4-4-7-4h-6zm25 0h-8c-3 0-4 2-4 4v20c2-3 4-4 7-4h5z" className="orbit-book" />
    <circle cx="38" cy="58" r="7" className="orbit-dot" /><circle cx="195" cy="124" r="8" className="orbit-dot light" /><circle cx="137" cy="19" r="5" className="orbit-dot" />
  </svg>;
}

interface CardProps {
  card: KnowledgeCard;
  saved: boolean;
  onSave: () => void;
  onHide: () => void;
  onRead: () => void;
  onShare: () => void;
}

function KnowledgeTile({ card, saved, onSave, onHide, onRead, onShare }: CardProps) {
  const Icon = card.zone ? zoneIcons[card.zone] : card.category === "life" ? Lightbulb : Layers3;
  return <article className={`knowledge-card ${card.zone ? `zone-${card.zone}` : card.category}`} data-card-id={card.id}>
    <div className="card-topline"><span className="category-badge"><Icon size={14} />{categoryLabel(card)}</span>{card.zone && <span className="zone-label">{zones.find((zone) => zone.id === card.zone)?.label}</span>}<span className="read-time">1 分钟</span></div>
    <h3><button onClick={onRead}>{card.title}</button></h3>
    <p className="card-summary">{card.summary}</p>
    <div className="card-tags">{card.tags.slice(0, 2).map((tag) => <span key={tag}>#{tag}</span>)}</div>
    <div className="card-source"><span className="source-dot" />{card.sources[0]?.name}<ArrowUpRight size={12} aria-hidden="true" /></div>
    <div className="card-footer"><button className="read-button" onClick={onRead}>读一读 <ArrowRight size={14} /></button><div className="card-actions">
      <button className={saved ? "icon-button saved" : "icon-button"} aria-pressed={saved} aria-label={`收藏：${card.title}`} title={saved ? "取消收藏" : "收藏"} onClick={onSave}><Bookmark size={17} fill={saved ? "currentColor" : "none"} /></button>
      <button className="icon-button" aria-label={`分享：${card.title}`} title="分享见识" onClick={onShare}><Share2 size={17} /></button>
      <button className="icon-button" aria-label={`不感兴趣：${card.title}`} title="不感兴趣" onClick={onHide}><EyeOff size={17} /></button>
    </div></div>
  </article>;
}

function CardDialog({ card, saved, onClose, onSave, onCopy, onPoster, shareOnly = false }: {
  card: KnowledgeCard;
  saved: boolean;
  onClose: () => void;
  onSave: () => void;
  onCopy: () => void;
  onPoster: () => void;
  shareOnly?: boolean;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  return <dialog ref={dialogRef} className="card-dialog" aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
    <button className="icon-button dialog-close" aria-label="关闭阅读窗口" onClick={onClose}><X size={21} /></button>
    <div className="dialog-eyebrow"><BookOpen size={16} />{shareOnly ? "把见识分享出去" : categoryLabel(card)}<span>示例归档 {card.archiveDate}</span></div>
    <h2 id="dialog-title">{card.title}</h2>
    <p className="dialog-summary">{card.summary}</p>
    <aside className="takeaway"><Lightbulb size={20} /><div><strong>记住这一点</strong><p>{card.takeaway}</p></div></aside>
    <div className="dialog-sources"><strong>继续求证</strong>{card.sources.map((source) => <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.url}>{source.name}<ExternalLink size={14} /></a>)}</div>
    <div className="dialog-actions"><button className="primary-button" onClick={onSave} aria-pressed={saved}><Bookmark size={16} />{saved ? "已收藏" : "收藏见识"}</button><button className="secondary-button" onClick={onCopy}><Copy size={16} />复制链接</button><button className="secondary-button" onClick={onPoster}><ArrowDownToLine size={16} />下载海报</button></div>
    <p className="dialog-footnote">种子知识用于首版演示。来源可查，阅读时请留意适用条件。</p>
  </dialog>;
}

export function KnowledgeApp({ cards }: { cards: KnowledgeCard[] }) {
  const dates = getArchiveDates(cards);
  const [date, setDate] = useState(dates[0] ?? "all");
  const [topic, setTopic] = useState<TopicId>("all");
  const [query, setQuery] = useState("");
  const [savedOnly, setSavedOnly] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mode, setMode] = useState<"local" | "web">("local");
  const [shareCard, setShareCard] = useState<KnowledgeCard | null>(null);
  const [notice, setNotice] = useState("");
  const [posterBusy, setPosterBusy] = useState(false);
  const { preferences, update } = usePreferences();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const cardId = searchParams.get("card");
  const openedCard = cards.find((card) => card.id === cardId);
  const selectedCard = shareCard ?? openedCard;
  const filtered = filterKnowledge(cards, { query, topic, date, savedOnly, saved: preferences.saved, hidden: preferences.hidden });
  const savedCount = cards.filter((card) => preferences.saved.includes(card.id)).length;
  const hiddenCount = cards.filter((card) => preferences.hidden.includes(card.id)).length;

  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName;
      if (event.key === "/" && !["INPUT", "TEXTAREA"].includes(tag) && !document.querySelector("dialog[open]")) {
        event.preventDefault(); inputRef.current?.focus();
      }
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  function chooseTopic(value: TopicId) {
    setTopic(value); setSavedOnly(false); setMenuOpen(false);
  }

  function save(card: KnowledgeCard) {
    const wasSaved = preferences.saved.includes(card.id);
    if (update((current) => toggleSaved(current, card.id))) setNotice(wasSaved ? "已取消收藏" : "已收藏，保存在当前浏览器");
    else setNotice("浏览器无法保存收藏，请允许本地存储后重试。");
  }

  function hide(card: KnowledgeCard) {
    if (update((current) => hideCard(current, card.id))) setNotice("已隐藏这条见识，可在侧栏恢复");
    else setNotice("浏览器无法保存偏好，请允许本地存储后重试。");
  }

  async function copy(card: KnowledgeCard) {
    try {
      await navigator.clipboard.writeText(shareUrl(window.location.origin, card.id));
      setNotice("链接已复制，打开即可阅读这条见识");
    } catch { setNotice("复制失败，请在浏览器中允许剪贴板权限，或复制地址栏链接。"); }
  }

  async function poster(card: KnowledgeCard) {
    if (posterBusy) return;
    setPosterBusy(true);
    try { await downloadPoster(card, shareUrl(window.location.origin, card.id)); setNotice("海报已生成，请查看浏览器下载列表"); }
    catch { setNotice("海报生成失败，请重试或复制链接分享。"); }
    finally { setPosterBusy(false); }
  }

  function clearFilters() {
    setQuery(""); setTopic("all"); setDate("all"); setSavedOnly(false); setMode("local");
  }

  return <div className="app-shell">
    <a className="skip-link" href="#knowledge-feed">跳到知识列表</a>
    {menuOpen && <button className="menu-backdrop" aria-label="关闭导航" onClick={() => setMenuOpen(false)} />}
    <aside className={`sidebar ${menuOpen ? "is-open" : ""}`} aria-label="主导航">
      <Link className="brand" href="/" aria-label="每日见识首页"><span className="brand-mark"><BookOpen size={23} strokeWidth={1.8} /><i /></span><span><strong>见识<span className="brand-period">.</span></strong><small>每天多懂一点</small></span></Link>
      <nav>
        <button className={`nav-item ${!savedOnly && topic === "all" ? "active" : ""}`} onClick={() => { chooseTopic("all"); setDate(dates[0] ?? "all"); setQuery(""); }}><Compass size={19} />每日见识<span className="nav-active-dot" /></button>
        <button className={`nav-item ${savedOnly ? "active" : ""}`} onClick={() => { setSavedOnly(true); setTopic("all"); setDate("all"); setQuery(""); setMenuOpen(false); }}><Bookmark size={18} />我的收藏<span className="nav-count">{savedCount}</span></button>
        <div className="nav-group-label">探索知识</div>
        {categories.map((category) => <div className="nav-category" key={category.id}>
          <button className={`nav-item category-parent ${!savedOnly && topic === category.id ? "active" : ""}`} onClick={() => chooseTopic(category.id)}>{category.id === "life" ? <Lightbulb size={18} /> : <Layers3 size={18} />}{category.label}<ChevronDown size={13} className="nav-chevron" /></button>
          <div className="nav-children">{category.children.map((child) => <button key={child.id} className={!savedOnly && topic === child.id ? "selected" : ""} onClick={() => chooseTopic(child.id)}>{child.label}</button>)}</div>
        </div>)}
        <div className="nav-group-label zone-heading">特色专区<span>专题</span></div>
        {zones.map((zone) => { const Icon = zoneIcons[zone.id]; return <button key={zone.id} className={`nav-item zone-nav ${!savedOnly && topic === zone.id ? "active" : ""}`} onClick={() => chooseTopic(zone.id)}><Icon size={17} />{zone.label}</button>; })}
      </nav>
      <div className="sidebar-bottom">{hiddenCount > 0 && <button className="restore-button" onClick={() => { if (update((current) => ({ ...current, hidden: [] }))) setNotice("已恢复隐藏的见识"); else setNotice("无法保存设置，请检查浏览器存储权限。"); }}><Undo2 size={14} />恢复已隐藏的 {hiddenCount} 条</button>}<a href="https://github.com/qingsaiyang-code" target="_blank" rel="noopener noreferrer"><CodeXml size={16} />和见识一起成长<ArrowUpRight size={13} /></a><span>Jianshi Daily <span>v0.1</span></span></div>
    </aside>

    <div className="workspace">
      <header className="topbar"><button className="icon-button mobile-menu" aria-label="打开导航" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><Menu size={23} /></button><span className="mobile-brand">见识<span>.</span></span>
        <form className="search-form" onSubmit={(event) => { event.preventDefault(); if (mode === "web") setNotice("联网问答尚未接入，请先使用站内搜索。"); }} role="search">
          <Search size={19} aria-hidden="true" /><input ref={inputRef} aria-label="搜索知识" placeholder={mode === "local" ? "好奇的事，来这里找找答案…" : "输入问题，联网问答尚待接入"} value={query} onChange={(event) => { setQuery(event.target.value); setDate("all"); }} />{query ? <button type="button" className="icon-button" aria-label="清空搜索" onClick={() => setQuery("")}><X size={16} /></button> : <kbd>/</kbd>}
        </form>
        <div className="search-modes" aria-label="搜索模式"><button className={mode === "local" ? "selected" : ""} aria-pressed={mode === "local"} onClick={() => setMode("local")}>站内检索</button><button className={mode === "web" ? "selected" : ""} aria-pressed={mode === "web"} onClick={() => setMode("web")}><Globe2 size={14} />联网问答<span className="coming-dot" /></button></div>
        <a className="profile-link" href="https://github.com/qingsaiyang-code" target="_blank" rel="noopener noreferrer" aria-label="作者 GitHub">Q</a>
      </header>

      <main>
        <section className="intro"><div><div className="intro-note"><span />给好奇心，留一点时间</div><h1>把世界看明白一点。</h1><p>从生活里的小问题，到值得理解的大世界。<br className="mobile-break" />每天一份见识，慢慢连成自己的知识地图。</p></div><KnowledgeOrbit /></section>

        <div className="mobile-topics" aria-label="快捷分类">{(["all", "life", "professional", "ai", "defense", "context"] as TopicId[]).map((value) => <button key={value} className={topic === value && !savedOnly ? "selected" : ""} onClick={() => chooseTopic(value)}>{topicLabel(value)}</button>)}</div>

        {mode === "web" && <section className="web-search-notice" aria-label="联网问答状态"><Globe2 size={22} /><div><strong>联网问答，下一站见</strong><p>当前可搜索全部种子知识。联网查询、引用溯源与 AI 总结将在后续版本接入。</p></div><button className="secondary-button" onClick={() => setMode("local")}>使用站内检索</button></section>}
        {cardId && !openedCard && <p className="invalid-link" role="status">这条分享链接对应的见识不存在，请从下方知识库继续浏览。</p>}

        <div className="content-layout"><section className="feed-section" id="knowledge-feed" aria-labelledby="feed-heading">
          <div className="feed-heading"><div><h2 id="feed-heading">{savedOnly ? "我的收藏" : query ? "搜索见识" : topic !== "all" ? topicLabel(topic) : date === dates[0] ? "今日见识" : "归档见识"}<span>{filtered.length}</span></h2><p>{savedOnly ? "把值得留下的知识，收进自己的口袋。" : query ? `在${date === "all" ? "全部归档" : date}中查找「${query}」` : "不必知道所有答案，先理解一个好问题。"}</p></div><span className="seed-badge">种子内容</span></div>
          <div className="filter-bar"><div className="date-control"><CalendarDays size={15} /><label htmlFor="archive-date">归档</label><select id="archive-date" aria-label="归档日期" value={date} onChange={(event) => setDate(event.target.value)}><option value="all">全部日期</option>{dates.map((day) => <option key={day} value={day}>{day}{day === dates[0] ? " · 最新" : ""}</option>)}</select><ChevronDown size={13} /></div><div className="feed-filters"><button className={topic === "all" && !savedOnly ? "selected" : ""} onClick={() => { setTopic("all"); setSavedOnly(false); }}>全部</button>{categories.map((category) => <button key={category.id} className={topic === category.id ? "selected" : ""} onClick={() => chooseTopic(category.id)}>{category.label}</button>)}</div></div>

          {filtered.length ? <div className="card-grid">{filtered.map((card) => <KnowledgeTile key={card.id} card={card} saved={preferences.saved.includes(card.id)} onSave={() => save(card)} onHide={() => hide(card)} onRead={() => router.replace(`/?card=${encodeURIComponent(card.id)}`, { scroll: false })} onShare={() => setShareCard(card)} />)}</div> : <div className="empty-state"><Search size={32} /><h3>{savedOnly ? "口袋里，还没有见识" : "换个方向，也许就有答案"}</h3><p>{savedOnly ? "点击知识卡片上的书签，就能把它留在这里。" : "当前日期与分类中没有匹配内容，可以浏览全部归档。"}</p><button className="primary-button" onClick={clearFilters}>浏览全部见识</button></div>}
          <div className="feed-end"><span /><BookOpen size={15} /><span /></div><p className="feed-end-note">今天懂一点，明天就多一份从容。</p>
        </section>

        <aside className="reading-aside" aria-label="阅读导览"><section className="daily-note"><div className="note-heading"><span className="note-spark"><Sparkles size={17} /></span><span>好奇心手记</span></div><h2>知识不必很远，<br />见识就在日常。</h2><p>一个更好的问题，常常比一个<br />匆忙的答案更有用。</p><div className="note-illustration" aria-hidden="true"><div className="illustration-circle" /><BookOpen size={74} strokeWidth={1.15} /><span className="spark-one">✦</span><span className="spark-two">+</span></div><span className="note-bottom">保持好奇，慢慢来。</span></section>
          <section className="topic-guide"><h3><Compass size={17} />换个视角看看</h3>{zones.map((zone) => { const Icon = zoneIcons[zone.id]; return <button key={zone.id} onClick={() => { chooseTopic(zone.id); setDate("all"); }}><span className={`guide-icon ${zone.id}`}><Icon size={18} /></span><span><strong>{zone.label}</strong><small>{zone.description}</small></span><ArrowUpRight size={15} /></button>; })}</section>
          <section className="reading-tip"><CircleHelp size={17} /><div><h3>让见识留下来</h3><p>读完后，试着用自己的话讲一遍。能说清楚，才更接近理解。</p></div></section>
          <div className="library-status"><span className="status-dot" /><span>{cards.length} 条种子知识 · {dates.length} 个示例归档</span></div>
        </aside></div>
        <footer className="page-footer"><span>见识 · 每天多懂一点</span><span>首版为示例知识库，尚未自动采集更新</span></footer>
      </main>
    </div>
    {selectedCard && <CardDialog key={selectedCard.id} card={selectedCard} shareOnly={!!shareCard} saved={preferences.saved.includes(selectedCard.id)} onClose={() => { setShareCard(null); if (cardId) router.replace("/", { scroll: false }); }} onSave={() => save(selectedCard)} onCopy={() => void copy(selectedCard)} onPoster={() => void poster(selectedCard)} />}
    <div className={`toast ${notice ? "visible" : ""}`} role="status" aria-live="polite">{notice && <><Check size={16} />{notice}</>}</div>
    {posterBusy && <div className="poster-progress" role="status">正在生成海报…</div>}
  </div>;
}
