import { reactive } from "vue";
import { hasMinPasswordLength } from "@/shared/utils/validators";

export const useProfileValidation = ({ profileForm, passwordForm }) => {
  const profileErrors = reactive({
    full_name: "",
    phone: "",
    date_of_birth: "",
  });

  const passwordErrors = reactive({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const clearProfileErrors = () => {
    profileErrors.full_name = "";
    profileErrors.phone = "";
    profileErrors.date_of_birth = "";
  };

  const clearPasswordErrors = () => {
    passwordErrors.current_password = "";
    passwordErrors.new_password = "";
    passwordErrors.confirm_password = "";
  };

  const validateProfileForm = () => {
    clearProfileErrors();

    if (!profileForm.full_name.trim()) {
      profileErrors.full_name = "Full name is required";
    }

    if (profileForm.phone && !/^[0-9+()\-\s]{7,20}$/.test(profileForm.phone)) {
      profileErrors.phone = "Phone number format is invalid";
    }

    if (profileForm.date_of_birth) {
      const birthDate = new Date(profileForm.date_of_birth);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (Number.isNaN(birthDate.getTime()) || birthDate > today) {
        profileErrors.date_of_birth = "Date of birth cannot be in the future";
      }
    }

    return !profileErrors.full_name && !profileErrors.phone && !profileErrors.date_of_birth;
  };

  const validatePasswordForm = () => {
    clearPasswordErrors();

    if (!passwordForm.current_password) {
      passwordErrors.current_password = "Current password is required";
    }

    if (!passwordForm.new_password) {
      passwordErrors.new_password = "New password is required";
    } else if (!hasMinPasswordLength(passwordForm.new_password)) {
      passwordErrors.new_password = "New password must be at least 8 characters";
    }

    if (!passwordForm.confirm_password) {
      passwordErrors.confirm_password = "Confirm password is required";
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      passwordErrors.confirm_password = "New password and confirmation do not match";
    }

    return (
      !passwordErrors.current_password &&
      !passwordErrors.new_password &&
      !passwordErrors.confirm_password
    );
  };

  return {
    profileErrors,
    passwordErrors,
    clearProfileErrors,
    clearPasswordErrors,
    validateProfileForm,
    validatePasswordForm,
  };
};
