import { BbInput, BbLine } from '../types/bbTypes';

export type BbOcrPackageType = 'BB' | 'MW';
type ProductionLine = 'I' | 'II' | 'III';

export type ParsedBbOcrText = {
  rawText: string;
  normalizedText: string;
  line: ProductionLine | null;
  grade: string | null;
  batchNumber: string | null;
  packageType: BbOcrPackageType | null;
  rangeFrom: string | null;
  rangeTo: string | null;
  yardName: string | null;
};

const commonCarbonGrades = ['330', '339', '326', '375'];

export function normalizeOcrText(rawText: string) {
  let normalized = rawText
    .normalize('NFKC')
    .toUpperCase()
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();

  normalized = normalizeLineTokens(normalized);
  normalized = normalizePlacTokens(normalized);
  normalized = normalizePackageTokens(normalized);
  normalized = normalizeGradeTokens(normalized);
  normalized = normalizeBatchTokens(normalized);
  normalized = normalizeRangeTokens(normalized);

  return normalized.replace(/\s+/g, ' ').trim();
}

export function parseBbOcrText(rawText: string): ParsedBbOcrText {
  const normalizedText = normalizeOcrText(rawText);
  const range = parseRange(normalizedText);

  return {
    rawText,
    normalizedText,
    line: parseProductionLine(normalizedText),
    grade: parseGrade(normalizedText),
    batchNumber: parseBatchNumber(normalizedText),
    packageType: parsePackageType(normalizedText),
    rangeFrom: range?.from ?? null,
    rangeTo: range?.to ?? null,
    yardName: parseYardName(normalizedText),
  };
}

export function buildSuggestedBbInput(parsed: ParsedBbOcrText): Partial<BbInput> {
  const line = mapProductionLineToBbLine(parsed.line);

  return {
    ...(parsed.batchNumber ? { nrPartii: parsed.batchNumber } : {}),
    ...(parsed.grade ? { rodzajSadzy: parsed.grade } : {}),
    ...(parsed.rangeFrom && parsed.rangeTo ? { bbOd: parsed.rangeFrom, bbDo: parsed.rangeTo } : {}),
    ...(line ? { linia: line } : {}),
  };
}

export function parseProductionLine(text: string): ProductionLine | null {
  const normalized = normalizeOcrText(text);

  if (/\bL-III\b/.test(normalized)) {
    return 'III';
  }

  if (/\bL-II\b/.test(normalized)) {
    return 'II';
  }

  if (/\bL-I\b/.test(normalized)) {
    return 'I';
  }

  return null;
}

export function parseGrade(text: string) {
  const normalized = normalizeOcrText(text);
  const prefixedMatch = normalized.match(/\bN\s*([A-Z0-9]{2,})\b/);

  if (prefixedMatch?.[1] && /\d/.test(prefixedMatch[1])) {
    return `N${normalizeNumberLikeToken(prefixedMatch[1])}`;
  }

  const commonGrade = commonCarbonGrades.find((grade) => new RegExp(`(^|\\D)${grade}(\\D|$)`).test(normalized));

  return commonGrade ? `N${commonGrade}` : null;
}

export function parseBatchNumber(text: string) {
  const normalized = normalizeOcrText(text);
  const prefixedMatch = normalized.match(/\bP\s*([0-9]{4,})\b/);

  if (prefixedMatch?.[1]) {
    return prefixedMatch[1];
  }

  const labelledMatch = normalized.match(/(?:PARTIA|NR\s*PARTII|BATCH)[:\s-]*(\d{4,})/);

  if (labelledMatch?.[1]) {
    return labelledMatch[1];
  }

  return normalized.match(/\b\d{6,}\b/)?.[0] ?? null;
}

export function parsePackageType(text: string): BbOcrPackageType | null {
  const normalized = normalizeOcrText(text);
  const match = normalized.match(/\b(BB|MW)(?=\s*\d|\b)/);

  return match?.[1] === 'BB' || match?.[1] === 'MW' ? match[1] : null;
}

export function parseRange(text: string) {
  const normalized = normalizeOcrText(text);
  const match = normalized.match(/\b(?:BB|MW)\s*0*(\d{1,3})\s*-\s*0*(\d{1,3})\b/);

  if (!match?.[1] || !match?.[2]) {
    return null;
  }

  return {
    from: match[1],
    to: match[2],
  };
}

export function parseYardName(text: string) {
  const normalized = normalizeOcrText(text);
  const match = normalized.match(/\bPLAC\s*-?\s*([0-9A-Z-]+)\b/);

  return match?.[1] ? `Plac ${match[1].toUpperCase()}` : null;
}

function normalizeLineTokens(text: string) {
  return text
    .replace(/\bL\s*-?\s*(?:III|3)\b/g, 'L-III')
    .replace(/\bL\s*-?\s*(?:II|2)\b/g, 'L-II')
    .replace(/\bL\s*-?\s*(?:I|1)\b/g, 'L-I');
}

function normalizePlacTokens(text: string) {
  return text
    .replace(/\bP\s*(?:L|I|1|\u0141)\s*A\s*C\b/g, 'PLAC')
    .replace(/\bP(?:L|I|1|\u0141)AC\b/g, 'PLAC')
    .replace(/\bPL[A4]C\b/g, 'PLAC')
    .replace(/\bP\u0141AC\b/g, 'PLAC');
}

function normalizePackageTokens(text: string) {
  return text.replace(/\b(?:B\s*8|8\s*B|B\s*B)\b/g, 'BB');
}

function normalizeGradeTokens(text: string) {
  return text.replace(/\bN\s*([0-9OIL]{2,}[A-Z0-9OIL]*)\b/g, (_, value: string) => {
    return `N${normalizeNumberLikeToken(value)}`;
  });
}

function normalizeBatchTokens(text: string) {
  return text.replace(/\bP\s*([0-9OIL](?:\s*[0-9OIL]){3,})\b/g, (_, value: string) => {
    return `P${normalizeNumberLikeToken(value)}`;
  });
}

function normalizeRangeTokens(text: string) {
  return text.replace(/\b(BB|MW)\s*([0-9OIL]{1,3})\s*(?:-|DO|\s)\s*([0-9OIL]{1,3})\b/g, (_, packageType: string, from: string, to: string) => {
    return `${packageType}${normalizeNumberLikeToken(from)}-${normalizeNumberLikeToken(to)}`;
  });
}

function normalizeNumberLikeToken(value: string) {
  return value
    .replace(/\s+/g, '')
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1');
}

function mapProductionLineToBbLine(line: ProductionLine | null): BbLine | null {
  if (line === 'I') {
    return 'L-I';
  }

  if (line === 'II') {
    return 'L-II';
  }

  return null;
}
