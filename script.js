// ==================== 設定 ====================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9zckX7MqXsaG49R8kSSeGw8I81bjmx7l6bp9sWsmOyVJCHdasqNahMDeaY42ErbjrQA/exec";

// ==================== 學生登入 ====================
async function studentLogin() {
  const user = document.getElementById("studentUser").value.trim();
  const pass = document.getElementById("studentPass").value.trim();

  if (!user || !pass) {
    alert("請輸入學號與密碼！");
    return;
  }

  document.querySelector("#studentLoginSection button").innerText = "登入中...";
  document.querySelector("#studentLoginSection button").disabled = true;

  try {
    // 假設班級取前 3 碼 (50501 -> 505)
    const className = user.substring(0, 3);
    const res = await fetch(`${SCRIPT_URL}?action=getStudent&id=${user}&password=${pass}&class=${className}`);
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      resetLoginButton();
      return;
    }

    // 顯示成績畫面
    document.getElementById("studentLoginSection").style.display = "none";
    document.getElementById("studentGradeSection").style.display = "block";

    document.getElementById("studentNameTitle").innerText = `${data.name} 的成績`;
    const tableBody = document.querySelector("#studentGradeTable tbody");
    tableBody.innerHTML = "";

    if (data.grades.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="2">目前沒有成績資料</td></tr>`;
    } else {
      data.grades.forEach(g => {
        const row = `<tr><td>${g.subject}</td><td>${g.score}</td></tr>`;
        tableBody.insertAdjacentHTML("beforeend", row);
      });
    }

  } catch (err) {
    console.error(err);
    alert("系統錯誤，請稍後再試。");
  } finally {
    resetLoginButton();
  }
}

// 登出功能
function studentLogout() {
  document.getElementById("studentLoginSection").style.display = "block";
  document.getElementById("studentGradeSection").style.display = "none";
  document.getElementById("studentUser").value = "";
  document.getElementById("studentPass").value = "";
}

function resetLoginButton() {
  document.querySelector("#studentLoginSection button").innerText = "登入";
  document.querySelector("#studentLoginSection button").disabled = false;
}
