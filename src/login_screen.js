import './styles/login_screen.css';
// import users from './users.json';

document.getElementById('login-form').addEventListener('submit', event => {
    event.preventDefault();

    const user_name = document.getElementById('input-user').value;
    const password = document.getElementById('input-password').value;

    if (!user_name || !password) {
        alert("Please enter a username and password");
    }
    else {
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user_name === user.user_name && password === user.password) {
                localStorage.setItem("signup-flag", "false");
                localStorage.setItem("user", JSON.stringify(user));
                console.log(user.user_name);
                window.location.replace("./main_menu.html");
            }
            else {
                alert("Invalid username or password");
            }
        } else {
            alert("User not found, please signup");
        }
    } 
    event.target.reset();
});

document.getElementById('signup-form').addEventListener('submit', event => {
    event.preventDefault();

    const user_name = document.getElementById('signup-input-user').value;
    const password = document.getElementById('signup-input-password').value;

    const newUser = {
        user_name: user_name,
        password: password
    }
    // for sending over name to all pages
    localStorage.setItem("signup-flag", "true");
    localStorage.setItem("user", JSON.stringify(newUser));
    window.location.replace("./main_menu.html");
    event.target.reset();
});

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginLink = document.getElementById('login');
const signupLink = document.getElementById('signup');

signupLink.addEventListener("click", function (e) {
  e.preventDefault();
  loginForm.style.display = "none";
  signupForm.style.display = "block";
});

loginLink.addEventListener("click", function (e) {
  e.preventDefault();
  signupForm.style.display = "none";
  loginForm.style.display = "block";
});
