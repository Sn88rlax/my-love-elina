const startDate = new Date("2025-09-24"); // первый день игры
const today = new Date();
today.setHours(0, 0, 0, 0);

let currentDay = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;

// --- Очистка localStorage, если день сменился ---
if (localStorage.getItem("answeredDay") != currentDay) {
  localStorage.removeItem("answeredDay");
}

async function loadData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    render(data);
  } catch (err) {
    document.getElementById("question").innerText = "Ошибка загрузки 😢";
  }
}

function render(data) {
  const historyBox = document.getElementById("history");
  historyBox.innerHTML = "";

  // --- История за прошедшие дни ---
  for (let i = 1; i < currentDay; i++) {
  const day = data.find(d => d.day === i);
  if (day) {
    const div = document.createElement("div");
    div.className = "day";

    // только сообщение
    div.innerHTML = `<p class="message-preview">${day.message}</p>`;

    // скрытый блок с деталями
    const details = document.createElement("div");
    details.className = "details hidden";
    details.innerHTML = `
      <strong>День ${i}</strong><br>
      <img src="${day.photo}" style="max-width:100%; border-radius:8px;"><br>
      <p><b>Вопрос:</b> ${day.question}</p>
      <p><b>Ответ:</b> ${day.answer}</p>
      <p>${day.message}</p>
    `;
    div.appendChild(details);

    // обработчик нажатия
    div.querySelector(".message-preview").onclick = () => {
      details.classList.toggle("hidden");
    };

    historyBox.appendChild(div);
  }
}

  // --- Текущий день ---
  const todayData = data.find(d => d.day === currentDay);
  if (!todayData) {
    document.getElementById("question").innerText = "Все дни закончились 💖";
    document.getElementById("answer").style.display = "none";
    document.getElementById("submit").style.display = "none";
    return;
  }

  // Сообщение об ошибке (если ответ неверный)
  let errorMsg = document.getElementById("error-msg");
  if (!errorMsg) {
    errorMsg = document.createElement("p");
    errorMsg.id = "error-msg";
    errorMsg.classList.add("error");
    document.getElementById("question-box").appendChild(errorMsg);
  }

  // Если на этот день уже был ответ → сразу показываем фото
  if (localStorage.getItem("answeredDay") == currentDay) {
    showPhoto(todayData);
  } else {
    document.getElementById("question").innerText = todayData.question;
    document.getElementById("submit").onclick = () => {
      const ans = document.getElementById("answer").value.trim().toLowerCase();
      if (ans === todayData.answer.toLowerCase()) {
        localStorage.setItem("answeredDay", currentDay);
        errorMsg.textContent = "";
        showPhoto(todayData);
      } else {
        errorMsg.textContent = "Хм, не угадала 🙈 попробуй снова 💕";
        errorMsg.style.opacity = "1";
        setTimeout(() => {
          errorMsg.style.opacity = "0.3";
        }, 3000);
      }
    };
  }
}

function showPhoto(day) {
  document.getElementById("question-box").classList.add("hidden");
  const box = document.getElementById("photo-box");
  box.classList.remove("hidden");
  document.getElementById("photo").src = day.photo;
  document.getElementById("message").innerText = day.message;
}



loadData();
