import TextRecognition from '@react-native-ml-kit/text-recognition';

import { BbInput, BbLine, BbOcrResult } from '../types/bbTypes';

export function extractBatchNumberFromText(text: string) {
  const normalized = text.replace(/\s+/g, ' ');
  const prefixedMatch = normalized.match(/\bP\s*([0-9]{4,})\b/i);

  if (prefixedMatch?.[1]) {
    return prefixedMatch[1];
  }

  const labelledMatch = normalized.match(/(?:partia|nr\s*partii|batch)[:\s-]*(\d{4,})/i);

  if (labelledMatch?.[1]) {
    return labelledMatch[1];
  }

  return normalized.match(/\b\d{6,}\b/)?.[0] ?? null;
}

export function extractCarbonTypeFromText(text: string) {
  const normalized = text.replace(/\s+/g, ' ');
  const match = normalized.match(/\bN\s*([A-Z]?\d{2,}[A-Z0-9]*)\b/i);

  return match?.[1] ? `N${match[1].toUpperCase()}` : null;
}

export function extractBbRangeFromText(text: string) {
  const normalized = text.replace(/\s+/g, ' ');
  const match = normalized.match(/BB\s*0*(\d{1,3})\s*(?:-|–|—|do)\s*0*(\d{1,3})/i);

  if (!match?.[1] || !match?.[2]) {
    return null;
  }

  return {
    bbOd: match[1],
    bbDo: match[2],
  };
}

export function extractLineFromText(text: string): BbLine | null {
  const normalized = text.toUpperCase();

  if (/\bL[\s-]?II\b/.test(normalized)) {
    return 'L-II';
  }

  if (/\bL[\s-]?I\b/.test(normalized)) {
    return 'L-I';
  }

  return null;
}

export function extractYardNameFromText(text: string) {
  const normalized = text.replace(/\s+/g, ' ');
  const match = normalized.match(/\bplac\s*([0-9A-ZĄĆĘŁŃÓŚŹŻ-]+)\b/i);

  return match?.[1] ? `Plac ${match[1].toUpperCase()}` : null;
}

export function buildSuggestedBbValues(rawText: string): Partial<BbInput> {
  const nrPartii = extractBatchNumberFromText(rawText);
  const rodzajSadzy = extractCarbonTypeFromText(rawText);
  const range = extractBbRangeFromText(rawText);
  const linia = extractLineFromText(rawText);

  return {
    ...(nrPartii ? { nrPartii } : {}),
    ...(rodzajSadzy ? { rodzajSadzy } : {}),
    ...(range ? range : {}),
    ...(linia ? { linia } : {}),
  };
}

export async function recognizeBbPhoto(imageUri: string): Promise<BbOcrResult> {
  try {
    const result = await TextRecognition.recognize(imageUri);
    return buildOcrResultFromText(result.text, imageUri);
  } catch (error) {
    return {
      imageUri,
      rawText: '',
      suggestedNrPartii: null,
      suggestedValues: {},
      suggestedPlacName: null,
      error:
        error instanceof Error
          ? error.message
          : 'Nie udało się odczytać tekstu ze zdjęcia. Możesz wprowadzić dane ręcznie.',
    };
  }
}

export function buildOcrResultFromText(rawText: string, imageUri: string | null = null): BbOcrResult {
  const suggestedValues = buildSuggestedBbValues(rawText);
  const suggestedPlacName = extractYardNameFromText(rawText);

  return {
    imageUri,
    rawText,
    suggestedNrPartii: suggestedValues.nrPartii ?? null,
    suggestedValues,
    suggestedPlacName,
  };
}
