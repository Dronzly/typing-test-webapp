const textDisplay = document.getElementById("text-display");
const inputBox = document.getElementById("input-box");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");

let timer = 60;
let interval;
let currentText = "";
let totalTyped = 0;
let correctTyped = 0;

let mistakes = {};
let streak = 0;
let maxStreak = 0;

const texts = [
  "The quick brown fox jumps over the lazy dog",
  "Typing fast requires practice and patience",
  "JavaScript makes websites interactive and dynamic"
];

function startTest() {
  reset();
  currentText = texts[Math.floor(Math.random() * texts.length)];
  renderText();
}

function startTraining() {
  reset();
  currentText = generateTrainingText();
  renderText();
}

function reset() {
  timer = 60;
  mistakes = {};
  streak = 0;
  maxStreak = 0;
  totalTyped = 0;
  correctTyped = 0;

  inputBox.value = "";
  inputBox.disabled = false;
  inputBox.focus();

  document.getElementById("result").classList.add("hidden");

  interval = setInterval(updateTime, 1000);
}

function renderText() {
  textDisplay.innerHTML = currentText
    .split("")
    .map(c => `<span>${c}</span>`)
    .join("");
}

function updateTime() {
  timer--;
  timeDisplay.textContent = timer;

  if (timer === 0) endTest();
}

function endTest() {
  clearInterval(interval);
  inputBox.disabled = true;

  document.getElementById("final-wpm").textContent = wpmDisplay.textContent;
  document.getElementById("final-accuracy").textContent = accuracyDisplay.textContent;
  document.getElementById("result").classList.remove("hidden");
}

inputBox.addEventListener("input", () => {
  const typed = inputBox.value;
  totalTyped = typed.length;

  const spans = textDisplay.querySelectorAll("span");
  correctTyped = 0;

  spans.forEach((span, i) => {
    const char = typed[i];
    const expected = span.textContent;

    span.classList.remove("correct", "wrong", "current");

    if (char === expected) {
      span.classList.add("correct");
      correctTyped++;
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else if (char) {
      span.classList.add("wrong");
      streak = 0;

      mistakes[expected] = (mistakes[expected] || 0) + 1;
    }

    if (i === typed.length) span.classList.add("current");
  });

  document.getElementById("streak").textContent = maxStreak;

  let accuracy = totalTyped === 0 ? 100 : Math.floor((correctTyped / totalTyped) * 100);
  accuracyDisplay.textContent = accuracy;

  let timeElapsed = 60 - timer;
  let wpm = timeElapsed > 0 ? Math.floor((correctTyped / 5) / (timeElapsed / 60)) : 0;
  wpmDisplay.textContent = wpm;

  // 🔥 SMOOTH SCROLL
  const currentSpan = spans[typed.length];
  if (currentSpan) {
    const offset = currentSpan.offsetLeft;
    textDisplay.style.transform = `translateX(-${offset - 150}px)`;
  }

  if (typed.length === currentText.length) endTest();
});

function generateTrainingText() {
  const weakChars = Object.keys(mistakes);

  if (weakChars.length === 0) {
    return texts[Math.floor(Math.random() * texts.length)];
  }

  return weakChars.join(" ").repeat(5);
}

document.addEventListener("click", () => inputBox.focus());