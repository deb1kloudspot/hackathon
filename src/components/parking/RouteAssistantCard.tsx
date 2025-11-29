import { ParkingSlot } from "@/types/parking";
import { Card } from "@/components/ui/card";
import { CarFront, Navigation, Route } from "lucide-react";
import { cn } from "@/lib/utils";

interface RouteAssistantCardProps {
    slot: ParkingSlot | null;
    rows: string[];
}

export const RouteAssistantCard = ({ slot, rows }: RouteAssistantCardProps) => {
    if (!slot) return null;

    const rowIndex = rows.indexOf(slot.row);
    const hasRow = rowIndex !== -1;

    // Each pair of rows (A/B, C/D, ...) = one aisle number
    const aisleNumber = hasRow ? Math.floor(rowIndex / 2) + 1 : null;

    // For mini-map: normalize row position (0 → top, 1 → bottom)
    const rowPos =
        hasRow && rows.length > 1 ? rowIndex / (rows.length - 1) : 0.5;

    return (
        <Card className="glass-strong rounded-xl p-4 space-y-3 border border-primary/30 relative overflow-hidden">
            <div className="absolute -top-8 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

            <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-[0.18em]">
                        Smart Route
                    </span>
                    <Route className="w-4 h-4 text-primary/80" />
                </div>

                {/* Mini floor-map (symbolic but clear) */}
                <div className="flex gap-3 items-center">
                    {/* Left: tiny schematic map */}
                    <div className="relative w-28 h-20 rounded-xl bg-slate-900/80 border border-slate-700 overflow-hidden">
                        {/* Main vertical road */}
                        <div className="absolute inset-y-2 left-1/3 w-[6px] rounded-full bg-slate-800 border border-slate-600/80" />
                        <div className="absolute inset-y-4 left-[calc(33%-1px)] w-[2px] border-l border-dashed border-white/35" />

                        {/* Entry marker */}
                        <div className="absolute top-1 left-[22%] flex flex-col items-center gap-0.5">
                            <span className="text-[8px] text-slate-300">ENTRY</span>
                            <span className="text-[8px]">⬇</span>
                        </div>

                        {/* Aisle highlight */}
                        {aisleNumber && (
                            <div
                                className="absolute left-1/3 w-[6px] rounded-full bg-cyan-400/40 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                                style={{
                                    top: `${10 + rowPos * 60}%`,
                                    height: "18%",
                                    transform: "translateX(-10%)",
                                }}
                            />
                        )}

                        {/* Horizontal spur to slot */}
                        <div
                            className="absolute h-[2px] bg-cyan-300/80 shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                            style={{
                                top: `${16 + rowPos * 60}%`,
                                left: "35%",
                                right: "10%",
                            }}
                        />

                        {/* Car at end of spur */}
                        <div
                            className="absolute flex items-center justify-center w-5 h-5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"
                            style={{
                                top: `${16 + rowPos * 60}%`,
                                right: "6%",
                                transform: "translateY(-50%)",
                            }}
                        >
                            <CarFront className="w-3 h-3 text-slate-900" />
                        </div>

                        {/* Slot label */}
                        <div className="absolute bottom-1 right-1 text-[9px] font-semibold text-slate-200 bg-slate-900/70 px-1.5 py-0.5 rounded-full border border-slate-600/80">
                            {slot.id}
                        </div>
                    </div>

                    {/* Right: textual directions */}
                    <div className="flex-1 space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5">
                            <Navigation className="w-3 h-3 text-primary" />
                            <span className="font-semibold text-[11px] uppercase tracking-wide text-slate-200">
                                Turn-by-turn
                            </span>
                        </div>

                        <ol className="space-y-1 text-[11px] text-slate-300 list-decimal list-inside">
                            <li>Enter via main gate and follow the central lane.</li>
                            {aisleNumber && (
                                <li>
                                    Take <span className="font-semibold">Aisle {aisleNumber}</span>{" "}
                                    (zone{" "}
                                    <span className="font-mono">
                                        {rows[2 * (aisleNumber - 1)]}
                                        {rows[2 * (aisleNumber - 1) + 1]
                                            ? `–${rows[2 * (aisleNumber - 1) + 1]}`
                                            : ""}
                                    </span>
                                    ).
                                </li>
                            )}
                            <li>
                                Continue to <span className="font-semibold">Row {slot.row}</span> and
                                park at <span className="font-semibold">slot {slot.number}</span>.
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </Card>
    );
};
