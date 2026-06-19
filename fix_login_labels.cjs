const fs = require('fs');
const file = 'src/modules/auth/pages/LoginView.vue';
let content = fs.readFileSync(file, 'utf8');

// Input 1: email
content = content.replace(
  /<span class="auth-input-shell">\s*<i class="bi bi-envelope" aria-hidden="true"><\/i>([\s\S]*?)<label for="login-email" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="login-email" class="auth-standard-label">\n                $2\n              </label>\n              <span class="auth-input-shell">\n                <i class="bi bi-envelope" aria-hidden="true"></i>$1$3</span>'
);

// Input 2: password
content = content.replace(
  /<span class="password-field auth-input-shell">\s*<i class="bi bi-lock" aria-hidden="true"><\/i>([\s\S]*?)<label for="login-password" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="login-password" class="auth-standard-label">\n                $2\n              </label>\n              <span class="password-field auth-input-shell">\n                <i class="bi bi-lock" aria-hidden="true"></i>$1$3</span>'
);

fs.writeFileSync(file, content);
console.log("Replaced labels in LoginView.vue");
