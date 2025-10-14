// 教師假帳號密碼
const teacherAccount = {
  username: "teacher",
  password: "1234"
};

// 模擬學生帳號（之後可以從老師新增）
const studentAccounts = [
  { id: "S001", password: "1111", name: "陳小明" },
  { id: "S002", password: "2222", name: "張小華" }
];

// 成績資料（存在 localStorage）
let grades = JSON.parse(localStorage.getItem("grades") || "[]");

// ================= 教師功能 =================

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

// 顯示教師端成績表格
function renderTable() {
  const tbody = document.querySelector("#gradeTable tbody");
  if (!tbody) return;
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

// 登出（教師）
function logout() {
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("gradeSection").style.display = "none";
}

// ================= 學生功能 =================

// 學生登入
function studentLogin() {
  const user = document.getElementById("studentUser").value.trim();
  const pass = document.getElementById("studentPass").value.trim();

  const student = studentAccounts.find(s => s.id === user && s.password === pass);
  if (!student) {
    alert("帳號或密碼錯誤！");
    return;
  }

  // 登入成功
  document.getElementById("studentLoginSection").style.display = "none";
  document.getElementById("studentGradeSection").style.display = "block";
  document.getElementById("studentNameTitle").innerText = `${student.name} (${student.id}) 的成績`;

  renderStudentGrades(student.id);
}

// 顯示學生成績
function renderStudentGrades(studentId) {
  const tbody = document.querySelector("#studentGradeTable tbody");
  tbody.innerHTML = "";

  const myGrades = grades.filter(g => g.id === studentId);
  if (myGrades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2">目前沒有成績資料</td></tr>`;
    return;
  }

  myGrades.forEach(g => {
    const row = `<tr><td>${g.subject}</td><td>${g.score}</td></tr>`;
    tbody.innerHTML += row;
  });
}

// 學生登出
function studentLogout() {
  document.getElementById("studentLoginSection").style.display = "block";
  document.getElementById("studentGradeSection").style.display = "none";
}
