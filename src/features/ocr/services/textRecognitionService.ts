import TextRecognition from '@react-native-ml-kit/text-recognition';

export type OcrFrame = {
  left?: number;
  top?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type OcrTextLine = {
  text?: string;
  frame?: OcrFrame;
  bounding?: OcrFrame;
};

export type OcrTextBlock = OcrTextLine & {
  lines?: OcrTextLine[];
};

export type OcrRecognitionResult = {
  text?: string;
  blocks?: OcrTextBlock[];
};

export type OcrRecognitionMeta = {
  blockCount: number;
  lineCount: number;
  attemptedUriCount: number;
};

export async function recognizeImageText(imageUri: string) {
  let lastError: unknown = null;
  let firstResult: { rawText: string; result: OcrRecognitionResult; meta: OcrRecognitionMeta } | null = null;
  const uriCandidates = buildImageUriCandidates(imageUri);

  for (const uri of uriCandidates) {
    try {
      const result = await TextRecognition.recognize(uri) as OcrRecognitionResult;
      const rawText = getFullText(result);
      const meta = buildOcrMeta(result, uriCandidates.length);
      firstResult ??= { rawText, result, meta };

      if (rawText) {
        return {
          rawText,
          result,
          meta,
        };
      }
    } catch (error) {
      lastError = error;
    }
  }

  if (firstResult) {
    return firstResult;
  }

  throw new Error(lastError instanceof Error ? getReadableOcrError(lastError) : 'Nie udalo sie odczytac tekstu ze zdjecia.');
}

function buildImageUriCandidates(imageUri: string) {
  const candidates = new Set<string>([imageUri]);

  try {
    candidates.add(decodeURI(imageUri));
  } catch {
    // Keep the original URI if decoding fails.
  }

  if (imageUri.startsWith('file://')) {
    candidates.add(imageUri.replace('file://', ''));
  } else if (/^[A-Za-z]:[\\/]/.test(imageUri) || imageUri.startsWith('/')) {
    candidates.add(`file://${imageUri}`);
  }

  return Array.from(candidates).filter(Boolean);
}

export function getReadableOcrError(error: Error) {
  if (error.message.includes("doesn't seem to be linked") || error.message.includes('NativeModules.TextRecognition')) {
    return 'Modul OCR nie jest wbudowany w uruchomiona aplikacje. Uruchom aplikacje jako development build, nie w Expo Go.';
  }

  return error.message;
}

export function getFullText(result: OcrRecognitionResult) {
  const text = result.text?.trim();

  if (text) {
    return text;
  }

  return getLines(result)
    .map((line) => line.text?.trim())
    .filter(Boolean)
    .join('\n');
}

export function getLines(result: OcrRecognitionResult) {
  return result.blocks?.flatMap((block) => block.lines?.length ? block.lines : [block]) ?? [];
}

function buildOcrMeta(result: OcrRecognitionResult, attemptedUriCount: number): OcrRecognitionMeta {
  return {
    blockCount: result.blocks?.length ?? 0,
    lineCount: getLines(result).length,
    attemptedUriCount,
  };
}
