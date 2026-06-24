# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Moduł Notatnik

Notatnik działa offline i zapisuje dane lokalnie na urządzeniu w SQLite (`expo-sqlite`).
Tabela `notes` jest tworzona automatycznie przy pierwszym użyciu modułu, razem z indeksami po `updatedAt` i `isImportant`.

Główne ścieżki:

- `/notatki` w zakładkach pokazuje listę notatek, filtry, wyszukiwarkę i sortowanie.
- `/notes/new` otwiera formularz dodawania notatki.
- `/notes/[id]` pokazuje szczegóły notatki.
- `/notes/[id]/edit` otwiera edycję z ostrzeżeniem o niezapisanych zmianach.

Dashboard ma szybkie przejście do Notatnika, akcję „Nowa notatka” oraz licznik ważnych notatek.

Przypadki kontrolne:

- dodanie notatki z samą treścią,
- dodanie notatki z tytułem i treścią,
- próba zapisania pustej notatki,
- oznaczenie notatki jako ważnej,
- filtrowanie ważnych notatek,
- wyszukiwanie po tytule i treści,
- edycja notatki,
- usunięcie notatki po potwierdzeniu,
- anulowanie usuwania notatki,
- wyjście z edycji z niezapisanymi zmianami.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Moduł Grafik

Moduł Grafik działa offline i zapisuje pracowników oraz grafiki lokalnie w SQLite (`expo-sqlite`) w bazie `liderapp.db`. Kod modułu znajduje się w `src/features/schedule` i jest podzielony na komponenty, ekrany, repozytoria, serwisy, typy, walidację, migrację bazy oraz pomocnicze funkcje dat i zmian.

Główne elementy:

- `/grafik` w zakładkach otwiera listę grafików, edytor tabeli oraz panel pracowników.
- `scheduleRepository.ts` obsługuje tabele `employees`, `schedule_weeks`, `schedule_entries` i `app_settings`.
- `scheduleService.ts` pilnuje walidacji zakresu, tworzenia wpisów dla aktywnych pracowników i zapisu konkretnego `entryDate` w formacie `YYYY-MM-DD`.
- `employeeService.ts` obsługuje dodawanie, edycję, dezaktywację, reaktywację i usuwanie pracowników.
- `scheduleMaintenanceService.ts` usuwa grafiki starsze niż 4 tygodnie od daty zakończenia, maksymalnie raz dziennie, bez usuwania pracowników.
- `scheduleExportService.ts` generuje lokalny plik DOCX z tabelą grafiku, zakresem dat, datą wygenerowania i legendą zmian.

Typy zmian:

- `0` - wolne, 0 godzin.
- `1` - zmiana 1, 8 godzin.
- `2` - zmiana 2, 8 godzin.
- `3` - zmiana 3, 8 godzin.
- `1_8_16` - `1 (8-16)`, 8 godzin.
- `1_12H` - `1 12h`, 12 godzin.
- `2_12H` - `2 12h`, 12 godzin.
- `U` - urlop, 0 godzin.
- `L4` - zwolnienie lekarskie, 0 godzin.

Każdy wpis grafiku zapisuje `entryDate`, `employeeId`, `shiftCode`, `shiftLabel`, `shiftNumber` i `hours`, dzięki czemu przyszły moduł raportów może liczyć obsadę i godziny po konkretnych datach, bez zgadywania tygodnia po nazwie dnia.

Eksport DOCX:

- przycisk `Eksport DOCX` generuje plik `grafik-startDate-endDate.docx`,
- dokument zawiera tytuł `Grafik pracy`, zakres dat, datę wygenerowania, tabelę pracowników i dni oraz legendę,
- jeśli w runtime dostępne są moduły Expo do plików i udostępniania, plik jest zapisywany lokalnie i przekazywany do systemowego udostępniania,
- w razie błędu aplikacja pokazuje komunikat `Nie udało się wygenerować pliku DOCX.`

Przypadki kontrolne:

- dodanie, edycja, dezaktywacja i ponowna aktywacja pracownika,
- ukrycie nieaktywnych pracowników,
- utworzenie grafiku tygodniowego lub zakresu do 14 dni,
- zmiana komórki na `1`, `1_12H`, `U`, `L4` i `0`,
- sprawdzenie, że `1_12H` daje 12 godzin, a `U`, `L4` i `0` dają 0 godzin,
- kopiowanie grafiku z poprzedniego tygodnia z przesunięciem `entryDate`,
- czyszczenie całego grafiku, dnia albo pracownika do `0`,
- eksport grafiku do DOCX,
- automatyczne usunięcie grafików starszych niż 4 tygodnie bez usuwania pracowników,
- `getScheduleEntriesForDates(dates)` zwraca dane po konkretnych datach i nie miesza tygodni.

