import swal from 'sweetalert2';
const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const loginUser = document.getElementById("signin-username");
const noMatch = document.getElementById("signup-no-match");
noMatch.style.display = "none";
const myStorage = window.localStorage

loginForm.addEventListener("submit", (e)=> {
    e.preventDefault();
    const username = document.getElementById("signin-username").value;
    const password = document.getElementById("signin-password").value;
    console.log(username, password)
    fetch('http://localhost:5000/login', {
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
        console.log(data)
        // console.log(myStorage.getItem("token"))
        // chrome.storage.local.set( { token: token }, () => console.log('Token is set to ' + token))
        // chrome.storage.local.get(['token'], (result) => console.log('Value currently is ' + result.key))
        if (data.status === "success") {
            noMatch.style.display = "none";
            swal({
                title: "Signed in!",
                icon: "success",
                button: "Close",
              }).then(function() {
                window.location = "./confirmation.html";
            });
            // window.location.href = "";
        }
        else {
            noMatch.style.display = "block";

        }
    })
})
