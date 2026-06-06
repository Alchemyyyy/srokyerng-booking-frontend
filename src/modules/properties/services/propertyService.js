import http from "@/app/api/http";

export const getOwnerProperties = async () => {
  const response = await http.get("/properties/my");
  return response.data;
};
