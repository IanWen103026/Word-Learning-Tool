// Variables
let currentQuestion = 0;
let correctCount = 0;
let wrongCount = 0;
let usedIndices = [];
let currentIndex = getRandomIndex();
let mode = 0; // 0: first & last char, 1: only first, 2: none

const checkButtonElem = document.getElementById('check-button');
const originalCheckButtonHTML = checkButtonElem.innerHTML;

document.getElementById('qcount').textContent = jsonData.length;

// Difficulty: easy -> mid -> hard
function toggleMode() {
  const button = document.getElementById('toggle-button');

  mode = (mode + 1) % 3;
  button.textContent = ['難度：易', '難度：中', '難度：難'][mode];

  loadQuestion();
}

// Random question
function getRandomIndex() {
  if (usedIndices.length >= jsonData.length) return null;

  let randomIndex;
  do {
    randomIndex = Math.floor(Math.random() * jsonData.length);
  } while (usedIndices.includes(randomIndex));

  return randomIndex;
}

const hintWhiteList = ["n", "ving", "v","vt","vi","adj","adv","...","sb","sth","one's"]; // 不被隱藏

// Generate hint
function getHint() {
  

  return jsonData[currentIndex].English.split(" ").map(word => {
    return word.split("/").map(part => {
      if (hintWhiteList.includes(part.toLowerCase())) return part;

      if (part.length <= 3) return "_";
      const first = part[0], last = part[part.length - 1];

      if (mode === 0) return `${first}_${last}`;
      if (mode === 1) return `${first}_`;
      return "_";
    }).join("/");
  }).join(" ");
}


// Render question
function loadQuestion() {
  if (currentIndex === null) return;

  document.getElementById('current-question').textContent = currentQuestion;
  document.getElementById('chinese-word').innerHTML =
  `<span id="darken">${getHint()}</span> <span>${jsonData[currentIndex].Chinese}</span>`;

  updateProgressChart();
}

const slider = document.getElementById('resize-slider');
const questionContainer = document.getElementById('question-container');

// 當滑桿值改變時，更新縮放並保存設置到 Cookie 中
slider.addEventListener('input', function () {
  const scaleValue = slider.value / 400; // 假設最大值為 400
  questionContainer.style.transform = `scale(${scaleValue})`;

  // 保存縮放比例到 Cookie，過期時間為 7 天
  setCookie('pageScale', scaleValue, 7);
});



// Input
/**
 * Checks the user's answer against the correct answer and updates the result and counts.
 */
function checkAnswer() {
  if (usedIndices.length >= jsonData.length) return;

  const input = document.getElementById('user-input').value.trim().toLowerCase();
  const answer = jsonData[currentIndex].English.toLowerCase();
  const resultElem = document.getElementById('result');
  const nextBtn = document.getElementById('next-button');
  const filteredInput = input
  .split(" ")
  .filter(word => !hintWhiteList.includes(word) && !word.includes("/"))
  .join(" ");

const filteredAnswer = answer
  .split(" ")
  .filter(word => !hintWhiteList.includes(word) && !word.includes("/"))
  .join(" ");

  if (filteredInput === filteredAnswer) {
    resultElem.textContent = '正確！';
    usedIndices.push(currentIndex);
    correctCount++;
  } else {
    resultElem.textContent = `錯誤，正確答案是: ${answer}`;
    wrongCount++;
  }

  currentQuestion++;
  nextBtn.style.display = 'flex';
  document.getElementById('correct-count').textContent = correctCount;
  document.getElementById('wrong-count').textContent = wrongCount;
  updateProgressChart();

  if (usedIndices.length === jsonData.length) {
    document.getElementById('result2').textContent = '已完成作答！';
    nextBtn.style.display = 'none';
    changeCheckButtonToReset();
  }
}

function changeCheckButtonToReset() {
  const btn = document.getElementById('check-button');
  btn.innerHTML = `
    <span class="shadow"></span>
    <span class="edge"></span>
    <span class="front">重新開始</span>
  `;
  btn.setAttribute('onclick', 'resetQuiz()');
}

