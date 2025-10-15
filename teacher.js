// ======================== 設定 ========================
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycby9zckX7MqXsaG49R8kSSeGw8I81bjmx7l6bp9sWsmOyVJCHdasqNahMDeaY42ErbjrQA/exec";

let teacherAccount = "";
let teacherName = "";
let teacherClasses = [];
let currentClass = "";


// ======================== 登入 ========================
async function teacherLogin() {
  const user = document.getElementById("teacherUser").value.trim();
  const pass = document.getElementById("teacherPass").value.trim();

  if (!user || !pass) return alert("請輸入帳號與密碼");

  const btn = document.querySelector("#loginSection button");
  btn.disabled = true;
  btn.innerHTML = `<span class="loading-spinner"></span> 登入中...`;

  try {
    const res = await fetch(`${SCRIPT_URL}?teacher=${user}&password=${pass}`);
    const data = await res.json();

    if (data.error) {
      alert(data.error);
      btn.disabled = false;
      btn.innerText = "登入";
      return;
    }

    teacherAccount = user;
    teacherName = data.name || "未命名教師";
    teacherClasses = data.classes || [];
    currentClass = data.currentClass || teacherClasses[0] || "尚未建立班級";

    // 切換畫面
    document.getElementById("loginSection").style.display = "none";
    document.getElementById("teacherPanel").style.display = "block";

    document.getElementById("welcomeMsg").innerText = `${teacherName}您好！`;
    document.getElementById("classInfo").innerText =
      `您目前管理的班級：${currentClass}`;

    loadClassList();
  } catch (err) {
    alert("登入發生錯誤，請稍後再試。");
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerText = "登入";
  }
}


// ======================== 載入班級下拉選單 ========================
function loadClassList() {
  const select = document.getElementById("classSelect");
  select.innerHTML = "";

  if (teacherClasses.length === 0) {
    const opt = document.createElement("option");
    opt.textContent = "目前尚未建立班級";
    select.appendChild(opt);
    return;
  }

  teacherClasses.forEach((cls) => {
    const opt = document.createElement("option");
    opt.value = cls;
    opt.textContent = cls;
    if (cls === currentClass) opt.selected = true;
    select.appendChild(opt);
  });
}


// ======================== 新增班級 ========================
async function addNewClass() {
  const newClassName = document.getElementById("newClassName").value.trim();
  if (!newClassName) return alert("請輸入班級名稱");

  try {
    const res = await fetch(`${SCRIPT_URL}?action=addClass&teacher=${teacherAccount}&class=${newClassName}`);
    const data = await res.json();

    if (data.message) {
      alert(data.message);
      await reloadTeacherData(); // 成功或班級存在都刷新
      document.getElementById("newClassName").value = "";
    } else if (data.error) {
      alert(data.error);
    }
  } catch (err) {
    alert("新增班級時發生錯誤。");
    console.error(err);
  }
}


// ======================== 重新抓教師資料 ========================
async function reloadTeacherData() {
  try {
    const res = await fetch(`${SCRIPT_URL}?teacher=${teacherAccount}`);
    const data = await res.json();

    teacherClasses = data.classes || [];
    currentClass = data.currentClass || teacherClasses[0] || "尚未建立班級";
    loadClassList();

    document.getElementById("classInfo").innerText =
      `您目前管理的班級：${currentClass}`;
  } catch (err) {
    console.error(err);
    alert("重新整理班級資料時發生錯誤");
  }
}


// ======================== 新增學生成績 ========================
async function addGrade() {
  const id = document.getElementById("newId").value.trim();
  const name = document.getElementById("newName").value.trim();
  const subject = document.getElementById("newSubject").value.trim();
  const score = document.getElementById("newScore").value.trim();
  const pass = document.getElementById("newPass").value.trim() || "0000";
  const className = document.getElementById("classSelect").value;

  if (!id || !name || !subject || !score)
    return alert("請填寫完整的學生資料！");

  try {
    const res = await fetch(
      `${SCRIPT_URL}?action=addGrade&class=${className}&id=${id}&name=${name}&subject=${subject}&score=${score}&password=${pass}`
    );
    const data = await res.json();

    if (data.message) {
      alert(data.message);
      loadClassGrades();
    } else {
      alert("新增失敗，請稍後再試。");
    }
  } catch (err) {
    alert("新增時發生錯誤");
    console.error(err);
  }
}


// ======================== 讀取班級成績 ========================
async function loadClassGrades() {
  const className = document.getElementById("classSelect").value;
  const table = document.getElementById("gradeTable").querySelector("tbody");

  table.innerHTML = `<tr><td colspan="4">載入中...</td></tr>`;

  try {
    const res = await fetch(`${SCRIPT_URL}?action=getGrades&class=${className}`);
    const data = await res.json();

    if (data.error || !data.grades || data.grades.length === 0) {
      table.innerHTML = `<tr><td colspan="4">目前沒有資料</td></tr>`;
      return;
    }

    table.innerHTML = "";
    data.grades.forEach((r) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${r.id}</td><td>${r.name}</td><td>${r.subject}</td><td>${r.score}</td>`;
      table.appendChild(tr);
    });
  } catch (err) {
    table.innerHTML = `<tr><td colspan="4">讀取失敗</td></tr>`;
    console.error(err);
  }
}


// ======================== 登出 ========================
function logout() {
  teacherAccount = "";
  teacherName = "";
  teacherClasses = [];
  currentClass = "";

  document.getElementById("teacherPanel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}


// ======================== 登入動畫（CSS動態） ========================
const style = document.createElement("style");
style.innerHTML = `
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid #004a91;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 5px;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}`;
document.head.appendChild(style);
