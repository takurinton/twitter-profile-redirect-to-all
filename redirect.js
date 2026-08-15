"use strict";

const paths = new Set([
  "compose", "explore", "home", "i", "jobs", "login", "logout",
  "messages", "notifications", "search", "settings", "signup", "tos"
]);

function redirect(value) {
  const url = new URL(value, "https://x.com");
  const username = url.pathname.match(/^\/(\w{1,15})\/?$/)?.[1];

  if (url.origin !== "https://x.com" || !username || paths.has(username.toLowerCase())) {
    return null;
  }

  url.pathname = `/${username}/all`;
  return url.href;
}

if (typeof location !== "undefined") {
  const destination = redirect(location.href);

  if (destination) {
    location.replace(destination);
  } else {
    addEventListener("click", (event) => {
      const link = event.target.closest?.("a[href]");
      const url = link && redirect(link.href);
      if (url) link.href = url;
    }, true);

    for (const method of ["pushState", "replaceState"]) {
      const route = history[method].bind(history);
      history[method] = (state, title, url) =>
        route(state, title, url && redirect(new URL(url, location.href)) || url);
    }
  }
}

if (typeof module !== "undefined") module.exports = { redirect };
