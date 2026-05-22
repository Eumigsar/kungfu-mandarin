// Kung Fu Mandarin — esboço de teste (offline)
// - Mini cena narrativa
// - Chat guiado com feedback robusto (HSK1 only)
// Ajustes: vocabulário maior + evitar repetições (só repete item quando erra)

const STORE_KEY = 'kungfu-mandarin:v2';

// Vocabulário (HSK1-ish) para o esboço — ampliado
// Obs.: é um esboço; a versão MVP real terá banco (Supabase) + guardrails.
const VOCAB = [
	{ id: 'laoshi', hanzi: '老师', pinyin: 'lǎoshī', tones: [3, 1], pt: 'professor; professora' },
	{ id: 'xuesheng', hanzi: '学生', pinyin: 'xuésheng', tones: [2, 0], pt: 'estudante; aluno; aluna' },
	{ id: 'xiexie', hanzi: '谢谢', pinyin: 'xièxie', tones: [4, 0], pt: 'obrigado; obrigada' },
	{ id: 'bu', hanzi: '不', pinyin: 'bù', tones: [4], pt: 'não' },
	{ id: 'shi', hanzi: '是', pinyin: 'shì', tones: [4], pt: 'ser; estar; é' },
	{ id: 'ni', hanzi: '你', pinyin: 'nǐ', tones: [3], pt: 'você' },
	{ id: 'wo', hanzi: '我', pinyin: 'wǒ', tones: [3], pt: 'eu' },
	{ id: 'ta', hanzi: '他/她', pinyin: 'tā', tones: [1], pt: 'ele; ela' },
	{ id: 'hao', hanzi: '好', pinyin: 'hǎo', tones: [3], pt: 'bom; bem' },
	{ id: 'ma', hanzi: '吗', pinyin: 'ma', tones: [0], pt: 'partícula de pergunta' },
	{ id: 'zaijian', hanzi: '再见', pinyin: 'zàijiàn', tones: [4, 4], pt: 'tchau; até mais' },
	{ id: 'qing', hanzi: '请', pinyin: 'qǐng', tones: [3], pt: 'por favor; convidar' },
	{ id: 'duibuqi', hanzi: '对不起', pinyin: 'duìbuqǐ', tones: [4, 0, 3], pt: 'desculpa; me desculpe' },
	{ id: 'meiguanxi', hanzi: '没关系', pinyin: 'méiguānxi', tones: [2, 1, 0], pt: 'tudo bem; não tem problema' },
	{ id: 'buKeqi', hanzi: '不客气', pinyin: 'bú kèqi', tones: [2, 4, 0], pt: 'de nada; não por isso' },
	{ id: 'shui', hanzi: '水', pinyin: 'shuǐ', tones: [3], pt: 'água' },
	{ id: 'cha', hanzi: '茶', pinyin: 'chá', tones: [2], pt: 'chá (bebida)' },
	{ id: 'fan', hanzi: '饭', pinyin: 'fàn', tones: [4], pt: 'refeição; arroz cozido' },
	{ id: 'chi', hanzi: '吃', pinyin: 'chī', tones: [1], pt: 'comer' },
	{ id: 'he', hanzi: '喝', pinyin: 'hē', tones: [1], pt: 'beber' },
	{ id: 'ren', hanzi: '人', pinyin: 'rén', tones: [2], pt: 'pessoa; gente' },
	{ id: 'mingzi', hanzi: '名字', pinyin: 'míngzi', tones: [2, 0], pt: 'nome' },
	{ id: 'shenme', hanzi: '什么', pinyin: 'shénme', tones: [2, 0], pt: 'o que; quê' },
	{ id: 'na', hanzi: '哪', pinyin: 'nǎ', tones: [3], pt: 'qual; onde (pergunta)' },
	{ id: 'nar', hanzi: '哪儿', pinyin: 'nǎr', tones: [3], pt: 'onde' },
	{ id: 'zai', hanzi: '在', pinyin: 'zài', tones: [4], pt: 'estar em; ficar em' },
	{ id: 'jian', hanzi: '见', pinyin: 'jiàn', tones: [4], pt: 'ver; encontrar' },
	{ id: 'ai', hanzi: '爱', pinyin: 'ài', tones: [4], pt: 'amar; gostar' },
	{ id: 'da', hanzi: '大', pinyin: 'dà', tones: [4], pt: 'grande' },
	{ id: 'xiao', hanzi: '小', pinyin: 'xiǎo', tones: [3], pt: 'pequeno; pequena' },
	{ id: 'duo', hanzi: '多', pinyin: 'duō', tones: [1], pt: 'muito; muitos; muitas' },
	{ id: 'shao', hanzi: '少', pinyin: 'shǎo', tones: [3], pt: 'pouco; poucos; poucas' },
	{ id: 'jinTian', hanzi: '今天', pinyin: 'jīntiān', tones: [1, 1], pt: 'hoje' },
	{ id: 'mingTian', hanzi: '明天', pinyin: 'míngtiān', tones: [2, 1], pt: 'amanhã' },
	{ id: 'zuoTian', hanzi: '昨天', pinyin: 'zuótiān', tones: [2, 1], pt: 'ontem' },
	{ id: 'kaiXin', hanzi: '开心', pinyin: 'kāixīn', tones: [1, 1], pt: 'feliz; contente' },
	{ id: 'xuexi', hanzi: '学习', pinyin: 'xuéxí', tones: [2, 2], pt: 'estudar; aprender' },
	{ id: 'zhongwen', hanzi: '中文', pinyin: 'zhōngwén', tones: [1, 2], pt: 'chinês (idioma)' },
	{ id: 'maMa', hanzi: '妈妈', pinyin: 'māma', tones: [1, 0], pt: 'mãe; mamãe' },
	{ id: 'baBa', hanzi: '爸爸', pinyin: 'bàba', tones: [4, 0], pt: 'pai; papai' },
	{ id: 'pengYou', hanzi: '朋友', pinyin: 'péngyou', tones: [2, 0], pt: 'amigo; amiga' },
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

function shuffle(arr) {
	const a = arr.slice();
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[a[i], a[j]] = [a[j], a[i]];
	}
	return a;
}

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
			store.xp += 5;
			saveStore(store);
			refreshHUD(store);
			appendMsg('bot', `<div class="fb ok">+5 XP</div><div style="margin-top:8px">Entendido. No dojo, você aprende pelo contexto.</div><div class="muted" style="margin-top:6px">Digite <span class="code">revisar</span> ou <span class="code">quiz</span> para começar.</div>`);
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

