const form = document.getElementById("form");
const tableBody = document.getElementById("tableBody");
const fnameInput = document.getElementById("fname");
const lnameInput = document.getElementById("lname");
const dobInput = document.getElementById("dob");
const addEditBtn = document.getElementById("addEditBtn");
const removeBtn = document.getElementById("removeBtn");
const searchInput = document.getElementById("search");
const exportJSONBtn = document.getElementById("exportJSON");
const exportCSVBtn = document.getElementById("exportCSV");
const tableHeaders = document.querySelectorAll("#studentTable th");

let students = [];
let selectedId = null;
let sortOrder = {}; 

function loadStudents() {
  const data = localStorage.getItem("students");
  if (data) {
    try { students = JSON.parse(data); } 
    catch { students = []; localStorage.removeItem("students"); }
  }
}
loadStudents();

function renderTable(filter="") {
  tableBody.innerHTML = "";
  students.forEach((s, idx) => {
    if (s.fname.toLowerCase().includes(filter) || s.lname.toLowerCase().includes(filter) || s.dob.includes(filter)) {
      const row = document.createElement("tr");
      row.dataset.id = s.id;
      row.innerHTML = `
        <td>${idx+1}</td>
        <td>${s.fname}</td>
        <td>${s.lname}</td>
        <td>${s.dob}</td>
        <td>${s.age}</td>
        <td>${s.createdAt}</td>
      `;
      if (s.id === selectedId) row.classList.add("highlight");
      tableBody.appendChild(row);
    }
  });
}

function saveAndRender() {
  localStorage.setItem("students", JSON.stringify(students));
  renderTable(searchInput.value.toLowerCase());
}

function calculateAge(dob) {
  const birth = new Date(dob);
  const diff = new Date() - birth;
  return Math.floor(diff / (1000*60*60*24*365.25));
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const fname = fnameInput.value.trim();
  const lname = lnameInput.value.trim();
  const dob = dobInput.value;

  if (!fname || !lname || !dob) return alert("Please fill all fields!");

  const age = calculateAge(dob);

  if (!selectedId && students.some(s => s.fname===fname && s.lname===lname && s.dob===dob)) {
    return alert("Duplicate student record!");
  }

  if (selectedId) {
    students = students.map(s => s.id === selectedId ? {...s,fname,lname,dob,age} : s);
    selectedId = null;
  } else {
    students.push({
      id: Date.now(),
      fname, lname, dob, age,
      createdAt: new Date().toLocaleString()
    });
  }

  form.reset();
  saveAndRender();
});

tableBody.addEventListener("click", e => {
  const row = e.target.closest("tr");
  if (!row) return;
  document.querySelectorAll("#tableBody tr").forEach(r => r.classList.remove("highlight"));
  row.classList.add("highlight");
  selectedId = parseInt(row.dataset.id);
  const student = students.find(s => s.id===selectedId);
  fnameInput.value = student.fname;
  lnameInput.value = student.lname;
  dobInput.value = student.dob;
});

removeBtn.addEventListener("click", () => {
  if (!selectedId) return alert("Select a row to remove.");
  if (confirm("Delete this student?")) {
    students = students.filter(s => s.id !== selectedId);
    selectedId = null;
    form.reset();
    saveAndRender();
  }
});

searchInput.addEventListener("input", () => renderTable(searchInput.value.toLowerCase()));

exportJSONBtn.addEventListener("click", () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null,2));
  const a = document.createElement("a");
  a.href = dataStr; a.download = "students.json"; a.click();
});

exportCSVBtn.addEventListener("click", () => {
  const headers = ["First Name","Last Name","DOB","Age","Created At"];
  const rows = students.map(s => [s.fname,s.lname,s.dob,s.age,s.createdAt]);
  const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
  const a = document.createElement("a");
  a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  a.download = "students.csv"; a.click();
});

tableHeaders.forEach(th => {
  th.addEventListener("click", () => {
    const key = th.dataset.key;
    if(!key || key==="index") return;
    sortOrder[key] = !sortOrder[key];
    students.sort((a,b) => {
      if(a[key] < b[key]) return sortOrder[key] ? -1 : 1;
      if(a[key] > b[key]) return sortOrder[key] ? 1 : -1;
      return 0;
    });
    renderTable(searchInput.value.toLowerCase());
  });
});

renderTable();
