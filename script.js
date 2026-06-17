let history = [];
let totalFixes = 0;
let totalWords = 0;
let currentTone = 'Casual';

function showPage(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.nav-tab').forEach(n => n.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
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

function clearAll() {
    document.getElementById('input-text').value = '';
    document.getElementById('output-text').value = '';
    document.getElementById('char-count').textContent = '0 / 100,000';
    document.getElementById('stats-grid').style.display = 'none';
    document.getElementById('correction-tags').style.display = 'none';
    document.getElementById('result-tabs').style.display = 'none';
    document.getElementById('tab-content').style.display = 'none';
}

async function correctText() {
    const text = document.getElementById('input-text').value.trim();
    if (!text) { alert('Please enter some text first!'); return; }

    document.getElementById('output-text').value = 'Correcting...';

    try {
        const response = await fetch('http://127.0.0.1:5000/correct', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text, tone: currentTone })
        });

        const data = await response.json();

        document.getElementById('output-text').value = data.corrected;

        totalFixes += data.errors;
        totalWords += data.words;

        document.getElementById('stat-errors').textContent = data.errors;
        document.getElementById('stat-words').textContent = data.words;
        document.getElementById('stat-before').textContent = data.accuracy_before + '%';
        document.getElementById('stat-after').textContent = '100%';

        document.getElementById('sb-fixes').textContent = totalFixes;
        document.getElementById('sb-docs').textContent = history.length + 1;
        document.getElementById('sb-words').textContent = totalWords;

        document.getElementById('tag-corrections').textContent = '+' + data.errors + ' corrections';
        document.getElementById('tag-spelling').textContent = '✗' + data.errors + ' spelling';
        document.getElementById('tag-grammar').textContent = '◆1 grammar';

        document.getElementById('stats-grid').style.display = 'grid';
        document.getElementById('correction-tags').style.display = 'flex';
        document.getElementById('result-tabs').style.display = 'flex';
        document.getElementById('tab-content').style.display = 'block';

        document.getElementById('grammar-tip-text').textContent =
            'AutoCorrect AI fixed ' + data.errors + ' spelling errors in your text using offline engine.';

        history.unshift({ original: text, corrected: data.corrected, errors: data.errors, words: data.words });
        updateHistory();

    } catch (error) {
        document.getElementById('output-text').value = 'Error: Make sure Flask server is running!\nRun: python app.py';
    }
}

function updateHistory() {
    const list = document.getElementById('history-list');
    if (history.length === 0) {
        list.innerHTML = '<p style="color:#555">No corrections yet.</p>';
        return;
    }
    list.innerHTML = history.map((item, i) => `
        <div class="history-item">
            <strong>Correction #${history.length - i}</strong> — ${item.words} words · ${item.errors} errors fixed
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
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
}

function speakText() {
    const text = document.getElementById('output-text').value;
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
}

function exportTXT() {
    const text = document.getElementById('output-text').value;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'corrected.txt';
    a.click();
}

function exportDOCX() {
    alert('DOCX export requires additional library. TXT export is available!');
}

function toggleTheme() {
    alert('Theme toggle coming soon!');
}

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'Enter') correctText();
    if (e.ctrlKey && e.key === 'd') { e.preventDefault(); clearAll(); }
});