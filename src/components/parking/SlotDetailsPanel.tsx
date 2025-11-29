import { ParkingSlot } from "@/types/parking";
import { Button } from "@/components/ui/button";
import { X, MapPin, Navigation, Coins } from "lucide-react";

interface SlotDetailsPanelProps {
  slot: ParkingSlot | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const SlotDetailsPanel = ({
  slot,
  onClose,
  onConfirm,
  isLoading,
}: SlotDetailsPanelProps) => {
  if (!slot) return null;

  // 🔹 Dynamic fare: prefer ratePerMinute, else price, else default 2
  const ratePerMinute =
    (slot as any).ratePerMinute ??
    (slot as any).price ??
    2;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-black text-white glass-strong border-l border-border/50 p-6 space-y-6 overflow-y-auto z-50">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Slot Details</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5 text-white" />
        </Button>
      </div>

      <div className="space-y-4">
        <div className="bg-black text-white rounded-xl p-4 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{slot.id}</span>
            <span className="text-muted-foreground">{slot.floor}</span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Level: {slot.floor}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Navigation className="w-4 h-4 text-primary" />
              <span>{slot.distanceFromEntrance}m from entrance</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Coins className="w-4 h-4 text-primary" />
              <span>
                {ratePerMinute} ADA per minute (pay-per-use)
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold glow-cyan"
          >
            {isLoading ? "Starting..." : "Start Parking"}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-border/50 text-white hover:text-primary"
          >
            Change Slot
          </Button>
        </div>
      </div>
    </div>
  );
};
