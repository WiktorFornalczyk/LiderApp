export type Employee = {
  id: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeRow = {
  id: string;
  fullName: string;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeInput = {
  fullName: string;
  isActive?: boolean;
};

export type EmployeeValidationErrors = Partial<Record<keyof EmployeeInput, string>>;
