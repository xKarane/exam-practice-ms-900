let allQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let startTime;
let selectedAnswers = [];

const startBtn = document.getElementById("start-btn");
const quizScreen = document.getElementById("quiz-screen");
const startScreen = document.getElementById("start-screen");
const resultScreen = document.getElementById("result-screen");
const questionNumber = document.getElementById("question-number");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers");
const checkBtn = document.getElementById("check-button");
const nextBtn = document.getElementById("next-button");
const resultScore = document.getElementById("result-score");
const resultTime = document.getElementById("result-time");

startBtn.addEventListener("click", async () => {
  startScreen.classList.add("hidden");
  quizScreen.classList.remove("hidden");
  const data = await fetchQuestions();
  allQuestions = shuffleArray(data).slice(0, 50);
  startTime = new Date();
  selectedAnswers = [];
  currentQuestionIndex = 0;
  renderPastResults();  // Anzeige der vergangenen Ergebnisse aktualisieren
  loadQuestion();
});

checkBtn.addEventListener("click", () => {
  const current = allQuestions[currentQuestionIndex];
  const selected = Array.from(document.querySelectorAll("input[type=checkbox]:checked"))
    .map(cb => cb.value);

  selectedAnswers.push(selected);

  document.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.disabled = true;
    if (current.correct.includes(cb.value)) {
      cb.parentElement.classList.add("correct");
    } else if (cb.checked) {
      cb.parentElement.classList.add("wrong");
    }
  });

  checkBtn.classList.add("hidden");
  nextBtn.classList.remove("hidden");
});

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < allQuestions.length) {
    loadQuestion();
  } else {
    finishQuiz();
  }
});

function loadQuestion() {
  const current = allQuestions[currentQuestionIndex];
  questionNumber.textContent = `Question ${currentQuestionIndex + 1} of ${allQuestions.length}`;
  questionText.textContent = current.text;

  answersContainer.innerHTML = "";
  current.options.forEach((opt) => {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = opt;
    label.appendChild(checkbox);
    label.append(` ${opt}`);
    answersContainer.appendChild(label);
  });

  checkBtn.classList.remove("hidden");
  nextBtn.classList.add("hidden");
}

function finishQuiz() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");

  let correctCount = 0;
  allQuestions.forEach((q, i) => {
    const selected = selectedAnswers[i];
    const correct = q.correct;
    if (arraysEqual(new Set(selected), new Set(correct))) {
      correctCount++;
    }
  });

  const endTime = new Date();
  const duration = Math.floor((endTime - startTime) / 1000);
  const percent = Math.round((correctCount / allQuestions.length) * 100);
  const pass = percent >= 80;

  resultScore.innerHTML = `
    <strong>Score:</strong> ${percent}% (${correctCount} of ${allQuestions.length})<br>
    <div style="width: 100%; background: #444; height: 20px; margin-top: 5px;">
      <div style="width: ${percent}%; height: 100%; background: ${pass ? 'green' : 'red'};"></div>
    </div>
    <p style="color: ${pass ? 'lightgreen' : 'orange'};"><strong>${pass ? 'Pass' : 'Not Pass'}</strong></p>
  `;
  resultTime.textContent = `Time taken: ${duration} seconds.`;

  saveResult({ date: new Date().toLocaleString(), score: percent, correct: correctCount, total: allQuestions.length, duration });
  renderPastResults();
}

function arraysEqual(a, b) {
  return a.size === b.size && [...a].every(value => b.has(value));
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function fetchQuestions() {
  const res = await fetch("questions.txt");
  const text = await res.text();
  return parseQuestions(text);
}

function parseQuestions(text) {
  const lines = text.split("\n");
  const questions = [];
  let current = null;

  for (const line of lines) {
    if (line.startsWith("#QUESTION")) {
      if (current) questions.push(current);
      current = { text: "", options: [], correct: [] };
    } else if (line.startsWith("* ")) {
      current.options.push(line.substring(2));
      current.correct.push(line.substring(2));
    } else if (line.startsWith("- ")) {
      current.options.push(line.substring(2));
    } else if (line.trim()) {
      current.text += (current.text ? " " : "") + line.trim();
    }
  }

  if (current) questions.push(current);
  return questions;
}

// Speichert Ergebnisse im localStorage (max. 10)
function saveResult(result) {
  const existing = JSON.parse(localStorage.getItem("quizResults") || "[]");
  existing.unshift(result);
  localStorage.setItem("quizResults", JSON.stringify(existing.slice(0, 10)));
}

// Zeigt vergangene Ergebnisse im Startbildschirm
function renderPastResults() {
  const pastContainer = document.getElementById("past-results");
  const data = JSON.parse(localStorage.getItem("quizResults") || "[]");

  if (!pastContainer) return;

  if (data.length === 0) {
    pastContainer.innerHTML = "<p>No previous results.</p>";
    return;
  }

  let table = `<h3>Past Results</h3><table><tr><th>Date</th><th>Score</th><th>Correct</th><th>Time (s)</th></tr>`;
  data.forEach(res => {
    table += `<tr>
      <td>${res.date}</td>
      <td>${res.score}%</td>
      <td>${res.correct} / ${res.total}</td>
      <td>${res.duration}</td>
    </tr>`;
  });
  table += `</table>`;

  pastContainer.innerHTML = table;
}

// Beim ersten Laden Seite Past Results anzeigen
document.addEventListener("DOMContentLoaded", () => {
  renderPastResults();
});
