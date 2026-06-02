import { computed, onUnmounted, ref } from "vue";

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const useProfileImageUpload = ({ onError, onSuccess } = {}) => {
  const selectedImageFile = ref(null);
  const selectedImagePreviewUrl = ref("");

  const hasSelectedImage = computed(() => Boolean(selectedImageFile.value));

  const revokeSelectedImagePreview = () => {
    if (selectedImagePreviewUrl.value) {
      URL.revokeObjectURL(selectedImagePreviewUrl.value);
      selectedImagePreviewUrl.value = "";
    }
  };

  const selectProfileImage = (event) => {
    const [file] = event.target.files || [];
    event.target.value = "";

    if (!file) {
      return;
    }

    onError?.("");
    onSuccess?.("");

    if (!ALLOWED_PROFILE_IMAGE_TYPES.includes(file.type)) {
      onError?.("Profile image must be a JPG, PNG, or WebP file");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      onError?.("Profile image must be 2MB or smaller");
      return;
    }

    revokeSelectedImagePreview();
    selectedImageFile.value = file;
    selectedImagePreviewUrl.value = URL.createObjectURL(file);
  };

  const cancelProfileImageSelection = () => {
    selectedImageFile.value = null;
    revokeSelectedImagePreview();
  };

  onUnmounted(revokeSelectedImagePreview);

  return {
    selectedImageFile,
    selectedImagePreviewUrl,
    hasSelectedImage,
    selectProfileImage,
    cancelProfileImageSelection,
    revokeSelectedImagePreview,
  };
};
