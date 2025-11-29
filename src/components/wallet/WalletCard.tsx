import { Booking } from "@/types/parking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface WalletCardProps {
  balance: number;              // in ADA
  onAddMoney: () => void;
  activeBooking?: Booking | null;
}

const LOW_BALANCE_THRESHOLD = 50;       // ADA
const LOCK_WINDOW_MINUTES = 30;         // how much future time we "lock" visually

export const WalletCard = ({
  balance,
  onAddMoney,
  activeBooking,
}: WalletCardProps) => {
  const hasBooking = !!activeBooking;
  const ratePerMinute = hasBooking ? activeBooking!.ratePerMinute : 2; // fallback for mock
  const estimatedMinutesRemaining = hasBooking
    ? Math.max(0, Math.floor(balance / ratePerMinute))
    : 0;

  // “Locked” ADA: rough budget for the next LOCK_WINDOW_MINUTES for this session
  const lockedAda = hasBooking
    ? Math.min(balance, ratePerMinute * LOCK_WINDOW_MINUTES)
    : 0;

  const availableAda = Math.max(0, balance - lockedAda);

  const isEmpty = balance <= 0;
  const isLow = !isEmpty && balance < LOW_BALANCE_THRESHOLD;

  // For the little usage bar at the bottom
  const utilization =
    hasBooking && balance > 0 ? Math.min(1, lockedAda / balance) : 0;

  return (
    <Card
      className={cn(
        "relative overflow-hidden rounded-2xl border p-5",
        "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950",
        "shadow-[0_0_40px_rgba(30,64,175,0.55)]",

        isEmpty
          ? "border-red-500/70"
          : isLow
            ? "border-amber-400/70"
            : "border-primary/30"
      )}
    >
      {/* Glow orbs */}
      <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-0 h-40 w-40 rounded-full bg-violet-500/15 blur-3xl" />

      {/* Header row */}
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-sky-300/80">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Orion Mall by parkngo powerd by Cardano · ADA Wallet
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-50">
            Cardano Parking Balance
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Pay-per-minute for live parking sessions in ADA.
          </p>
        </div>

        {/* “Chip” / card badge */}
        <div className="flex flex-col items-end gap-1">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-900/80 px-3 py-2 border border-slate-700/80">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-300 text-slate-900 shadow-md">
              <Wallet className="h-4 w-4" />
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">Network</p>
              <p className="text-xs font-semibold text-slate-100">
                Cardano · Testnet
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Balance + Top-up */}
      <div className="relative mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-slate-400">Current balance</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-bold text-primary">{balance}</span>
            <span className="text-sm font-medium text-slate-300">ADA</span>
          </div>
          {hasBooking && (
            <p className="mt-1 text-[11px] text-slate-400">
              Rate: <span className="font-semibold text-slate-200">{ratePerMinute} ADA/min</span>{" "}
              · Est.{" "}
              <span className="font-semibold text-slate-200">
                {estimatedMinutesRemaining} min
              </span>{" "}
              remaining
            </p>
          )}
        </div>

        <Button
          onClick={onAddMoney}
          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-[0_0_18px_rgba(56,189,248,0.7)]"
        >
          + Top up 500 ADA
        </Button>
      </div>

      {/* 3-column info: locked / available / status */}
      <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-700/80 pt-4 sm:grid-cols-3">
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Locked for parking
          </p>
          <p className="text-lg font-semibold text-slate-50">
            {hasBooking ? lockedAda : 0} <span className="text-xs text-slate-300">ADA</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Approx. budget for the next {LOCK_WINDOW_MINUTES} min of this session.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Free / available
          </p>
          <p className="text-lg font-semibold text-emerald-400">
            {availableAda > 0 ? availableAda : 0}{" "}
            <span className="text-xs text-emerald-200">ADA</span>
          </p>
          <p className="text-[11px] text-slate-400">
            Still usable for future sessions or top-ups.
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">
            Status
          </p>
          <div className="flex items-center gap-2 text-sm">
            {isEmpty ? (
              <>
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 font-medium">Balance empty</span>
              </>
            ) : isLow ? (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <span className="text-amber-300 font-medium">
                  Low balance · recharge soon
                </span>
              </>
            ) : hasBooking ? (
              <>
                <Activity className="h-4 w-4 text-emerald-400" />
                <span className="text-emerald-300 font-medium">Live session running</span>
              </>
            ) : (
              <>
                <Activity className="h-4 w-4 text-sky-400" />
                <span className="text-sky-300 font-medium">Ready for next parking</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-slate-500">
            Auto-stop triggers when wallet can’t cover the next minute.
          </p>
        </div>
      </div>

      {/* usage bar */}
      <div className="mt-4 space-y-1">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-cyan-300 transition-all duration-500"
            style={{ width: `${utilization * 100}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
          {hasBooking
            ? "Visualizing ADA earmarked for the current session window."
            : "Start a parking session to see live ADA usage here."}
        </p>
      </div>
    </Card>
  );
};
