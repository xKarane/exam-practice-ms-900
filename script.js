document.addEventListener("DOMContentLoaded", () => {
  let allQuestions = [];
  let currentQuestionIndex = 0;
  let selectedAnswers = [];
  let startTime;

  const startBtn = document.getElementById("start-btn");
  const startScreen = document.getElementById("start-screen");
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");

  const questionNumber = document.getElementById("question-number");
  const questionText = document.getElementById("question-text");
  const answersContainer = document.getElementById("answers");
  const checkBtn = document.getElementById("check-button");
  const nextBtn = document.getElementById("next-button");

  const resultScore = document.getElementById("result-score");
  const resultTime = document.getElementById("result-time");

  function saveResult(score, total, duration) {
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]");
    results.unshift({
      date: new Date().toLocaleString(),
      score,
      total,
      duration,
    });
    localStorage.setItem("quizResults", JSON.stringify(results.slice(0, 10))); // max 10 speichern
  }

  function loadResults() {
    return JSON.parse(localStorage.getItem("quizResults") || "[]");
  }

  function displayResults() {
    const results = loadResults();
    const container = document.getElementById("past-results");
    if (!container) return;
    if (results.length === 0) {
      container.innerHTML = "<p>No previous test results.</p>";
      return;
    }
    let html = "<table><thead><tr><th>Date</th><th>Score</th><th>Time (s)</th></tr></thead><tbody>";
    results.forEach(r => {
      html += `<tr><td>${r.date}</td><td>${r.score} / ${r.total}</td><td>${r.duration}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  }

  startBtn.addEventListener("click", async () => {
    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    const data = await fetchQuestions();
    allQuestions = shuffleArray(data).slice(0, 50);
    startTime = new Date();
    selectedAnswers = [];
    currentQuestionIndex = 0;
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
    current.options.forEach(opt => {
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

    saveResult(correctCount, allQuestions.length, duration);

    resultScore.textContent = `You answered ${correctCount} out of ${allQuestions.length} questions correctly.`;
    resultTime.textContent = `Time taken: ${duration} seconds.`;
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

  // Direkt beim Laden der Seite die alten Ergebnisse anzeigen
  displayResults();
});
