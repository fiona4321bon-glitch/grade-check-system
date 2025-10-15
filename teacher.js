// ================== 教師端腳本 ==================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby9zckX7MqXsaG49R8kSSeGw8I81bjmx7l6bp9sWsmOyVJCHdasqNahMDeaY42ErbjrQA/exec";

let teacherAccount = "";
let teacherPassword = "";
let teacherName = "";
let teacherClass = "";

// ================== 登入 ==================
async function teacherLogin() {
  const user = document.getElementById("teacherUser").value.trim();
  const pass = document.getElementById("teacherPass").value.trim();

  if (!user || !pass) return alert("請輸入帳號與密碼");

  document.querySelector("#loginSection button").innerText = "登入中...";
  document.querySelector("#loginSection button").disabled = true;

  try {
    // ✅ 修正這裡：password=${pass}
    const res = await fetch(`${SCRIPT_URL}?teacher=${user}&password=${pass}`);
    const data = await res.json();

    if (data.error) {
      alert(data.error);
    } else {
      teacherAccount = user;
      teacherPassword = pass;
      teacherName = data.teacherName;
      teacherClass = data.class;

      document.getElementById("loginSection").style.display = "none";
      document.getElementById("teacherPanel").style.display = "block";

      document.getElementById("welcomeMsg").innerText = `${teacherName}您好！`;
      document.getElementById("classInfo").innerText = `您目前管理的班級：${teacherClass}`;

      renderGrades(data.data);
    }
  } catch (err) {
    alert("伺服器連線錯誤：" + err);
  } finally {
    document.querySelector("#loginSection button").innerText = "登入";
    document.querySelector("#loginSection button").disabled = false;
  }
}

// ================== 顯示成績 ==================
function renderGrades(grades) {
  const tbody = document.querySelector("#gradeTable tbody");
  tbody.innerHTML = "";

  if (!grades || grades.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4">目前沒有成績資料</td></tr>`;
    return;
  }

  grades.forEach(g => {
    tbody.innerHTML += `
      <tr>
        <td>${g.id}</td>
        <td>${g.name}</td>
        <td>${g.subject}</td>
        <td>${g.score}</td>
      </tr>
    `;
  });
}

// ================== 重新載入成績 ==================
async function loadClassGrades() {
  try {
    const res = await fetch(`${SCRIPT_URL}?teacher=${teacherAccount}&password=${teacherPassword}`);
    const data = await res.json();
    if (data.error) return alert(data.error);
    renderGrades(data.data);
  } catch (err) {
    alert("載入失敗：" + err);
  }
}

// ================== 新增成績 ==================
async function addGrade() {
  const id = document.getElementById("newId").value.trim();
  const name = document.getElementById("newName").value.trim();
  const subject = document.getElementById("newSubject").value.trim();
  const score = document.getElementById("newScore").value.trim();
  const pass = document.getElementById("newPass").value.trim() || "0000";

  if (!id || !name || !subject || !score)
    return alert("請輸入完整資料");

  const payload = {
    teacher: teacherAccount,
    password: teacherPassword,
    id,
    name,
    subject,
    score,
    studentPass: pass
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      alert(data.message);
      await loadClassGrades();
    }
  } catch (err) {
    alert("新增失敗：" + err);
  }
}

// ================== 登出 ==================
function logout() {
  teacherAccount = "";
  teacherPassword = "";
  teacherName = "";
  teacherClass = "";

  document.getElementById("teacherPanel").style.display = "none";
  document.getElementById("loginSection").style.display = "block";
}
