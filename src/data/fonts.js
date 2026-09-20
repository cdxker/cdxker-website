export const defaultFontId = "fira-sans";
export const fontStorageKey = "cdxker-font";

export const fontOptions = [
  {
    id: "fira-sans",
    name: "Fira Sans",
    description: "The original. Familiar and informal.",
    stack: '"Fira Sans", system-ui, sans-serif',
    googleFamily: "Fira+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900",
  },
  {
    id: "source-sans-3",
    name: "Source Sans 3",
    description: "Clear and human. A quiet fit for the whole site.",
    stack: '"Source Sans 3", system-ui, sans-serif',
    googleFamily: "Source+Sans+3:ital,wght@0,400..900;1,400..900",
  },
  {
    id: "dm-sans",
    name: "DM Sans",
    description: "Modern and rounded. A little more geometric.",
    stack: '"DM Sans", system-ui, sans-serif',
    googleFamily: "DM+Sans:ital,wght@0,400..900;1,400..900",
  },
  {
    id: "source-serif-4",
    name: "Source Serif 4",
    description: "A balanced serif for essays and poems.",
    stack: '"Source Serif 4", Georgia, "Times New Roman", serif',
    googleFamily: "Source+Serif+4:ital,wght@0,400..900;1,400..900",
  },
  {
    id: "literata",
    name: "Literata",
    description: "Bookish and expressive. Try it on a poem.",
    stack: '"Literata", Georgia, "Times New Roman", serif',
    googleFamily: "Literata:ital,wght@0,400..900;1,400..900",
  },
];

export function getFont(id) {
  return fontOptions.find((font) => font.id === id) ?? fontOptions[0];
}

export const fontStylesheetUrl = `https://fonts.googleapis.com/css2?${fontOptions
  .map((font) => `family=${font.googleFamily}`)
  .join("&")}&display=swap`;
