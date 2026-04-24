const textDisplay = document.getElementById("text-display");
const inputBox = document.getElementById("input-box");
const timeDisplay = document.getElementById("time");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const caret = document.getElementById("caret");

inputBox.disabled = true;

let timer = 60;
let interval = null;
let currentText = "";
let totalTyped = 0;
let correctTyped = 0;

let mistakes = {};
let streak = 0;
let maxStreak = 0;

const texts = [
  "The quick brown fox jumps over the lazy dog",
  "Typing fast requires practice and patience",
  "JavaScript makes websites interactive and dynamic",
  "Consistency is the key to improving typing speed"
];

const wordBank = [
  "test","type","speed","focus","train","reset","steel","street","sense","letter",
  "better","water","enter","system","keyboard","practice","target","effort","result",
  "simple","random","words","input","output","correct","wrong","track","skill",
  "level","power","smart","learn","improve","typing","accuracy","control"
];

function startTest() {
  timer = 60;
  mistakes = {};
  streak = 0;
  maxStreak = 0;

  totalTyped = 0;
  correctTyped = 0;

  inputBox.value = "";
  wpmDisplay.textContent = 0;
  accuracyDisplay.textContent = 100;
  timeDisplay.textContent = timer;

  inputBox.disabled = false;
  inputBox.focus();

  currentText = texts[Math.floor(Math.random() * texts.length)];

  textDisplay.innerHTML = currentText
    .split("")
    .map(char => `<span>${char}</span>`)
    .join("");

  const firstSpan = textDisplay.querySelector("span");
  if (firstSpan) firstSpan.classList.add("current");

  setTimeout(moveCaret, 50);

  clearInterval(interval);
  interval = setInterval(updateTime, 1000);
}

function startTraining() {
  timer = 60;
  mistakes = {};
  streak = 0;
  maxStreak = 0;

  totalTyped = 0;
  correctTyped = 0;

  inputBox.value = "";
  wpmDisplay.textContent = 0;
  accuracyDisplay.textContent = 100;
  timeDisplay.textContent = timer;

  inputBox.disabled = false;
  inputBox.focus();

  currentText = generateTrainingText();

  textDisplay.innerHTML = currentText
    .split("")
    .map(char => `<span>${char}</span>`)
    .join("");

  setTimeout(moveCaret, 50);

  clearInterval(interval);
  interval = setInterval(updateTime, 1000);
}

function updateTime() {
  timer--;
  timeDisplay.textContent = timer;

  if (timer === 0) {
    endTest();
  }
}

function endTest() {
  clearInterval(interval);
  inputBox.disabled = true;

  saveResult(wpmDisplay.textContent, accuracyDisplay.textContent);
  loadHistory();
  showWeakKeys();
}

inputBox.addEventListener("input", () => {
  const typed = inputBox.value;

  if (typed.length > currentText.length) {
    inputBox.value = typed.slice(0, currentText.length);
    return;
  }

  totalTyped = typed.length;

  const spans = textDisplay.querySelectorAll("span");
  correctTyped = 0;

  spans.forEach((span, index) => {
    const typedChar = typed[index];
    const expected = span.textContent;

    span.classList.remove("correct", "wrong", "current", "active");

    if (typedChar === undefined) {
      // untouched
    } else if (typedChar === expected) {
      span.classList.add("correct");
      correctTyped++;

      streak++;
      if (streak > maxStreak) maxStreak = streak;

    } else {
      span.classList.add("wrong");

      streak = 0;

      if (!mistakes[expected]) {
        mistakes[expected] = 0;
      }

      mistakes[expected]++;
    }

    if (index === typed.length) {
      span.classList.add("current");
    }

    if (Math.abs(index - typed.length) < 5) {
      span.classList.add("active");
    }
  });

  document.getElementById("streak").textContent = maxStreak;

  let accuracy = totalTyped === 0
    ? 100
    : Math.floor((correctTyped / totalTyped) * 100);

  accuracyDisplay.textContent = accuracy;

  let timeElapsed = 60 - timer;

  let wpm = timeElapsed > 0
    ? Math.floor((correctTyped / 5) / (timeElapsed / 60))
    : 0;

  wpmDisplay.textContent = wpm;

  moveCaret();
});

function moveCaret() {
  const spans = textDisplay.querySelectorAll("span");
  const currentIndex = inputBox.value.length;

  let target = spans[currentIndex] || spans[currentIndex - 1];

  if (target) {
    const rect = target.getBoundingClientRect();
    const containerRect = textDisplay.getBoundingClientRect();

    caret.style.left = rect.left - containerRect.left - 1 + "px";
    caret.style.top = rect.top - containerRect.top + "px";
  }
}

function generateTrainingText() {
  const weakChars = Object.keys(mistakes);

  if (weakChars.length === 0) {
    return texts[Math.floor(Math.random() * texts.length)];
  }

  let scoredWords = wordBank.map(word => {
    let score = 0;

    for (let char of word) {
      if (weakChars.includes(char)) score++;
    }

    return { word, score };
  });

  scoredWords.sort((a, b) => b.score - a.score);

  return scoredWords.slice(0, 20).map(w => w.word).join(" ");
}

function saveResult(wpm, accuracy) {
  let history = JSON.parse(localStorage.getItem("typingHistory")) || [];

  history.push({
    wpm,
    accuracy,
    date: new Date().toLocaleString()
  });

  localStorage.setItem("typingHistory", JSON.stringify(history));
}

function loadHistory() {
  const historyDiv = document.getElementById("history");
  let history = JSON.parse(localStorage.getItem("typingHistory")) || [];

  if (!historyDiv) return;

  if (history.length === 0) {
    historyDiv.innerHTML = "<p>No history yet</p>";
    return;
  }

  let html = "<h3>Recent Results</h3>";

  history.slice(-5).reverse().forEach(entry => {
    html += `<p>⚡ ${entry.wpm} WPM | 🎯 ${entry.accuracy}%</p>`;
  });

  historyDiv.innerHTML = html;
}

function showWeakKeys() {
  const weak = Object.entries(mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(x => x[0])
    .join(", ");

  textDisplay.innerHTML += `<br><br>🔥 Weak keys: ${weak}`;
}

document.addEventListener("click", () => {
  inputBox.focus();
});

loadHistory();