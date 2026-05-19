// Movement model defines the shape of a transaction record returned by the API
// `type` is a discriminant allowing UI logic to colour or format values.
export type MovementType = 'deposit' | 'withdrawal';

export interface Movement {
  /** Primary key (optional for new objects) */
  id?: number;
  /** Account id this movement belongs to */
  account_id?: number;
  /** Movement type: deposit | withdrawal */
  type: MovementType;
  /** Amount in the account's base currency (integer/number) */
  amount: number;
  /** Human-friendly description */
  description: string;
  /** ISO timestamp of creation */
  created_at?: string;
}
