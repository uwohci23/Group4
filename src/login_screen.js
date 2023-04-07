import './styles/login_screen.css';
// import users from './users.json';
const users = [
    {
        user_name: "john_doe",
        password: "john123",
        xp: 44,
        kills: 100,
        wins: 20,
        losses: 10,
        skills: ["temp Skill 1", "temp Skill 2", "temp Skill 3"],
    },
    {
        user_name: "jane_doe",
        password: "jane123",
        xp: 78,
        kills: 150,
        wins: 25,
        losses: 5,
        skills: ["temp Skill 1", "temp Skill 4", "temp Skill 5"],
    },
    {
        user_name: "admin",
        password: "admin123",
        xp: 99,
        kills: 200,
        wins: 30,
        losses: 15,
        skills: ["temp Skill 2", "temp Skill 3", "temp Skill 6"],
    },
    ];

    localStorage.setItem("users", JSON.stringify(users));
    
function createNewPlayer(user_name, password) {
    const defaultSkills = []; // Empty array for new players.
    const defaultKills = 0;
    const defaultWins = 0;
    const defaultLosses = 0;
  
    const newPlayer = {
      user_name,
      password,
      skills: defaultSkills,
      kills: defaultKills,
      wins: defaultWins,
      losses: defaultLosses,
    };
  
    const users = JSON.parse(localStorage.getItem("users"));
    users.push(newPlayer);
    localStorage.setItem("users", JSON.stringify(users));
  }
  

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
                createNewPlayer(user_name, password);
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
