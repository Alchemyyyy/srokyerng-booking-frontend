export const resolveAssetUrl = (path) => {
  if (!path) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(path)) {
    return path;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
  const assetBaseUrl = apiBaseUrl.replace(/\/api\/?$/, "");

  return `${assetBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};
