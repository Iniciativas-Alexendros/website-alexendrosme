(function () {
  try {
    var theme = localStorage.getItem("theme");
    var root = document.documentElement;
    if (
      theme === "light" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: light)").matches)
    ) {
      root.classList.add("light");
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
    }
  } catch {
    // localStorage not available — use default dark theme
  }
})();
