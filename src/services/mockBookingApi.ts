// Mock API service for booking operations
// Simulates backend endpoints for starting bookings, charging wallet, and ending bookings

export interface StartBookingResponse {
  booking_id: string;
  slot_id: string;
  start_time: Date;
  rate_per_minute: number;        // in ADA per minute
  current_wallet_balance: number; // in ADA
  status: "active";
}

export interface ChargeWalletResponse {
  wallet_balance: number;         // in ADA
  booking_status: "active" | "ended" | "stopped_insufficient_balance";
}

export interface EndBookingResponse {
  booking_id: string;
  total_time_minutes: number;
  total_amount_charged: number;   // in ADA
  final_wallet_balance: number;   // in ADA
  status: "completed" | "stopped_insufficient_balance";
}

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock POST /api/bookings/start
export const startBooking = async (
  slotId: string,
  slotLabel: string,
  floor: string,
  currentBalance: number
): Promise<StartBookingResponse> => {
  await delay(500); // Simulate network delay

  return {
    booking_id: `BK${Date.now()}`,
    slot_id: slotId,
    start_time: new Date(),
    rate_per_minute: 2, // 2 ADA per minute (fixed)
    current_wallet_balance: currentBalance,
    status: "active",
  };
};

// Mock POST /api/wallet/charge
export const chargeWallet = async (
  bookingId: string,
  amount: number,       // ADA per minute
  currentBalance: number
): Promise<ChargeWalletResponse> => {
  await delay(300); // Simulate network delay

  const newBalance = currentBalance - amount;

  if (newBalance < 0) {
    return {
      wallet_balance: currentBalance, // Don't deduct if insufficient
      booking_status: "stopped_insufficient_balance",
    };
  }

  return {
    wallet_balance: newBalance,
    booking_status: "active",
  };
};

// Mock POST /api/bookings/end
export const endBooking = async (
  bookingId: string,
  startTime: Date,
  currentBalance: number,
  ratePerMinute: number
): Promise<EndBookingResponse> => {
  await delay(500); // Simulate network delay

  const now = new Date();
  const totalMinutes = Math.floor(
    (now.getTime() - startTime.getTime()) / 60000
  );
  const totalCharged = totalMinutes * ratePerMinute;

  return {
    booking_id: bookingId,
    total_time_minutes: totalMinutes,
    total_amount_charged: totalCharged,
    final_wallet_balance: currentBalance,
    status: "completed",
  };
};
