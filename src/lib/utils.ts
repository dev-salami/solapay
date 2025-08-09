/* eslint-disable @typescript-eslint/no-explicit-any */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useLocalStorage } from "react-use";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Token functions
export const useToken = () => {
  const [token, setToken] = useLocalStorage<string>("auth_token", undefined);

  const storeToken = (newToken: string) => setToken(newToken);
  const removeToken = () => setToken(undefined);

  return {
    token: typeof window !== "undefined" ? token : undefined,
    storeToken,
    removeToken,
  };
};

// Business data functions
export const useBusinessData = () => {
  const [businessData, setBusinessData] = useLocalStorage<any>(
    "business_data",
    undefined
  );

  const storeBusinessData = (data: any) => setBusinessData(data);
  const removeBusinessData = () => setBusinessData(undefined);

  return {
    businessData: typeof window !== "undefined" ? businessData : undefined,
    storeBusinessData,
    removeBusinessData,
  };
};

export const useLogout = () => {
  const { removeToken } = useToken();
  const { removeBusinessData } = useBusinessData();

  const logout = () => {
    removeToken();
    removeBusinessData();
  };

  return { logout };
};
