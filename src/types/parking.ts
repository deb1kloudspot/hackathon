export type SlotStatus = "available" | "occupied" | "selected" | "suggested";

export interface ParkingSlot {
  id: string;
  row: string;
  number: number;
  status: SlotStatus;
  price: number;
  distanceFromEntrance: number;
  floor: string;
}

export interface Booking {
  id: string;
  slotId: string;
  slotLabel: string;
  floor: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  ratePerMinute: number;
  totalAmount?: number;
  status: "active" | "completed" | "stopped_insufficient_balance";
}

export interface WalletTransaction {
  id: string;
  date: Date;
  amount: number;
  type: "debit" | "credit";
  description: string;
  status: "completed" | "pending";
}
