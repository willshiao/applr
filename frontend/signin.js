
const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const loginUser = document.getElementById("signin-username");

loginBtn.addEventListener("click", (e)=> {
    e.preventDefault();
    const username = document.getElementById("signin-username").value;
    const password = document.getElementById("signin-password").value;
    console.log(username, password);
    window.location.href = "./applr.html";

});
