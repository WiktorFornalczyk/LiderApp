export type Yard = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type YardRow = Yard;

export type YardInput = {
  name: string;
  description?: string | null;
};

export type YardWithStats = Yard & {
  activeBbCount: number;
};

export type YardValidationErrors = Partial<Record<keyof YardInput, string>>;
