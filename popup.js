const CLIENTS = [
  { name: 'Gmail',      device: 'mobile',
    subj: { safe: 43, max: 50 }, prev: { safe: 40, max: 55 },
    inbox: { combined: true,  subjMax: 43, combinedMax: 55 } },
  { name: 'Gmail',      device: 'desktop',
    subj: { safe: 70, max: 88 }, prev: { safe: 90, max: 120 },
    inbox: { combined: true,  subjMax: 70, combinedMax: 100 } },
  { name: 'Apple Mail', device: 'mobile',
    subj: { safe: 44, max: 54 }, prev: { safe: 44, max: 58 },
    inbox: { combined: false, subjMax: 44, prevMax: 44 } },
  { name: 'Apple Mail', device: 'desktop',
    subj: { safe: 65, max: 85 }, prev: { safe: 60, max: 80 },
    inbox: { combined: false, subjMax: 65, prevMax: 60 } },
  { name: 'Outlook',    device: 'mobile',
    subj: { safe: 46, max: 52 }, prev: { safe: 38, max: 52 },
    inbox: { combined: false, subjMax: 46, prevMax: 38 } },
  { name: 'Outlook',    device: 'desktop',
    subj: { safe: 46, max: 53 }, prev: { safe: 38, max: 58 },
    inbox: { combined: false, subjMax: 46, prevMax: 38 } },
  { name: 'Yahoo Mail', device: 'mobile',
    subj: { safe: 42, max: 48 }, prev: { safe: 42, max: 58 },
    inbox: { combined: false, subjMax: 42, prevMax: 42 } },
];

// ── Width-aware sizing ───────────────────────────────────────────────────────
// Inboxes truncate by PIXEL WIDTH, not character count — a "W" is far wider than
// an "l". So rather than counting characters, we measure the rendered width of
// the text (canvas measureText) in each client's font and divide by the average
// character width for that font. That yields an "effective character" length:
// skinny text (illil) counts for less, wide text (WMQ@) for more, and emoji are
// measured at their true width. The researched per-client limits above stay as
// the calibration, so typical text behaves as before while narrow/wide text is
// judged the way a real inbox actually renders it.
const FONTS = {
  'Gmail':      'Roboto, Arial, sans-serif',
  'Apple Mail': '-apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif',
  'Outlook':    '"Segoe UI", Helvetica, Arial, sans-serif',
  'Yahoo Mail': 'Helvetica, Arial, sans-serif',
};
const MEASURE_PX = 14;
// Mixed-case sample (letters, digits, spaces, punctuation) ≈ a typical subject
// line — defines the "average character" width the limits are calibrated to.
const SAMPLE = 'The Quick Brown Fox Jumps Over 5 Lazy Dogs and 2 Cats! ';

const _ctx = document.createElement('canvas').getContext('2d');
const _avg = {};
function famFor(name) { return FONTS[name] || 'Arial, sans-serif'; }
function measure(text, fam) { _ctx.font = MEASURE_PX + 'px ' + fam; return _ctx.measureText(text || '').width; }
function avgCharW(fam) {
  if (_avg[fam] == null) _avg[fam] = measure(SAMPLE, fam) / [...SAMPLE].length;
  return _avg[fam];
}
// Effective length of `text` in average-characters, for a given client's font.
function effLen(text, name) {
  if (!text) return 0;
  const fam = famFor(name);
  return measure(text, fam) / avgCharW(fam);
}
// Raw Unicode character count — shown to the user as "characters typed".
function rlen(t) { return [...(t || '')].length; }

// Truncate `text` so its effective length fits `budget` average-characters.
function truncEff(text, budget, name) {
  if (effLen(text, name) <= budget) return { vis: text || '', cut: '' };
  const chars = [...(text || '')];
  let lo = 0, hi = chars.length;
  while (lo < hi) {                                   // largest prefix that still fits
    const mid = Math.ceil((lo + hi) / 2);
    if (effLen(chars.slice(0, mid).join(''), name) <= budget) lo = mid; else hi = mid - 1;
  }
  return { vis: chars.slice(0, lo).join(''), cut: chars.slice(lo).join('') };
}

