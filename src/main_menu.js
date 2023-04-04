// get element from login
if (localStorage.getItem("signup-flag") === "false") {
    const username = JSON.parse(localStorage.getItem("user"));
    const id = document.getElementById("username");
    id.textContent = username.user_name;
}
// get element from signup
else if (localStorage.getItem("signup-flag") === "true") {
    const username = JSON.parse(localStorage.getItem("user"));
    const id = document.getElementById("username");
    id.textContent = username.user_name;
}

