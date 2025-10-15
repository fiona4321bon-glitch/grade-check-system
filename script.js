// ================== 學生成績查詢系統（Google Sheet 雲端版 + Loading 動畫） ==================

// ✅ Google Apps Script 部署網址
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9zckX7MqXsaG49R8kSSeGw8I81bjmx7l6bp9sWsmOyVJCHdasqNahMDeaY42ErbjrQA/exec";

// ================== 學生登入 ==================
async function studentLogin() {
  const user = document.getElementById("studentUser").value.trim();
  const pass = document.getElementById("studentPass").value.trim();

  if (!user || !pass) {
    alert("請輸入帳號與密碼！");
    return;
  }

  const url = `${SCRIPT_URL}?id=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;
  
  // 顯示 loading 動畫
  showLoading(true);

  try {
    const response = await fetch(url);
    const data = await response.json();

    // 登入失敗
    if (data.error) {
      showLoading(false);
      alert("帳號或密碼錯誤！");
      return;
    }

    // 登入成功
    showLoading(false);
    document.getElementById("studentLoginSection").style.display = "none";
    document.getElementById("studentGradeSection").style.display = "block";

    const student = data[0];
    document.getElementById("studentNameTitle").innerText = `${student.name} (${student.id}) 的成績`;

    const tbody = document.querySelector("#studentGradeTable tbody");
    tbody.innerHTML = "";

    data.forEach(g => {
      tbody.innerHTML += `
        <tr>
          <td>${g.subject}</td>
          <td>${g.score}</td>
        </tr>
      `;
    });

  } catch (err) {
    showLoading(false);
    alert("系統錯誤，請稍後再試！");
    console.error(err);
  }
}

// ================== 登出 ==================
function studentLogout() {
  document.getElementById("studentLoginSection").style.display = "block";
  document.getElementById("studentGradeSection").style.display = "none";
}

// ================== Loading 動畫 ==================
function showLoading(show) {
  let loader = document.getElementById("loadingSpinner");

  if (show) {
    if (!loader) {
      loader = document.createElement("div");
      loader.id = "loadingSpinner";
      loader.innerHTML = `
        <div class="spinner"></div>
        <p>查詢中，請稍候...</p>
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = "flex";
  } else {
    if (loader) loader.style.display = "none";
  }
}

// ================== 加入 CSS 動畫樣式 ==================
const style = document.createElement("style");
style.textContent = `
  #loadingSpinner {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.8);
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .spinner {
    width: 60px;
    height: 60px;
    border: 6px solid #ccc;
    border-top-color: #007bff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  #loadingSpinner p {
    margin-top: 15px;
    font-size: 18px;
    color: #333;
  }
`;
document.head.appendChild(style);
