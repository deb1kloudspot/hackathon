import { ParkingSlot } from "@/types/parking";
import { cn } from "@/lib/utils";

interface SlotGridProps {
  slots: ParkingSlot[];
  onSlotSelect: (slot: ParkingSlot) => void;
  selectedSlotId?: string;
}

export const SlotGrid = ({ slots, onSlotSelect, selectedSlotId }: SlotGridProps) => {
  const rows = Array.from(new Set(slots.map((s) => s.row))).sort();

  // 🔹 FIXED: every row has exactly 8 parking positions
  const NUM_SLOTS_PER_ROW = 8;
  const allPositions = Array.from({ length: NUM_SLOTS_PER_ROW }, (_, i) => i + 1);

  // Group rows as [A,B], [C,D], ...
  const rowPairs: [string, string | null][] = [];
  for (let i = 0; i < rows.length; i += 2) {
    rowPairs.push([rows[i], rows[i + 1] ?? null]);
  }

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);
  const hasSelection = Boolean(selectedSlot);

  return (
    <div className="relative space-y-4 rounded-2xl bg-slate-950 border border-slate-800 p-4 shadow-[0_0_40px_rgba(15,23,42,0.8)]">
      {/* HEADER: ENTRY / EXIT */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-400/40 px-2 py-0.5">
            <span className="text-[10px]">⬅</span>
            ENTRY
          </span>
          <span className="hidden sm:inline text-xs opacity-70">Main gate</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline text-xs opacity-70">Exit to street</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-400/40 px-2 py-0.5">
            EXIT
            <span className="text-[10px]">⬆</span>
          </span>
        </div>
      </div>

      {/* MAIN HORIZONTAL ROAD (ENTRY → EXIT) */}
      <div className="mb-4">
        <div className="relative h-10 w-full rounded-2xl bg-slate-900 border border-slate-700 shadow-[0_0_30px_rgba(15,23,42,0.9)] flex items-center px-6">
          <div className="relative flex-1 h-[2px] border-t-2 border-dashed border-yellow-300">
            <span className="absolute -left-1.5 -top-3 text-[9px] text-slate-200">
              ENTRY
            </span>
            <span className="absolute -right-3 -top-3 text-[9px] text-slate-200">
              EXIT
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-6 text-[11px] text-slate-100/90 pointer-events-none">
            <span>⬅</span>
            <span>⬆</span>
          </div>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="relative mt-2 space-y-6">
        {/* VERTICAL AISLE (spine road from main road downwards) */}
        <div className="pointer-events-none absolute left-16 top-0 bottom-0">
          <div className="relative h-full w-10 rounded-2xl bg-slate-900 border border-slate-700 shadow-[0_0_24px_rgba(15,23,42,0.9)]">
            {hasSelection && (
              <div className="absolute inset-x-[25%] top-3 bottom-3 rounded-full bg-gradient-to-b from-cyan-400/80 via-cyan-300/40 to-transparent shadow-[0_0_26px_rgba(34,211,238,0.9)]" />
            )}
            <div className="absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-white/40" />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center justify-center pr-[2px]">
              <span className="rotate-90 text-[9px] tracking-[0.22em] text-slate-200/85">
                AISLE
              </span>
            </div>
          </div>
        </div>

        {rowPairs.map(([rowTop, rowBottom]) => {
          const topSlots = slots.filter((s) => s.row === rowTop);
          const bottomSlots = rowBottom
            ? slots.filter((s) => s.row === rowBottom)
            : [];

          const topHasSelected = topSlots.some((s) => s.id === selectedSlotId);
          const bottomHasSelected = bottomSlots.some((s) => s.id === selectedSlotId);
          const laneHasSelected = topHasSelected || bottomHasSelected;

          return (
            <div key={rowTop} className="relative flex flex-col gap-1 pl-2">
              {/* FRONT ROW (one side of lane) */}
              <RowWithSlots
                row={rowTop}
                slots={topSlots}
                allPositions={allPositions}
                selectedSlotId={selectedSlotId}
                onSlotSelect={onSlotSelect}
              />

              {/* HORIZONTAL LANE BETWEEN FRONT & BACK ROW */}
              <div
                className={cn(
                  "pointer-events-none ml-[3.8rem] mr-4 h-8 rounded-full bg-slate-900 border border-slate-700 shadow-[0_0_18px_rgba(15,23,42,0.9)] flex items-center",
                  laneHasSelected &&
                  "ring-1 ring-cyan-400/80 shadow-[0_0_24px_rgba(34,211,238,0.95)]"
                )}
              >
                <div className="relative flex-1 h-[1px] border-t border-dashed border-white/40">
                  <span className="absolute left-1 -top-2 text-[10px] text-white/80">
                    ⇢
                  </span>
                </div>
              </div>

              {/* BACK ROW (other side of lane) */}
              {rowBottom && (
                <RowWithSlots
                  row={rowBottom}
                  slots={bottomSlots}
                  allPositions={allPositions}
                  selectedSlotId={selectedSlotId}
                  onSlotSelect={onSlotSelect}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ---------- ROW + VERTICAL LANES ---------- */

interface RowProps {
  row: string;
  slots: ParkingSlot[];
  allPositions: number[];
  onSlotSelect: (slot: ParkingSlot) => void;
  selectedSlotId?: string;
}

/** Small vertical lane between groups of 4 slots */
const VerticalLane = () => (
  <div className="w-4 h-9 sm:h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center shadow-[0_0_10px_rgba(0,0,0,0.7)]">
    <div className="h-[70%] w-[1px] border-l border-dashed border-white/40" />
  </div>
);

/** One parking row: label + groups of 4 slots separated by vertical lanes */
const RowWithSlots = ({
  row,
  slots,
  allPositions,
  onSlotSelect,
  selectedSlotId,
}: RowProps) => {
  const slotsByNumber = new Map(
    slots.map((s) => [Number(s.number), s] as [number, ParkingSlot])
  );

  const cells: any[] = [];

  allPositions.forEach((pos, idx) => {
    const slot = slotsByNumber.get(pos);

    // REAL SLOT OR PLACEHOLDER (keeps structure always 8 wide)
    if (!slot) {
      cells.push(
        <div
          key={`ghost-${row}-${pos}`}
          className="w-16 h-9 sm:w-20 sm:h-10 rounded-[4px] border border-white/15 bg-slate-900/70 opacity-40 pointer-events-none"
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-[12%] border border-white/20 rounded-[3px]" />
            <div className="absolute inset-y-[24%] left-1/2 w-[1px] -translate-x-1/2 bg-white/20" />
          </div>
        </div>
      );
    } else {
      cells.push(
        <button
          key={slot.id}
          onClick={() => slot.status !== "occupied" && onSlotSelect(slot)}
          disabled={slot.status === "occupied"}
          className={cn(
            "relative group rounded-[4px] transition-all duration-200",
            "flex items-center justify-center",
            "w-16 h-9 sm:w-20 sm:h-10",
            "shadow-[0_0_12px_rgba(0,0,0,0.8)] border overflow-hidden",

            slot.status === "available" &&
            "bg-slate-900/90 border-white/60 hover:bg-slate-900 hover:border-emerald-400 hover:shadow-[0_0_18px_rgba(34,197,94,0.6)] cursor-pointer",

            slot.status === "occupied" &&
            "bg-slate-900/90 border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.7)] cursor-not-allowed opacity-95",

            slot.status === "selected" &&
            "bg-slate-900/90 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.9)] scale-[1.03]",

            slot.status === "suggested" &&
            "bg-slate-900/90 border-violet-400 shadow-[0_0_22px_rgba(168,85,247,0.9)] animate-pulse-glow",

            slot.id === selectedSlotId &&
            "ring-2 ring-glow-cyan/80 ring-offset-2 ring-offset-slate-950"
          )}
        >
          {/* EMPTY BAY – painted like real parking lines */}
          {slot.status === "available" && (
            <div className="relative flex h-[80%] w-[90%] items-center justify-center">
              {/* outer painted rectangle */}
              <div className="absolute inset-0 border border-white/80 rounded-[3px]" />
              {/* center divider line */}
              <div className="absolute inset-y-[20%] left-1/2 w-[1px] -translate-x-1/2 bg-white/80" />
              {/* short nose lines */}
              <div className="absolute top-0 left-[12%] w-[22%] h-[2px] bg-white/80" />
              <div className="absolute bottom-0 right-[12%] w-[22%] h-[2px] bg-white/80" />
              <span className="relative text-[9px] font-semibold text-white/85">
                {slot.number}
              </span>
            </div>
          )}

          {/* CAR – top view when not available */}
          {/* CAR – more realistic top view when not available */}
          {slot.status !== "available" && (
            <div className="relative h-[82%] w-[90%] mx-auto">
              {/* bay lines behind car */}
              <div className="absolute inset-0 border border-white/35 rounded-[3px]" />
              <div className="absolute inset-y-[20%] left-1/2 w-[1px] -translate-x-1/2 bg-white/30" />

              {/* shadow under car */}
              <div className="absolute inset-[14%] rounded-[10px] bg-black/40 blur-[2px]" />

              {/* car body */}
              <div className="absolute inset-[12%] rounded-[9px] bg-gradient-to-b from-slate-100 via-slate-200 to-slate-400 border border-slate-500 shadow-[0_0_10px_rgba(0,0,0,0.9)]" />

              {/* hood (front) */}
              <div className="absolute inset-x-[20%] top-[8%] h-[16%] rounded-b-[12px] bg-slate-300/95 border-b border-slate-500" />

              {/* trunk (rear) */}
              <div className="absolute inset-x-[20%] bottom-[8%] h-[16%] rounded-t-[12px] bg-slate-300/95 border-t border-slate-500" />

              {/* roof / cabin glass */}
              <div className="absolute inset-x-[24%] inset-y-[26%] rounded-[8px] bg-gradient-to-b from-sky-200 to-sky-400 border border-sky-300/90" />

              {/* side windows */}
              <div className="absolute top-[30%] bottom-[34%] left-[18%] w-[10%] rounded-[6px] bg-sky-300/85" />
              <div className="absolute top-[30%] bottom-[34%] right-[18%] w-[10%] rounded-[6px] bg-sky-300/85" />

              {/* bumpers */}
              <div className="absolute top-[4%] left-[28%] right-[28%] h-[4%] rounded-full bg-slate-700/90" />
              <div className="absolute bottom-[4%] left-[28%] right-[28%] h-[4%] rounded-full bg-slate-700/90" />

              {/* headlights */}
              <div className="absolute top-[6%] left-[22%] h-[5%] w-[10%] rounded-[4px] bg-amber-200/90" />
              <div className="absolute top-[6%] right-[22%] h-[5%] w-[10%] rounded-[4px] bg-amber-200/90" />

              {/* tail lights */}
              <div className="absolute bottom-[6%] left-[22%] h-[5%] w-[10%] rounded-[4px] bg-rose-500/90" />
              <div className="absolute bottom-[6%] right-[22%] h-[5%] w-[10%] rounded-[4px] bg-rose-500/90" />

              {/* wheels */}
              <div className="absolute -left-[8%] top-[20%] h-[22%] w-[16%] rounded-full bg-black/90" />
              <div className="absolute -left-[8%] bottom-[20%] h-[22%] w-[16%] rounded-full bg-black/90" />
              <div className="absolute -right-[8%] top-[20%] h-[22%] w-[16%] rounded-full bg-black/90" />
              <div className="absolute -right-[8%] bottom-[20%] h-[22%] w-[16%] rounded-full bg-black/90" />

              {/* slot label on roof */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="px-1.5 py-0.5 rounded-[6px] bg-slate-900/80 text-[9px] font-semibold text-slate-50 shadow-[0_0_6px_rgba(0,0,0,0.7)]">
                  {slot.number}
                </span>
              </div>
            </div>
          )}


          {slot.status === "suggested" && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-glow-purple rounded-full animate-ping" />
          )}
        </button>
      );
    }

    // 🔹 VERTICAL LANE AFTER EVERY 4 SLOTS (except at the far right edge)
    const isEndOfGroup =
      (idx + 1) % 4 === 0 && idx + 1 !== allPositions.length;
    if (isEndOfGroup) {
      cells.push(<VerticalLane key={`lane-${row}-${idx}`} />);
    }
  });

  return (
    <div className="relative flex items-center gap-3">
      {/* Row label (A,B,C,...) */}
      <div className="relative z-10 flex h-full w-8 flex-col items-center justify-center">
        <span className="text-[11px] font-semibold tracking-wide text-slate-200/90">
          {row}
        </span>
        <span className="mt-0.5 h-5 w-[1px] rounded-full bg-slate-600/60" />
      </div>

      {/* Row content: 4 slots + vertical lane + 4 slots */}
      <div className="relative z-10 ml-6 flex flex-wrap gap-2">{cells}</div>
    </div>
  );
};
