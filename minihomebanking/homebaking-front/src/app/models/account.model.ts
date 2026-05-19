/** Account model describes user bank accounts stored on backend */
export interface Account {
  id: number;
  name: string;
  surname?: string;
  currency: string;
  created_at?: string;
}
