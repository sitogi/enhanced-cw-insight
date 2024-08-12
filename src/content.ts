document.addEventListener("DOMContentLoaded", () => {
  console.log('content loaded');
});

console.log("content.ts loaded");

setTimeout(() => {
  console.log("content.ts loaded after 2 seconds");
  const pageTitle = document.title;
  console.log("Page Title:", pageTitle);
}, 2000);
