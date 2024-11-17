import { loginWithEmailAndPassword, loginWithGoogle } from "./firebase.js";

const form = document.getElementById("loginForm");
const googleButton = document.getElementById("googleLogin");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form["email"].value;
  const password = form["password"].value;

  const result = await loginWithEmailAndPassword(email, password);
  if (result) {
    window.location.href = "/";
  } else {
    alert("Login failed");
  }
});

googleButton.addEventListener("click", async () => {
  const result = await loginWithGoogle();
  if (result) {
    window.location.href = "/";
  } else {
    alert("Login failed");
  }
});
