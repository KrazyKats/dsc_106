// console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// const navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
//   );


// currentLink?.classList.add('current');

// === GLOBAL NAV + DARK MODE SWITCH ===

console.log("IT'S ALIVE!");

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Base path for internal links
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"
  : "/dsc_106/"; // Change this to match your GitHub repo name

// === Step 3: Navigation ===
let pages = [
  { url: "", title: "Home" },
  { url: "project/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume.html", title: "Resume" },
  { url: "https://github.com/KrazyKats", title: "GitHub" },
];

// Create <nav> and add to <body>
let nav = document.createElement("nav");
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;
  url = !url.startsWith("http") ? BASE_PATH + url : url;

  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  // Highlight current page
  a.classList.toggle("current", a.host === location.host && a.pathname === location.pathname);

  // Open external links in new tab
  a.toggleAttribute("target", a.host !== location.host);

  nav.append(a);
}

// === Step 4: Dark Mode ===

// Add dark mode switch HTML to top of <body>
document.body.insertAdjacentHTML(
  "afterbegin",
  `
  <label class="color-scheme">
    Theme:
    <select>
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>
`
);

// Reference to <select> element
const select = document.querySelector(".color-scheme select");

// Define reusable function to set the color scheme
function setColorScheme(value) {
  document.documentElement.style.setProperty("color-scheme", value);
  select.value = value;
}

// Event listener for dropdown change
select.addEventListener("input", function (event) {
  const value = event.target.value;
  setColorScheme(value);
  localStorage.colorScheme = value;
  console.log("color scheme changed to", value);
});

// On page load: apply saved preference if it exists
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}

// === Step 5: Intercept form submission for proper email encoding ===

const form = document.querySelector("form[action^='mailto:']");

form?.addEventListener("submit", function (event) {
  event.preventDefault(); // Stop normal form behavior

  const data = new FormData(form);
  const params = [];

  for (let [name, value] of data) {
    // Encode each name/value and add to params list
    params.push(`${name}=${encodeURIComponent(value)}`);
  }

  const url = `${form.action}?${params.join("&")}`;

  // Navigate to the mailto URL with encoded params
  location.href = url;
});
