import { lessons, byId, groups, sources, glossary, components, paths, researchDate } from './content.mjs';

const icons = {
  arrow: '<path d="M5 12h14m-5-5 5 5-5 5"/>',
  external: '<path d="M14 3h7v7m0-7L10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-3 5-5 3 3-5z"/>',
  route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M5 7v8a4 4 0 0 0 4 4h4M11 5h4a4 4 0 0 1 4 4v4"/>',
  box: '<path d="m12 3 9 5v8l-9 5-9-5V8zM3 8l9 5 9-5m-9 5v8M7 5.8l9 5"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  terminal: '<path d="m5 7 5 5-5 5m8 0h6"/>',
  book: '<path d="M12 5v16M12 5C8 2 4 3 2 4v15c3-1 6-1 10 2 4-3 7-3 10-2V4c-2-1-6-2-10 1"/>',
  layers: '<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',
  scan: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m8 0h5v-5M7 8h10M7 12h10M7 16h6"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M7 6.5h.01M7 17.5h.01M11 6.5h6M11 17.5h6"/>',
  file: '<path d="M14 2H5a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8zM14 2v6h6M8 13h8M8 17h5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
  moon: '<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
};
const icon = (name, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.box}</svg>`;
const escape = text => String(text).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const link = id => `#/${id === 'overview' ? '' : id}`;
const rich = text => escape(text).replace(/\[\[([\w-]+)\|([^\]]+)\]\]/g, (_, id, label) => `<a href="${link(id)}">${label}</a>`).replace(/`([^`]+)`/g, '<code>$1</code>');
function readStore(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function saveStore(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Browsing remains available without storage. */ } }
const storedProgress = readStore('trivy-completed', []);
let completed = new Set((Array.isArray(storedProgress) ? storedProgress : []).filter(id => typeof id === 'string' && byId[id]));
let lastLesson = readStore('trivy-last', 'topology');
if (!byId[lastLesson]) lastLesson = 'topology';
const preferredTheme = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
let theme = readStore('trivy-theme', preferredTheme);
if (!['dark', 'light'].includes(theme)) theme = preferredTheme;
document.documentElement.dataset.theme = theme;
let currentId = 'overview';
let mapMode = 'all';
let selectedComponent = 'scanner';
let flowStep = 0;
const quizAnswers = new Map();
let toastTimer;
const app = document.querySelector('#app');
const dialog = document.querySelector('#search-dialog');

function titleFor(id) { return byId[id]?.short || ({ overview: 'Overview', glossary: 'Concepts glossary', sources: 'Sources & about' })[id] || 'Page not found'; }
function groupFor(id) { return groups.find(g => g.ids.includes(id)); }
function progressMarkup() {
  return `<div class="progress-label"><span>Your field notes</span><span>${completed.size} / ${lessons.length}</span></div><div class="progress-track" role="progressbar" aria-label="Completed lessons" aria-valuenow="${completed.size}" aria-valuemin="0" aria-valuemax="${lessons.length}"><span style="width:${completed.size / lessons.length * 100}%"></span></div><p>${completed.size ? 'Keep going. One connection at a time.' : 'A little understanding, every day.'}</p>`;
}
function sidebar() {
  return `<aside class="sidebar" aria-label="Learning guide"><a class="brand" href="#/" aria-label="Learn Trivy home"><span class="brand-mark">t<span>›</span></span><span>learn<span class="brand-trivy">trivy</span><small>A VISUAL FIELD GUIDE</small></span></a><button class="sidebar-search" data-action="search">${icon('search')}<span>Find something...</span><kbd>⌘ K</kbd></button><nav aria-label="Course navigation">${groups.map(g => `<div class="nav-group"><div class="nav-group-title">${icon(g.icon)}<span>${g.title}</span></div>${g.ids.map(id => `<a class="nav-link ${currentId === id ? 'active' : ''}" href="${link(id)}" ${currentId === id ? 'aria-current="page"' : ''}><span>${titleFor(id)}</span>${completed.has(id) ? icon('check', 'nav-check') : currentId === id ? '<span class="active-dot"></span>' : ''}</a>`).join('')}</div>`).join('')}</nav><div class="sidebar-progress">${progressMarkup()}</div><div class="sidebar-foot">An independent learning project ${icon('external')}</div></aside><button class="nav-backdrop" data-action="menu-close" aria-label="Close navigation"></button>`;
}
function header() {
  return `<header class="topbar"><div class="breadcrumbs"><button class="icon-button mobile-menu" data-action="menu" aria-label="Open navigation" aria-expanded="false">${icon('menu')}</button><span class="breadcrumb-root">The field guide</span>${icon('chevron')}<span>${titleFor(currentId)}</span></div><div class="header-actions"><a href="${sources.trivy.url}" target="_blank" rel="noopener noreferrer">Trivy docs ${icon('external')}</a><span class="header-divider"></span><button class="icon-button theme-toggle" data-action="theme" aria-label="Switch to ${theme === 'light' ? 'dark' : 'light'} theme">${icon(theme === 'light' ? 'moon' : 'sun')}<span>${theme === 'light' ? 'Dark' : 'Light'}</span></button><button class="icon-button header-search" data-action="search" aria-label="Search lessons">${icon('search')}</button></div></header>`;
}
function footer() {
  return `<footer class="page-footer"><span>Learn Trivy <span class="footer-dot">·</span> Understand what runs beneath.</span><a href="${link('sources')}">Sources, scope & inspiration ${icon('arrow')}</a></footer>`;
}

const layouts = {
  all: {
    nodes: [['vulnerability-db', 26, 40], ['java-db', 26, 169], ['checks-bundle', 26, 298], ['scanner', 285, 169], ['operator', 543, 40], ['reports', 543, 237], ['node-collector', 285, 335]],
    edges: [
      ['M206 78C246 78 245 195 285 195', 'advisories', 244, 111],
      ['M206 207H285', 'identity', 245, 195],
      ['M206 336C247 336 243 221 285 221', 'rules', 244, 284],
      ['M543 78H375V169', 'scan Jobs', 414, 65],
      ['M465 207H504V276H543', 'results', 502, 244],
      ['M633 116V237', 'report CRs', 674, 179],
      ['M375 335V245', 'host evidence', 428, 300],
    ], caption: 'A conceptual map of responsibilities. Select a component to explore it.',
  },
  image: {
    nodes: [['java-db', 28, 80], ['vulnerability-db', 28, 270], ['scanner', 286, 174], ['reports', 543, 174]],
    edges: [['M208 118C247 118 248 198 286 198', 'identity', 246, 143], ['M208 308C247 308 248 222 286 222', 'advisories', 248, 278], ['M466 212H543', 'findings', 505, 199]],
    caption: 'Image vulnerability scanning: identify packages, match advisories, then report.',
  },
  kubernetes: {
    nodes: [['operator', 28, 78], ['scanner', 286, 78], ['reports', 543, 78], ['node-collector', 286, 299], ['checks-bundle', 28, 299]],
    edges: [['M208 116H286', 'scan Jobs', 247, 103], ['M466 116H543', 'results', 505, 103], ['M118 78V37H633V78', 'Operator writes report resources', 380, 60], ['M376 299V154', 'node evidence', 429, 238], ['M208 337H246V144H286', 'rules', 247, 263]],
    caption: 'Conceptual paths: image scan Jobs, configuration assessment, and node collection use different inputs.',
  },
};
function mapMarkup() {
  const layout = layouts[mapMode];
  if (!layout.nodes.some(n => n[0] === selectedComponent)) selectedComponent = 'scanner';
  const chosen = components[selectedComponent];
  return `<div class="system-map"><div class="map-toolbar"><div class="map-tabs" role="group" aria-label="System map view">${[['all', 'Whole ecosystem'], ['image', 'Image scan'], ['kubernetes', 'Kubernetes']].map(([id, title]) => `<button data-map-mode="${id}" class="${mapMode === id ? 'selected' : ''}" aria-pressed="${mapMode === id}">${title}</button>`).join('')}</div><span class="map-live"><span></span> INTERACTIVE MAP</span></div><div class="map-body"><div class="map-scroll" tabindex="0" role="region" aria-label="Component map. Scroll horizontally to explore the diagram."><div class="map-canvas"><div class="map-axis">${mapMode === 'kubernetes' ? 'COORDINATE' : 'KNOWLEDGE'}<span>${mapMode === 'kubernetes' ? 'ASSESS' : 'ENGINE'}</span><span>RESULTS</span></div><svg class="map-edges" viewBox="0 0 750 430" aria-hidden="true"><defs><marker id="edge-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10" fill="none" stroke="currentColor" stroke-width="1.5"/></marker></defs>${layout.edges.map(([d, label, x, y]) => `<path class="map-edge" d="${d}" marker-end="url(#edge-arrow)"/><text x="${x}" y="${y}" text-anchor="middle">${label}</text>`).join('')}</svg>${layout.nodes.map(([id, x, y]) => { const c = components[id]; return `<button class="map-node ${c.color} ${selectedComponent === id ? 'is-selected' : ''}" style="left:${x / 7.5}%;top:${y / 4.3}%" data-component="${id}" aria-pressed="${selectedComponent === id}"><span class="node-icon">${icon(c.icon)}</span><span><strong>${c.title}</strong><small>${c.type}</small></span></button>`; }).join('')}</div></div><aside class="map-inspector"><span class="inspector-kicker">UNDER THE HOOD</span><span class="inspector-icon ${chosen.color}">${icon(chosen.icon)}</span><h3>${chosen.title}</h3><p>${chosen.text}</p><div class="inspector-role"><small>ITS JOB</small><span>${chosen.role}</span></div><a href="${link(chosen.link)}">Explore component ${icon('arrow')}</a></aside></div><div class="map-caption"><span>${icon('info')}${layout.caption}</span><span class="map-legend"><i></i> Data <i></i> Engine <i></i> Kubernetes</span></div></div>`;
}

function pathCard(path, index) {
  const minutes = path.ids.reduce((sum, id) => sum + byId[id].minutes, 0);
  const next = path.ids.find(id => !completed.has(id)) || path.ids[0];
  return `<a class="path-card" href="${link(next)}"><div class="path-top"><span class="path-icon">${icon(path.icon)}</span><span class="path-number">0${index + 1}</span></div><h3>${path.title}</h3><p>${path.description}</p><div class="path-bottom"><span>${path.ids.length} lessons <span>·</span> ${minutes} min</span>${icon('arrow')}</div></a>`;
}

function overview() {
  return `<div class="overview"><section class="hero"><div class="eyebrow"><span class="tiny-square"></span> THE OPEN SOURCE SECURITY FIELD GUIDE</div><h1>Understand the scan.<br><span>See the whole system.</span></h1><p class="hero-description">From a single image to an entire cluster. Explore how Trivy,<br class="desktop-break"> its databases, and the Operator work together.</p><div class="hero-actions"><a class="button primary" href="${link('image-scan')}">Follow your first scan ${icon('arrow')}</a><a class="button text-button" href="${link('topology')}">Start with the big picture ${icon('chevron')}</a></div><div class="hero-stats"><span>${icon('book')} ${lessons.length} connected lessons</span><span>${icon('route')} 4 guided flows</span><span>${icon('terminal')} 4 hands-on labs</span></div><div class="hero-decoration" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div><span class="hero-glyph">${icon('scan')}</span><i></i></div></section><section id="ecosystem" class="home-section"><div class="section-heading"><div><div class="section-eyebrow">01 / THE BIG PICTURE</div><h2>Everything connects.</h2></div><p>Pick a component. Follow the connections.</p></div><div id="map-container">${mapMarkup()}</div></section><section class="home-section"><div class="section-heading"><div><div class="section-eyebrow">02 / FIND YOUR WAY IN</div><h2>A path for your next question.</h2></div><span class="subtle">Learn in order, or follow your curiosity.</span></div><div class="path-grid">${paths.map(pathCard).join('')}</div></section><section class="architecture-entry"><div><div class="section-eyebrow">ARCHITECTURE IN DEPTH</div><h2>Open the system. Follow its contracts.</h2><p>Study the scan engine, controller loops, cache lifetimes, collector interfaces, and deployment tradeoffs. Six chapters connect versioned APIs to the field-guide examples.</p></div><a class="button primary" href="${link('architecture')}">Explore architecture ${icon('arrow')}</a></section><section class="field-note"><div class="field-note-icon">${icon('book')}</div><div><span class="section-eyebrow">ONE DISTINCTION TO KEEP</span><h3>The scanner, the knowledge, and the orchestrator.</h3><p>Trivy performs the assessment. Databases and rules supply the knowledge.<br>Trivy Operator puts that work into the Kubernetes lifecycle.</p></div><a class="round-link" href="${link('topology')}" aria-label="Learn the system topology">${icon('arrow')}</a></section>${completed.size ? `<section class="resume-strip"><div>${icon('compass')}<span><strong>Continue your field guide</strong><small>${completed.size} lessons complete. Your progress stays in this browser.</small></span></div><a class="button secondary" href="${link(lastLesson)}">Resume ${icon('arrow')}</a></section>` : ''}<div class="source-note">Explore full sequences, evidence contracts, failure paths, and tested policy fixtures. Inspired by the teaching approach of <a href="${sources.substrate.url}" target="_blank" rel="noopener noreferrer">Learn Agent Substrate ${icon('external')}</a>.</div>${footer()}</div>`;
}

function flowMarkup(lesson) {
  const s = lesson.flow[flowStep];
  return `<div class="flow-player"><div class="flow-top"><span>${icon('route')} FOLLOW THE FLOW</span><span>STEP ${flowStep + 1} OF ${lesson.flow.length}</span></div><div class="flow-track" role="group" aria-label="Walkthrough steps">${lesson.flow.map((item, i) => `<button class="flow-stop ${i === flowStep ? 'selected' : ''} ${i < flowStep ? 'passed' : ''}" data-step="${i}" aria-pressed="${i === flowStep}" aria-label="Step ${i + 1}: ${escape(item.title)}"><span>${i < flowStep ? icon('check') : String(i + 1).padStart(2, '0')}</span><small>${item.title}</small></button>`).join('')}</div><div class="flow-detail" aria-live="polite"><span class="flow-step-number">0${flowStep + 1}</span><div><h3>${s.title}</h3><p>${s.text}</p><a href="${link(s.component)}">Meet the component ${icon('arrow')}</a></div></div><div class="flow-controls"><span>Click any step to trace the handoff.</span><div><button class="icon-button previous-icon" data-step="${flowStep - 1}" aria-label="Previous step" ${flowStep === 0 ? 'disabled' : ''}>${icon('arrow')}</button><button class="next-step" data-step="${flowStep === lesson.flow.length - 1 ? 0 : flowStep + 1}">${flowStep === lesson.flow.length - 1 ? 'Start again' : 'Next step'} ${icon('arrow')}</button></div></div></div>`;
}
function diagramMarkup(labels) {
  return `<figure class="mini-diagram"><figcaption>THE MENTAL MODEL</figcaption><div>${labels.map((label, i) => `<span><small>0${i + 1}</small>${escape(label)}</span>${i < labels.length - 1 ? icon('arrow') : ''}`).join('')}</div></figure>`;
}
function codeMarkup(block, index) {
  return `<div class="code-block"><div class="code-header"><span>${icon('terminal')}${escape(block.label)}</span><button data-copy="${index}" aria-label="Copy ${escape(block.label)} code">${icon('copy')}<span>Copy</span></button></div><pre tabindex="0"><code class="language-${block.language}">${escape(block.text)}</code></pre></div>`;
}
function tableMarkup(table) {
  return `<div class="technical-table-scroll" tabindex="0" role="region" aria-label="${escape(table.caption)}"><table class="technical-table"><caption>${escape(table.caption)}</caption><thead><tr>${table.headers.map(h => `<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${table.rows.map(row => `<tr>${row.map((cell, i) => i === 0 ? `<th scope="row">${rich(cell)}</th>` : `<td>${rich(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function boundaryMapMarkup(map) {
  return `<figure class="boundary-map"><figcaption>${escape(map.caption)}</figcaption><div class="boundary-groups">${map.groups.map(group => `<section class="boundary-group"><h3>${escape(group.title)}</h3><p>${escape(group.subtitle)}</p><div>${group.items.map(item => `<a class="boundary-node" href="${link(item.link)}"><span>${escape(item.label)}${icon('arrow')}</span><small>${escape(item.detail)}</small></a>`).join('')}</div></section>`).join('')}</div></figure>`;
}
function sequenceMarkup(sequence, id) {
  const width = sequence.actors.length * 180 + 40;
  const height = sequence.messages.length * 86 + 126;
  const x = i => 110 + i * 180;
  return `<figure class="sequence-figure"><figcaption>${escape(sequence.caption)}</figcaption><div class="sequence-scroll" tabindex="0" role="region" aria-label="${escape(sequence.caption)}"><svg viewBox="0 0 ${width} ${height}" style="min-width:${width}px" role="img" aria-labelledby="sequence-${id}"><title id="sequence-${id}">${escape(sequence.caption)}</title><defs><marker id="seq-arrow-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10" fill="currentColor"/></marker></defs>${sequence.actors.map((actor, i) => `<rect class="sequence-actor" x="${x(i) - 80}" y="12" width="160" height="40" rx="4"/><text class="sequence-actor-label" x="${x(i)}" y="37" text-anchor="middle">${escape(actor)}</text><line class="sequence-lifeline" x1="${x(i)}" x2="${x(i)}" y1="54" y2="${height - 20}"/>`).join('')}${sequence.messages.map(([from, to, label], i) => {
    const y = 112 + i * 86;
    const self = from === to;
    const direction = from === sequence.actors.length - 1 ? -1 : 1;
    const textX = self ? x(from) + 12 * direction : (x(from) + x(to)) / 2;
    const path = self ? `M${x(from)} ${y}h${45 * direction}v17h${-45 * direction}` : `M${x(from)} ${y}H${x(to)}`;
    const words = `${i + 1}. ${label}`.split(' ');
    const lines = [''];
    for (const word of words) {
      const max = self ? 23 : Math.max(23, Math.min(85, Math.abs(to - from) * 23));
      if ((lines.at(-1) + ' ' + word).length > max) lines.push(word); else lines[lines.length - 1] += (lines.at(-1) ? ' ' : '') + word;
    }
    return `<g><path class="sequence-message" d="${path}" marker-end="url(#seq-arrow-${id})"/><text class="sequence-label" x="${textX}" y="${y - 9 - (lines.length - 1) * 17}" text-anchor="${self ? (direction < 0 ? 'end' : 'start') : 'middle'}">${lines.map((line, j) => `<tspan x="${textX}" dy="${j ? 17 : 0}">${escape(line)}</tspan>`).join('')}</text></g>`;
  }).join('')}</svg></div><details class="sequence-transcript"><summary>Read the exchange as text</summary><ol>${sequence.messages.map(([from, to, label]) => `<li><strong>${escape(sequence.actors[from])} → ${escape(sequence.actors[to])}</strong>: ${escape(label)}</li>`).join('')}</ol></details></figure>`;
}
function downloadMarkup(path, label) {
  const href = globalThis.__TRIVY_DOWNLOADS__?.[path] || './' + path;
  return `<a class="download-link" href="${escape(href)}" download="${escape(path.split('/').at(-1))}">${icon('file')}${escape(label || 'Download the exercise fixture')}${icon('arrow')}</a>`;
}
function sectionMarkup(s, lesson, nextCodeIndex) {
  return `<section class="lesson-section" id="${s.id}"><h2><a href="#/${lesson.id}/${s.id}" class="section-anchor" aria-label="Link to ${escape(s.title)}">#</a>${s.title}</h2>${s.paragraphs.map(p => `<p>${rich(p)}</p>`).join('')}${s.boundaryMap ? boundaryMapMarkup(s.boundaryMap) : ''}${s.sequence ? sequenceMarkup(s.sequence, `${lesson.id}-${s.id}`) : ''}${s.table ? tableMarkup(s.table) : ''}${s.bullets ? `<ul>${s.bullets.map(b => `<li>${rich(b)}</li>`).join('')}</ul>` : ''}${s.download ? downloadMarkup(s.download) : ''}${(s.downloads || []).map(d => downloadMarkup(d.path, d.label)).join('')}${s.code ? codeMarkup(s.code, nextCodeIndex()) : ''}${s.note ? `<aside class="inline-note">${icon('info')}<p>${rich(s.note)}</p></aside>` : ''}${s.exercise ? `<details class="reasoning-exercise"><summary><span>REASON IT THROUGH</span>${rich(s.exercise.prompt)}</summary><p>${rich(s.exercise.answer)}</p></details>` : ''}${s.evidence?.length ? `<div class="section-evidence"><span>Evidence</span>${s.evidence.map(key => `<a href="${sources[key].url}" target="_blank" rel="noopener noreferrer">${escape(sources[key].title)}<small>${escape(sources[key].version || 'Rolling documentation')}</small></a>`).join('')}</div>` : ''}</section>`;
}
function quizMarkup(lesson) {
  const chosen = quizAnswers.get(lesson.id);
  const q = lesson.quiz;
  return `<section class="knowledge-test" id="knowledge-test"><div class="section-eyebrow">PAUSE & CONNECT THE DOTS</div><h2>${q.question}</h2><div class="quiz-options" role="group" aria-label="Answer choices">${q.options.map((option, i) => `<button data-answer="${i}" class="quiz-option ${chosen === i ? (chosen === q.answer ? 'correct' : 'incorrect') : ''}" aria-pressed="${chosen === i}"><span>${String.fromCharCode(65 + i)}</span>${escape(option)}${chosen === i ? icon(chosen === q.answer ? 'check' : 'close') : ''}</button>`).join('')}</div>${chosen !== undefined ? `<p class="quiz-feedback ${chosen === q.answer ? 'correct' : 'incorrect'}" role="status">${chosen === q.answer ? 'That is right.' : 'Try another answer.'} ${q.explanation}</p>` : '<p class="quiz-hint">Choose an answer to test your mental model.</p>'}</section>`;
}
function sourcesMarkup(keys) {
  return `<section class="lesson-sources" id="lesson-sources"><h2>Go to the source</h2><p>These official pages support this lesson. Match commands and defaults to your installed release.</p><div>${keys.map(key => `<a href="${sources[key].url}" target="_blank" rel="noopener noreferrer">${icon('file')}<span>${sources[key].title}<small>${escape(sources[key].version || 'Rolling documentation')}</small></span>${icon('external')}</a>`).join('')}</div></section>`;
}
function lessonMarkup(lesson) {
  const index = lessons.indexOf(lesson);
  const previous = lessons[index - 1];
  const next = lessons[index + 1];
  let blockIndex = 0;
  return `<div class="lesson-layout"><article class="lesson"><header class="lesson-header"><div class="eyebrow"><span class="tiny-square"></span>${escape(lesson.level.toUpperCase())}<span class="eyebrow-separator">/</span> ${lesson.level === 'Architecture' ? 'ARCHITECTURE CHAPTER' : 'FIELD NOTE'} ${String(lesson.level === 'Architecture' ? groups.find(g => g.title === 'Architecture in depth').ids.indexOf(lesson.id) + 1 : index + 1).padStart(2, '0')}</div><h1>${lesson.title}</h1><p>${lesson.description}</p><div class="lesson-meta"><span>${icon('clock')} ${lesson.minutes} min study</span><span>${icon('book')} ${lesson.sources.length} source references</span>${completed.has(lesson.id) ? `<span class="completed-label">${icon('check')} Completed</span>` : ''}</div></header><aside class="takeaway"><span>${icon('compass')} KEEP THIS IN MIND</span><p>${lesson.takeaway}</p></aside>${lesson.map ? `<div id="map-container" class="lesson-map">${mapMarkup()}</div>` : ''}${lesson.flow ? `<div id="flow-container">${flowMarkup(lesson)}</div>` : ''}${lesson.diagram ? diagramMarkup(lesson.diagram) : ''}${lesson.sections.map(s => sectionMarkup(s, lesson, () => blockIndex++)).join('')}<div id="quiz-container">${quizMarkup(lesson)}</div>${sourcesMarkup(lesson.sources)}${lesson.repo ? `<p class="upstream-link">Source repository: <a href="${lesson.repo}" target="_blank" rel="noopener noreferrer">${escape(lesson.repo.replace('https://github.com/', ''))} ${icon('external')}</a></p>` : ''}<div class="completion-panel"><div><h3>${completed.has(lesson.id) ? 'One more connection made.' : 'Ready for the next connection?'}</h3><p>Mark this lesson complete to save your progress here.</p></div><button class="button ${completed.has(lesson.id) ? 'secondary' : 'primary'}" data-action="complete">${icon('check')}${completed.has(lesson.id) ? 'Completed · undo' : 'Mark as complete'}</button></div><nav class="lesson-pagination" aria-label="Previous and next lessons"><a href="${link(previous?.id || 'overview')}"><small>PREVIOUS</small><span>${previous?.short || 'Overview'}</span></a><a href="${link(next?.id || 'glossary')}"><small>NEXT</small><span>${next?.short || 'Concepts glossary'} ${icon('arrow')}</span></a></nav>${footer()}</article><aside class="toc"><span>${lesson.level === 'Architecture' ? 'IN THIS CHAPTER' : 'IN THIS FIELD NOTE'}</span>${lesson.flow ? '<a href="#flow-container" data-scroll="flow-container">The walkthrough</a>' : ''}${lesson.sections.map(s => `<a href="#/${lesson.id}/${s.id}">${s.title}</a>`).join('')}<a href="#/${lesson.id}/knowledge-test">Test your understanding</a><a href="#/${lesson.id}/lesson-sources">Go to the source</a><div class="toc-note">${icon('compass')}<p>Explore the connections.<br>Every lesson stands on its own.</p><a href="${link('glossary')}">Need a definition? ${icon('arrow')}</a></div></aside></div>`;
}
function glossaryMarkup() {
  return `<article class="reference-page"><div class="eyebrow"><span class="tiny-square"></span> THE WORDS BEHIND THE SYSTEM</div><h1>A shared vocabulary.</h1><p class="reference-intro">Short definitions. A path back to the bigger picture.</p><label class="glossary-search">${icon('search')}<input id="glossary-filter" type="search" placeholder="Filter terms, for example: database" aria-label="Filter glossary terms"></label><div id="glossary-terms">${glossaryItems('')}</div>${footer()}</article>`;
}
function glossaryItems(query) {
  const terms = glossary.filter(item => item.slice(0, 2).join(' ').toLowerCase().includes(query.toLowerCase()));
  return terms.length ? terms.map(([term, meaning, id]) => `<div class="glossary-term"><h2>${term}</h2><p>${meaning}</p><a href="${link(id)}" aria-label="Learn about ${escape(term)}">${icon('arrow')}</a></div>`).join('') : '<p class="empty-state">No matching terms. Try a broader word.</p>';
}
function sourcePage() {
  return `<article class="reference-page source-page"><div class="eyebrow"><span class="tiny-square"></span> FOLLOW THE EVIDENCE</div><h1>A field guide, with roots.</h1><p class="reference-intro">A visual companion to the upstream documentation, built to make the connections easier to understand.</p><section><h2>How this guide teaches</h2><p><a href="${sources.substrate.url}" target="_blank" rel="noopener noreferrer">Learn Agent Substrate</a> starts with a whole-system map, follows complete flows, and links components to focused explanations. This guide adapts that teaching structure to Trivy.</p><p>Begin with the overview, follow an input to a result, then inspect the component responsible for each step. Use the labs to connect the model to observable behavior.</p></section><section><h2>Scope and freshness</h2><p>Documentation research date: ${researchDate}. This guide focuses on Trivy, Trivy Operator, scan data, configuration checks, and node collection.</p><p>Detailed chapters trace inputs, ownership, retained state, failure paths, and observable results. Each technical section links to its supporting evidence.</p><p>Operator design sections use versioned 0.30.1 documentation where available. Rolling Trivy references are labeled separately. The guide distinguishes documented behavior from illustrative diagrams and local experiments.</p><p>The architecture section uses Trivy 0.75.0 and Operator 0.35.0 published Go APIs. It labels the historical collector 0.6.0 types separately. Internal API views explain the selected versions rather than promising stable integration contracts.</p><p>Local experiments used Trivy 0.75.0 for package inventory, NodeInfo evaluation, custom rules, and exit statuses. Their fixtures and recorded results are downloadable. Registry scans and Kubernetes procedures remain unexecuted exercises.</p></section><section><h2>What remains unverified</h2><p>The shell command gh repo view aquasecurity/trivy returned “error connecting to api.github.com.” This is a failure of that access path, not evidence of a GitHub outage. Research uses official documentation, vendor advisories, and published Go package documentation. No repository checkout or source-code audit is claimed.</p><p>Sequence diagrams name documented roles and handoffs. They do not imply an exact internal call order where the sources do not establish one.</p><p>Chrome failed to start in the restricted build session, so browser layout remains untested. Content, rendering logic, download packaging, and local configuration experiments have automated coverage.</p></section><section><h2>Your learning data</h2><p>Completed lessons and the selected theme stay in this browser through local storage. The site has no account service or analytics.</p><p>If you clear site storage, the progress resets. The lessons remain available.</p><button class="button secondary" data-action="reset-progress">Reset lesson progress</button><span class="reset-explanation">This removes only this guide’s saved completion marks.</span></section><section><h2>Official documentation</h2><div class="source-directory">${Object.entries(sources).filter(([key]) => key !== 'substrate').map(([, source]) => `<a href="${source.url}" target="_blank" rel="noopener noreferrer"><span>${source.title}<small>${new URL(source.url).hostname}</small></span>${icon('external')}</a>`).join('')}</div></section><section><h2>Upstream projects</h2><p>Repository links help you move from the mental model to implementation. This independent guide is not an official Aqua Security publication.</p><div class="repo-list">${['trivy', 'trivy-operator', 'trivy-db', 'trivy-java-db', 'trivy-checks', 'k8s-node-collector', 'vuln-list'].map(repo => `<a href="https://github.com/aquasecurity/${repo}" target="_blank" rel="noopener noreferrer">aquasecurity/${repo} ${icon('external')}</a>`).join('')}</div></section>${footer()}</article>`;
}
function render({ preserveScroll = false } = {}) {
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const id = parts[0] || 'overview';
  const changed = id !== currentId;
  currentId = id;
  if (changed) { flowStep = 0; mapMode = 'all'; selectedComponent = 'scanner'; }
  if (byId[id]) { lastLesson = id; saveStore('trivy-last', id); }
  const page = id === 'overview' ? overview() : byId[id] ? lessonMarkup(byId[id]) : id === 'glossary' ? glossaryMarkup() : id === 'sources' ? sourcePage() : `<div class="reference-page"><div class="eyebrow">OFF THE MAP</div><h1>That page is not in the guide.</h1><p>Choose a lesson from the navigation, or return to the overview.</p><a class="button primary" href="#/">Return to the map ${icon('arrow')}</a></div>`;
  app.innerHTML = `${sidebar()}<div class="workspace">${header()}<main id="main" tabindex="-1">${page}</main></div>`;
  document.title = `${id === 'overview' ? 'A visual field guide' : titleFor(id)} · Learn Trivy`;
  document.body.classList.remove('menu-open');
  if (parts[1] && !preserveScroll) requestAnimationFrame(() => document.getElementById(parts[1])?.scrollIntoView({ block: 'start' }));
  else if (changed) { window.scrollTo(0, 0); document.getElementById('main').focus({ preventScroll: true }); }
}
function toast(text) { const el = document.querySelector('#toast'); el.textContent = text; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2400); }
function refreshMap() { document.querySelector('#map-container').innerHTML = mapMarkup(); }

function openSearch() {
  dialog.innerHTML = `<div class="search-input-row">${icon('search')}<input id="global-search" type="search" placeholder="Search lessons, components, and concepts..." aria-label="Search the guide" autocomplete="off"><button class="search-close" data-action="search-close" aria-label="Close search"><kbd>Esc</kbd></button></div><div class="search-results" id="search-results"></div><div class="search-footer"><span>Search across the field guide</span><span>↑ ↓ navigate <span>·</span> Enter open</span></div>`;
  updateSearch('');
  dialog.showModal();
  document.querySelector('#global-search').focus();
}
function updateSearch(query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = lessons.map(l => {
    const text = [l.title, l.short, l.description, l.takeaway, ...l.sections.flatMap(s => [s.title, ...s.paragraphs, JSON.stringify(s.table || {}), s.code?.text || '', s.exercise?.prompt || '', s.exercise?.answer || '', JSON.stringify(s.sequence || {}), JSON.stringify(s.boundaryMap || {})])].join(' ').toLowerCase();
    const matches = words.every(word => text.includes(word));
    const score = words.reduce((n, word) => n + (l.title.toLowerCase().includes(word) ? 10 : 1), 0);
    return { ...l, matches, score };
  }).filter(l => l.matches).sort((a, b) => b.score - a.score).slice(0, words.length ? 12 : 5);
  const termMatches = words.length ? glossary.filter(([term, meaning]) => words.every(word => `${term} ${meaning}`.toLowerCase().includes(word))).slice(0, 3) : [];
  document.querySelector('#search-results').innerHTML = `<div class="search-caption">${words.length ? `${results.length + termMatches.length} matching entries` : 'GOOD PLACES TO START'}</div>${results.map(l => `<a class="search-result" data-search-result href="${link(l.id)}">${icon(groupFor(l.id)?.icon || 'book')}<span><strong>${escape(l.title)}</strong><small>${escape(l.description)}</small></span>${icon('arrow')}</a>`).join('')}${termMatches.map(([term, meaning, id]) => `<a class="search-result" data-search-result href="${link(id)}">${icon('book')}<span><strong>${escape(term)} <em>Concept</em></strong><small>${escape(meaning)}</small></span>${icon('arrow')}</a>`).join('')}${!results.length && !termMatches.length ? '<p class="empty-state">No matching lessons. Try “Java”, “database”, “node”, or “report”.</p>' : ''}`;
}

document.addEventListener('click', async event => {
  const target = event.target.closest('button, a');
  if (!target) return;
  const action = target.dataset.action;
  if (target.hasAttribute('data-search-result')) dialog.close();
  if (action === 'search') openSearch();
  if (action === 'search-close') dialog.close();
  if (action === 'menu' || action === 'menu-close') {
    const open = action === 'menu' && !document.body.classList.contains('menu-open');
    document.body.classList.toggle('menu-open', open);
    document.querySelector('.mobile-menu')?.setAttribute('aria-expanded', String(open));
  }
  if (action === 'theme') {
    theme = theme === 'light' ? 'dark' : 'light'; saveStore('trivy-theme', theme);
    document.documentElement.dataset.theme = theme;
    target.innerHTML = `${icon(theme === 'light' ? 'moon' : 'sun')}<span>${theme === 'light' ? 'Dark' : 'Light'}</span>`;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#101820' : '#f6f8fb');
    target.setAttribute('aria-label', `Switch to ${theme === 'light' ? 'dark' : 'light'} theme`);
  }
  if (target.dataset.mapMode) { mapMode = target.dataset.mapMode; refreshMap(); document.querySelector(`[data-map-mode="${mapMode}"]`).focus({ preventScroll: true }); }
  if (target.dataset.component) { selectedComponent = target.dataset.component; refreshMap(); document.querySelector(`[data-component="${selectedComponent}"]`).focus({ preventScroll: true }); }
  if (target.dataset.step !== undefined) {
    const lesson = byId[currentId];
    const requested = Number(target.dataset.step);
    if (lesson?.flow && requested >= 0 && requested < lesson.flow.length) { flowStep = requested; document.querySelector('#flow-container').innerHTML = flowMarkup(lesson); document.querySelector(`.flow-stop[data-step="${flowStep}"]`).focus({ preventScroll: true }); }
  }
  if (target.dataset.answer !== undefined) {
    quizAnswers.set(currentId, Number(target.dataset.answer));
    document.querySelector('#quiz-container').innerHTML = quizMarkup(byId[currentId]);
    document.querySelector(`[data-answer="${target.dataset.answer}"]`).focus({ preventScroll: true });
  }
  if (target.dataset.copy !== undefined) {
    const block = byId[currentId].sections.filter(s => s.code)[Number(target.dataset.copy)].code;
    try { await navigator.clipboard.writeText(block.text); target.innerHTML = `${icon('check')}<span>Copied</span>`; toast('Command copied.'); }
    catch { toast('Clipboard access is unavailable. Select and copy the code.'); }
  }
  if (target.dataset.scroll) { event.preventDefault(); document.getElementById(target.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' }); }
  if (action === 'complete') {
    if (completed.has(currentId)) completed.delete(currentId); else completed.add(currentId);
    saveStore('trivy-completed', [...completed]);
    const y = window.scrollY;
    render({ preserveScroll: true });
    window.scrollTo(0, y);
    document.querySelector('[data-action="complete"]').focus({ preventScroll: true });
    toast(completed.has(currentId) ? 'Lesson complete. Progress saved in this browser.' : 'Completion mark removed.');
  }
  if (action === 'reset-progress') {
    completed.clear(); saveStore('trivy-completed', []);
    document.querySelector('.sidebar-progress').innerHTML = progressMarkup();
    document.querySelectorAll('.nav-check').forEach(el => el.remove());
    toast('Lesson progress reset.');
  }
});
document.addEventListener('input', event => {
  if (event.target.id === 'global-search') updateSearch(event.target.value);
  if (event.target.id === 'glossary-filter') document.querySelector('#glossary-terms').innerHTML = glossaryItems(event.target.value);
});
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (dialog.open) dialog.close(); else openSearch(); }
  if (event.key === 'Escape') { document.body.classList.remove('menu-open'); document.querySelector('.mobile-menu')?.setAttribute('aria-expanded', 'false'); }
  if (!dialog.open || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
  const results = [...dialog.querySelectorAll('[data-search-result]')];
  if (!results.length) return;
  const index = results.indexOf(document.activeElement);
  if (event.key === 'ArrowDown') { event.preventDefault(); results[(index + 1) % results.length].focus(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); results[(index - 1 + results.length) % results.length].focus(); }
  if (event.key === 'Enter' && event.target.id === 'global-search') { event.preventDefault(); results[0].click(); }
});
dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
window.addEventListener('hashchange', render);
render();
