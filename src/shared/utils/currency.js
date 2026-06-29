import { ref } from "vue";

const KHR_RATE = 4100; // Mock rate: 1 USD = 4100 KHR

const getUserId = () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      return userObj.id || "guest";
    }
  } catch (e) {
    console.error("Failed to parse user details for currency key", e);
  }
  return "guest";
};

// Global reactive currency ref loaded initially from local storage
export const currentCurrency = ref(localStorage.getItem(`pref_currency_${getUserId()}`) || "USD");

export const updateCurrency = (newVal) => {
  currentCurrency.value = newVal;
  localStorage.setItem(`pref_currency_${getUserId()}`, newVal);
};

export const formatPrice = (usdAmount) => {
  const amount = Number(usdAmount) || 0;
  if (currentCurrency.value === "KHR") {
    const khrVal = amount * KHR_RATE;
    return new Intl.NumberFormat("km-KH", {
      style: "currency",
      currency: "KHR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(khrVal);
  }
  // Default format as USD
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
