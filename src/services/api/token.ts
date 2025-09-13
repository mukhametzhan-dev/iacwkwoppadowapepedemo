import axios from "axios";

const BASE = import.meta.env.VITE_BACKEND_URL || "http://144.124.225.79:3001";

export interface CreateTokenRequest {
  name: string;
  symbol: string;
  initialSupply: number;
  decimals?: number;
  description?: string;
  socialLinks?: string;
  initialLiquidity?: number;
  percentage?: number;
}

export interface CreateTokenResponse {
  mint: string;
  name: string;
  symbol: string;
  decimals: number;
  initialSupply: number;
  tokenAccount: string;
  pool?: {
    address: string;
    lpMint: string;
    txId: string;
  };
  initialPrice?: number;
  txId?: string;
  isPlaceholder?: boolean;
}

export const createTokenWithPool = async (
  payload: CreateTokenRequest, 
  file?: File
): Promise<CreateTokenResponse> => {
  if (file) {
    const formData = new FormData();
    
    // Add all payload fields to form data
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    // Add image file
    formData.append("image", file);
    
    const response = await axios.post(
      `${BASE}/api/token/create-with-pool`, 
      formData, 
      { 
        timeout: 40000,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    
    return response.data;
  } else {
    const response = await axios.post(
      `${BASE}/api/token/create-with-pool`, 
      payload, 
      { 
        timeout: 40000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    return response.data;
  }
};

export const createToken = async (
  payload: CreateTokenRequest, 
  file?: File
): Promise<CreateTokenResponse> => {
  if (file) {
    const formData = new FormData();
    
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, String(value));
      }
    });
    
    formData.append("image", file);
    
    const response = await axios.post(
      `${BASE}/api/token/create`, 
      formData, 
      { 
        timeout: 40000,
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      }
    );
    
    return response.data;
  } else {
    const response = await axios.post(
      `${BASE}/api/token/create`, 
      payload, 
      { 
        timeout: 40000,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    return response.data;
  }
};