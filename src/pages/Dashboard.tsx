import { useState, useEffect, useMemo } from "react";
import { Link, Outlet } from "react-router-dom"; // For routing purposes
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SlotGrid } from "@/components/parking/SlotGrid";
import { SlotLegend } from "@/components/parking/SlotLegend";
import { SuggestedSlotCard } from "@/components/parking/SuggestedSlotCard";
import { SlotDetailsPanel } from "@/components/parking/SlotDetailsPanel";
import { WalletCard } from "@/components/wallet/WalletCard";
import { ActiveBookingCard } from "@/components/booking/ActiveBookingCard";
import { ParkingSlot, Booking } from "@/types/parking";
import { generateMockSlots } from "@/data/mockData";
import { startBooking, endBooking } from "@/services/mockBookingApi";
import { toast } from "sonner";
import { ChevronDown, History, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteAssistantCard } from "@/components/parking/RouteAssistantCard";
import DisputeManagementPage from "@/pages/dispute-management/DisputeManagementPage"; // Ensure this path is correct

const LOW_BALANCE_THRESHOLD = 50; // in ADA

type StatusTone = "idle" | "booking" | "low_balance";

const Dashboard = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [nearestSlot, setNearestSlot] = useState<ParkingSlot | null>(null);
  const [walletBalance, setWalletBalance] = useState(350); // ADA
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [view, setView] = useState<"overview" | "booking" | "history" | "dispute">("overview");
  const [isStartingBooking, setIsStartingBooking] = useState(false);

  // 🔹 1. Generate mock parking layout + nearest slot
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

  // 🔹 2. Derived layout info for route assistant (rows, aisles)
  const rows = useMemo(
    () => Array.from(new Set(slots.map((s) => s.row))).sort(),
    [slots]
  );

  // Slot to explain route for: selected → active booking → nearest
  const routeSlot: ParkingSlot | null = useMemo(() => {
    if (selectedSlot) return selectedSlot;

    if (activeBooking) {
      const match = slots.find((s) => s.id === activeBooking.slotId);
      if (match) return match;
    }

    return nearestSlot ?? null;
  }, [selectedSlot, activeBooking, slots, nearestSlot]);

  // 🔹 3. User selects a slot on the grid
  const handleSlotSelect = (slot: ParkingSlot) => {
    const updatedSlots = slots.map((s) => ({
      ...s,
      status:
        s.id === slot.id
          ? ("selected" as ParkingSlot["status"])
          : s.status === "selected"
            ? ("available" as ParkingSlot["status"])
            : s.status,
    }));
    setSlots(updatedSlots);
    setSelectedSlot(slot);
  };

  // 🔹 4. Start booking (pay-per-minute ADA)
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

      toast.success("Booking started!", {
        description: `Slot ${selectedSlot.id} — Charging ${response.rate_per_minute} ADA/min`,
      });
    } catch (error) {
      toast.error("Booking failed", {
        description: "Please try again",
      });
    } finally {
      setIsStartingBooking(false);
    }
  };

  // 🔹 5. End booking
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

  // 🔹 6. Global status strip copy + tone (top of main content)
  const status = (() => {
    if (!activeBooking) {
      if (nearestSlot) {
        return {
          tone: "idle" as StatusTone,
          title: `Nearest empty slot: ${nearestSlot.id}`,
          subtitle: `${nearestSlot.distanceFromEntrance}m from entrance · Tap the highlighted slot to start a 2 ADA/min session.`,
        };
      }

      return {
        tone: "idle" as StatusTone,
        title: "No active parking",
        subtitle: "Pick any green slot on the map to start a new ADA parking session.",
      };
    }

    const remainingMinutes = Math.floor(
      walletBalance / activeBooking.ratePerMinute
    );
    const isLow = walletBalance < LOW_BALANCE_THRESHOLD;

    return {
      tone: (isLow ? "low_balance" : "booking") as StatusTone,
      title: `You’re parked at ${activeBooking.slotLabel} (${activeBooking.floor})`,
      subtitle: `Wallet: ${walletBalance} ADA · Rate: ${activeBooking.ratePerMinute} ADA/min · Est. ~${remainingMinutes} minutes remaining.`,
    };
  })();

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
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
              <AvatarFallback className="bg-primary/10 text-primary">
                U
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 bg-black rounded-xl text-white">
        {/* View Tabs */}
        <div className="flex gap-2 mb-4">
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
          <Button
            variant={view === "dispute" ? "default" : "outline"}
            onClick={() => setView("dispute")}
            className={view === "dispute" ? "bg-primary" : ""}
          >
            Dispute Management
          </Button>
        </div>

        {/* Global Status Strip */}
        <div
          className={cn(
            "mb-6 rounded-xl px-4 py-3 glass-strong flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border",
            status.tone === "idle" && "border-primary/30",
            status.tone === "booking" &&
            "border-emerald-400/60 bg-emerald-500/5",
            status.tone === "low_balance" &&
            "border-yellow-400/70 bg-yellow-500/5"
          )}
        >
          <div>
            <p className="text-sm font-semibold">
              {status.title}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {status.subtitle}
            </p>
          </div>
          {activeBooking && (
            <div className="text-xs sm:text-sm font-medium text-primary/90">
              Live mode · Pay-per-minute in ADA
            </div>
          )}
        </div>

        {/* Overview View */}
        {view === "overview" && (
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Panel */}
            <div className="lg:col-span-1 space-y-4">
              <SuggestedSlotCard
                slot={nearestSlot}
                onSelect={() => nearestSlot && handleSlotSelect(nearestSlot)}
              />

              {/* Smart Route Assistant (mini-map + directions) */}
              <RouteAssistantCard slot={routeSlot} rows={rows} />

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

        {/* Booking View */}
        {view === "booking" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <WalletCard
              balance={walletBalance}
              onAddMoney={() => {
                const newBalance = walletBalance + 500;
                setWalletBalance(newBalance);
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
                  const newBalance = walletBalance + 500;
                  setWalletBalance(newBalance);
                  toast.success("Wallet topped up!", {
                    description: "500 ADA added to your wallet",
                  });
                }}
              />
            )}
          </div>
        )}

        {/* Dispute Management View */}
        {view === "dispute" && (
          <div className="max-w-2xl mx-auto">
            <DisputeManagementPage />
          </div>
        )}
      </main>

      {/* Slot Details Panel (side sheet) */}
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
