// Kung Fu Mandarin — esboço de teste (offline)
// - Mini cena narrativa
// - Chat guiado com feedback robusto (HSK1 only)

const STORE_KEY = 'kungfu-mandarin:v1';

// Vocabulário mínimo para o esboço
const VOCAB = [
	{ id: 'laoshi', hanzi: '老师', pinyin: 'lǎoshī', tones: [3, 1], pt: 'professor; professora' },
	{ id: 'xuesheng', hanzi: '学生', pinyin: 'xuésheng', tones: [2, 0], pt: 'estudante; aluno; aluna' },
	{ id: 'xiexie', hanzi: '谢谢', pinyin: 'xièxie', tones: [4, 0], pt: 'obrigado; obrigada' },
	{ id: 'bu', hanzi: '不', pinyin: 'bù', tones: [4], pt: 'não' },
	{ id: 'shi', hanzi: '是', pinyin: 'shì', tones: [4], pt: 'ser; estar; é' },
	{ id: 'ni', hanzi: '你', pinyin: 'nǐ', tones: [3], pt: 'você' },
	{ id: 'wo', hanzi: '我', pinyin: 'wǒ', tones: [3], pt: 'eu' },
	{ id: 'shui', hanzi: '水', pinyin: 'shuǐ', tones: [3], pt: 'água' },
];

const INTENTS = {
	help: ['ajuda', 'help', 'comandos'],
	quiz: ['quiz', 'teste'],
	review: ['revisar', 'revisao', 'revisão'],
	translate: ['como se diz', 'traduz', 'em mandarim'],
};

const MODES = { chat: 'chat', quizPtToZh: 'quizPtToZh', quizZhToPt: 'quizZhToPt' };

function loadStore() {
	try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { return null; }
}
function saveStore(s) { try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch {} }

