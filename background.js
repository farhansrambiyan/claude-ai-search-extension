// Claude AI Search - background service worker
const BYPASS_RULE_ID = 1;

const bypassRule = {
    id: BYPASS_RULE_ID,
    priority: 1,
    action: {
        type: "redirect",
        redirect: { regexSubstitution: "https://www.google.com/search?q=\\1" }
    },
    condition: {
        regexFilter: "^https://claude\.ai/new\\?q=(.*)$",
        resourceTypes: ["main_frame"]
    }
};

async function applyToggleState(enabled) {
    if (enabled) {
        await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [BYPASS_RULE_ID], addRules: [] });
    } else {
        await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: [BYPASS_RULE_ID], addRules: [bypassRule] });
    }
}

chrome.runtime.onInstalled.addListener(async () => {
    const { enabled } = await chrome.storage.sync.get({ enabled: true });
    await applyToggleState(enabled);
    chrome.contextMenus.create({ id: "claude-parent", title: "Claude AI", contexts: ["selection"] });
    chrome.contextMenus.create({ id: "claude-answer", parentId: "claude-parent", title: 'Ask: "%s"', contexts: ["selection"] });
    chrome.contextMenus.create({ id: "claude-summarize", parentId: "claude-parent", title: 'Summarize: "%s"', contexts: ["selection"] });
});

chrome.runtime.onStartup.addListener(async () => {
    const { enabled } = await chrome.storage.sync.get({ enabled: true });
    await applyToggleState(enabled);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "SET_ENABLED") {
        chrome.storage.sync.set({ enabled: message.enabled }, async () => {
            await applyToggleState(message.enabled);
            sendResponse({ ok: true });
        });
        return true;
    }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const text = info.selectionText;
    if (!text) return;
    let prompt = "";
    if (info.menuItemId === "claude-answer") prompt = `Explain or answer this: "${text}"`;
    else if (info.menuItemId === "claude-summarize") prompt = `Summarize this: "${text}"`;
    if (prompt) chrome.tabs.create({ url: `https://claude.ai/new?q=${encodeURIComponent(prompt)}`, index: tab.index + 1 });
});