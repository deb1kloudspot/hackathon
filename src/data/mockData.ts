import { ParkingSlot, Booking, WalletTransaction } from "@/types/parking";

// Generate mock parking slots
export const generateMockSlots = (): ParkingSlot[] => {
  const rows = ["A", "B", "C", "D", "E"];
  const slots: ParkingSlot[] = [];
  
  rows.forEach((row, rowIndex) => {
    for (let i = 1; i <= 12; i++) {
      const occupied = Math.random() > 0.6; // 40% occupied
      slots.push({
        id: `${row}${i}`,
        row,
        number: i,
        status: occupied ? "occupied" : "available",
        price: 50,
        distanceFromEntrance: rowIndex * 20 + i * 5,
        floor: "Basement 1",
      });
    }
  });
  
  return slots;
};

export const mockBookings: Booking[] = [
  {
    id: "BK001",
    slotId: "A5",
    slotLabel: "A5",
    floor: "Basement 1",
    startTime: new Date(Date.now() - 30 * 60000),
    ratePerMinute: 2,
    status: "active",
  },
];

export const mockTransactions: WalletTransaction[] = [
  {
    id: "TXN001",
    date: new Date(Date.now() - 2 * 24 * 60 * 60000),
    amount: -100,
    type: "debit",
    description: "Parking - Slot A5 (2 hours)",
    status: "completed",
  },
  {
    id: "TXN002",
    date: new Date(Date.now() - 5 * 24 * 60 * 60000),
    amount: 500,
    type: "credit",
    description: "Wallet Top-up",
    status: "completed",
  },
];