function ensurePool(store) {
	store.pool ||= {};
	store.pool.ptToZh ||= [];
	store.pool.zhToPt ||= [];

	if (store.pool.ptToZh.length === 0) store.pool.ptToZh = shuffle(VOCAB.map(v => v.id));
	if (store.pool.zhToPt.length === 0) store.pool.zhToPt = shuffle(VOCAB.map(v => v.id));
}

function nextItemId(store, type) {
	ensurePool(store);
	const key = type === 'ptToZh' ? 'ptToZh' : 'zhToPt';
	const id = store.pool[key].shift();
	return id;
}

function startQuizPtToZh(store) {
	store.mode = MODES.quizPtToZh;
	store.pending = { type: 'ptToZh', itemId: nextItemId(store, 'ptToZh'), retryOnError: false };
	saveStore(store);
	const item = VOCAB.find(v => v.id === store.pending.itemId);
	const pt = splitPtSynonyms(item.pt)[0] || item.pt;
	return `<div><strong>Desafio do Dojo (PT → Mandarim)</strong></div><div>Como se diz <span class="code">${escapeHtml(pt)}</span>?</div><div class="muted" style="margin-top:6px">Aceito pinyin/hanzi.</div>`;
}

function startQuizZhToPt(store, prefs) {
	store.mode = MODES.quizZhToPt;
	store.pending = { type: 'zhToPt', itemId: nextItemId(store, 'zhToPt'), retryOnError: false };
	saveStore(store);
	const item = VOCAB.find(v => v.id === store.pending.itemId);
	return `<div><strong>Desafio do Dojo (Mandarim → PT)</strong></div><div>O que significa?</div><div style="margin-top:8px">${formatEntry({ ...item, pt: '—' }, prefs).replace('<div class="muted">—</div>','<div class="muted">(responda em português)</div>')}</div>`;
}

function acceptableHanziForms(hanzi) {
	const raw = String(hanzi || '').trim();
	const parts = raw.split('/').map(s => s.trim()).filter(Boolean);
	const forms = new Set();
	for (const p of parts) forms.add(p);
	if (parts.length > 1) forms.add(parts.join(''));
	if (parts.length === 0 && raw) forms.add(raw);
	return Array.from(forms);
}

