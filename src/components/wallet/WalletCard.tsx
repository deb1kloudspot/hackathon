import { Wallet, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WalletCardProps {
  balance: number;
  onAddMoney: () => void;
}

export const WalletCard = ({ balance, onAddMoney }: WalletCardProps) => {
  return (
    <div className="glass-strong rounded-xl p-6 space-y-4 border-2 border-primary/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-glow-cyan/10 rounded-full blur-3xl" />
      
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <span className="font-semibold">Wallet Balance</span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={onAddMoney}
            className="gap-1 border-primary/30 hover:bg-primary/10"
          >
            <Plus className="w-4 h-4" />
            Add Money
          </Button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-primary">{balance} ADA</span>
          <span className="text-sm text-muted-foreground">available</span>
        </div>
      </div>
    </div>
  );
};
