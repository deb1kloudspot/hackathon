import { ParkingSlot } from "@/types/parking";
import { Button } from "@/components/ui/button";
import { Navigation, Coins } from "lucide-react";

interface SuggestedSlotCardProps {
  slot: ParkingSlot | null;
  onSelect: () => void;
}

export const SuggestedSlotCard = ({ slot, onSelect }: SuggestedSlotCardProps) => {
  if (!slot) return null;

  return (
    <div className="glass-strong rounded-xl p-4 space-y-3 border-2 border-slot-suggested/30 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slot-suggested/10 rounded-full blur-2xl" />

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slot-suggested uppercase tracking-wider">
            Nearest Empty Slot
          </span>
          <div className="w-2 h-2 bg-slot-suggested rounded-full animate-ping" />
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{slot.id}</span>
            <span className="text-sm text-muted-foreground">{slot.floor}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <Navigation className="w-4 h-4 text-slot-suggested" />
              <span>{slot.distanceFromEntrance}m from entrance</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Coins className="w-4 h-4 text-slot-suggested" />
              <span>2 ADA per minute (pay-per-use)</span>
            </div>
          </div>
        </div>

        <Button
          onClick={onSelect}
          className="w-full mt-3 bg-slot-suggested hover:bg-slot-suggested/90 text-white"
        >
          Select This Slot
        </Button>
      </div>
    </div>
  );
};
