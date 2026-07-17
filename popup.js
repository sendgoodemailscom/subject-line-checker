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

function rlen(t) { return [...(t||'')].length; }

function trunc(t, max) {
  const c = [...(t||'')];
  if (c.length <= max) return { vis: t||'', cut: '' };
  return { vis: c.slice(0,max).join(''), cut: c.slice(max).join('') };
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
    const st = trunc(subject, ix.subjMax);
    const rem = Math.max(0, ix.combinedMax - rlen(st.vis) - 3);
    const pt  = trunc(preview, rem);
    return '<div class="inbox-mock">' +
      '<div class="mock-sender">' + sn + '</div>' +
      '<div class="mock-line">' +
        '<span class="mock-subject">' + esc(st.vis) + (st.cut ? '<span class="mock-cut">…</span>' : '') + '</span>' +
        (preview ? '<span class="mock-sep"> — </span><span class="mock-prev">' +
          esc(pt.vis) + (pt.cut ? '<span class="mock-cut">…</span>' : '') + '</span>' : '') +
      '</div>' +
    '</div>';
  } else {
    const st = trunc(subject, ix.subjMax);
    const pt  = trunc(preview,  ix.prevMax);
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
    el.innerHTML = '<div class="empty-state"><span class="em">📬</span>Fill in the fields above to check truncation</div>';
    return;
  }

  let html = '';
  for (const c of CLIENTS) {
    const sn  = rlen(subject);
    const pn  = rlen(preview);
    const sst = statusOf(sn, c.subj.safe, c.subj.max);
    const pst = statusOf(pn, c.prev.safe, c.prev.max);
    const dc  = c.device === 'mobile' ? 'device-mobile' : 'device-desktop';
    const dl  = c.device === 'mobile' ? '📱 Mobile' : '🖥 Desktop';

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
