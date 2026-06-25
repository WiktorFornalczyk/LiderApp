export type Report = {
  id: string;
  title: string;
  body: string;
  entryCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ReportEntry = {
  id: string;
  reportId: string;
  content: string;
  position: number;
  createdAt: string;
};

export type ReportRow = Report;
export type ReportEntryRow = ReportEntry;
