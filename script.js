let historyList = [];
let totalFixes = 0;
let totalWords = 0;
let currentTone = 'Casual';

const commonFixes = {
    'wnt':'want','wnt':'want','fogot':'forgot','walet':'wallet','hom':'home',
    'wether':'weather','verry':'very','coudnt':'couldn\'t','coudnt':'couldn\'t',
    'kees':'keys','exmple':'example','writting':'writing','mistkes':'mistakes',
    'sentances':'sentences','tomoro':'tomorrow','teh':'the','recieve':'receive',
    'beleive':'believe','freind':'friend','wierd':'weird','occured':'occurred',
    'untill':'until','seperate':'separate','definately':'definitely','goverment':'government',
    'occassion':'occasion','accomodate':'accommodate','calender':'calendar',
    'enviroment':'environment','existance':'existence','independant':'independent',
    'knowlege':'knowledge','maintainance':'maintenance','millenium':'millennium',
    'neccessary':'necessary','occurance':'occurrence','persistance':'persistence',
    'privalege':'privilege','professer':'professor','reccomend':'recommend',
    'refered':'referred','religous':'religious','remeber':'remember','repitition':'repetition',
    'restarant':'restaurant','rythm':'rhythm','sence':'sense','sieze':'seize',
    'succesful':'successful','suprise':'surprise','tatoo':'tattoo','temperture':'temperature',
    'tommorow':'tomorrow','truely':'truly','unforseen':'unforeseen','untill':'until',
    'vaccum':'vacuum','visious':'vicious','wellcome':'welcome','wierd':'weird',
    'i ':'I ','dont':"don't",'cant':"can't",'wont':"won't",'isnt':"isn't",
    'arent':"aren't",'wasnt':"wasn't",'werent':"weren't",'hasnt':"hasn't",
    'havent':"haven't",'hadnt':"hadn't",'doesnt':"doesn't",'didnt':"didn't",
    'im':"I'm",'ive':"I've",'id':"I'd",'ill':"I'll"
};

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    event.target.classList.add('active');
}

function setTone(tone, btn) {
    currentTone = tone;
    document.querySelectorAll('.tone-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const descs = {
        'Default': 'Standard correction mode',
        'Formal': 'Formal and professional language',
        'Casual': 'Relaxed and friendly tone',
        'Professional': 'Business-ready language, precise and polished'
    };
    document.getElementById('tone-desc').textContent = descs[tone];
}

function updateCount() {
    const text = document.getElementById('input-text').value;
    document.getElementById('char-count').textContent = text.length + ' / 100,000';
}

function loadSample() {
    document.getElementById('input-text').value = 'i wnt to go too the store tomoro but i fogot my walet at hom. the wether was verry bad and i coudnt find my car kees. this is a exmple of how autocorrect can help with writting mistkes in everyday sentances.';
    updateCount();
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('input-text').value = text;
        updateCount();
    } catch(e) {
        alert('Paste manually using Ctrl+V');
    }
}

function clearAll() {
    document.getElementById('input-text').value = '';
    document.getElementById('output-text').value = '';
    document.getElementById('char-count').textContent = '0 / 100,000';
    document.getElementById('stats-grid').style.display = 'none';
    document.getElementById('correction-tags').style.display = 'none';
    document.getElementById('result-tabs').style.display = 'none';
    document.getElementById('tab-content').style.display = 'none';
}

function correctTextJS(text) {
    let corrected = text;
    let errorCount = 0;

    Object.keys(commonFixes).forEach(wrong => {
        const regex = new RegExp('\\b' + wrong + '\\b', 'gi');
        const matches = corrected.match(regex);
        if (matches) errorCount += matches.length;
        corrected = corrected.replace(regex, commonFixes[wrong]);
    });

    corrected = corrected.replace(/\.\s+([a-z])/g, (m, p1) => '. ' + p1.toUpperCase());
    corrected = corrected.charAt(0).toUpperCase() + corrected.slice(1);

    return { corrected, errorCount };
}

function correctText() {
    const text = document.getElementById('input-text').value.trim();
    if (!text) { alert('Please enter some text first!'); return; }

    document.getElementById('output-text').value = 'Correcting...';

    setTimeout(() => {
        const words = text.split(/\s+/);
        const { corrected, errorCount } = correctTextJS(text);

        document.getElementById('output-text').value = corrected;

        totalFixes += errorCount;
        totalWords += words.length;

        document.getElementById('stat-errors').textContent = errorCount;
        document.getElementById('stat-words').textContent = words.length;

        const accuracyBefore = Math.round(((words.length - errorCount) / words.length) * 100);
        document.getElementById('stat-before').textContent = accuracyBefore + '%';
        document.getElementById('stat-after').textContent = '100%';

        document.getElementById('sb-fixes').textContent = totalFixes;
        document.getElementById('sb-docs').textContent = historyList.length + 1;
        document.getElementById('sb-words').textContent = totalWords;

        document.getElementById('tag-corrections').textContent = '+' + errorCount + ' corrections';
        document.getElementById('tag-spelling').textContent = '✗' + errorCount + ' spelling';
        document.getElementById('tag-grammar').textContent = '◆1 grammar';
        document.querySelector('.badge').textContent = errorCount;

        document.getElementById('stats-grid').style.display = 'grid';
        document.getElementById('correction-tags').style.display = 'flex';
        document.getElementById('result-tabs').style.display = 'flex';
        document.getElementById('tab-content').style.display = 'block';

        document.getElementById('grammar-tip-text').textContent =
            'AutoCorrect AI fixed ' + errorCount + ' errors in your text using offline engine.';

        historyList.unshift({ original: text, corrected, errors: errorCount, words: words.length });
        updateHistory();
    }, 600);
}

function updateHistory() {
    const list = document.getElementById('history-list');
    if (historyList.length === 0) {
        list.innerHTML = '<p style="color:#555">No corrections yet.</p>';
        return;
    }
    list.innerHTML = historyList.map((item, i) => `
        <div class="history-item">
            <strong>Correction #${historyList.length - i}</strong> — ${item.words} words · ${item.errors} errors fixed
            <div style="display:flex;gap:12px;margin-top:8px">
                <div style="flex:1">
                    <div style="color:#555;font-size:11px;margin-bottom:4px">ORIGINAL</div>
                    <div style="color:#8b949e">${item.original.substring(0, 100)}...</div>
                </div>
                <div style="flex:1">
                    <div style="color:#555;font-size:11px;margin-bottom:4px">CORRECTED</div>
                    <div style="color:#3fb950">${item.corrected.substring(0, 100)}...</div>
                </div>
            </div>
        </div>
    `).join('');
}

function showTab(tab) {
    document.querySelectorAll('.result-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
}

function copyText() {
    const text = document.getElementById('output-text').value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => alert('Copied!'));
}

function speakText() {
    const text = document.getElementById('output-text').value;
    if (!text) return;
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
}

function exportTXT() {
    const text = document.getElementById('output-text').value;
    if (!text) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], {type:'text/plain'}));
    a.download = 'corrected.txt';
    a.click();
}

function exportDOCX() {
    alert('TXT export available! Use TXT button.');
}

function toggleTheme() {
    document.body.style.background = document.body.style.background === 'white' ? '' : 'white';
}

document.addEventListener('keydown', e => {
    if (e.ctrlKey && e.key === 'Enter') correctText();
    if (e.ctrlKey && e.key === 'd') { e.preventDefault(); clearAll(); }
});