## Moduł BB i Place

Moduł BB i Place działa offline i zapisuje dane w SQLite (`expo-sqlite`) w bazie `liderapp.db`. Kod modułu znajduje się w `src/features/bb` i jest podzielony na komponenty, ekrany, repozytoria, serwisy, typy, walidację, migrację SQLite oraz helpery zakresów BB.

Główne wejścia:

- `/bb` w zakładkach pokazuje aktywne BB, place, archiwum i import/eksport.
- `/bb/new` otwiera szybkie dodawanie BB.
- `/bb/photo` otwiera przepływ dodawania BB przez wykonanie pojedynczego zdjęcia i lokalny OCR.

Tabele SQLite:

- `yards` przechowuje place.
- `bb_records` przechowuje aktywne, archiwalne i podzielone zapisy BB.
- `app_settings` przechowuje m.in. `lastBbArchiveCleanupAt`, ostatni plac, ostatnią linię i lokalną kopię przed importem zastępującym.

Archiwum BB:

- archiwizacja ustawia `status = archived` i `archivedAt`,
- rekord można przywrócić przez 7 dni,
- czyszczenie archiwum usuwa trwale rekordy starsze niż 7 dni i działa maksymalnie raz dziennie,
- przed ręcznym trwałym usunięciem aplikacja pokazuje dodatkowe potwierdzenie.

Dzielenie partii BB:

- `splitBbRecord(recordId, splitAfterNumber)` wykonuje całość w transakcji SQLite,
- oryginał dostaje `status = split` i `splitAt`,
- powstają dwa aktywne rekordy z `splitFromId` oraz zakresami, np. `BB 001-010` i `BB 011-020`,
- rekordy `split` nie są widoczne na głównej liście aktywnych BB.

Import i eksport JSON:

- eksport tworzy strukturę `schemaVersion: 1`, `appName: LiderApp`, `dataType: bb_backup`, `yards` i `bbRecords`,
- domyślnie eksportowane są tylko aktywne BB oraz place potrzebne do przypisania BB,
- opcjonalnie można eksportować archiwum,
- import obsługuje tryb połączenia danych oraz zastąpienia danych BB,
- przed zastąpieniem danych aplikacja tworzy lokalną kopię obecnych danych BB.

Dodawanie BB ze zdjęcia i OCR:

- zdjęcie jest wykonywane przez `expo-camera` po naciśnięciu przycisku `Zrób zdjęcie`,
- aplikacja nie skanuje obrazu stale w trybie live,
- lokalny OCR jest wykonywany przez Google ML Kit Text Recognition (`@react-native-ml-kit/text-recognition`) dopiero po wykonaniu zdjęcia,
- aplikacja nie wysyła zdjęć do zewnętrznego API,
- po OCR użytkownik widzi zdjęcie, pełny odczytany tekst oraz proponowane wartości,
- parser rozpoznaje zapis w stylu `L-I N339 P565499 BB11-23, plac 3`: `L-I` jako linia, `N339` jako rodzaj sadzy, `P565499` jako numer partii, `BB11-23` jako zakres i `plac 3` jako dopasowanie do istniejącego placu,
- wynik OCR nigdy nie jest zapisywany automatycznie: użytkownik musi potwierdzić albo poprawić dane przed przejściem do zapisu BB,
- ML Kit wymaga natywnego buildu/Expo Dev Client po instalacji paczki.

Przypadki kontrolne:

- dodanie, edycja i usunięcie placu,
- blokada usunięcia placu z aktywnymi BB,
- dodanie BB z poprawnym zakresem, pustą paletą i domyślnymi wartościami `strecz = nie`, `kapturownica = nie`,
- walidacja numeru partii, rodzaju sadzy, placu, linii i zakresu BB,
- wyszukiwanie po partii, sadzy, placu, zakresie i linii,
- filtrowanie po placu, linii, palecie, strechu i kapturownicy,
- ostrzeżenia dla duplikatów oraz nachodzących zakresów tej samej partii,
- archiwizacja, przywrócenie i trwałe usunięcie BB,
- automatyczne czyszczenie archiwum po 7 dniach,
- podział `BB 001-020` na `BB 001-010` i `BB 011-020`,
- eksport aktywnych BB do JSON,
- import JSON w trybie połączenia i zastąpienia,
- OCR z ręcznym potwierdzeniem danych.
