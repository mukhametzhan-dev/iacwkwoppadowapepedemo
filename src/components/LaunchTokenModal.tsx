import React, { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Rocket, Upload, CheckCircle, ExternalLink, Copy, AlertCircle, X } from "lucide-react";
import { APILaunchTokenButton } from "./APILaunchTokenButton";
import { CreateTokenRequest, CreateTokenResponse } from "@/services/api/token";

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

interface LaunchTokenModalProps {
  children: React.ReactNode;
}

export const LaunchTokenModal: React.FC<LaunchTokenModalProps> = ({ children }) => {
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

  const handleLaunchStarted = () => {
    setIsLaunching(true);
    setLaunchResult(null);
    setLaunchError(null);
  };

  const handleLaunchSuccess = (response: CreateTokenResponse) => {
    setIsLaunching(false);
    setLaunchResult(response);
    setLaunchError(null);
  };

  const handleLaunchError = (error: Error) => {
    setIsLaunching(false);
    setLaunchResult(null);
    setLaunchError(error.message);
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
    <Dialog open={open} onOpenChange={setOpen}>
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
              <APILaunchTokenButton
                payload={formData}
                file={imageFile}
                onStarted={handleLaunchStarted}
                onSuccess={handleLaunchSuccess}
                onError={handleLaunchError}
                disabled={!isFormValid || isLaunching}
                className="flex-1"
              />
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
              Signing smart contracts and deploying to Solana devnet.
              <br />
              This may take up to 20 seconds.
            </p>
          </div>
        )}

        {/* Success Screen */}
        {launchResult && (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-2xl font-bold text-green-700">
                🎉 Congratulations! Your token launched successfully!
              </h3>
              <p className="text-muted-foreground">
                {formData.name} ({formData.symbol}) is now live on Solana devnet
              </p>
            </div>

            {/* Token Details */}
            <div className="space-y-4 text-left">
              {/* Mint Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Mint Address:</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono break-all">
                    {launchResult.mint}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(launchResult.mint, 'mint')}
                    className="h-8 w-8 p-0"
                  >
                    {copied === 'mint' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Transaction ID */}
              {launchResult.txId && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Transaction ID:</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono break-all">
                      {launchResult.txId}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(launchResult.txId!, 'tx')}
                      className="h-8 w-8 p-0"
                    >
                      {copied === 'tx' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Pool Information */}
              {launchResult.pool && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Pool Address:</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-xs bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded font-mono break-all">
                      {launchResult.pool.address}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(launchResult.pool!.address, 'pool')}
                      className="h-8 w-8 p-0"
                    >
                      {copied === 'pool' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open(`https://explorer.solana.com/address/${launchResult.mint}?cluster=devnet`, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Token
                </Button>
                {launchResult.txId && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://explorer.solana.com/tx/${launchResult.txId}?cluster=devnet`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Transaction
                  </Button>
                )}
                {launchResult.pool && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(`https://jup.ag/swap?inputMint=So11111111111111111111111111111111111111112&outputMint=${launchResult.mint}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Add Liquidity
                  </Button>
                )}
              </div>

              {launchResult.isPlaceholder && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Pool creation is a placeholder. Manual liquidity addition required.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Launch Another Token */}
            <Button onClick={resetForm} className="w-full">
              Launch Another Token
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};