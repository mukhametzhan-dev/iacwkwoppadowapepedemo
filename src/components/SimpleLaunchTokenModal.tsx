import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Rocket, Upload, CheckCircle, ExternalLink, Copy, AlertCircle, X, Loader2, Star } from "lucide-react";
import { createTokenWithPool, CreateTokenRequest, CreateTokenResponse } from "@/services/api/token";

// Solana Icon Component
const SolanaIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 646 646" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="solanaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00FFA3" />
        <stop offset="100%" stopColor="#DC1FFF" />
      </linearGradient>
    </defs>
    <g>
      <path
        d="M108.53 478.697c5.343-5.343 12.595-8.34 20.18-8.34h489.04c11.605 0 17.407 14.03 9.19 22.247l-82.107 82.106c-5.343 5.343-12.595 8.34-20.18 8.34H35.618c-11.605 0-17.407-14.03-9.19-22.247l82.107-82.106z"
        fill="url(#solanaGradient)"
      />
      <path
        d="M108.53 85.593c5.55-5.55 13.165-8.666 21.065-8.666h489.04c11.605 0 17.407 14.03 9.19 22.247l-82.107 82.106c-5.343 5.343-12.595 8.34-20.18 8.34H35.618c-11.605 0-17.407-14.03-9.19-22.247l82.107-82.106z"
        fill="url(#solanaGradient)"
      />
      <path
        d="M537.467 282.145c-5.343-5.343-12.595-8.34-20.18-8.34H28.248c-11.605 0-17.407 14.03-9.19 22.247l82.107 82.106c5.343 5.343 12.595 8.34 20.18 8.34h489.04c11.605 0 17.407-14.03 9.19-22.247l-82.107-82.106z"
        fill="url(#solanaGradient)"
      />
    </g>
  </svg>
);

// AI-generated templates
const AI_TEMPLATES = [
  {
    id: 1,
    name: "AI Sultan V3",
    symbol: "AIS3",
    description: "The ultimate AI-powered meme token for the future",
    initialSupply: 1000000,
    decimals: 9,
    socialLinks: "https://twitter.com/aisultan, https://t.me/aisultan",
    initialLiquidity: 0.1,
    percentage: 50,
    category: "AI & Tech"
  },
  {
    id: 2,
    name: "Doge Commander",
    symbol: "DOGECMD",
    description: "Much wow, very command, such leadership",
    initialSupply: 10000000,
    decimals: 9,
    socialLinks: "https://twitter.com/dogecommander",
    initialLiquidity: 0.2,
    percentage: 40,
    category: "Meme"
  },
  {
    id: 3,
    name: "Quantum Pepe",
    symbol: "QPEPE",
    description: "Pepe meets quantum computing - the future is green",
    initialSupply: 5000000,
    decimals: 9,
    socialLinks: "https://twitter.com/quantumpepe, https://discord.gg/qpepe",
    initialLiquidity: 0.15,
    percentage: 60,
    category: "Science"
  },
  {
    id: 4,
    name: "Moon Rocket",
    symbol: "MOON",
    description: "To the moon and beyond! 🚀🌙",
    initialSupply: 21000000,
    decimals: 9,
    socialLinks: "https://moonrocket.space",
    initialLiquidity: 0.3,
    percentage: 30,
    category: "Space"
  }
];

interface SimpleLaunchTokenModalProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: {
    name?: string;
    symbol?: string;
    description?: string;
  };
}

