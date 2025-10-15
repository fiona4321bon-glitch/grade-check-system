// =============================
// ✅ Google Sheets 雲端版本 script.js
// =============================

// 這是你自己的 Google Apps Script API 網址（請不要改）
const GOOGLE_API_URL = "https://script.google.com/macros/s/AKfycby9zckX7MqXsaG49R8kSSeGw8I81bjmx7l6bp9sWsmOyVJCHdasqNahMDeaY42ErbjrQA/exec";

// =============================
// 🧑‍🏫 教師端（暫時保留 localStorage 版）
// =============================

const teacherAccount = { username: "teacher", password: "1234" };
let students = JSON.parse(localStorage.getItem("students") || "[]");
let grades = JSON.parse(localStorage.getItem("grades") || "[]");

// 教師登入
function teacherLogin() {
  const user = document.getElementById("teacherUser")?.value.trim();
  const pass = document.getElementById("teacherPass")?.value.trim();

  if (user === teacherAccount.username && pass === teacherAccount.password) {
    alert("登入成功！");
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("teacherPanel").style.display = "block";
    renderStudents();
    renderGrades();
  } else {
    alert("帳號或密碼錯誤！");
  }
}

// 切換面板
function showSection(id) {
  document.querySelectorAll(".panel-section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// 新增學生
function addStudent() {
  const id = document.getElementById("newId")?.value.trim();
  const name = document.getElementById("newName")?.value.trim();
  const pass = document.getElementById("newPass")?.value.trim() || "0000";

  if (!id || !name) return alert("請輸入完整資料");
  if (students.find(s => s.id === id)) return alert("此學號已存在");

  students.push({ id, name, password: pass });
  localStorage.setItem("students", JSON.stringify(students));
  renderStudents();

  document.getElementById("newId").value = "";
  document.getElementById("newName").value = "";
  document.getElementById("newPass").value = "";
}

// 顯示學生名單
function renderStudents() {
  const tbody = document.querySelector("#studentTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  students.forEach((s, idx) => {
    tbody.innerHTML += `
      <tr>
        <td>${s.id}</td>
        <td>${s.name}</td>
        <td><input type="text" value="${s.password}" onchange="changePass(${idx}, this.value)"></td>
        <td><button onclick="removeStudent(${idx})">刪除</button></td>
      </tr>`;
  });
}

// 刪除學生
function removeStudent(idx) {
  if (!confirm("確定要刪除此學生？")) return;
  students.splice(idx, 1);
  localStorage.setItem("students", JSON.stringify(students));
  renderStudents();
}

// 修改密碼
function changePass(idx, newVal) {
  students[idx].password = newVal;
  localStorage.setItem("students", JSON.stringify(students));
}

// 匯入 CSV
function importStudents(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split(/\r?\n/).filter(l => l.trim());
    lines.forEach(line => {
      const [id, name, pass] = line.split(",");
      if (!id || !name) return;
      if (students.find(s => s.id === id)) return;
      students.push({ id: id.trim(), name: name.trim(), password: pass ? pass.trim() : "0000" });
    });
    localStorage.setItem("students", JSON.stringify(students));
    renderStudents();
    alert("匯入完成！");
  };
  reader.readAsText(file, "utf-8");
}

// 儲存成績
function saveGrade() {
  const id = document.getElementById("studentId")?.value.trim();
  const subject = document.getElementById("subject")?.value.trim();
  const score = document.getElementById("score")?.value.trim();

  if (!id || !subject || !score) return alert("請輸入完整資料");

  const stu = students.find(s => s.id === id);
  if (!stu) return alert("查無此學號，請先新增學生名單");

  grades.push({ id, name: stu.name, subject, score });
  localStorage.setItem("grades", JSON.stringify(grades));
  renderGrades();

  document.getElementById("studentId").value = "";
  document.getElementById("studentName").value = "";
  document.getElementById("subject").value = "";
  document.getElementById("score").value = "";
}

// 自動帶出姓名
document.addEventListener("input", e => {
  if (e.target.id === "studentId") {
    const id = e.target.value.trim();
    const stu = students.find(s => s.id === id);
    document.getElementById("studentName").value = stu ? stu.name : "";
  }
});

// 顯示成績表
function renderGrades() {
  const tbody = document.querySelector("#gradeTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  grades.forEach(g => {
    tbody.innerHTML += `<tr>
      <td>${g.id}</td><td>${g.name}</td><td>${g.subject}</td><td>${g.score}</td>
    </tr>`;
  });
}

// 登出教師端
function logout() {
  document.getElementById("teacherPanel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

// =============================
// 👩‍🎓 學生端（連接 Google Sheets）
// =============================

async function studentLogin() {
  const user = document.getElementById("studentUser").value.trim();
  const pass = document.getElementById("studentPass").value.trim();

  if (!user || !pass) {
    alert("請輸入帳號與密碼");
    return;
  }

  try {
    // 向 Google Apps Script 發送請求
    const res = await fetch(`${GOOGLE_API_URL}?id=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`);
    const data = await res.json();

    // 錯誤處理
    if (data.error) {
      alert(data.error);
      return;
    }

    // 登入成功 → 顯示成績
    document.getElementById("studentLoginSection").style.display = "none";
    document.getElementById("studentGradeSection").style.display = "block";
    document.getElementById("studentNameTitle").innerText = `${data[0].name} (${data[0].id}) 的成績`;

    const tbody = document.querySelector("#studentGradeTable tbody");
    tbody.innerHTML = "";
    data.forEach(g => {
      tbody.innerHTML += `<tr><td>${g.subject}</td><td>${g.score}</td></tr>`;
    });
  } catch (err) {
    console.error(err);
    alert("讀取資料時發生錯誤，請稍後再試");
  }
}

// 學生登出
function studentLogout() {
  document.getElementById("studentLoginSection").style.display = "block";
  document.getElementById("studentGradeSection").style.display = "none";
}

