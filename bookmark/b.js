const form = document.getElementById("form");
const div = document.getElementById("bookmarksadded");
const searchInput = document.getElementById("search");

let user = JSON.parse(localStorage.getItem("user")) || [];


window.addEventListener("DOMContentLoaded", () => {
  renderBookmarks(user);
});


form.addEventListener("submit", (e) => {
  e.preventDefault();

  const webname = document.getElementById("websitename").value.trim();
  const weburl = document.getElementById("websiteurl").value.trim();

  if (!webname || !weburl) {
    alert("Please fill out both fields.");
    return;
  }

  if (!isValidurl(weburl)) {
    alert("Please enter a valid URL.");
    return;
  }

  if (checkingduplicateurl(weburl)) {
    alert("This URL already exists!");
    return;
  }

  const bookmark = {
    id: Date.now(),
    sitename: webname,
    siteurl: weburl,
    createdAt: new Date().toLocaleString(),
    visitCount: 0,
  };

  user.push(bookmark);
  localStorage.setItem("user", JSON.stringify(user));
  renderBookmarks(user);

  form.reset();
});

function isValidurl(weburl) {
  try {
    new URL(weburl);
    return true;
  } catch {
    return false;
  }
}

function checkingduplicateurl(weburl) {
  return user.some((item) => item.siteurl === weburl);
}

function renderBookmarks(bookmarkArray) {
  div.innerHTML = "";

  if (bookmarkArray.length === 0) {
    div.innerHTML = `<p class="empty-msg">No bookmarks found.</p>`;
    return;
  }

  bookmarkArray.forEach((bookmark) => {
    const el = document.createElement("div");
    el.classList.add("divs");
    el.setAttribute("id", bookmark.id);

    const favicon = `https://www.google.com/s2/favicons?domain=${bookmark.siteurl}`;

    el.innerHTML = `
      <div class="bookmark-info">
        <img src="${favicon}" alt="icon">
        <div class="bookmark-details">
          <strong>${bookmark.sitename}</strong>
          <p>Added: ${bookmark.createdAt}</p>
          <p>Visits: ${bookmark.visitCount}</p>
        </div>
      </div>
      <div class="bookmark-actions">
        <button class="visit-btn">🔗 Visit</button>
        <button class="deletbutton">❌ Delete</button>
      </div>
    `;
    div.appendChild(el);
  });
}


div.addEventListener("click", function (e) {
  const parentEle = e.target.closest(".divs");
  if (!parentEle) return;

  const parenteleid = parseInt(parentEle.getAttribute("id"));

  if (e.target.classList.contains("deletbutton")) {
  
    user = user.filter((item) => item.id !== parenteleid);
    localStorage.setItem("user", JSON.stringify(user));
    renderBookmarks(user);
  }

  if (e.target.classList.contains("visit-btn")) {
 
    const bookmark = user.find((item) => item.id === parenteleid);
    if (bookmark) {
      bookmark.visitCount += 1;
      localStorage.setItem("user", JSON.stringify(user));
      renderBookmarks(user);
      window.open(bookmark.siteurl, "_blank");
    }
  }
});
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = user.filter(
    (item) =>
      item.sitename.toLowerCase().includes(query) ||
      item.siteurl.toLowerCase().includes(query)
  );
  renderBookmarks(filtered);
});
