const fs = require('fs');
const file = 'src/modules/auth/pages/RegisterView.vue';
let content = fs.readFileSync(file, 'utf8');

// 1. Move AuthSocialLogin
// Remove from step 1
content = content.replace(/<AuthSocialLogin :role="selectedRole"[^>]*\/>/g, '');

// Add to bottom of form
content = content.replace(/(<\/div>\s*<\/div>\s*<\/form>)/, `  <AuthSocialLogin v-if="currentStep === 1 || selectedRole === ROLES.OWNER" :role="selectedRole" style="margin-top: 24px;" />\n      $1`);

// 2. Refactor floating labels
// Regex to capture:
// <div class="auth-floating-group">
//   <span class="...auth-input-shell">
//     <i ...></i>
//     <input ... id="ID" ... />
//     <label for="ID" class="auth-floating-label-text">
//       LABEL CONTENT
//     </label>
//     REST OF SPAN
//   </span>
//   REST OF DIV
// </div>
// It's easier to just match the <label> and move it before the <span class="auth-input-shell">

// We will do this manually for the 5 inputs to be safe.
// Input 1: full_name
content = content.replace(
  /<span class="auth-input-shell">([\s\S]*?)<label for="reg-fullname" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-fullname" class="auth-standard-label">\n                $2\n              </label>\n            <span class="auth-input-shell">$1$3</span>'
);

// Input 2: email
content = content.replace(
  /<span class="auth-input-shell">([\s\S]*?)<label for="reg-email" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-email" class="auth-standard-label">\n                $2\n              </label>\n            <span class="auth-input-shell">$1$3</span>'
);

// Input 3: phone
content = content.replace(
  /<span class="auth-input-shell">([\s\S]*?)<label for="reg-phone" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-phone" class="auth-standard-label">\n                $2\n              </label>\n            <span class="auth-input-shell">$1$3</span>'
);

// Input 4: password
content = content.replace(
  /<span class="password-field auth-input-shell">([\s\S]*?)<label for="reg-password" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-password" class="auth-standard-label">\n                $2\n              </label>\n            <span class="password-field auth-input-shell">$1$3</span>'
);

// Input 5: confirm
content = content.replace(
  /<span class="password-field auth-input-shell">([\s\S]*?)<label for="reg-confirm" class="auth-floating-label-text">\s*([\s\S]*?)\s*<\/label>([\s\S]*?)<\/span>/,
  '<label for="reg-confirm" class="auth-standard-label">\n                $2\n              </label>\n            <span class="password-field auth-input-shell">$1$3</span>'
);

fs.writeFileSync(file, content);
console.log("Replaced labels and social login in RegisterView.vue");