// Reset progress & data
function resetQuiz() {
  resetProgress();
  correctCount = 0;
  wrongCount = 0;
  usedIndices = [];
  currentQuestion = 0;

  document.getElementById('correct-count').textContent = 0;
  document.getElementById('wrong-count').textContent = 0;
  document.getElementById('current-question').textContent = 0;
  document.getElementById('accuracy').textContent = "0%";
  document.getElementById('progress').textContent = "0%";
  document.getElementById('result').textContent = '';
  document.getElementById('result2').textContent = '';
  document.getElementById('user-input').value = '';
  document.getElementById('completion-progress').style.width = '0%';
  document.getElementById('accuracy-progress').style.width = '0%';

  currentIndex = getRandomIndex();
  currentQuestion++;
  loadQuestion();

  const btn = document.getElementById('check-button');
  btn.innerHTML = originalCheckButtonHTML;
  btn.setAttribute('onclick', 'checkAnswer()');
}

// Load next question
function nextQuestion() {
  if (usedIndices.length === jsonData.length) return;

  storeProgress();
  document.getElementById('next-button').style.display = 'none';
  document.getElementById('user-input').value = '';
  document.getElementById('result').textContent = '';
  document.getElementById('result2').textContent = '';

  currentIndex = getRandomIndex();
  if (currentIndex !== null) loadQuestion();
}

// Update chart
function updateProgressChart() {
  const total = jsonData.length;
  const completed = usedIndices.length;
  const completion = (completed / total) * 100;
  const accuracy = currentQuestion != 1 ? (correctCount / (currentQuestion - 1)) * 100 : 0;
  document.getElementById('completion-progress').style.width = `${completion}%`;
  document.getElementById('completion-text').textContent = `${correctCount} / ${total} (${Math.round(completion)}%)`;

  document.getElementById('accuracy-progress').style.width = `${accuracy}%`;
  document.getElementById('accuracy-text').textContent = `${Math.round(accuracy)}%`;
}

function checkOnEnter(event) {
  if (event.key === 'Enter') {
    const nextBtn = document.getElementById('next-button');
    nextBtn.style.display === 'flex' ? nextQuestion() : checkAnswer();
  }
}

// Cookie operations
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let c of ca) {
    c = c.trim();
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length);
  }
  return null;
}

function storeProgress() {
  setCookie('correctCount', correctCount, 7);
  setCookie('wrongCount', wrongCount, 7);
  setCookie('usedIndices', JSON.stringify(usedIndices), 7);
  setCookie('currentQuestion', currentQuestion, 7);
  setCookie('totalQuestion', jsonData.length, 7);
}

function resetProgress() {
  correctCount = 0;
  wrongCount = 0;
  usedIndices = [];
  currentQuestion = 0;

  setCookie('correctCount', '', -1);
  setCookie('wrongCount', '', -1);
  setCookie('usedIndices', '', -1);
  setCookie('currentQuestion', '', -1);

  currentIndex = getRandomIndex();
  currentQuestion++;
  loadQuestion();
  updateProgressChart();
}

// Storing data
function loadProgress() {

  const savedScale = getCookie('pageScale');
  if (savedScale) {
    const scaleValue = parseFloat(savedScale);
    questionContainer.style.transform = `scale(${scaleValue})`;
    slider.value = scaleValue * 400; 
  }

  correctCount = parseInt(getCookie('correctCount')) || 0;
  wrongCount = parseInt(getCookie('wrongCount')) || 0;
  currentQuestion = parseInt(getCookie('currentQuestion')) || 0;
  let totalQuestion = parseInt(getCookie('totalQuestion')) || 0;

  try {
    usedIndices = JSON.parse(getCookie('usedIndices')) || [];
  } catch (e) {
    usedIndices = [];
  }

  if (totalQuestion === 0 || totalQuestion !== jsonData.length) {
    const id = totalQuestion === 0 ? 'notification2' : 'notification1';
    const notif = document.getElementById(id);
    const confirmBtn = document.getElementById(`confirmBtn${id.slice(-1)}`);
    notif.classList.add('show');
    confirmBtn.addEventListener('click', () => notif.classList.remove('show'));
    resetProgress();
  }

  loadQuestion();
}

// Load Progress
loadProgress();