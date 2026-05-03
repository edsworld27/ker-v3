export interface Deal {
  id: string;
  name: string;
  title?: string;
  value: number;
  stage: string;
  clientId?: string;
  clientName?: string;
  probability?: number;
  expectedClose?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
