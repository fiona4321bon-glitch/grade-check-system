// =====================================
// ✅ 教師端主程式 (teacher.js)
// =====================================

// 這裡改成妳自己的 Apps Script 部署網址
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9zckX7MqXsaG49R8kSSeGw8I81bjmx7l6bp9sWsmOyVJCHdasqNahMDeaY42ErbjrQA/exec";

let teacherAccount = "";
let teacherPassword = "";
let teacherName = "";
let teacherClasses = [];
let currentClass = "";

// =============================
// 教師登入
// =============================
async function teacherLogin() {
  const user = document.getElementById("teacherUser").value.trim();
  const pass = document.getElementById("teacherPass").value.trim();
  if (!user || !pass) return alert("請輸入帳號與密碼");

  const loginBtn = document.querySelector("#loginSection button");
  loginBtn.textContent = "登入中...";
  loginBtn.disabled = true;

  try {
    const res = await fetch(`${SCRIPT_URL}?teacher=${user}&password=${pass}`);
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      loginBtn.textContent = "登入";
      loginBtn.disabled = false;
      return;
    }

    teacherAccount = user;
    teacherPassword = pass;
    teacherName = data.teacherName;
    teacherClasses = data.classes;
    currentClass = data.currentClass;

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("teacherPanel").style.display = "block";
    document.getElementById("welcomeMsg").innerText = `${teacherName}您好！`;
    document.getElementById("classInfo").innerText = `您目前管理的班級：${currentClass}`;

    showClassList(teacherClasses, currentClass);
    renderGrades(data.data);
  } catch (err) {
    alert("登入失敗：" + err);
  } finally {
    loginBtn.textContent = "登入";
    loginBtn.disabled = false;
  }
}

// =============================
// 顯示班級清單
// =============================
function showClassList(classes, current) {
  const sel = document.getElementById("classSelect");
  sel.innerHTML = "";
  if (!classes || classes.length === 0) {
    sel.innerHTML = `<option>目前尚未建立班級</option>`;
    return;
  }

  classes.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    if (c === current) opt.selected = true;
    sel.appendChild(opt);
  });
}

// =============================
// 新增班級
// =============================
async function addNewClass() {
  const newClass = document.getElementById("newClassName").value.trim();
  if (!newClass) return alert("請輸入班級名稱");

  const payload = {
    teacher: teacherAccount,
    password: teacherPassword,
    newClass
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert(data.message || data.error);

    // 自動刷新班級列表
    if (data.message && data.message.includes("成功")) {
      await reloadTeacherData();
      document.getElementById("newClassName").value = "";
    }
  } catch (err) {
    alert("新增班級失敗：" + err);
  }
}

// =============================
// 新增學生成績
// =============================
async function addGrade() {
  const id = document.getElementById("newId").value.trim();
  const name = document.getElementById("newName").value.trim();
  const subject = document.getElementById("newSubject").value.trim();
  const score = document.getElementById("newScore").value.trim();
  const studentPass = document.getElementById("newPass").value.trim() || "0000";
  const className = document.getElementById("classSelect").value;

  if (!id || !name || !subject || !score)
    return alert("請輸入完整資料");

  const payload = {
    teacher: teacherAccount,
    password: teacherPassword,
    id,
    name,
    subject,
    score,
    studentPass,
    class: className
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    alert(data.message || data.error);

    // 新增完後自動更新列表
    if (data.message && data.message.includes("成績已新增")) {
      await loadClassGrades();
      document.getElementById("newId").value = "";
      document.getElementById("newName").value = "";
      document.getElementById("newSubject").value = "";
      document.getElementById("newScore").value = "";
      document.getElementById("newPass").value = "";
    }
  } catch (err) {
    alert("新增失敗：" + err);
  }
}

// =============================
// 重新載入成績
// =============================
async function loadClassGrades() {
  const className = document.getElementById("classSelect").value;
  document.querySelector("#gradeTable tbody").innerHTML =
    `<tr><td colspan="4">載入中...</td></tr>`;

  try {
    const res = await fetch(
      `${SCRIPT_URL}?teacher=${teacherAccount}&password=${teacherPassword}&class=${className}`
    );
    const data = await res.json();
    if (data.error) {
      alert(data.error);
      return;
    }
    renderGrades(data.data);
  } catch (err) {
    alert("載入失敗：" + err);
  }
}

// =============================
// 重新載入教師資料 (自動刷新班級)
// =============================
async function reloadTeacherData() {
  const res = await fetch(`${SCRIPT_URL}?teacher=${teacherAccount}&password=${teacherPassword}`);
  const data = await res.json();
  if (!data.error) {
    teacherClasses = data.classes;
    showClassList(teacherClasses, data.currentClass);
  }
}

// =============================
// 顯示成績表格
// =============================
function renderGrades(grades) {
  const tbody = document.querySelector("#gradeTable tbody");
  tbody.innerHTML = "";
  if (!grades || grades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">目前沒有資料</td></tr>`;
    return;
  }

  grades.forEach(g => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${g.id}</td><td>${g.name}</td><td>${g.subject}</td><td>${g.score}</td>`;
    tbody.appendChild(row);
  });
}

// =============================
// 登出功能
// =============================
function logout() {
  teacherAccount = "";
  teacherPassword = "";
  teacherName = "";
  teacherClasses = [];
  currentClass = "";

  document.getElementById("teacherPanel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
  document.getElementById("teacherUser").value = "";
  document.getElementById("teacherPass").value = "";
}