function normalize(s) {
	return String(s || '')
		.trim()
		.toLowerCase()
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '');
}
function normalizeFlat(s) { return normalize(s).replaceAll(' ', ''); }
function normalizePinyinAnswer(s) {
	return normalize(s).replaceAll(' ', '').replace(/[1-4]/g, '').replace(/[·•\-_.]/g, '');
}
function normalizeAnswerPt(s) {
	return normalize(s)
		.replace(/[()]/g, '')
		.replaceAll('/', ' ')
		.replaceAll('-', ' ')
		.replace(/[^a-z\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
}
function splitPtSynonyms(pt) {
	return String(pt || '').split(';').map(s => s.trim()).filter(Boolean);
}
function escapeHtml(s) {
	return String(s)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#039;');
}
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function todayKey() {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function colorizePinyin(pinyin, tones, enabled) {
	if (!enabled) return `<span class="pinyin">${escapeHtml(pinyin)}</span>`;
	const parts = pinyin.split(/\s+/).filter(Boolean);
	const out = parts.map((part, idx) => {
		const t = tones?.[idx] ?? 0;
		const cls = t===1?'t1':t===2?'t2':t===3?'t3':t===4?'t4':'t0';
		return `<span class="${cls}">${escapeHtml(part)}</span>`;
	});
	return `<span class="pinyin">${out.join(' ')}</span>`;
}

function formatEntry(entry, prefs) {
	const hanzi = `<div class="hanziBig" style="font-size:24px">${escapeHtml(entry.hanzi)}</div>`;
	const py = `<div>${colorizePinyin(entry.pinyin, entry.tones, prefs.toneColor)}</div>`;
	const pt = `<div class="muted">${escapeHtml(entry.pt)}</div>`;
	return prefs.hanziFirst ? `${hanzi}${py}${pt}` : `${py}${hanzi}${pt}`;
}

function detectIntent(text) {
	const n = normalize(text);
	for (const [key, words] of Object.entries(INTENTS)) {
		if (words.some(w => n.includes(w))) return key;
	}
	return null;
}

function appendMsg(who, html) {
	const chat = document.getElementById('chat');
	const div = document.createElement('div');
	div.className = `msg ${who}`;
	div.innerHTML = `<div class="meta">${who==='you'?'Você':'Mestre Liang'}</div>${html}`;
	chat.appendChild(div);
	chat.scrollTop = chat.scrollHeight;
}

function setScene(store) {
	const el = document.getElementById('scene');
	el.innerHTML = `
		<div><strong>Mestre Liang:</strong> Antes de entrar no dojo… diga quem você é.</div>
		<div class="muted" style="margin-top:8px;">Escolha uma resposta. (Isso já inicia seu perfil narrativo.)</div>
		<div class="choiceRow">
			<button class="choice" data-choice="sou estudante">“Sou estudante.”</button>
			<button class="choice" data-choice="sou professor">“Sou professor(a).”</button>
			<button class="choice" data-choice="quero aprender">“Quero aprender.”</button>
		</div>
	`;

	el.querySelectorAll('button').forEach(btn => {
		btn.addEventListener('click', () => {
			const c = btn.getAttribute('data-choice');
			store.xp += 5;
			saveStore(store);
			refreshHUD(store);
			appendMsg('bot', `<div class="fb ok">+5 XP</div><div style="margin-top:8px">Entendido. Agora, prove que reconhece <span class="code">老师</span>.</div><div class="muted" style="margin-top:6px">Digite <span class="code">revisar</span> para começar.</div>`);
		});
	});
}

function refreshHUD(store) {
	document.getElementById('xp').textContent = String(store.xp);
	document.getElementById('right').textContent = String(store.right);
	document.getElementById('streak').textContent = String(store.streak);
}

function computeStreak(lastDays) {
	const set = new Set(lastDays);
	let streak = 0;
	let d = new Date();
	while (true) {
		const k = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
		if (!set.has(k)) break;
		streak++;
		d.setDate(d.getDate()-1);
	}
	return streak;
}

function startQuizPtToZh(store) {
	store.mode = MODES.quizPtToZh;
	store.pending = { type: 'ptToZh', itemId: rand(VOCAB).id };
	saveStore(store);
	const item = VOCAB.find(v => v.id === store.pending.itemId);
	const pt = splitPtSynonyms(item.pt)[0] || item.pt;
	return `<div><strong>Desafio do Dojo (PT → Mandarim)</strong></div><div>Como se diz <span class="code">${escapeHtml(pt)}</span>?</div><div class="muted" style="margin-top:6px">Aceito pinyin/hanzi.</div>`;
}

function startQuizZhToPt(store, prefs) {
	store.mode = MODES.quizZhToPt;
	store.pending = { type: 'zhToPt', itemId: rand(VOCAB).id };
	saveStore(store);
	const item = VOCAB.find(v => v.id === store.pending.itemId);
	return `<div><strong>Desafio do Dojo (Mandarim → PT)</strong></div><div>O que significa?</div><div style="margin-top:8px">${formatEntry({ ...item, pt: '—' }, prefs).replace('<div class="muted">—</div>','<div class="muted">(responda em português)</div>')}</div>`;
}

function isCorrectPtToZh(userText, item) {
	const uRaw = String(userText||'').trim();
	const uPy = normalizePinyinAnswer(uRaw);
	const uHanzi = normalizeFlat(uRaw);
	if (uPy && uPy === normalizePinyinAnswer(item.pinyin)) return true;
	if (uHanzi && uHanzi === normalizeFlat(item.hanzi)) return true;
	return false;
}

function isCorrectZhToPt(userText, item) {
	const u = normalizeAnswerPt(userText);
	const syns = splitPtSynonyms(item.pt).map(normalizeAnswerPt);
	return syns.some(s => s && (u === s || u.includes(s) || s.includes(u)));
}

function checkAnswer(store, prefs, userText) {
	const pending = store.pending;
	if (!pending?.itemId) return null;
	const item = VOCAB.find(v => v.id === pending.itemId);
	if (!item) return null;

	let ok = false;
	if (pending.type === 'ptToZh') ok = isCorrectPtToZh(userText, item);
	if (pending.type === 'zhToPt') ok = isCorrectZhToPt(userText, item);

	if (ok) {
		store.right += 1;
		store.xp += 12;
		store.lastDays ||= [];
		const t = todayKey();
		if (!store.lastDays.includes(t)) store.lastDays.push(t);
		store.streak = computeStreak(store.lastDays);
	}

	const badge = ok ? `<div class="fb ok">✔ Correto</div>` : `<div class="fb bad">✖ Incorreto</div>`;
	const accepted = pending.type === 'ptToZh'
		? `Aceito: <span class="code">${escapeHtml(item.pinyin)}</span> • <span class="code">${escapeHtml(item.hanzi)}</span>`
		: `Aceito: ${splitPtSynonyms(item.pt).map(s=>`<span class="code">${escapeHtml(s)}</span>`).join(' ')}`;

	let out = `${badge}<div style="margin-top:8px">${formatEntry(item, prefs)}</div><div class="muted" style="margin-top:8px">${accepted}</div>`;

	// próxima
	store.pending.itemId = rand(VOCAB).id;
	saveStore(store);
	refreshHUD(store);

	if (pending.type === 'ptToZh') {
		const next = VOCAB.find(v => v.id === store.pending.itemId);
		const pt = splitPtSynonyms(next.pt)[0] || next.pt;
		out += `<div style="margin-top:10px"><strong>Próxima:</strong> Como se diz <span class="code">${escapeHtml(pt)}</span>?</div>`;
	}
	if (pending.type === 'zhToPt') {
		const next = VOCAB.find(v => v.id === store.pending.itemId);
		out += `<div style="margin-top:10px"><strong>Próxima:</strong> O que significa?</div>`;
		out += `<div style="margin-top:8px">${formatEntry({ ...next, pt: '—' }, prefs).replace('<div class="muted">—</div>','<div class="muted">(responda em português)</div>')}</div>`;
	}

	return out;
}

function reply(store, prefs, text) {
	const intent = detectIntent(text);
	const n = normalize(text);

	if (store.pending?.itemId && !intent) {
		return checkAnswer(store, prefs, text) || 'Entendi.';
	}

	if (intent === 'help') {
		return `Comandos: <span class="code">quiz</span>, <span class="code">revisar</span>, <span class="code">como se diz água?</span>`;
	}

	if (intent === 'translate' || n.includes('agua')) {
		const w = VOCAB.find(v => v.id === 'shui');
		return `<div><strong>No dojo, “água” é:</strong></div><div style="margin-top:8px">${formatEntry(w, prefs)}</div>`;
	}

	if (intent === 'quiz') return startQuizPtToZh(store);
	if (intent === 'review') return startQuizZhToPt(store, prefs);

	if (n.startsWith('oi') || n.startsWith('ola') || n.startsWith('olá')) {
		return `Silêncio… depois um aceno. <span class="code">你好</span> (nǐ hǎo). Digite <span class="code">revisar</span> para provar que você observa detalhes.`;
	}

	return `Entendi. Para treinar: <span class="code">quiz</span> ou <span class="code">revisar</span>.`;
}

function init() {
	const store = loadStore() || { xp: 0, right: 0, streak: 0, lastDays: [], mode: MODES.chat, pending: null };
	saveStore(store);

	const prefs = {
		get toneColor() { return document.getElementById('toneColor').checked; },
		get hanziFirst() { return document.getElementById('hanziFirst').checked; }
	};

	refreshHUD(store);
	setScene(store);

	appendMsg('bot', `Bem-vinda(o). Eu sou Mestre Liang. Aqui não há lições… apenas prática. Digite <span class="code">revisar</span> ou <span class="code">quiz</span>.`);

	document.getElementById('btnReset').addEventListener('click', () => {
		localStorage.removeItem(STORE_KEY);
		location.reload();
	});

	document.getElementById('btnDaily').addEventListener('click', () => {
		appendMsg('bot', `<div class="fb ok">Missão do dia</div><div style="margin-top:8px">Reconheça <span class="code">老师</span> e ganhe XP. Digite <span class="code">revisar</span>.</div>`);
	});

	document.getElementById('composer').addEventListener('submit', (e) => {
		e.preventDefault();
		const input = document.getElementById('input');
		const text = input.value;
		if (!text.trim()) return;
		appendMsg('you', `<div>${escapeHtml(text)}</div>`);
		input.value = '';

		// auto-inicia modo se necessário
		if ((store.mode === MODES.quizPtToZh || store.mode === MODES.quizZhToPt) && !store.pending?.itemId) {
			appendMsg('bot', store.mode === MODES.quizPtToZh ? startQuizPtToZh(store) : startQuizZhToPt(store, prefs));
		}

		const r = reply(store, prefs, text);
		appendMsg('bot', r);
	});
}

document.addEventListener('DOMContentLoaded', init);
