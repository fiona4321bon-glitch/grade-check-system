// ================== 教師登入設定 ==================
const teacherAccount = { username: "teacher", password: "1234" };

// 從 localStorage 讀取學生與成績資料
let students = JSON.parse(localStorage.getItem("students") || "[]");
let grades = JSON.parse(localStorage.getItem("grades") || "[]");

// ================== 教師登入 ==================
function teacherLogin() {
  const user = document.getElementById("teacherUser").value.trim();
  const pass = document.getElementById("teacherPass").value.trim();

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

// ================== 面板切換 ==================
function showSection(id) {
  document.querySelectorAll(".panel-section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// ================== 學生管理 ==================
function addStudent() {
  const id = document.getElementById("newId").value.trim();
  const name = document.getElementById("newName").value.trim();
  const pass = document.getElementById("newPass").value.trim() || "0000";

  if (!id || !name) return alert("請輸入完整資料");
  if (students.find(s => s.id === id)) return alert("此學號已存在");

  students.push({ id, name, password: pass });
  localStorage.setItem("students", JSON.stringify(students));
  renderStudents();

  document.getElementById("newId").value = "";
  document.getElementById("newName").value = "";
  document.getElementById("newPass").value = "";
}

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

function removeStudent(idx) {
  if (!confirm("確定要刪除此學生？")) return;
  students.splice(idx, 1);
  localStorage.setItem("students", JSON.stringify(students));
  renderStudents();
}

function changePass(idx, newVal) {
  students[idx].password = newVal;
  localStorage.setItem("students", JSON.stringify(students));
}

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

// ================== 成績輸入 ==================
function saveGrade() {
  const id = document.getElementById("studentId").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const score = document.getElementById("score").value.trim();

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

document.addEventListener("input", e => {
  if (e.target.id === "studentId") {
    const id = e.target.value.trim();
    const stu = students.find(s => s.id === id);
    document.getElementById("studentName").value = stu ? stu.name : "";
  }
});

function renderGrades() {
  const tbody = document.querySelector("#gradeTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";
  grades.forEach(g => {
    tbody.innerHTML += `<tr><td>${g.id}</td><td>${g.name}</td><td>${g.subject}</td><td>${g.score}</td></tr>`;
  });
}

function logout() {
  document.getElementById("teacherPanel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}

// ================== 學生登入與查詢 ==================
function studentLogin() {
  const user = document.getElementById("studentUser").value.trim();
  const pass = document.getElementById("studentPass").value.trim();

  // 每次登入都重新載入最新的學生資料
  students = JSON.parse(localStorage.getItem("students") || "[]");
  grades = JSON.parse(localStorage.getItem("grades") || "[]");

  const student = students.find(s => s.id === user && s.password === pass);
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

function renderStudentGrades(studentId) {
  const tbody = document.querySelector("#studentGradeTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const myGrades = grades.filter(g => g.id === studentId);
  if (myGrades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="2">目前沒有成績資料</td></tr>`;
    return;
  }

  myGrades.forEach(g => {
    tbody.innerHTML += `<tr><td>${g.subject}</td><td>${g.score}</td></tr>`;
  });
}

function studentLogout() {
  document.getElementById("studentLoginSection").style.display = "block";
  document.getElementById("studentGradeSection").style.display = "none";
}

function studentLogout() {
  document.getElementById("studentLoginSection").style.display = "block";
  document.getElementById("studentGradeSection").style.display = "none";
}
