// console.log('IT’S ALIVE!');

// function $$(selector, context = document) {
//   return Array.from(context.querySelectorAll(selector));
// }

// const navLinks = $$("nav a");

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
//   );


// currentLink?.classList.add('current');

console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// Define base path based on where the site is hosted
const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                      // Local development
  : "/website/";             // GitHub Pages repo name (adjust as needed)

// Pages in the nav menu
let pages = [
  { url: "", title: "Home" },
  { url: "project/", title: "Projects" },
  { url: "contact/", title: "Contact" },
  { url: "resume.html", title: "Resume" },
  { url: "https://github.com/KrazyKats", title: "GitHub" },
];

// Create and insert nav element at top of body
let nav = document.createElement("nav");
document.body.prepend(nav);

// Loop through each page and create nav links
for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust internal URLs using BASE_PATH
  url = !url.startsWith("http") ? BASE_PATH + url : url;

  // Create the link element
  let a = document.createElement("a");
  a.href = url;
  a.textContent = title;

  // Highlight current page link
  a.classList.toggle(
    "current",
    a.host === location.host && a.pathname === location.pathname
  );

  // Open external links in new tab
  a.toggleAttribute("target", a.host !== location.host);

  // Add link to nav
  nav.append(a);
}
