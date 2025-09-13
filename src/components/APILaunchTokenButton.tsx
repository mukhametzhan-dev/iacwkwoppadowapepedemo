import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Rocket, Loader2 } from "lucide-react";
import { createTokenWithPool, CreateTokenRequest, CreateTokenResponse } from "@/services/api/token";

export interface APILaunchTokenButtonProps {
  payload: CreateTokenRequest;
  file?: File | null;
  onStarted?: () => void;
  onSuccess?: (response: CreateTokenResponse) => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const APILaunchTokenButton: React.FC<APILaunchTokenButtonProps> = ({
  payload,
  file,
  onStarted,
  onSuccess,
  onError,
  disabled = false,
  children,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleLaunch = async () => {
    if (isLoading || disabled) return;

    try {
      // Validate required fields
      if (!payload.name || !payload.symbol || !payload.initialSupply) {
        throw new Error("Name, symbol, and initial supply are required");
      }

      setIsLoading(true);
      onStarted?.();

      console.log("Launching token with backend API:", payload);
      console.log("Image file:", file?.name);

      const response = await createTokenWithPool(payload, file || undefined);
      
      console.log("Backend token launch successful:", response);
      onSuccess?.(response);
    } catch (error: any) {
      console.error("Backend token launch failed:", error);
      
      let errorMessage = "Unknown error occurred";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Backend timed out. Please try again or run the dev script.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Invalid request parameters.";
      }
      
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLaunch}
      disabled={isLoading || disabled}
      className={`bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold ${className}`}
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Launching...
        </>
      ) : (
        <>
          <Rocket className="w-4 h-4 mr-2" />
          {children || "Launch Token"}
        </>
      )}
    </Button>
  );
};