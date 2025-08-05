let questions = [];
let currentIndex = 0;
let correctCount = 0;
let startTime;

async function loadQuestions() {
  const res = await fetch("questions.txt");
  const text = await res.text();
  const blocks = text.trim().split(/#QUESTION\s*/).filter(Boolean);
  return blocks.map(block => {
    const lines = block.trim().split(/\n/);
    const question = lines[0];
    const answers = lines.slice(1).map(line => {
      return {
        text: line.slice(2).trim(),
        correct: line.startsWith("*")
      };
    });
    return { question, answers };
  });
}

function startQuiz() {
  document.getElementById("start-screen").classList.add("hidden");
  document.getElementById("quiz-screen").classList.remove("hidden");
  startTime = new Date();
  loadQuestions().then(qs => {
    questions = qs.sort(() => 0.5 - Math.random()).slice(0, 50);
    showQuestion();
  });
}

function showQuestion() {
  const q = questions[currentIndex];
  document.getElementById("question-number").textContent = \`Question \${currentIndex + 1}/50\`;
  document.getElementById("question-text").textContent = q.question;
  const container = document.getElementById("answers");
  container.innerHTML = "";
  q.answers.forEach((a, i) => {
    const div = document.createElement("div");
    div.innerHTML = \`<input type="checkbox" id="a\${i}"><label for="a\${i}"> \${a.text}</label>\`;
    container.appendChild(div);
  });
  document.getElementById("check-button").classList.remove("hidden");
  document.getElementById("next-button").classList.add("hidden");
}

function checkAnswer() {
  const q = questions[currentIndex];
  const inputs = document.querySelectorAll("#answers input");
  inputs.forEach((input, i) => {
    const label = input.nextElementSibling;
    if (input.checked && !q.answers[i].correct) {
      label.classList.add("incorrect");
    }
    if (q.answers[i].correct) {
      label.classList.add("correct");
    }
  });

  const allCorrect = q.answers.every((a, i) => {
    return a.correct === inputs[i].checked;
  });
  if (allCorrect) correctCount++;

  document.getElementById("check-button").classList.add("hidden");
  document.getElementById("next-button").classList.remove("hidden");
}

function nextQuestion() {
  currentIndex++;
  if (currentIndex < 50) {
    showQuestion();
  } else {
    showResult();
  }
}

function showResult() {
  document.getElementById("quiz-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");
  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  document.getElementById("result-score").textContent = \`You answered \${correctCount} out of 50 correctly.\`;
  document.getElementById("result-time").textContent = \`Time taken: \${minutes}m \${seconds}s\`;
}