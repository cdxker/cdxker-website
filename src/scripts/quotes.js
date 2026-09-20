const quotes = [
  {
    top: "make software",
    bottom: "be happy.",
  },
  {
    top: "just make software",
    bottom: "life will make sense.",
  },
  {
    top: "make what you want",
    bottom: "be a picky user.",
  },
];

const textAnimations = new WeakMap();

function animateText(element, newText) {
  // Delayed typing must stop when the next quote starts.
  const previousAnimation = textAnimations.get(element);
  if (previousAnimation) {
    clearTimeout(previousAnimation.timeoutId);
  }

  const animation = { timeoutId: null };
  textAnimations.set(element, animation);
  let currentIndex = 0;
  element.textContent = "";

  function addNextChar() {
    if (textAnimations.get(element) !== animation) return;

    currentIndex++;
    element.textContent = newText.slice(0, currentIndex);

    if (currentIndex < newText.length) {
      animation.timeoutId = setTimeout(addNextChar, 50);
    } else {
      textAnimations.delete(element);
    }
  }

  addNextChar();
}

// Astro bundles this as a module, so the document is parsed before it runs.
const topElement = document.querySelector(".top-quote");
const bottomElement = document.querySelector(".bottom-quote");

if (topElement && bottomElement) {
  setInterval(() => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    animateText(topElement, quote.top);
    animateText(bottomElement, quote.bottom);
  }, 3500);
}
