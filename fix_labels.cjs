const fs = require('fs');
const file = 'src/modules/auth/pages/RegisterView.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Move AuthSocialLogin
// Remove from step 1
content = content.replace(/<AuthSocialLogin :role="selectedRole"[^>]*\/>\s*/g, '');

// Add to bottom of form
content = content.replace(/(<\/div>\s*<\/div>\s*<\/form>)/, `  </div>\n      <AuthSocialLogin v-if="currentStep === 1 || selectedRole === ROLES.OWNER" :role="selectedRole" style="margin-top: 24px;" />\n      </div>\n    </form>`);

// 2. Refactor floating labels
// Input 1: full_name
content = content.replace(
  /<span class="auth-input-shell">\s*<i class="bi bi-person" aria-hidden="true"><\/i>([\s\S]*?)<label for="reg-fullname" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-fullname" class="auth-standard-label">\n                $2\n              </label>\n              <span class="auth-input-shell">\n                <i class="bi bi-person" aria-hidden="true"></i>$1$3</span>'
);

// Input 2: email
content = content.replace(
  /<span class="auth-input-shell">\s*<i class="bi bi-envelope" aria-hidden="true"><\/i>([\s\S]*?)<label for="reg-email" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-email" class="auth-standard-label">\n                $2\n              </label>\n              <span class="auth-input-shell">\n                <i class="bi bi-envelope" aria-hidden="true"></i>$1$3</span>'
);

// Input 3: phone
content = content.replace(
  /<span class="auth-input-shell">\s*<i class="bi bi-telephone" aria-hidden="true"><\/i>([\s\S]*?)<label for="reg-phone" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-phone" class="auth-standard-label">\n                $2\n              </label>\n              <span class="auth-input-shell">\n                <i class="bi bi-telephone" aria-hidden="true"></i>$1$3</span>'
);

// Input 4: password
content = content.replace(
  /<span class="password-field auth-input-shell">\s*<i class="bi bi-lock" aria-hidden="true"><\/i>([\s\S]*?)<label for="reg-password" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-password" class="auth-standard-label">\n                $2\n              </label>\n              <span class="password-field auth-input-shell">\n                <i class="bi bi-lock" aria-hidden="true"></i>$1$3</span>'
);

// Input 5: confirm
content = content.replace(
  /<span class="password-field auth-input-shell">\s*<i class="bi bi-lock-fill" aria-hidden="true"><\/i>([\s\S]*?)<label for="reg-confirm" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-confirm" class="auth-standard-label">\n                $2\n              </label>\n              <span class="password-field auth-input-shell">\n                <i class="bi bi-lock-fill" aria-hidden="true"></i>$1$3</span>'
);

fs.writeFileSync(file, content);
console.log("Replaced labels and social login in RegisterView.vue");
