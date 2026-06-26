export type ParsedReportEntry = {
  id: string;
  originalText: string;
  line: 'L-I' | 'L-II' | null;
  carbonType: string | null;
  batchNumber: string | null;
  unitType: 'BB' | 'PALETY';
  rangeFrom: number | null;
  rangeTo: number | null;
  yardText: string | null;
  temperatures: ReportTemperaturePoint[];
  confidence: number;
  requiresReview: boolean;
};

export type ReportTemperaturePoint = {
  bbNumber: number;
  value: string;
};

type ParsedLine = {
  value: ParsedReportEntry['line'];
  certain: boolean;
};

let nextEntryId = 0;

export function parseReportOcrText(text: string): ParsedReportEntry[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseSingleReportLine);
}

export function parseSingleReportLine(line: string): ParsedReportEntry {
  const originalText = line.trim();
  const normalized = normalizeOcrLine(originalText);
  const parsedLine = detectLine(normalized);
  const unitType = detectUnitType(normalized);
  const range = detectRange(normalized, unitType);
  const carbonType = normalized.match(/\bN\s*([A-Z]?\d{2,}[A-Z0-9]*)\b/i)?.[1] ?? null;
  const batchNumber = normalized.match(/\bP\s*(\d{4,})\b/i)?.[1] ?? null;
  const yardText = detectYardText(normalized);

  const entry: ParsedReportEntry = {
    id: createEntryId(),
    originalText,
    line: parsedLine.value,
    carbonType: carbonType ? `N${carbonType.toUpperCase()}` : null,
    batchNumber: batchNumber ? `P${batchNumber}` : null,
    unitType,
    rangeFrom: range?.from ?? null,
    rangeTo: range?.to ?? null,
    yardText,
    temperatures: detectTemperatures(normalized),
    confidence: 0,
    requiresReview: false,
  };

  const hasRequiredFields = Boolean(
    entry.line &&
      entry.carbonType &&
      entry.batchNumber &&
      entry.rangeFrom !== null &&
      entry.rangeTo !== null &&
      entry.yardText
  );
  const invalidRange = entry.rangeFrom !== null && entry.rangeTo !== null && entry.rangeFrom > entry.rangeTo;
  const inferredPaletteRange = unitType === 'PALETY' && range?.source === 'plain-range';

  entry.requiresReview = !hasRequiredFields || !parsedLine.certain || invalidRange || inferredPaletteRange;
  entry.confidence = calculateConfidence({
    hasLine: Boolean(entry.line),
    lineCertain: parsedLine.certain,
    hasCarbonType: Boolean(entry.carbonType),
    hasBatchNumber: Boolean(entry.batchNumber),
    hasRange: entry.rangeFrom !== null && entry.rangeTo !== null,
    hasYard: Boolean(entry.yardText),
    invalidRange,
    inferredPaletteRange,
  });

  return entry;
}

export function formatParsedEntryForReport(entry: ParsedReportEntry): string {
  if (
    entry.requiresReview ||
    !entry.line ||
    !entry.carbonType ||
    !entry.batchNumber ||
    entry.rangeFrom === null ||
    entry.rangeTo === null ||
    !entry.yardText
  ) {
    return entry.originalText;
  }

  const rangeText = `${entry.rangeFrom}-${entry.rangeTo}`;
  const unitText =
    entry.unitType === 'PALETY' ? `MW ${entry.carbonType} ${entry.batchNumber} palety` : `${entry.carbonType} ${entry.batchNumber} BB`;

  return `${entry.line} ${unitText} ${rangeText} ${entry.yardText}`;
}

export function detectUnitType(line: string): 'BB' | 'PALETY' {
  return /\bMW\b/i.test(normalizeOcrLine(line)) ? 'PALETY' : 'BB';
}

export function normalizeOcrLine(line: string): string {
  return line
    .replace(/[–—]/g, '-')
    .replace(/[,;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function detectLine(line: string): ParsedLine {
  const normalized = line.toUpperCase();

  if (/\bL\s*-\s*II\b|\bL\s+II\b|\bLII\b/.test(normalized)) {
    return { value: 'L-II', certain: true };
  }

  if (/\bL\s*-\s*I\b|\bL\s+I\b/.test(normalized)) {
    return { value: 'L-I', certain: true };
  }

  if (/\b(?:LI|L1|L-L|L-LI|L\|)\b/.test(normalized)) {
    return { value: 'L-I', certain: false };
  }

  return { value: null, certain: false };
}

function detectRange(line: string, unitType: ParsedReportEntry['unitType']) {
  const bbRange = line.match(/\bBB\s*0*(\d{1,4})(?:\s*(?:-|do)\s*0*(\d{1,4}))?\b/i);

  if (bbRange?.[1]) {
    return normalizeRange(Number(bbRange[1]), Number(bbRange[2] ?? bbRange[1]), 'bb-range');
  }

  const plainRange = line.match(/\b0*(\d{1,4})\s*(?:-|do)\s*0*(\d{1,4})\b/i);

  if (plainRange?.[1] && plainRange[2]) {
    return normalizeRange(Number(plainRange[1]), Number(plainRange[2]), unitType === 'PALETY' ? 'plain-range' : 'bb-range');
  }

  return null;
}

function normalizeRange(from: number, to: number, source: 'bb-range' | 'plain-range') {
  return {
    from,
    to,
    source,
  };
}

function detectYardText(line: string) {
  const match = line.match(/\bplac\s*([0-9A-ZĄĆĘŁŃÓŚŹŻ-]+)\b/i);
  return match?.[1] ? `plac ${match[1]}` : null;
}

function detectTemperatures(line: string): ReportTemperaturePoint[] {
  const temperatures: ReportTemperaturePoint[] = [];
  const labeledPattern = /(?:BB\s*)?0*(\d{1,4})\s*[:=\-]\s*(-?\d+(?:[.,]\d+)?)\s*(?:°?\s*C)?/gi;
  let match: RegExpExecArray | null;

  while ((match = labeledPattern.exec(line)) !== null) {
    const bbNumber = Number(match[1]);
    const value = match[2]?.replace(',', '.');

    if (Number.isFinite(bbNumber) && value) {
      temperatures.push({ bbNumber, value });
    }
  }

  return temperatures;
}

function calculateConfidence(values: {
  hasLine: boolean;
  lineCertain: boolean;
  hasCarbonType: boolean;
  hasBatchNumber: boolean;
  hasRange: boolean;
  hasYard: boolean;
  invalidRange: boolean;
  inferredPaletteRange: boolean;
}) {
  let score = 0;

  if (values.hasLine) score += values.lineCertain ? 0.2 : 0.12;
  if (values.hasCarbonType) score += 0.18;
  if (values.hasBatchNumber) score += 0.18;
  if (values.hasRange) score += 0.18;
  if (values.hasYard) score += 0.16;
  if (values.invalidRange) score -= 0.3;
  if (values.inferredPaletteRange) score -= 0.12;

  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

function createEntryId() {
  nextEntryId += 1;
  return `report-ocr-${Date.now()}-${nextEntryId}`;
}
