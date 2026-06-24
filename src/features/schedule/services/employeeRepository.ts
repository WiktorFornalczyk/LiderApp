import { Employee, EmployeeInput, EmployeeRow } from '../types/employeeTypes';
import { getScheduleDatabase } from './scheduleRepository';

function mapRowToEmployee(row: EmployeeRow): Employee {
  return {
    ...row,
    isActive: row.isActive === 1,
  };
}

export async function getEmployees() {
  const db = await getScheduleDatabase();
  const rows = await db.getAllAsync<EmployeeRow>(
    'SELECT * FROM employees ORDER BY isActive DESC, fullName COLLATE NOCASE ASC'
  );

  return rows.map(mapRowToEmployee);
}

export async function getActiveEmployees() {
  const db = await getScheduleDatabase();
  const rows = await db.getAllAsync<EmployeeRow>(
    'SELECT * FROM employees WHERE isActive = 1 ORDER BY fullName COLLATE NOCASE ASC'
  );

  return rows.map(mapRowToEmployee);
}

export async function getEmployeeById(id: string) {
  const db = await getScheduleDatabase();
  const row = await db.getFirstAsync<EmployeeRow>('SELECT * FROM employees WHERE id = ?', id);

  return row ? mapRowToEmployee(row) : null;
}

export async function findActiveEmployeeByName(fullName: string) {
  const db = await getScheduleDatabase();
  const row = await db.getFirstAsync<EmployeeRow>(
    'SELECT * FROM employees WHERE isActive = 1 AND lower(fullName) = lower(?)',
    fullName
  );

  return row ? mapRowToEmployee(row) : null;
}

export async function createEmployee(employee: Employee) {
  const db = await getScheduleDatabase();

  await db.runAsync(
    `INSERT INTO employees (id, fullName, isActive, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?)`,
    employee.id,
    employee.fullName,
    employee.isActive ? 1 : 0,
    employee.createdAt,
    employee.updatedAt
  );

  return employee;
}

export async function updateEmployee(id: string, input: EmployeeInput & { updatedAt: string }) {
  const db = await getScheduleDatabase();

  await db.runAsync(
    `UPDATE employees
     SET fullName = ?, isActive = ?, updatedAt = ?
     WHERE id = ?`,
    input.fullName,
    input.isActive ? 1 : 0,
    input.updatedAt,
    id
  );

  return getEmployeeById(id);
}

export async function deactivateEmployee(id: string) {
  const db = await getScheduleDatabase();
  await db.runAsync('UPDATE employees SET isActive = 0, updatedAt = ? WHERE id = ?', new Date().toISOString(), id);
}

export async function reactivateEmployee(id: string) {
  const db = await getScheduleDatabase();
  await db.runAsync('UPDATE employees SET isActive = 1, updatedAt = ? WHERE id = ?', new Date().toISOString(), id);
}

export async function deleteEmployee(id: string) {
  const db = await getScheduleDatabase();
  await db.runAsync('DELETE FROM employees WHERE id = ?', id);
}

export async function getActiveEmployeesCount() {
  const db = await getScheduleDatabase();
  const row = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM employees WHERE isActive = 1'
  );

  return row?.count ?? 0;
}
