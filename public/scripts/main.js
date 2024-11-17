import { auth } from "./firebase.js";

// add removeAllEventListeners method to Element prototype
(function () {
  const originalAddEventListener = Element.prototype.addEventListener;
  const listeners = [];

  Element.prototype.addEventListener = function (event, handler, ...rest) {
    listeners.push({ element: this, event, handler });
    originalAddEventListener.call(this, event, handler, ...rest);
  };

  function removeAllEventListeners() {
    listeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    listeners.length = 0;
  }
  Element.prototype.removeAllEventListeners = removeAllEventListeners;
})();

let c = 0;

auth.onAuthStateChanged((user) => {
  if (c !== 0) return;
  c++;

  if (
    window.location.pathname !== "/login" &&
    window.location.pathname !== "/register" &&
    !user
  ) {
    window.location.href = "/login";
  }

  if (
    (window.location.pathname === "/login" ||
      window.location.pathname === "/register") &&
    user
  ) {
    window.location.href = "/";
  }

  user.getIdToken().then((token) => {
    window.token = token;
    // set token in cookie
    document.cookie = `token=${token}`;
  });
});
