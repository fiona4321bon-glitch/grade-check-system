// ================== 學生成績查詢系統 (雲端 Google Sheet 版) ==================

// Google Apps Script 部署網址
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9zckX7MqXsaG49R8kSSeGw8I81bjmx7l6bp9sWsmOyVJCHdasqNahMDeaY42ErbjrQA/exec";

// ================== 學生登入 ==================
async function studentLogin() {
  const user = document.getElementById("studentUser").value.trim();
  const pass = document.getElementById("studentPass").value.trim();

  if (!user || !pass) {
    alert("請輸入帳號與密碼！");
    return;
  }

  // 向 Google Apps Script 請求資料
  const url = `${SCRIPT_URL}?id=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      alert("帳號或密碼錯誤！");
      return;
    }

    // 登入成功，顯示成績表
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
    alert("系統錯誤，請稍後再試！");
    console.error(err);
  }
}

// ================== 登出 ==================
function studentLogout() {
  document.getElementById("studentLoginSection").style.display = "block";
  document.getElementById("studentGradeSection").style.display = "none";
}
