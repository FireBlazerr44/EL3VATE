document.addEventListener("DOMContentLoaded", function() {
    const tabBtns = document.querySelectorAll(".tab-btn");
    const authForms = document.querySelectorAll(".auth-form");
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const tab = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            
            authForms.forEach(form => {
                form.classList.remove("active");
                if (form.id === tab + "-form") {
                    form.classList.add("active");
                }
            });
            
            clearErrors();
        });
    });

    function clearErrors() {
        document.querySelectorAll(".error-message").forEach(err => err.textContent = "");
    }

    function getUsers() {
        const users = localStorage.getItem("users");
        return users ? JSON.parse(users) : [];
    }

    function saveUsers(users) {
        localStorage.setItem("users", JSON.stringify(users));
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showError(elementId, message) {
        document.getElementById(elementId).textContent = message;
    }

    signupForm.addEventListener("submit", function(e) {
        e.preventDefault();
        clearErrors();
        
        const name = document.getElementById("signup-name").value.trim();
        const email = document.getElementById("signup-email").value.trim();
        const password = document.getElementById("signup-password").value;
        const confirmPassword = document.getElementById("signup-confirm").value;
        
        if (!name || !email || !password || !confirmPassword) {
            showError("signup-error", "Please fill in all fields");
            return;
        }
        
        if (!isValidEmail(email)) {
            showError("signup-error", "Please enter a valid email address");
            return;
        }
        
        if (password.length < 6) {
            showError("signup-error", "Password must be at least 6 characters");
            return;
        }
        
        if (password !== confirmPassword) {
            showError("signup-error", "Passwords do not match");
            return;
        }
        
        const users = getUsers();
        
        if (users.some(user => user.email === email)) {
            showError("signup-error", "Email already registered");
            return;
        }
        
        users.push({ name, email, password });
        saveUsers(users);
        
        showError("signup-error", "");
        alert("Account created successfully! Please log in.");
        
        document.getElementById("signup-name").value = "";
        document.getElementById("signup-email").value = "";
        document.getElementById("signup-password").value = "";
        document.getElementById("signup-confirm").value = "";
        
        document.querySelector("[data-tab=\"login\"]").click();
    });

    loginForm.addEventListener("submit", function(e) {
        e.preventDefault();
        clearErrors();
        
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value;
        const rememberMe = document.getElementById("remember-me").checked;
        
        if (!email || !password) {
            showError("login-error", "Please fill in all fields");
            return;
        }
        
        if (!isValidEmail(email)) {
            showError("login-error", "Please enter a valid email address");
            return;
        }
        
        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            showError("login-error", "Invalid email or password");
            return;
        }
        
        if (rememberMe) {
            localStorage.setItem("currentUser", JSON.stringify(user));
        } else {
            sessionStorage.setItem("currentUser", JSON.stringify(user));
        }
        
        window.location.href = "index.html";
    });
});
