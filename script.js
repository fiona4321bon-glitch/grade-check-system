// 教師假帳號密碼（暫時寫死，之後可改為資料庫或 JSON）
const teacherAccount = {
  username: "teacher",
  password: "1234"
};

// 模擬成績資料（存放於 localStorage）
let grades = JSON.parse(localStorage.getItem("grades") || "[]");

// 教師登入
function teacherLogin() {
  const user = document.getElementById("teacherUser").value.trim();
  const pass = document.getElementById("teacherPass").value.trim();

  if (user === teacherAccount.username && pass === teacherAccount.password) {
    alert("登入成功！");
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("gradeSection").style.display = "block";
    renderTable();
  } else {
    alert("帳號或密碼錯誤！");
  }
}

// 儲存成績
function saveGrade() {
  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("studentName").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const score = document.getElementById("score").value.trim();

  if (!id || !name || !subject || !score) {
    alert("請填寫完整資訊！");
    return;
  }

  grades.push({ id, name, subject, score });
  localStorage.setItem("grades", JSON.stringify(grades));

  renderTable();
  document.getElementById("studentId").value = "";
  document.getElementById("studentName").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("score").value = "";
}

// 顯示表格內容
function renderTable() {
  const tbody = document.querySelector("#gradeTable tbody");
  tbody.innerHTML = "";
  grades.forEach(g => {
    const row = `<tr>
      <td>${g.id}</td>
      <td>${g.name}</td>
      <td>${g.subject}</td>
      <td>${g.score}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// 登出
function logout() {
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("gradeSection").style.display = "none";
}
