const root = document.documentElement;

const translations = {
  en: {
    settings: "Settings",
    search: "Search",
    writtenBy: "Written by:",
    preferences: "PREFERENCES",
    appearance: "Appearance",
    appearanceDescription: "Choose your preferred theme.",
    light: "Light",
    dark: "Dark",
    language: "Language",
    languageDescription: "Choose the interface language.",
    saved: "Your preferences are saved on this device.",
    searchPlaceholder: "Search the web...",
    searchLabel: "Search the web",
    closeSettings: "Close settings"
  },
  vi: {
    settings: "Cài đặt",
    search: "Tìm kiếm",
    writtenBy: "Được tạo bởi:",
    preferences: "TÙY CHỈNH",
    appearance: "Giao diện",
    appearanceDescription: "Chọn giao diện bạn muốn sử dụng.",
    light: "Sáng",
    dark: "Tối",
    language: "Ngôn ngữ",
    languageDescription: "Chọn ngôn ngữ hiển thị.",
    saved: "Cài đặt đã được lưu trên thiết bị này.",
    searchPlaceholder: "Tìm kiếm trên web...",
    searchLabel: "Tìm kiếm trên web",
    closeSettings: "Đóng cài đặt"
  }
};

function readPreference(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

function savePreference(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Preferences still apply for the current page if storage is unavailable.
  }
}

function applyTheme(theme) {
  const selected = theme === "light" ? "light" : "dark";
  root.setAttribute("data-theme", selected);
  root.style.colorScheme = selected;
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.themeChoice === selected));
  });
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.content = selected === "light" ? "#f5f5f7" : "#0f0f10";
  savePreference("devant-theme", selected);
}

function applyLanguage(language) {
  const selected = translations[language] ? language : "en";
  document.documentElement.lang = selected;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (translations[selected][key]) element.textContent = translations[selected][key];
  });

  const searchInput = document.querySelector(".type");
  searchInput.placeholder = translations[selected].searchPlaceholder;
  searchInput.setAttribute("aria-label", translations[selected].searchLabel);
  document.getElementById("closeSettings").setAttribute("aria-label", translations[selected].closeSettings);
  document.getElementById("languageSelect").value = selected;
  savePreference("devant-language", selected);
}

const settingsButton = document.getElementById("settingsButton");
const closeButton = document.getElementById("closeSettings");
const panel = document.getElementById("settingsPanel");
const overlay = document.getElementById("overlay");

function openSettings() {
  panel.removeAttribute("hidden");
  overlay.removeAttribute("hidden");
  closeButton.focus();
}

function closeSettings() {
  panel.setAttribute("hidden", "");
  overlay.setAttribute("hidden", "");
  settingsButton.focus();
}

settingsButton.addEventListener("click", openSettings);
closeButton.addEventListener("click", closeSettings);
overlay.addEventListener("click", closeSettings);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !panel.hasAttribute("hidden")) closeSettings();
});

document.querySelectorAll("[data-theme-choice]").forEach((button) => {
  button.addEventListener("click", () => applyTheme(button.dataset.themeChoice));
});

document.getElementById("languageSelect").addEventListener("change", (event) => {
  applyLanguage(event.target.value);
});

// Initialize theme and language on page load
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(readPreference("devant-theme", "dark"));
  applyLanguage(readPreference("devant-language", "en"));
});

// Fallback initialization if DOMContentLoaded already fired
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(readPreference("devant-theme", "dark"));
    applyLanguage(readPreference("devant-language", "en"));
  });
} else {
  applyTheme(readPreference("devant-theme", "dark"));
  applyLanguage(readPreference("devant-language", "en"));
}
