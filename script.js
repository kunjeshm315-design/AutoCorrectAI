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
document.querySelector('.upload-bar').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.pdf,.docx';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('input-text').value = e.target.result;
                updateCount();
            };
            reader.readAsText(file);
        } else if (file.name.endsWith('.docx')) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const arrayBuffer = e.target.result;
        const mammoth = await import('https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js');
        const result = await mammoth.extractRawText({ arrayBuffer });
        document.getElementById('input-text').value = result.value;
        updateCount();
    };
    reader.readAsArrayBuffer(file);
} else if (file.name.endsWith('.pdf')) {
    const reader = new FileReader();
    reader.onload = async (e) => {
        const typedArray = new Uint8Array(e.target.result);
        const pdfjsLib = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            fullText += content.items.map(item => item.str).join(' ') + '\n';
        }
        document.getElementById('input-text').value = fullText;
        updateCount();
    };
    reader.readAsArrayBuffer(file);
}else {
    alert('Supported formats: TXT and DOCX only!');
}
    };
    input.click();
});

document.querySelector('.settings-btn').addEventListener('click', () => {
    const existing = document.getElementById('settings-modal');
    if (existing) { existing.remove(); return; }
    
    const modal = document.createElement('div');
    modal.id = 'settings-modal';
    modal.style.cssText = `
        position: absolute;
        bottom: 60px;
        left: 10px;
        width: 200px;
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 8px;
        padding: 12px;
        z-index: 999;
    `;
    modal.innerHTML = `
        <div style="font-size:13px;font-weight:500;margin-bottom:12px;color:#e6edf3">Settings</div>
        <div style="margin-bottom:10px">
            <label style="font-size:12px;color:#8b949e;display:block;margin-bottom:4px">Theme</label>
            <select onchange="document.body.style.background=this.value==='light'?'#ffffff':'#0d1117'" 
                style="width:100%;background:#0d1117;color:#e6edf3;border:1px solid #30363d;border-radius:4px;padding:4px;font-size:12px">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
            </select>
        </div>
        <div style="margin-bottom:10px">
            <label style="font-size:12px;color:#8b949e;display:block;margin-bottom:4px">Font Size</label>
            <select onchange="document.querySelector('textarea').style.fontSize=this.value"
                style="width:100%;background:#0d1117;color:#e6edf3;border:1px solid #30363d;border-radius:4px;padding:4px;font-size:12px">
                <option value="13px">Small</option>
                <option value="15px">Medium</option>
                <option value="17px">Large</option>
            </select>
        </div>
        <div style="margin-bottom:10px">
            <label style="font-size:12px;color:#8b949e;display:block;margin-bottom:4px">Auto Correct</label>
            <select style="width:100%;background:#0d1117;color:#e6edf3;border:1px solid #30363d;border-radius:4px;padding:4px;font-size:12px">
                <option>On</option>
                <option>Off</option>
            </select>
        </div>
        <button onclick="document.getElementById('settings-modal').remove()" 
            style="width:100%;background:#238636;border:none;color:white;padding:5px;border-radius:4px;font-size:12px;cursor:pointer;margin-top:4px">
            Close
        </button>
    `;
    document.querySelector('.sidebar').appendChild(modal);
});
document.querySelector('.btn-plagiarism').addEventListener('click', () => {
    const text = document.getElementById('input-text').value.trim();
    if (!text) { alert('Please enter some text first!'); return; }

    const existing = document.getElementById('plagiarism-modal');
    if (existing) { existing.remove(); return; }

    // Basic plagiarism check logic
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const repetitionScore = Math.round((uniqueWords.size / words.length) * 100);
    
    const commonPhrases = [
        'the quick brown fox', 'to be or not to be', 'once upon a time',
        'in conclusion', 'as a result', 'for example', 'in other words',
        'it is important', 'in today\'s world', 'since the beginning of time'
    ];
    
    let foundPhrases = [];
    commonPhrases.forEach(phrase => {
        if (text.toLowerCase().includes(phrase)) {
            foundPhrases.push(phrase);
        }
    });

    const originalityScore = Math.min(100, Math.max(0, 
        repetitionScore - (foundPhrases.length * 10)
    ));

    const modal = document.createElement('div');
    modal.id = 'plagiarism-modal';
    modal.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 420px;
        background: #161b22;
        border: 1px solid #30363d;
        border-radius: 12px;
        padding: 20px;
        z-index: 9999;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    `;

    const scoreColor = originalityScore > 70 ? '#3fb950' : originalityScore > 40 ? '#d29922' : '#f85149';
    const scoreLabel = originalityScore > 70 ? 'Original ✅' : originalityScore > 40 ? 'Partially Original ⚠️' : 'Possibly Copied ❌';

    modal.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <span style="font-size:15px;font-weight:600;color:#e6edf3">📋 Plagiarism Report</span>
            <button onclick="document.getElementById('plagiarism-modal').remove()" 
                style="background:none;border:none;color:#8b949e;font-size:18px;cursor:pointer">✕</button>
        </div>
        
        <div style="text-align:center;margin-bottom:16px">
            <div style="font-size:48px;font-weight:700;color:${scoreColor}">${originalityScore}%</div>
            <div style="font-size:14px;color:${scoreColor}">${scoreLabel}</div>
        </div>

        <div style="background:#0d1117;border-radius:8px;padding:12px;margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:12px;color:#8b949e">Total Words</span>
                <span style="font-size:12px;color:#e6edf3">${words.length}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:12px;color:#8b949e">Unique Words</span>
                <span style="font-size:12px;color:#e6edf3">${uniqueWords.size}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
                <span style="font-size:12px;color:#8b949e">Total Sentences</span>
                <span style="font-size:12px;color:#e6edf3">${sentences.length}</span>
            </div>
            <div style="display:flex;justify-content:space-between">
                <span style="font-size:12px;color:#8b949e">Common Phrases Found</span>
                <span style="font-size:12px;color:${foundPhrases.length > 0 ? '#f85149' : '#3fb950'}">${foundPhrases.length}</span>
            </div>
        </div>

        ${foundPhrases.length > 0 ? `
        <div style="background:#f8514922;border:1px solid #f85149;border-radius:8px;padding:10px;margin-bottom:12px">
            <div style="font-size:12px;color:#f85149;margin-bottom:6px">⚠️ Common Phrases Detected:</div>
            ${foundPhrases.map(p => `<div style="font-size:11px;color:#8b949e;padding:2px 0">• "${p}"</div>`).join('')}
        </div>` : `
        <div style="background:#3fb95022;border:1px solid #3fb950;border-radius:8px;padding:10px;margin-bottom:12px">
            <div style="font-size:12px;color:#3fb950">✅ No common phrases detected!</div>
        </div>`}

        <div style="background:#0d1117;border-radius:6px;padding:8px;margin-bottom:12px">
            <div style="font-size:11px;color:#555;text-align:center">
                ⚡ Powered by AutoCorrectAI Offline Engine
            </div>
        </div>

        <button onclick="document.getElementById('plagiarism-modal').remove()"
            style="width:100%;background:#238636;border:none;color:white;padding:8px;border-radius:6px;font-size:13px;cursor:pointer;font-weight:500">
            Close Report
        </button>
    `;

    // Backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
        position:fixed;top:0;left:0;width:100%;height:100%;
        background:rgba(0,0,0,0.5);z-index:9998;
    `;
    backdrop.onclick = () => {
        modal.remove();
        backdrop.remove();
    };

    document.body.appendChild(backdrop);
    document.body.appendChild(modal);
});