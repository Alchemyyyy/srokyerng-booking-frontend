// Shared bank branding lookup (name, logo, accent color) by payment_method_id.
// Single source of truth so the owner and customer sides always show the
// same logo for the same bank instead of duplicating this mapping.
//
// Note: logos are hotlinked to third-party sites, not hosted by this app.
// If one of those URLs breaks or blocks hotlinking, the <img> will just
// fail to load (callers should have an alt/fallback for that case).

const BANK_METHODS = {
  1: {
    name: "ABA Bank",
    logo: "https://i.pinimg.com/736x/e2/33/f5/e233f5b0c5a358449398f202b03f063a.jpg",
    accentClass: "border-t-4 border-[#005f9e]",
  },
  2: {
    name: "Acleda Bank",
    logo: "https://companieslogo.com/img/orig/ABC.KH-3aa8d94f.png?t=1659408615",
    accentClass: "border-t-4 border-[#0b3366]",
  },
  3: {
    name: "Wing Bank",
    logo: "https://www.royalgroup.com.kh/img/business_division/WingBank_Logo.png",
    accentClass: "border-t-4 border-[#8cc63f]",
  },
};

const DEFAULT_BANK = {
  name: "Other Bank",
  logo: "https://cdn-icons-png.flaticon.com/512/2830/2830284.png",
  accentClass: "border-t-4 border-slate-400",
};

export const getBankName = (methodId) =>
  (BANK_METHODS[Number(methodId)] || DEFAULT_BANK).name;

export const getBankLogo = (methodId) =>
  (BANK_METHODS[Number(methodId)] || DEFAULT_BANK).logo;

export const getBankAccentClass = (methodId, isActive) => {
  if (isActive === false) return "border-t-4 border-slate-300 opacity-75";
  return (BANK_METHODS[Number(methodId)] || DEFAULT_BANK).accentClass;
};
