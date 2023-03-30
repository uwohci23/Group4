
fetch('users.json')
    .then(response => response.json())
    .then(users => {
        document.getElementById('login-form').addEventListener('submit', event => {
            event.preventDefault();

            const user_name = document.getElementById('input-user').value;
            const password = document.getElementById('input-password').value;

            const user = users.find(user => user.user_name === user_name && user.password === password);

            if (user) {
                alert('Login Successful!')
                window.location.href = 'main_menu.html';
            } else {
                alert('Inavlid username or password');
            }
        });
    });