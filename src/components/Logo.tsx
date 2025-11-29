import { ParkingSquare } from "lucide-react";

export const Logo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full" />
        <div className="relative bg-primary/10 p-2 rounded-xl border border-primary/30">
          <ParkingSquare className="w-6 h-6 text-primary" />
        </div>
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
        SmartPark
      </span>
    </div>
  );
};
