# LiderApp

LiderApp to aplikacja Expo/React Native do codziennego prowadzenia pracy lidera: BB, placów, grafików, kalendarza, notatek i raportów zmianowych. Aplikacja działa lokalnie i zapisuje dane offline w SQLite (`expo-sqlite`) w bazie `liderapp.db`.

## Uruchomienie

1. Zainstaluj zależności:

   ```bash
   npm install
   ```

2. Uruchom projekt:

   ```bash
   npx expo start
   ```

3. OCR wymaga natywnego development builda/dev clienta albo normalnego builda aplikacji. Nie działa w zwykłym Expo Go.

## Nawigacja

- Dolne menu prowadzi do Dashboardu, BB, Raportów, Notatek i Ustawień.
- Grafik jest dostępny z rozwijanego menu w lewym górnym rogu Dashboardu.
- Strzałka w lewym górnym rogu wraca do poprzedniego widoku.
- Dashboard pokazuje szybkie akcje, ostatnie BB i najbliższe wydarzenia.

## Moduł BB i Place

Moduł BB i Place działa offline i zapisuje dane w SQLite. Kod znajduje się w `src/features/bb`.

Główne możliwości:

- dodawanie, edycja i archiwizacja BB,
- prowadzenie placów,
- wyszukiwanie i filtrowanie po partii, sadzy, placu, zakresie i linii,
- ostrzeganie przed duplikatami oraz nakładającymi się zakresami,
- dzielenie partii BB,
- import i eksport danych BB do JSON,
- automatyczne czyszczenie archiwum po ustawionej liczbie dni,
- dodawanie BB ze zdjęcia przez lokalny OCR.

Główne dane BB:

- numer partii,
- rodzaj sadzy,
- plac,
- zakres BB od/do,
- linia,
- typ palety,
- strecz,
- kapturownica,
- uwagi.

Najczęstsze gatunki sadzy rozpoznawane i podpowiadane przez aplikację:

- `N330`,
- `N339`,
- `N326`,
- `N375`.

## OCR

OCR jest wykonywany lokalnie przez Google ML Kit Text Recognition za pomocą paczki:

```text
@react-native-ml-kit/text-recognition
```

Zdjęcia nie są wysyłane do zewnętrznego API. OCR uruchamia się dopiero po wykonaniu zdjęcia.

OCR w BB rozpoznaje między innymi zapis:

```text
L-I N339 P565499 BB11-23 plac 3
```

Z takiego tekstu aplikacja próbuje odczytać:

- linię,
- gatunek sadzy,
- numer partii,
- zakres BB,
- plac.

Wynik OCR nigdy nie jest zapisywany automatycznie. Użytkownik musi potwierdzić albo poprawić dane przed zapisem.

## Moduł Raporty

Moduł raportów pozwala tworzyć raport zmianowy ręcznie albo ze zdjęć OCR. Kod znajduje się w `src/features/reports` oraz `app/reports`.

Możliwości:

- dodawanie wpisów ręcznych,
- dodawanie wpisów ze zdjęcia OCR,
- składanie raportu z kilku zdjęć,
- wybór zmiany,
- uzupełnianie temperatur,
- generowanie gotowej treści raportu,
- edycja, kopiowanie i usuwanie zapisanych raportów.

Lista raportów pokazuje datę bez godziny.

## Moduł Grafik

Moduł Grafik działa offline i zapisuje pracowników oraz grafiki w SQLite. Kod znajduje się w `src/features/schedule`.

Możliwości:

- dodawanie i edycja pracowników,
- dezaktywacja i ponowna aktywacja pracowników,
- tworzenie grafiku tygodniowego albo zakresu do 14 dni,
- edycja zmian w tabeli,
- kopiowanie grafiku z poprzedniego tygodnia,
- czyszczenie grafiku,
- eksport grafiku do pliku Excel,
- automatyczne usuwanie starych grafików po ustawionej liczbie dni.

Typy zmian:

- `0` - wolne, 0 godzin,
- `1` - zmiana 1, 8 godzin,
- `2` - zmiana 2, 8 godzin,
- `3` - zmiana 3, 8 godzin,
- `1_8_16` - zmiana 1 w godzinach 8-16, 8 godzin,
- `1_12H` - zmiana 1, 12 godzin,
- `2_12H` - zmiana 2, 12 godzin,
- `U` - urlop, 0 godzin,
- `L4` - zwolnienie lekarskie, 0 godzin.

Każdy wpis grafiku zapisuje konkretną datę (`entryDate`), dzięki czemu raporty mogą liczyć obsadę i godziny po właściwych dniach.

## Moduł Kalendarz

Moduł Kalendarz działa offline i zapisuje wydarzenia w SQLite. Kod znajduje się w `src/features/calendar`.

Możliwości:

- widok miesięczny,
- lista wydarzeń,
- dodawanie, edycja i usuwanie wydarzeń,
- filtrowanie po typie wydarzenia,
- oznaczanie wydarzeń całodniowych,
- pokazywanie najbliższych wydarzeń na Dashboardzie.

Typy wydarzeń:

- Praca,
- Grafik,
- Raport,
- BB,
- Urlop,
- Spotkanie,
- Przypomnienie,
- Inne.

## Moduł Notatki

Moduł Notatki działa offline i zapisuje dane lokalnie w SQLite. Kod znajduje się w `src/features/notes`.

Możliwości:

- dodawanie notatek,
- edycja notatek,
- usuwanie notatek po potwierdzeniu,
- oznaczanie notatek jako ważne,
- filtrowanie ważnych notatek,
- wyszukiwanie po tytule i treści,
- ostrzeganie o niezapisanych zmianach.

## Import i eksport danych

W ustawieniach dostępny jest eksport oraz import danych BB w formacie JSON.

Eksport zawiera:

- `schemaVersion`,
- `appName`,
- `dataType`,
- listę placów,
- listę rekordów BB.

Przed importem w trybie zastąpienia aplikacja tworzy lokalną kopię obecnych danych BB.

## Najważniejsze technologie

- Expo SDK 54,
- React Native,
- Expo Router,
- SQLite przez `expo-sqlite`,
- Google ML Kit Text Recognition,
- Expo Camera,
- TypeScript.

## Przydatne komendy

```bash
npm install
cmd /c npx expo lint
cmd /c npx tsc --noEmit
npx expo start
```

Na Windowsie czasem PowerShell blokuje `npx.ps1`. Wtedy używaj:

```bash
cmd /c npx expo ...
```