function isCorrectPtToZh(userText, item) {
	const uRaw = String(userText||'').trim();
	const uPy = normalizePinyinAnswer(uRaw);
	const uHanzi = normalizeFlat(uRaw);
	if (uPy && uPy === normalizePinyinAnswer(item.pinyin)) return true;
	const forms = acceptableHanziForms(item.hanzi).map(normalizeFlat);
	if (uHanzi && forms.includes(uHanzi)) return true;
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
		? `Aceito: <span class="code">${escapeHtml(item.pinyin)}</span> • <span class="code">${escapeHtml(acceptableHanziForms(item.hanzi).join(' / '))}</span>`
		: `Aceito: ${splitPtSynonyms(item.pt).map(s=>`<span class="code">${escapeHtml(s)}</span>`).join(' ')}`;

	let out = `${badge}<div style="margin-top:8px">${formatEntry(item, prefs)}</div><div class="muted" style="margin-top:8px">${accepted}</div>`;

	// Repetição inteligente:
	// - se errou: repete o MESMO item uma vez
	// - se acertou: avança para um item novo (sem repetir)
	if (!ok && !pending.retryOnError) {
		pending.retryOnError = true;
		saveStore(store);
		refreshHUD(store);
		out += `<div style="margin-top:10px"><strong>De novo:</strong> tente mais uma vez o mesmo item.</div>`;
		return out;
	}

	// avança
	pending.retryOnError = false;
	pending.itemId = nextItemId(store, pending.type);
	saveStore(store);
	refreshHUD(store);

	if (pending.type === 'ptToZh') {
		const next = VOCAB.find(v => v.id === pending.itemId);
		const pt = splitPtSynonyms(next.pt)[0] || next.pt;
		out += `<div style="margin-top:10px"><strong>Próxima:</strong> Como se diz <span class="code">${escapeHtml(pt)}</span>?</div>`;
	}
	if (pending.type === 'zhToPt') {
		const next = VOCAB.find(v => v.id === pending.itemId);
		out += `<div style="margin-top:10px"><strong>Próxima:</strong> O que significa?</div>`;
		out += `<div style="margin-top:8px">${formatEntry({ ...next, pt: '—' }, prefs).replace('<div class="muted">—</div>','<div class="muted">(responda em português)</div>')}</div>`;
	}

	return out;
}

function findByPt(text) {
	const n = normalize(text);
	const m = n.match(/como se diz\s+(.+?)(\?|$)/);
	const query = (m?.[1] || n)
		.replaceAll('em mandarim', '')
		.replaceAll('em chines', '')
		.replaceAll('em chineses', '')
		.replaceAll('em chinês', '')
		.replaceAll('?', '')
		.trim();

	let hits = VOCAB.filter(v => normalize(v.pt).includes(query));
	if (hits.length === 0) {
		const tokens = query.split(/\s+/).filter(Boolean);
		hits = VOCAB.filter(v => tokens.some(t => normalize(v.pt).includes(t)));
	}
	return { query, hits };
}

function reply(store, prefs, text) {
	const intent = detectIntent(text);

	if (store.pending?.itemId && !intent) {
		return checkAnswer(store, prefs, text) || 'Entendi.';
	}

	const n = normalize(text);
	if (intent === 'help') {
		return `Comandos: <span class="code">quiz</span>, <span class="code">revisar</span>, ou pergunte “como se diz água?”`;
	}

	if (intent === 'translate' || n.includes('como se diz')) {
		const { hits, query } = findByPt(text);
		if (hits.length > 0) {
			return `<div><strong>No dojo, “${escapeHtml(query)}” é:</strong></div>` + hits.slice(0, 3).map(w => `<div style="margin-top:8px">${formatEntry(w, prefs)}</div>`).join('');
		}
		return `Não encontrei essa palavra no meu vocabulário deste esboço. Tente <span class="code">água</span>, <span class="code">professor</span>, <span class="code">obrigado</span>.`;
	}

	if (intent === 'quiz') return startQuizPtToZh(store);
	if (intent === 'review') return startQuizZhToPt(store, prefs);

	if (n.startsWith('oi') || n.startsWith('ola') || n.startsWith('olá')) {
		return `Silêncio… depois um aceno. <span class="code">你好</span> (nǐ hǎo). Digite <span class="code">revisar</span> para provar que você observa detalhes.`;
	}

	return `Entendi. Para treinar: <span class="code">quiz</span> ou <span class="code">revisar</span>.`;
}

function init() {
	const store = loadStore() || {
		xp: 0,
		right: 0,
		streak: 0,
		lastDays: [],
		mode: MODES.chat,
		pending: null,
		pool: { ptToZh: [], zhToPt: [] },
	};

	// garante pools preenchidos logo
	ensurePool(store);
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
		appendMsg('bot', `<div class="fb ok">Missão do dia</div><div style="margin-top:8px">Treine 5 palavras sem repetir. Digite <span class="code">quiz</span>.</div>`);
	});

	document.getElementById('composer').addEventListener('submit', (e) => {
		e.preventDefault();
		const input = document.getElementById('input');
		const text = input.value;
		if (!text.trim()) return;
		appendMsg('you', `<div>${escapeHtml(text)}</div>`);
		input.value = '';

		const r = reply(store, prefs, text);
		appendMsg('bot', r);
	});
}

document.addEventListener('DOMContentLoaded', init);
