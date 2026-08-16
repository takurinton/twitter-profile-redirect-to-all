"use strict";

const paths = new Set([
  "compose", "explore", "home", "i", "jobs", "login", "logout",
  "messages", "notifications", "search", "settings", "signup", "tos"
]);

function profileUsername(value) {
  const url = new URL(value, "https://x.com");
  const username = url.pathname.match(/^\/(\w{1,15})\/?$/)?.[1];

  return url.origin === "https://x.com" && username &&
    !paths.has(username.toLowerCase()) ? username : null;
}

function redirect(value) {
  const url = new URL(value, "https://x.com");
  const username = profileUsername(url);

  if (!username) return null;

  url.pathname = `/${username}/all`;
  return url.href;
}

function isAllLink(value, username) {
  const url = new URL(value, "https://x.com");
  return url.origin === "https://x.com" &&
    url.pathname.toLowerCase() === `/${username}/all`.toLowerCase();
}

if (typeof location !== "undefined") {
  const destination = redirect(location.href);

  if (destination) {
    // A direct visit can safely reload before X has created any timeline state.
    location.replace(destination);
  } else {
    let automation = null;
    let timer = null;
    let replaceAllNavigation = null;

    const visible = (element) => element.getClientRects().length > 0;
    const label = (element) =>
      (element.textContent || element.getAttribute("aria-label") || "").trim();

    function attemptAllSelection() {
      const username = profileUsername(location.href);
      if (!username) {
        automation = null;
        return;
      }

      if (!automation || automation.username.toLowerCase() !== username.toLowerCase()) {
        automation = {
          username,
          openedMenu: false,
          done: false,
          deadline: Date.now() + 5000
        };
      }

      if (automation.done || Date.now() > automation.deadline) return;

      const allLink = [...document.querySelectorAll("a[href]")]
        .find((element) => visible(element) && isAllLink(element.href, username));

      if (allLink) {
        automation.done = true;
        replaceAllNavigation = { username, deadline: Date.now() + 2000 };
        allLink.click();
        return;
      }

      if (automation.openedMenu) {
        const allItem = [...document.querySelectorAll('[role="menuitem"]')]
          .find((element) => visible(element) && /^(All|すべて)$/i.test(label(element)));
        if (allItem) {
          automation.done = true;
          replaceAllNavigation = { username, deadline: Date.now() + 2000 };
          allItem.click();
        }
        return;
      }

      const menu = [...document.querySelectorAll('main [aria-haspopup="menu"]')]
        .find((element) => visible(element) && /^(Posts|ポスト)$/i.test(label(element)));
      if (menu) {
        automation.openedMenu = true;
        menu.click();
      }
    }

    function scheduleAllSelection() {
      if (!profileUsername(location.href) || timer) return;
      timer = setTimeout(() => {
        timer = null;
        attemptAllSelection();
      });
    }

    // Let X perform its own navigation first so its router and timeline state stay intact.
    addEventListener("click", scheduleAllSelection, true);
    addEventListener("popstate", scheduleAllSelection);

    const pushState = history.pushState.bind(history);
    const replaceState = history.replaceState.bind(history);

    history.pushState = (state, title, url) => {
      const replace = replaceAllNavigation &&
        Date.now() <= replaceAllNavigation.deadline && url &&
        isAllLink(new URL(url, location.href), replaceAllNavigation.username);
      replaceAllNavigation = null;
      const result = replace
        ? replaceState(state, title, url)
        : pushState(state, title, url);
      scheduleAllSelection();
      return result;
    };

    history.replaceState = (...args) => {
      replaceAllNavigation = null;
      const result = replaceState(...args);
      scheduleAllSelection();
      return result;
    };

    new MutationObserver(scheduleAllSelection)
      .observe(document.documentElement, { childList: true, subtree: true });
  }
}

if (typeof module !== "undefined") {
  module.exports = { redirect, profileUsername, isAllLink };
}
