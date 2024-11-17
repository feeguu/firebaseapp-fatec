import { loginWithGoogle, registerUser } from "./firebase.js";

const form = document.getElementById("registerForm");
const googleButton = document.getElementById("googleLogin");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = form["email"].value;
  const password = form["password"].value;

  console.log("Submitting registration form...");
  const result = await registerUser(email, password);
  console.log("Registration result:", result);

  if (result) {
    window.location.href = "/";
  } else {
    alert("Registration failed");
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
