import { useState } from "react";
import { ParkingSlot } from "@/types/parking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Coins } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPanelProps {
  slot: ParkingSlot;
  onProceedToPayment: (duration: number, amount: number) => void;
  onCancel: () => void;
}

const durationOptions = [
  { label: "1 hour", value: 1 },
  { label: "2 hours", value: 2 },
  { label: "4 hours", value: 4 },
  { label: "Full day", value: 24 },
];

export const PricingPanel = ({ slot, onProceedToPayment, onCancel }: PricingPanelProps) => {
  const [selectedDuration, setSelectedDuration] = useState(2);

  // slot.price is assumed to be in ADA per hour
  const totalAmount = slot.price * selectedDuration;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-lg glass-strong p-6 space-y-6 border-2 border-primary/20">
        <div>
          <h2 className="text-2xl font-bold mb-2">Review &amp; Pricing</h2>
          <p className="text-muted-foreground text-sm">
            Select your parking duration
          </p>
        </div>

        {/* Slot summary */}
        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Selected Slot</span>
            <span className="text-lg font-bold text-primary">{slot.id}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Floor</span>
            <span className="text-sm font-medium">{slot.floor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price per hour</span>
            <span className="text-sm font-medium">{slot.price} ADA</span>
          </div>
        </div>

        {/* Duration selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Duration
          </label>
          <div className="grid grid-cols-2 gap-2">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedDuration(option.value)}
                className={cn(
                  "p-3 rounded-lg border-2 transition-all duration-200",
                  selectedDuration === option.value
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border hover:border-primary/50 bg-secondary/50"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total amount */}
        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">Total Amount</span>
            <div className="flex items-center gap-1">
              <Coins className="w-5 h-5 text-primary" />
              <span className="text-3xl font-bold text-primary">
                {totalAmount} ADA
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 border-border/50"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onProceedToPayment(selectedDuration, totalAmount)}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-cyan"
          >
            Proceed to Wallet
          </Button>
        </div>
      </Card>
    </div>
  );
};
