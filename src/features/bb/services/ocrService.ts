import {
  getFullText,
  getLines,
  getReadableOcrError,
  OcrRecognitionResult,
  OcrTextLine,
  recognizeImageText,
} from '@/src/features/ocr/services/textRecognitionService';
import { BbInput, BbLine, BbOcrResult } from '../types/bbTypes';
import {
  buildSuggestedBbInput,
  normalizeOcrText,
  parseBatchNumber,
  parseBbOcrText,
  parseGrade,
  parseProductionLine,
  parseRange,
  parseYardName,
} from './bbOcrParser';

type RecognizeBbPhotoOptions = {
  maxTextY?: number;
};

export function extractBatchNumberFromText(text: string) {
  return parseBatchNumber(text);
}

export function extractCarbonTypeFromText(text: string) {
  return parseGrade(text);
}

export function extractBbRangeFromText(text: string) {
  const range = parseRange(text);

  if (!range) {
    return null;
  }

  return {
    bbOd: range.from,
    bbDo: range.to,
  };
}

export function extractLineFromText(text: string): BbLine | null {
  const line = parseProductionLine(text);

  if (line === 'II') {
    return 'L-II';
  }

  if (line === 'I') {
    return 'L-I';
  }

  return null;
}

export function extractYardNameFromText(text: string) {
  return parseYardName(text);
}

export function buildSuggestedBbValues(rawText: string): Partial<BbInput> {
  return buildSuggestedBbInput(parseBbOcrText(rawText));
}

export async function recognizeBbPhoto(imageUri: string, options: RecognizeBbPhotoOptions = {}): Promise<BbOcrResult> {
  try {
    const { rawText: fullText, result, meta } = await recognizeImageText(imageUri);
    const guidedText = getTextAboveLine(result, options.maxTextY);
    const guidedResult = buildOcrResultFromText(guidedText, imageUri);
    const debugInfo = buildDebugInfo(meta.blockCount, meta.lineCount, meta.attemptedUriCount);

    if (guidedText && hasSuggestedValues(guidedResult)) {
      return { ...guidedResult, debugInfo };
    }

    return { ...buildOcrResultFromText(fullText || guidedText, imageUri), debugInfo };
  } catch (error) {
    return {
      imageUri,
      rawText: '',
      normalizedText: '',
      suggestedNrPartii: null,
      suggestedValues: {},
      suggestedPlacName: null,
      error:
        error instanceof Error
          ? getReadableOcrError(error)
          : 'Nie udało się odczytać tekstu ze zdjęcia. Możesz wprowadzić dane ręcznie.',
      debugInfo: 'ML Kit nie zwrocil wyniku OCR.',
    };
  }
}

function buildDebugInfo(blockCount: number, lineCount: number, attemptedUriCount: number) {
  return `ML Kit: bloki ${blockCount}, linie ${lineCount}, proby pliku ${attemptedUriCount}`;
}

function getTextAboveLine(result: OcrRecognitionResult, maxTextY?: number) {
  if (!maxTextY || !result.blocks?.length) {
    return getFullText(result);
  }

  const selectedLines = getLines(result)
    .filter((line) => isLineAboveCutoff(line, maxTextY))
    .map((line) => line.text?.trim())
    .filter(Boolean);

  return selectedLines.length > 0 ? selectedLines.join('\n') : getFullText(result);
}

function isLineAboveCutoff(line: OcrTextLine, maxTextY: number) {
  const frame = line.frame ?? line.bounding;
  const frameTop = frame?.top ?? frame?.y;

  if (!frame || typeof frameTop !== 'number') {
    return true;
  }

  const height = typeof frame.height === 'number' ? frame.height : 0;
  const lineCenterY = frameTop + height / 2;

  return lineCenterY <= maxTextY;
}

function hasSuggestedValues(result: BbOcrResult) {
  return Boolean(
    result.suggestedPlacName ||
      result.suggestedValues.nrPartii ||
      result.suggestedValues.rodzajSadzy ||
      result.suggestedValues.bbOd ||
      result.suggestedValues.bbDo ||
      result.suggestedValues.linia
  );
}

export function buildOcrResultFromText(rawText: string, imageUri: string | null = null): BbOcrResult {
  const parsedText = parseBbOcrText(rawText);
  const suggestedValues = buildSuggestedBbInput(parsedText);

  return {
    imageUri,
    rawText,
    normalizedText: normalizeOcrText(rawText),
    suggestedNrPartii: suggestedValues.nrPartii ?? null,
    suggestedValues,
    suggestedPlacName: parsedText.yardName,
  };
}
