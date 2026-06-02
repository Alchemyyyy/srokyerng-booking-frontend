import { computed, onUnmounted, ref } from "vue";

const MAX_PROFILE_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const useProfileImageUpload = ({ onError, onSuccess, t } = {}) => {
  const selectedImageFile = ref(null);
  const selectedImagePreviewUrl = ref("");

  const hasSelectedImage = computed(() => Boolean(selectedImageFile.value));

  const revokeSelectedImagePreview = () => {
    if (selectedImagePreviewUrl.value) {
      URL.revokeObjectURL(selectedImagePreviewUrl.value);
      selectedImagePreviewUrl.value = "";
    }
  };

  const applyProfileImageCrop = async (canvas) => {
    if (!selectedImageFile.value || !canvas) {
      return;
    }

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, selectedImageFile.value.type || "image/jpeg", 0.92),
    );

    if (!blob) {
      return;
    }

    const croppedFile = new File([blob], selectedImageFile.value.name, {
      type: blob.type || selectedImageFile.value.type,
    });

    revokeSelectedImagePreview();
    selectedImageFile.value = croppedFile;
    selectedImagePreviewUrl.value = URL.createObjectURL(croppedFile);
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
      onError?.(t?.("profile.validation.profileImageType") || "Profile image must be a JPG, PNG, or WebP file");
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_SIZE) {
      onError?.(t?.("profile.validation.profileImageSize") || "Profile image must be 2MB or smaller");
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
    applyProfileImageCrop,
    cancelProfileImageSelection,
    revokeSelectedImagePreview,
  };
};