export const SimpleLaunchTokenModal: React.FC<SimpleLaunchTokenModalProps> = ({ 
  children, 
  open: controlledOpen, 
  onOpenChange,
  initialData 
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateTokenRequest>({
    name: "",
    symbol: "",
    initialSupply: 1000000,
    decimals: 9,
    description: "",
    socialLinks: "",
    initialLiquidity: 0.1,
    percentage: 50,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchResult, setLaunchResult] = useState<CreateTokenResponse | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle controlled vs uncontrolled
  const isOpen = controlledOpen !== undefined ? controlledOpen : open;
  const setIsOpen = onOpenChange || setOpen;

  // Set initial data when provided
  React.useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || prev.name,
        symbol: initialData.symbol || prev.symbol,
        description: initialData.description || prev.description,
      }));
    }
  }, [initialData]);

  const handleTemplateSelect = (template: typeof AI_TEMPLATES[0]) => {
    setFormData({
      name: template.name,
      symbol: template.symbol,
      initialSupply: template.initialSupply,
      decimals: template.decimals,
      description: template.description,
      socialLinks: template.socialLinks,
      initialLiquidity: template.initialLiquidity,
      percentage: template.percentage,
    });
    setLaunchResult(null);
    setLaunchError(null);
  };

  const handleInputChange = (field: keyof CreateTokenRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageError(null);

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Please upload a valid image file (JPEG, PNG, WEBP, or GIF)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setImageError("Image size must be less than 5MB");
      return;
    }

    setImageFile(file);
  };

  const handleLaunch = async () => {
    if (!formData.name.trim() || !formData.symbol.trim() || formData.initialSupply <= 0) {
      setLaunchError("Please fill in all required fields");
      return;
    }

    setIsLaunching(true);
    setLaunchResult(null);
    setLaunchError(null);

    try {
      console.log("Launching token with backend API:", formData);
      console.log("Image file:", imageFile?.name);

      const response = await createTokenWithPool(formData, imageFile || undefined);
      
      console.log("Backend token launch successful:", response);
      setLaunchResult(response);
    } catch (error: any) {
      console.error("Backend token launch failed:", error);
      
      let errorMessage = "Unknown error occurred";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = "Backend timed out. Please try again or check the backend status.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again later.";
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.error || "Invalid request parameters.";
      }
      
      setLaunchError(errorMessage);
    } finally {
      setIsLaunching(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      symbol: "",
      initialSupply: 1000000,
      decimals: 9,
      description: "",
      socialLinks: "",
      initialLiquidity: 0.1,
      percentage: 50,
    });
    setImageFile(null);
    setLaunchResult(null);
    setLaunchError(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isFormValid = formData.name.trim() && formData.symbol.trim() && formData.initialSupply > 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Rocket className="w-5 h-5" />
            Launch Your Token
          </DialogTitle>
        </DialogHeader>

        {!launchResult && !isLaunching && (
          <div className="space-y-6">
            {/* AI Templates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">🤖 AI-Generated Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {AI_TEMPLATES.map((template) => (
                  <Card 
                    key={template.id} 
                    className="cursor-pointer hover:border-purple-300 transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{template.name}</CardTitle>
                        <Badge variant="secondary">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>Symbol: {template.symbol}</div>
                        <div>Supply: {template.initialSupply.toLocaleString()}</div>
                        <div className="truncate">{template.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Token Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Token Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Token Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="e.g., AI Sultan V3"
                    maxLength={32}
                  />
                </div>
                
                <div>
                  <Label htmlFor="symbol">Token Symbol *</Label>
                  <Input
                    id="symbol"
                    value={formData.symbol}
                    onChange={(e) => handleInputChange("symbol", e.target.value.toUpperCase())}
                    placeholder="e.g., AIS3"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <Label htmlFor="supply">Initial Supply *</Label>
                  <Input
                    id="supply"
                    type="number"
                    value={formData.initialSupply}
                    onChange={(e) => handleInputChange("initialSupply", parseInt(e.target.value) || 0)}
                    min={1}
                  />
                </div>
                
                <div>
                  <Label htmlFor="decimals">Decimals</Label>
                  <Input
                    id="decimals"
                    type="number"
                    value={formData.decimals}
                    onChange={(e) => handleInputChange("decimals", parseInt(e.target.value) || 9)}
                    min={0}
                    max={18}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your token..."
                  maxLength={200}
                />
              </div>

              <div>
                <Label htmlFor="socialLinks">Social Links (comma-separated)</Label>
                <Input
                  id="socialLinks"
                  value={formData.socialLinks}
                  onChange={(e) => handleInputChange("socialLinks", e.target.value)}
                  placeholder="https://twitter.com/yourtoken, https://t.me/yourtoken"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="liquidity">Initial Liquidity (SOL)</Label>
                  <Input
                    id="liquidity"
                    type="number"
                    step="0.01"
                    value={formData.initialLiquidity}
                    onChange={(e) => handleInputChange("initialLiquidity", parseFloat(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                
                <div>
                  <Label htmlFor="percentage">Pool Percentage (%)</Label>
                  <Input
                    id="percentage"
                    type="number"
                    value={formData.percentage}
                    onChange={(e) => handleInputChange("percentage", parseInt(e.target.value) || 0)}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <Label htmlFor="image">Token Logo (optional)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {imageFile ? "Change Image" : "Upload Image"}
                  </Button>
                  {imageFile && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{imageFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setImageFile(null)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleImageUpload}
                />
                {imageError && (
                  <p className="text-sm text-red-500 mt-1">{imageError}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Recommended: 512x512px, max 5MB (JPEG, PNG, WEBP, GIF)
                </p>
              </div>
            </div>

            {/* Error Display */}
            {launchError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Launch Failed:</strong> {launchError}
                </AlertDescription>
              </Alert>
            )}

            {/* Launch Button */}
            <div className="flex gap-2">
              <Button
                onClick={handleLaunch}
                disabled={!isFormValid || isLaunching}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                size="lg"
              >
                {isLaunching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Launch Token
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Reset
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLaunching && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Launching Your Token...</h3>
            <p className="text-muted-foreground">
              Sending request to backend API for token creation.
              <br />
              This may take up to 20 seconds.
            </p>
          </div>
        )}

        {/* Success Screen */}
        {launchResult && (
          <div className="space-y-8">
            {/* Header Section with Celebration */}
            <div className="text-center space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="relative">
                  <SolanaIcon className="w-16 h-16" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  🎉 Token Launched Successfully!
                </h3>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {formData.name} ({formData.symbol}) is now live on Solana Devnet
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>Your token is ready to trade and share!</span>
                  <Star className="w-4 h-4 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Token Details Cards */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Token Details</h4>
              
              {/* Mint Address Card */}
              <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-purple-200 dark:border-purple-700 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                    <SolanaIcon className="w-5 h-5 text-white" />
                  </div>
                  <Label className="text-base font-bold text-slate-900 dark:text-white">Mint Address</Label>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-3 rounded border border-slate-300 dark:border-slate-600 font-mono break-all select-all">
                    {launchResult.mint}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(launchResult.mint, 'mint')}
                    className="h-10 w-10 p-0 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                  >
                    {copied === 'mint' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Transaction ID Card */}
              {launchResult.txId && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-blue-200 dark:border-blue-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                    <Label className="text-base font-bold text-slate-900 dark:text-white">Transaction ID</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-3 rounded border border-slate-300 dark:border-slate-600 font-mono break-all select-all">
                      {launchResult.txId}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(launchResult.txId!, 'tx')}
                      className="h-10 w-10 p-0 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      {copied === 'tx' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Pool Information Card */}
              {launchResult.pool && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-orange-200 dark:border-orange-700 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <Label className="text-base font-bold text-slate-900 dark:text-white">Liquidity Pool Address</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-3 rounded border border-slate-300 dark:border-slate-600 font-mono break-all select-all">
                      {launchResult.pool.address}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(launchResult.pool!.address, 'pool')}
                      className="h-10 w-10 p-0 border-slate-400 dark:border-slate-500 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600"
                    >
                      {copied === 'pool' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons Section */}
            <div className="space-y-4">
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">Quick Actions</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://explorer.solana.com/address/${launchResult.mint}?cluster=devnet`, '_blank')}
                  className="flex items-center gap-2 h-12 bg-purple-500 text-white border-2 border-purple-500 hover:bg-purple-600 hover:border-purple-600 font-semibold"
                >
                  <SolanaIcon className="w-5 h-5" />
                  <span>View on Explorer</span>
                </Button>
                
                {launchResult.txId && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://explorer.solana.com/tx/${launchResult.txId}?cluster=devnet`, '_blank')}
                    className="flex items-center gap-2 h-12 bg-blue-500 text-white border-2 border-blue-500 hover:bg-blue-600 hover:border-blue-600 font-semibold"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Transaction</span>
                  </Button>
                )}
                
                {launchResult.pool && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://jup.ag/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=${launchResult.mint}`, '_blank')}
                    className="flex items-center gap-2 h-12 bg-green-500 text-white border-2 border-green-500 hover:bg-green-600 hover:border-green-600 font-semibold"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>Trade on Jupiter</span>
                  </Button>
                )}
              </div>

              {launchResult.isPlaceholder && (
                <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                  <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-800 dark:text-yellow-300">
                    <strong>Note:</strong> Pool creation is a placeholder. Manual liquidity addition may be required.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Next Steps */}
            <div className="space-y-3">
              <Button 
                onClick={resetForm} 
                size="lg"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold h-12"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Launch Another Token
              </Button>
              
              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Share your new token with the community and start building your project! 🚀
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};