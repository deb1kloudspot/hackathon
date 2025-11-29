import { useEffect, useState } from "react";
import { Booking } from "@/types/parking";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, AlertCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { chargeWallet } from "@/services/mockBookingApi";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ActiveBookingCardProps {
  booking: Booking;
  walletBalance: number;
  onWalletUpdate: (newBalance: number) => void;
  onEnd: () => void;
  onAddMoney: () => void;
}

const LOW_BALANCE_THRESHOLD = 50; // 50 ADA

export const ActiveBookingCard = ({
  booking,
  walletBalance,
  onWalletUpdate,
  onEnd,
  onAddMoney,
}: ActiveBookingCardProps) => {
  const [timeParked, setTimeParked] = useState(0);
  const [isCharging, setIsCharging] = useState(true);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<
    "active" | "stopped_insufficient_balance"
  >("active");

  // Update time parked counter
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date().getTime();
      const start = booking.startTime.getTime();
      const secondsParked = Math.floor((now - start) / 1000);
      setTimeParked(secondsParked);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [booking.startTime]);

  // Per-minute wallet charging
  useEffect(() => {
    if (!isCharging || bookingStatus !== "active") return;

    const chargeInterval = setInterval(async () => {
      try {
        const response = await chargeWallet(
          booking.id,
          booking.ratePerMinute,
          walletBalance
        );

        onWalletUpdate(response.wallet_balance);

        if (response.booking_status === "stopped_insufficient_balance") {
          setBookingStatus("stopped_insufficient_balance");
          setIsCharging(false);
          clearInterval(chargeInterval);
        }
      } catch (error) {
        console.error("Failed to charge wallet:", error);
      }
    }, 60000); // Charge every 60 seconds

    return () => clearInterval(chargeInterval);
  }, [
    booking.id,
    booking.ratePerMinute,
    walletBalance,
    isCharging,
    bookingStatus,
    onWalletUpdate,
  ]);

  // Check for low balance
  useEffect(() => {
    setShowLowBalanceAlert(
      walletBalance < LOW_BALANCE_THRESHOLD && bookingStatus === "active"
    );
  }, [walletBalance, bookingStatus]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  // Each full minute * ratePerMinute (already in ADA)
  const estimatedCost =
    Math.floor(timeParked / 60) * booking.ratePerMinute;

  return (
    <div
      className={cn(
        "glass-strong rounded-xl p-6 space-y-4 border-2 relative overflow-hidden",
        bookingStatus === "stopped_insufficient_balance"
          ? "border-destructive/50"
          : showLowBalanceAlert
            ? "border-yellow-500/50"
            : "border-primary/20"
      )}
    >
      {showLowBalanceAlert && bookingStatus === "active" && (
        <div className="absolute inset-0 bg-yellow-500/5 animate-pulse" />
      )}

      <div className="relative space-y-4">
        {/* Low Balance Alert */}
        {showLowBalanceAlert && bookingStatus === "active" && (
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500">
              Your wallet balance is low. Please recharge to continue parking.
            </AlertDescription>
          </Alert>
        )}

        {/* Insufficient Balance Alert */}
        {bookingStatus === "stopped_insufficient_balance" && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Your booking was stopped due to insufficient wallet balance.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {bookingStatus === "active" ? "Active Booking" : "Booking Stopped"}
          </h3>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-sm font-semibold",
              bookingStatus === "active"
                ? "bg-accent/20 text-accent"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {bookingStatus === "active" ? "Active" : "Stopped"}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                {booking.slotLabel}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {booking.floor}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Started at {booking.startTime.toLocaleTimeString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Time Parked</p>
              <p className="text-lg font-bold text-primary">
                {formatTime(timeParked)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rate</p>
              <p className="text-lg font-bold text-accent">
                {booking.ratePerMinute} ADA/min
              </p>
            </div>
          </div>

          <div className="p-3 glass rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Wallet Balance</span>
              </div>
              <span
                className={cn(
                  "text-lg font-bold",
                  walletBalance < LOW_BALANCE_THRESHOLD
                    ? "text-yellow-500"
                    : "text-primary"
                )}
              >
                {walletBalance} ADA
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Cost</span>
              <span className="font-semibold">
                {estimatedCost} ADA
              </span>
            </div>
          </div>
        </div>

        {bookingStatus === "active" ? (
          <div className="flex gap-3">
            <Button
              onClick={onAddMoney}
              variant="outline"
              className="flex-1 border-primary/30 hover:bg-primary/10"
            >
              Add Money
            </Button>
            <Button
              onClick={onEnd}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              End Parking
            </Button>
          </div>
        ) : (
          <Button
            onClick={onAddMoney}
            className="w-full bg-primary hover:bg-primary/90"
          >
            Recharge Wallet &amp; Book Again
          </Button>
        )}
      </div>
    </div>
  );
};
