export const SlotLegend = () => {
  return (
    <div className="flex flex-wrap gap-4 p-4 glass rounded-xl">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-slot-available/20 border-2 border-slot-available" />
        <span className="text-sm text-foreground">Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-slot-occupied/20 border-2 border-slot-occupied" />
        <span className="text-sm text-foreground">Occupied</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-slot-selected/20 border-2 border-slot-selected" />
        <span className="text-sm text-foreground">Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-slot-suggested/20 border-2 border-slot-suggested animate-pulse" />
        <span className="text-sm text-foreground">Suggested</span>
      </div>
    </div>
  );
};
