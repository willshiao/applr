const signUpForm = document.getElementById("signup-form");
const signupBtn = document.getElementById("signup-btn");
const confirmPassword = document.getElementById("confirm-signup-password");
const signupPassword = document.getElementById("signup-password");

const noMatch = document.getElementById("signup-no-match");
noMatch.style.display = "none";

confirmPassword.addEventListener("change", () => {
    if (confirmPassword.value !== signupPassword.value) {
        console.log("Passwords do not match");
        noMatch.style.display = "block";
    } else {
        noMatch.style.display = "none";
    }
});

signupBtn.addEventListener("click", (e)=>{
    e.preventDefault();
    const username = signUpForm.username.value;
    const password = signUpForm.password.value;
    const confirmPassword = signUpForm.confirmPassword.value;
    if (password === confirmPassword) {
        console.log("sign up success");
        window.location.href = "./applr.html";
    }
});