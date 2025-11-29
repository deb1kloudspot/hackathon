import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SlotGrid } from "@/components/parking/SlotGrid";
import { SlotLegend } from "@/components/parking/SlotLegend";
import { SuggestedSlotCard } from "@/components/parking/SuggestedSlotCard";
import { SlotDetailsPanel } from "@/components/parking/SlotDetailsPanel";
import { PricingPanel } from "@/components/parking/PricingPanel";
import { WalletCard } from "@/components/wallet/WalletCard";
import { ActiveBookingCard } from "@/components/booking/ActiveBookingCard";
import { ParkingSlot, Booking } from "@/types/parking";
import { generateMockSlots } from "@/data/mockData";
import { startBooking, endBooking } from "@/services/mockBookingApi";
import { toast } from "sonner";
import { ChevronDown, History, Wallet } from "lucide-react";

const Dashboard = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [nearestSlot, setNearestSlot] = useState<ParkingSlot | null>(null);
  const [walletBalance, setWalletBalance] = useState(350); // ADA
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [view, setView] = useState<"overview" | "booking" | "history">("overview");
  const [isStartingBooking, setIsStartingBooking] = useState(false);

  useEffect(() => {
    const generatedSlots = generateMockSlots();
    setSlots(generatedSlots);

    const nearest = generatedSlots
      .filter((s) => s.status === "available")
      .sort((a, b) => a.distanceFromEntrance - b.distanceFromEntrance)[0];

    if (nearest) {
      nearest.status = "suggested";
      setNearestSlot(nearest);
    }
  }, []);

  const handleSlotSelect = (slot: ParkingSlot) => {
    const updatedSlots = slots.map((s) => ({
      ...s,
      status: (s.id === slot.id
        ? "selected"
        : s.status === "selected"
          ? "available"
          : s.status) as ParkingSlot["status"],
    }));
    setSlots(updatedSlots);
    setSelectedSlot(slot);
  };

  const handleConfirmSlot = async () => {
    if (!selectedSlot) return;

    setIsStartingBooking(true);

    try {
      const response = await startBooking(
        selectedSlot.id,
        selectedSlot.id,
        selectedSlot.floor,
        walletBalance
      );

      const newBooking: Booking = {
        id: response.booking_id,
        slotId: response.slot_id,
        slotLabel: selectedSlot.id,
        floor: selectedSlot.floor,
        startTime: response.start_time,
        ratePerMinute: response.rate_per_minute,
        status: response.status,
      };

      setActiveBooking(newBooking);
      setSelectedSlot(null);
      setView("booking");

      toast.success("Booking started!", {
        description: `Slot ${selectedSlot.id} - Charging ${response.rate_per_minute} ADA/min`,
      });
    } catch (error) {
      toast.error("Booking failed", {
        description: "Please try again",
      });
    } finally {
      setIsStartingBooking(false);
    }
  };

  const handleEndBooking = async () => {
    if (!activeBooking) return;

    try {
      const response = await endBooking(
        activeBooking.id,
        activeBooking.startTime,
        walletBalance,
        activeBooking.ratePerMinute
      );

      toast.success("Parking ended", {
        description: `Total: ${response.total_amount_charged} ADA for ${response.total_time_minutes} minutes`,
      });

      setActiveBooking(null);
    } catch (error) {
      toast.error("Failed to end booking", {
        description: "Please try again",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="glass-strong border-b border-border/50 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Logo />

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1">
              <span className="text-sm">Mall Parking – Basement 1</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("booking")}
              className="gap-2"
            >
              <Wallet className="w-4 h-4" />
              <span className="font-semibold text-primary">
                {walletBalance} ADA
              </span>
            </Button>
            <Avatar className="border-2 border-primary/30">
              <AvatarFallback className="bg-primary/10 text-primary">U</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={view === "overview" ? "default" : "outline"}
            onClick={() => setView("overview")}
            className={view === "overview" ? "bg-primary" : ""}
          >
            Parking Overview
          </Button>
          <Button
            variant={view === "booking" ? "default" : "outline"}
            onClick={() => setView("booking")}
            className={view === "booking" ? "bg-primary" : ""}
          >
            My Booking
          </Button>
          <Button
            variant={view === "history" ? "default" : "outline"}
            onClick={() => setView("history")}
            className={view === "history" ? "bg-primary" : ""}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>

        {view === "overview" && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1 space-y-4">
              <SuggestedSlotCard
                slot={nearestSlot}
                onSelect={() => nearestSlot && handleSlotSelect(nearestSlot)}
              />
              <SlotLegend />
            </div>

            {/* Parking Grid */}
            <div className="lg:col-span-3">
              <div className="glass-strong rounded-xl p-6">
                <h2 className="text-2xl font-bold mb-6">Select Your Slot</h2>
                <SlotGrid
                  slots={slots}
                  onSlotSelect={handleSlotSelect}
                  selectedSlotId={selectedSlot?.id}
                />
              </div>
            </div>
          </div>
        )}

        {view === "booking" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <WalletCard
              balance={walletBalance}
              onAddMoney={() => {
                setWalletBalance(walletBalance + 500);
                toast.success("Wallet topped up!", {
                  description: "500 ADA added to your wallet",
                });
              }}
            />
            {activeBooking && (
              <ActiveBookingCard
                booking={activeBooking}
                walletBalance={walletBalance}
                onWalletUpdate={setWalletBalance}
                onEnd={handleEndBooking}
                onAddMoney={() => {
                  setWalletBalance(walletBalance + 500);
                  toast.success("Wallet topped up!", {
                    description: "500 ADA added to your wallet",
                  });
                }}
              />
            )}
          </div>
        )}

        {view === "history" && (
          <div className="max-w-2xl mx-auto">
            <div className="glass-strong rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">Booking History</h2>
              <p className="text-muted-foreground">No past bookings to display</p>
            </div>
          </div>
        )}
      </main>

      {/* Slot Details Panel */}
      {selectedSlot && (
        <SlotDetailsPanel
          slot={selectedSlot}
          onClose={() => setSelectedSlot(null)}
          onConfirm={handleConfirmSlot}
          isLoading={isStartingBooking}
        />
      )}
    </div>
  );
};

export default Dashboard;
