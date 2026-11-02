# 📨 Subject Line Checker

**See exactly how your subject line and preview text get cut across Gmail, Apple Mail, Outlook and Yahoo — before you hit send.**

![Manifest V3](https://img.shields.io/badge/Manifest-V3-15121f)
![Version](https://img.shields.io/badge/version-1.2-FF3FA4)
[![Made by David Bustos](https://img.shields.io/badge/made%20by-David%20Bustos-00B8D4)](https://david.sendgoodemails.com)

You write a great subject line. You send the campaign. Then you see it in someone's inbox — sliced in half, mid-word, right before the part that mattered.

Subject Line Checker shows you the cut **before** it happens. Type your subject line and preview text, and it renders a live inbox mock for every major client and device, telling you whether each one **fits**, is **risky**, or will be **truncated**.

> 🌐 **Prefer not to install anything?** There's a free web version: **[david.sendgoodemails.com/subject-line-checker](https://david.sendgoodemails.com/subject-line-checker/)**

---

## ✨ Features

- **Live inbox previews** — see the actual truncation point per client, not just a character count
- **Mobile *and* desktop** for each provider, side by side
- **Traffic-light verdicts** — ✓ Fits / ⚠ Risky / ✕ Truncated for both subject line and preview text
- **Auto-fill from selection** — highlight a subject line on any page, open the extension, and it's already filled in
- **Width-aware accuracy** — it measures *rendered pixel width*, not characters (see below)
- **100% local & private** — nothing is sent anywhere, no accounts, no analytics
- **Manifest V3**, zero dependencies

## 🎯 Why it's more accurate than a character counter

Most tools count characters. But inboxes don't truncate by character — they truncate by **pixel width**. An `l` is roughly a quarter the width of a `W`, so "43 characters" means nothing on its own:

```
illillillillillillillillillillillillillilli   ← 43 chars, fits easily
WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW   ← 43 chars, blown past the limit
```

This extension measures the **rendered width of your actual text** in each client's font (via canvas text metrics) and converts it to "effective characters". Skinny text gets more room, wide text gets less — and emoji are measured at their true width too. The researched per-client limits stay as the calibration, so normal copy behaves as you'd expect while the edges get judged the way a real inbox renders them.

## 📬 What it checks

| Client | Devices | Layout |
| --- | --- | --- |
| **Gmail** | Mobile + Desktop | Subject and preview share one line |
| **Apple Mail** | Mobile + Desktop | Subject and preview on separate lines |
| **Outlook** | Mobile + Desktop | Subject and preview on separate lines |
| **Yahoo Mail** | Mobile | Subject and preview on separate lines |

## 📦 Install

**From the Chrome Web Store:** [Add to Chrome](https://chromewebstore.google.com/detail/subject-line-checker/jfinblmdccjekfocdbfehdbmnjoadlpi) — free, no account.

**Or load it from source:**

1. Download or clone this repo
2. Open `chrome://extensions`
3. Turn on **Developer mode** (top-right)
4. Click **Load unpacked** and select the folder
5. Pin the icon

Works in Chrome and any Chromium browser (Edge, Brave, Arc, Vivaldi…).

## 🔒 Privacy

Everything runs locally in your browser. The extension makes **no network requests**, collects nothing, and has no account or analytics. Your subject lines never leave your machine.

**Permissions:**
- `activeTab` — so the popup can read text you've selected on the current page (the auto-fill convenience)
- content script — reads `window.getSelection()` only, and only when the popup asks for it

## 👋 Built by David Bustos

I'm an email & content marketer who builds small tools to kill everyday friction. If this is useful, you might like the rest:

- 🌐 **Portfolio & tools** — [david.sendgoodemails.com](https://david.sendgoodemails.com)
- 🔗 **Clean Copy URL** — copy any URL with the tracking junk (UTM, gclid, fbclid…) stripped, in one shortcut → [repo](https://github.com/sendgoodemailscom/clean-copy-url)
- 🗂️ **Tab Switcher** — a visual Alt+Tab for your browser tabs → [repo](https://github.com/sendgoodemailscom/tab-switcher-extension)
- ✉️ **Send Good Emails** — my email-marketing site & newsletter → [sendgoodemails.com](https://www.sendgoodemails.com)

---

Found a client whose truncation is off, or want another one added? [Open an issue or PR](https://github.com/sendgoodemailscom/subject-line-checker/issues) — the limits improve with what people report.
