import { useEffect, useState, useMemo } from "react";
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

const LOW_BALANCE_THRESHOLD = 50; // in ADA

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
  const [bookingStatus, setBookingStatus] =
    useState<"active" | "stopped_insufficient_balance">("active");

  // ─────────────────────────────────────────────
  // 1) Live time counter (seconds since start)
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // 2) Per-minute wallet charging in ADA
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (!isCharging || bookingStatus !== "active") return;

    const chargeInterval = setInterval(async () => {
      try {
        const response = await chargeWallet(
          booking.id,
          booking.ratePerMinute, // ADA per minute
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
    }, 60000); // every 60 seconds

    return () => clearInterval(chargeInterval);
  }, [
    booking.id,
    booking.ratePerMinute,
    walletBalance,
    isCharging,
    bookingStatus,
    onWalletUpdate,
  ]);

  // ─────────────────────────────────────────────
  // 3) Low balance indicator
  // ─────────────────────────────────────────────
  useEffect(() => {
    setShowLowBalanceAlert(
      walletBalance < LOW_BALANCE_THRESHOLD &&
      bookingStatus === "active"
    );
  }, [walletBalance, bookingStatus]);

  // ─────────────────────────────────────────────
  // 4) Derived values for UI
  // ─────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const minutesParked = Math.floor(timeParked / 60);
  const chargedSoFar = minutesParked * booking.ratePerMinute; // ADA
  const estimatedRemainingMinutes = useMemo(() => {
    if (booking.ratePerMinute <= 0) return Infinity;
    return Math.floor(walletBalance / booking.ratePerMinute);
  }, [walletBalance, booking.ratePerMinute]);

  // Circular timer visual (not hard limit, just 0–60 min loop visual)
  const MAX_VISUAL_SECONDS = 60 * 60; // 1 hour = full circle (for display)
  const progress =
    MAX_VISUAL_SECONDS === 0
      ? 0
      : Math.min(timeParked / MAX_VISUAL_SECONDS, 1);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div
      className={cn(
        "glass-strong rounded-xl p-6 space-y-4 border-2 relative overflow-hidden",
        bookingStatus === "stopped_insufficient_balance"
          ? "border-destructive/60"
          : showLowBalanceAlert
            ? "border-yellow-500/70"
            : "border-primary/30"
      )}
    >
      {/* subtle background glow for low balance */}
      {showLowBalanceAlert && bookingStatus === "active" && (
        <div className="absolute inset-0 bg-yellow-500/5 pointer-events-none" />
      )}

      <div className="relative space-y-4">
        {/* Alerts */}
        {showLowBalanceAlert && bookingStatus === "active" && (
          <Alert className="border-yellow-500/60 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-500 text-xs">
              Wallet balance is low. At {booking.ratePerMinute} ADA/min, you have
              roughly {estimatedRemainingMinutes} minutes left.
            </AlertDescription>
          </Alert>
        )}

        {bookingStatus === "stopped_insufficient_balance" && (
          <Alert className="border-destructive/60 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive text-xs">
              Booking was stopped due to insufficient ADA in your wallet.
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">
            {bookingStatus === "active" ? "Active Booking" : "Booking Stopped"}
          </h3>
          <div
            className={cn(
              "px-3 py-1 rounded-full text-xs font-semibold",
              bookingStatus === "active"
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/40"
                : "bg-destructive/15 text-destructive border border-destructive/40"
            )}
          >
            {bookingStatus === "active" ? "LIVE · ADA" : "INSUFFICIENT BALANCE"}
          </div>
        </div>

        {/* Slot & time info row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {booking.slotLabel}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {booking.floor}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Started at {booking.startTime.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Circular timer block */}
          <div className="flex items-center justify-center">
            <div className="relative w-24 h-24">
              <svg
                className="w-24 h-24 -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* background circle */}
                <circle
                  className="text-slate-700/80"
                  strokeWidth="6"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="50"
                  cy="50"
                />
                {/* progress circle */}
                <circle
                  className={cn(
                    "transition-all duration-500 ease-out",
                    bookingStatus === "active"
                      ? "text-primary"
                      : "text-destructive"
                  )}
                  strokeWidth="6"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="50"
                  cy="50"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] text-muted-foreground">
                  Time parked
                </span>
                <span className="text-xs font-semibold">
                  {formatTime(timeParked)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Billing & wallet panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <div className="p-3 glass rounded-lg space-y-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Rate
            </p>
            <p className="text-lg font-bold text-accent">
              {booking.ratePerMinute} ADA/min
            </p>
            <p className="text-[11px] text-muted-foreground">
              Per-minute pay-as-you-park.
            </p>
          </div>

          <div className="p-3 glass rounded-lg space-y-1">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
              Charged so far
            </p>
            <p className="text-lg font-bold text-primary">
              {chargedSoFar} ADA
            </p>
            <p className="text-[11px] text-muted-foreground">
              Based on {minutesParked} full minute
              {minutesParked === 1 ? "" : "s"} elapsed.
            </p>
          </div>

          <div className="p-3 glass rounded-lg space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Wallet className="w-4 h-4 text-primary" />
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Wallet balance
                </p>
              </div>
            </div>
            <p
              className={cn(
                "text-lg font-bold",
                walletBalance < LOW_BALANCE_THRESHOLD
                  ? "text-yellow-400"
                  : "text-primary"
              )}
            >
              {walletBalance} ADA
            </p>
            <p className="text-[11px] text-muted-foreground">
              ~{estimatedRemainingMinutes} minutes left at current rate.
            </p>
          </div>
        </div>

        {/* Actions */}
        {bookingStatus === "active" ? (
          <div className="flex flex-col sm:flex-row gap-3 mt-3">
            <Button
              onClick={onAddMoney}
              variant="outline"
              className="flex-1 border-primary/40 hover:bg-primary/10"
            >
              Add ADA to Wallet
            </Button>
            <Button
              onClick={onEnd}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              End Parking
            </Button>
          </div>
        ) : (
          <div className="mt-3">
            <Button
              onClick={onAddMoney}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Recharge Wallet & Book Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
