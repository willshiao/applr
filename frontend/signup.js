// import swal from 'sweetalert2';
const signUpForm = document.getElementById("signup-form");
const signupBtn = document.getElementById("signup-btn");
const confirmPassword = document.getElementById("confirm-signup-password");
const signupPassword = document.getElementById("signup-password");
const noMatch = document.getElementById("signup-no-match");
noMatch.style.display = "none";
const myStorage = window.localStorage

confirmPassword.addEventListener("change", () => {
    if (confirmPassword.value !== signupPassword.value) {
        console.log("Passwords do not match");
        noMatch.style.display = "block";
    } else {
        noMatch.style.display = "none";
    }
});

signUpForm.addEventListener("submit", (e)=>{
    e.preventDefault();
    console.log("hello")
    const username = signUpForm.username.value;
    const password = signUpForm.password.value;
    const confirmPassword = signUpForm.confirmPassword.value;
    console.log(username, password)
    fetch("https://applr-api.wls.ai/register", {
        method: "POST",
        body: JSON.stringify({
            username: username,
            password: password
        }),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })
    .then(res => res.json())
    .then(function (data) {
        let token = data.token
        myStorage.setItem('applrToken', token)
        if (data.status === "success") {
            noMatch.style.display = "none"
            // window.location.href = "../extension/confirmation.html"
            swal({
                title: "Signed up!",
                icon: "success",
                button: "Close",
              }).then(function() {
                  window.location.href = "./../extension/confirmation.html";
            });
        } else {
            noMatch.style.display = "block"
        }
    })
});