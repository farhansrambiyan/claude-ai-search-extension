// Claude AI Search - content script (runs on claude.ai/new)
(function () {
    "use strict";
    const query = new URLSearchParams(location.search).get("q");
    if (!query || !query.trim()) return;
    const MAX_WAIT_MS = 10000;
    const POLL_INTERVAL = 150;
    let elapsed = 0;
    function findEditor() {
        return document.querySelector("div[contenteditable='true']") || document.querySelector("textarea");
    }
    function findSendButton() {
        return document.querySelector('button[aria-label="Send message"]') ||
            document.querySelector('button[aria-label="Send Message"]') ||
            document.querySelector('button[data-testid="send-button"]') ||
            [...document.querySelectorAll("button")].find(btn => !btn.disabled && (btn.getAttribute("aria-label") || "").toLowerCase().includes("send"));
    }
    function setNativeValue(el, value) {
        if (el.tagName === "TEXTAREA") {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
            setter.call(el, value);
            el.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
            el.innerText = value;
            el.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
        }
    }
    function attemptSubmit() {
        const editor = findEditor();
        if (!editor) {
            elapsed += POLL_INTERVAL;
            if (elapsed < MAX_WAIT_MS) setTimeout(attemptSubmit, POLL_INTERVAL);
            return;
        }
        const currentText = (editor.innerText || editor.value || "").trim();
        if (!currentText) setNativeValue(editor, query.trim());
        waitForSendButton();
    }
    function waitForSendButton() {
        const btn = findSendButton();
        if (btn && !btn.disabled) { btn.click(); return; }
        elapsed += POLL_INTERVAL;
        if (elapsed < MAX_WAIT_MS) setTimeout(waitForSendButton, POLL_INTERVAL);
    }
    setTimeout(attemptSubmit, 400);
})();