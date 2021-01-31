// can be where the user edits the auto fill info

const loginForm = document.getElementById("login-form");
const loginBtn = document.getElementById("login-btn");
const loginUser = document.getElementById("signin-username");

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
        // console.log(data)
        let token = data.token
        chrome.storage.sync.set( { token: token }, () => console.log('Token is set to ' + token))
    })
    // console.log(username, password)  
    // window.location.href = "./applr.html"
    swal({
        title: "Signed in!",
        icon: "success",
        button: "Close",
      });
})