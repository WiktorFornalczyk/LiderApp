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

export async function recognizeImageText(imageUri: string) {
  let result: OcrRecognitionResult;

  try {
    result = await TextRecognition.recognize(imageUri) as OcrRecognitionResult;
  } catch (error) {
    throw new Error(error instanceof Error ? getReadableOcrError(error) : 'Nie udalo sie odczytac tekstu ze zdjecia.');
  }

  return {
    rawText: getFullText(result),
    result,
  };
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