function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function statusOf(n, safe, max) {
  if (n <= safe) return 'green';
  if (n <= max)  return 'orange';
  return 'red';
}

function badgeHtml(status) {
  const labels = { green: '✓ Fits', orange: '⚠ Risky', red: '✕ Truncated' };
  return '<span class="status-badge badge-' + status + '">' + labels[status] + '</span>';
}

function inboxMockHtml(c, sender, subject, preview) {
  const sn = esc(sender || 'Your Brand');
  const ix = c.inbox;

  if (ix.combined) {
    // Gmail: "Subject — Preview" on one line
    const st = truncEff(subject, ix.subjMax, c.name);
    const sepEff = effLen(' — ', c.name);
    const rem = Math.max(0, ix.combinedMax - effLen(st.vis, c.name) - sepEff);
    const pt  = truncEff(preview, rem, c.name);
    return '<div class="inbox-mock">' +
      '<div class="mock-sender">' + sn + '</div>' +
      '<div class="mock-line">' +
        '<span class="mock-subject">' + esc(st.vis) + (st.cut ? '<span class="mock-cut">…</span>' : '') + '</span>' +
        (preview ? '<span class="mock-sep"> — </span><span class="mock-prev">' +
          esc(pt.vis) + (pt.cut ? '<span class="mock-cut">…</span>' : '') + '</span>' : '') +
      '</div>' +
    '</div>';
  } else {
    // Apple / Outlook / Yahoo: two separate lines
    const st = truncEff(subject, ix.subjMax, c.name);
    const pt = truncEff(preview,  ix.prevMax, c.name);
    return '<div class="inbox-mock">' +
      '<div class="mock-sender">' + sn + '</div>' +
      '<div class="mock-line mock-subject-line">' + esc(st.vis) + (st.cut ? '<span class="mock-cut">…</span>' : '') + '</div>' +
      '<div class="mock-line mock-preview-line">' + esc(pt.vis) + (pt.cut ? '<span class="mock-cut">…</span>' : '') + '</div>' +
    '</div>';
  }
}

function render(sender, subject, preview) {
  const el = document.getElementById('results-list');
  if (!subject && !preview) {
    el.innerHTML = '<div class="empty-state"><span class="em"><span class="body"></span><span class="flap"></span></span>Fill in the fields above to check truncation</div>';
    return;
  }

  let html = '';
  for (const c of CLIENTS) {
    const sst = statusOf(effLen(subject, c.name), c.subj.safe, c.subj.max);
    const pst = statusOf(effLen(preview, c.name), c.prev.safe, c.prev.max);
    const dc  = c.device === 'mobile' ? 'device-mobile' : 'device-desktop';
    const dl  = c.device === 'mobile' ? 'Mobile' : 'Desktop';

    html += '<div class="client-card">' +
      '<div class="client-card-header">' +
        '<span class="client-card-name">' + c.name + '</span>' +
        '<span class="device-badge ' + dc + '">' + dl + '</span>' +
      '</div>' +
      inboxMockHtml(c, sender, subject, preview) +
      '<div class="status-rows">' +
        '<div class="status-row">' +
          '<span class="status-field">Subject line</span>' + badgeHtml(sst) +
        '</div>' +
        '<div class="status-row">' +
          '<span class="status-field">Preview text</span>' + badgeHtml(pst) +
        '</div>' +
      '</div>' +
    '</div>';
  }

  el.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', function() {
  const inpS = document.getElementById('inp-subject');
  const inpP = document.getElementById('inp-preview');
  const inpSender = document.getElementById('sender-input');
  const hint = document.getElementById('paste-hint');

  function update() {
    document.getElementById('cc-s').textContent = rlen(inpS.value);
    document.getElementById('cc-p').textContent = rlen(inpP.value);
    render(inpSender.value, inpS.value, inpP.value);
  }

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (!tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getSelection' }, function(response) {
      if (chrome.runtime.lastError) return;
      if (response && response.text && response.text.trim()) {
        inpS.value = response.text.trim();
        hint.textContent = '✓ Auto-filled from your selection';
        hint.classList.add('selected');
        update();
      }
    });
  });

  inpS.addEventListener('input', update);
  inpP.addEventListener('input', update);
  inpSender.addEventListener('input', update);
});
