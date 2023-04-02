import './styles/login_screen.css';
import users from './users.json';

document.getElementById('login-form').addEventListener('submit', event => {
  event.preventDefault();

  const user_name = document.getElementById('input-user').value;
  const password = document.getElementById('input-password').value;
  
  const user = users.find(user => user.user_name === user_name && user.password === password);

    if (user) {
    localStorage.setItem('username', user_name);
    localStorage.setItem('password', password);
    window.location.replace("./main_menu.html");
  } else {
    alert('Inavlid username or password');
  }
});
document.getElementById('signup-form').addEventListener('submit', event => {
    event.preventDefault();

    const user_name = document.getElementById('input-user').value;
    const password = document.getElementById('input-password').value;

    // const newUser = {
    //     user_name: user_name,
    //     password: password
    // }
    // const data = JSON.stringify(newUser);
    
    // window.location.replace("./main_menu.html");
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
