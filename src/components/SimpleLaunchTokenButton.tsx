import React from "react";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";
import { SimpleLaunchTokenModal } from "./SimpleLaunchTokenModal";

export const SimpleLaunchTokenButton: React.FC = () => {
  return (
    <SimpleLaunchTokenModal>
      <Button
        variant="default"
        size="lg"
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        <Rocket className="w-5 h-5 mr-2" />
        Launch Token!
      </Button>
    </SimpleLaunchTokenModal>
  );
};