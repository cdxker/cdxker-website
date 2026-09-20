import { fontStorageKey, getFont } from "../data/fonts.js";

const picker = document.getElementById("font-picker");
const description = document.getElementById("font-description");
const root = document.documentElement;

if (picker instanceof HTMLSelectElement && description) {
  const applyFont = (font) => {
    root.style.setProperty("--font-sans", font.stack);
    root.dataset.font = font.id;
    picker.value = font.id;
    description.textContent = font.description;
  };

  applyFont(getFont(root.dataset.font));
  picker.disabled = false;

  picker.addEventListener("change", () => {
    const font = getFont(picker.value);
    applyFont(font);

    try {
      localStorage.setItem(fontStorageKey, font.id);
    } catch {
      // The current selection still works when browser storage is unavailable.
    }
  });

  window.addEventListener("pageshow", (event) => {
    if (!event.persisted) return;
    try {
      applyFont(getFont(localStorage.getItem(fontStorageKey)));
    } catch {
      // Keep the current font if storage becomes unavailable.
    }
  });
}
