// Claude AI Search - popup script
const toggle = document.getElementById("mainToggle");
const brandLogo = document.getElementById("brandLogo");
const toggleSub = document.getElementById("toggleSub");

function applyUI(enabled) {
    toggle.checked = enabled;
    if (enabled) {
        toggleSub.textContent = "All address-bar searches open Claude.ai";
    } else {
        toggleSub.textContent = "Searches use your default engine";
    }
}

chrome.storage.sync.get({ enabled: true }, ({ enabled }) => { applyUI(enabled); });
toggle.addEventListener("change", () => {
    const enabled = toggle.checked;
    applyUI(enabled);
    chrome.runtime.sendMessage({ type: "SET_ENABLED", enabled });
});