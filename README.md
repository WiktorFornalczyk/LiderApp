# Welcome to your Expo app đź‘‹

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## ModuĹ‚ Notatnik

Notatnik dziaĹ‚a offline i zapisuje dane lokalnie na urzÄ…dzeniu w SQLite (`expo-sqlite`).
Tabela `notes` jest tworzona automatycznie przy pierwszym uĹĽyciu moduĹ‚u, razem z indeksami po `updatedAt` i `isImportant`.

GĹ‚Ăłwne Ĺ›cieĹĽki:

- `/notatki` w zakĹ‚adkach pokazuje listÄ™ notatek, filtry, wyszukiwarkÄ™ i sortowanie.
- `/notes/new` otwiera formularz dodawania notatki.
- `/notes/[id]` pokazuje szczegĂłĹ‚y notatki.
- `/notes/[id]/edit` otwiera edycjÄ™ z ostrzeĹĽeniem o niezapisanych zmianach.

Dashboard ma szybkie przejĹ›cie do Notatnika, akcjÄ™ â€žNowa notatkaâ€ť oraz licznik waĹĽnych notatek.

Przypadki kontrolne:

- dodanie notatki z samÄ… treĹ›ciÄ…,
- dodanie notatki z tytuĹ‚em i treĹ›ciÄ…,
- prĂłba zapisania pustej notatki,
- oznaczenie notatki jako waĹĽnej,
- filtrowanie waĹĽnych notatek,
- wyszukiwanie po tytule i treĹ›ci,
- edycja notatki,
- usuniÄ™cie notatki po potwierdzeniu,
- anulowanie usuwania notatki,
- wyjĹ›cie z edycji z niezapisanymi zmianami.

## ModuĹ‚ Kalendarz

ModuĹ‚ Kalendarz dziaĹ‚a offline i zapisuje wydarzenia lokalnie w SQLite (`expo-sqlite`) w bazie `liderapp.db`. Kod znajduje siÄ™ w `src/features/calendar` i jest podzielony na komponenty, ekrany, repozytorium, serwis, typy, walidacjÄ™, migracjÄ™ SQLite oraz helpery dat i formatowania.

Model wydarzenia `CalendarEvent`:

- `id` - identyfikator wydarzenia,
- `title` - tytuĹ‚,
- `description` - opcjonalny opis,
- `eventDate` - data w formacie `YYYY-MM-DD`,
- `eventTime` - opcjonalna godzina w formacie `HH:mm`,
- `eventType` - typ wydarzenia,
- `isAllDay` - wydarzenie caĹ‚odniowe,
- `createdAt` i `updatedAt` - daty utworzenia i edycji.

Typy wydarzeĹ„:

- Praca,
- Grafik,
- Raport,
- BB,
- Urlop,
- Spotkanie,
- Przypomnienie,
- Inne.

GĹ‚Ăłwne wejĹ›cia:

- `/calendar` pokazuje widok miesiÄ™czny z oznaczeniem dni z wydarzeniami, dzisiejszego dnia i wybranej daty.
- `/calendar/list` pokazuje listÄ™ wydarzeĹ„ z wyszukiwaniem, filtrami i sortowaniem.
- `/calendar/new` otwiera formularz dodawania wydarzenia.
- `/calendar/[id]` pokazuje szczegĂłĹ‚y wydarzenia.
- `/calendar/[id]/edit` otwiera edycjÄ™ z ostrzeĹĽeniem o niezapisanych zmianach.

Widok miesiÄ™czny pozwala przechodziÄ‡ miÄ™dzy miesiÄ…cami, wrĂłciÄ‡ do dzisiejszej daty, wybraÄ‡ dzieĹ„ i szybko dodaÄ‡ wydarzenie dla tej daty. Lista wydarzeĹ„ obsĹ‚uguje filtry `Wszystkie`, `NadchodzÄ…ce`, `PrzeszĹ‚e`, `Dzisiejsze` oraz filtrowanie po typie wydarzenia.

Dashboard korzysta z `calendarService.getDashboardCalendarSummary()` i pokazuje liczbÄ™ wydarzeĹ„ na dziĹ›, najbliĹĽsze wydarzenia oraz szybkie akcje `Dodaj wydarzenie` i `Kalendarz`.

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

## ModuĹ‚ Grafik

ModuĹ‚ Grafik dziaĹ‚a offline i zapisuje pracownikĂłw oraz grafiki lokalnie w SQLite (`expo-sqlite`) w bazie `liderapp.db`. Kod moduĹ‚u znajduje siÄ™ w `src/features/schedule` i jest podzielony na komponenty, ekrany, repozytoria, serwisy, typy, walidacjÄ™, migracjÄ™ bazy oraz pomocnicze funkcje dat i zmian.

GĹ‚Ăłwne elementy:

- `/grafik` w zakĹ‚adkach otwiera listÄ™ grafikĂłw, edytor tabeli oraz panel pracownikĂłw.
- `scheduleRepository.ts` obsĹ‚uguje tabele `employees`, `schedule_weeks`, `schedule_entries` i `app_settings`.
- `scheduleService.ts` pilnuje walidacji zakresu, tworzenia wpisĂłw dla aktywnych pracownikĂłw i zapisu konkretnego `entryDate` w formacie `YYYY-MM-DD`.
- `employeeService.ts` obsĹ‚uguje dodawanie, edycjÄ™, dezaktywacjÄ™, reaktywacjÄ™ i usuwanie pracownikĂłw.
- `scheduleMaintenanceService.ts` usuwa grafiki po ustawionej liczbie dni od daty zakończenia (domyślnie 28 dni), maksymalnie raz dziennie, bez usuwania pracowników.
- `scheduleExportService.ts` generuje lokalny plik Excel z tabelą: pracownik, daty i zmiany.

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

KaĹĽdy wpis grafiku zapisuje `entryDate`, `employeeId`, `shiftCode`, `shiftLabel`, `shiftNumber` i `hours`, dziÄ™ki czemu przyszĹ‚y moduĹ‚ raportĂłw moĹĽe liczyÄ‡ obsadÄ™ i godziny po konkretnych datach, bez zgadywania tygodnia po nazwie dnia.

Eksport Excel:

- przycisk `Eksport Excel` generuje plik `grafik-startDate-endDate.xlsx`,
- dokument zawiera tytuĹ‚ `Grafik pracy`, zakres dat, datÄ™ wygenerowania, tabelÄ™ pracownikĂłw i dni oraz legendÄ™,
- jeĹ›li w runtime dostÄ™pne sÄ… moduĹ‚y Expo do plikĂłw i udostÄ™pniania, plik jest zapisywany lokalnie i przekazywany do systemowego udostÄ™pniania,
- w razie bĹ‚Ä™du aplikacja pokazuje komunikat `Nie udaĹ‚o siÄ™ wygenerowaÄ‡ pliku Excel.`

Przypadki kontrolne:

- dodanie, edycja, dezaktywacja i ponowna aktywacja pracownika,
- ukrycie nieaktywnych pracownikĂłw,
- utworzenie grafiku tygodniowego lub zakresu do 14 dni,
- zmiana komĂłrki na `1`, `1_12H`, `U`, `L4` i `0`,
- sprawdzenie, ĹĽe `1_12H` daje 12 godzin, a `U`, `L4` i `0` dajÄ… 0 godzin,
- kopiowanie grafiku z poprzedniego tygodnia z przesuniÄ™ciem `entryDate`,
- czyszczenie caĹ‚ego grafiku, dnia albo pracownika do `0`,
- eksport grafiku do Excel XLSX,
- automatyczne usunięcie grafików po ustawionej liczbie dni od daty zakończenia (domyślnie 28 dni) bez usuwania pracowników,
- `getScheduleEntriesForDates(dates)` zwraca dane po konkretnych datach i nie miesza tygodni.

## ModuĹ‚ BB i Place

ModuĹ‚ BB i Place dziaĹ‚a offline i zapisuje dane w SQLite (`expo-sqlite`) w bazie `liderapp.db`. Kod moduĹ‚u znajduje siÄ™ w `src/features/bb` i jest podzielony na komponenty, ekrany, repozytoria, serwisy, typy, walidacjÄ™, migracjÄ™ SQLite oraz helpery zakresĂłw BB.

GĹ‚Ăłwne wejĹ›cia:

- `/bb` w zakĹ‚adkach pokazuje aktywne BB, place, archiwum i import/eksport.
- `/bb/new` otwiera szybkie dodawanie BB.
- `/bb/photo` otwiera przepĹ‚yw dodawania BB przez wykonanie pojedynczego zdjÄ™cia i lokalny OCR.

Tabele SQLite:

- `yards` przechowuje place.
- `bb_records` przechowuje aktywne, archiwalne i podzielone zapisy BB.
- `app_settings` przechowuje m.in. `lastBbArchiveCleanupAt`, ostatni plac, ostatniÄ… liniÄ™ i lokalnÄ… kopiÄ™ przed importem zastÄ™pujÄ…cym.

Archiwum BB:

- archiwizacja ustawia `status = archived` i `archivedAt`,
- rekord moĹĽna przywrĂłciÄ‡ przez 7 dni,
- czyszczenie archiwum usuwa trwale rekordy starsze niĹĽ 7 dni i dziaĹ‚a maksymalnie raz dziennie,
- przed rÄ™cznym trwaĹ‚ym usuniÄ™ciem aplikacja pokazuje dodatkowe potwierdzenie.

Dzielenie partii BB:

- `splitBbRecord(recordId, splitAfterNumber)` wykonuje caĹ‚oĹ›Ä‡ w transakcji SQLite,
- oryginaĹ‚ dostaje `status = split` i `splitAt`,
- powstajÄ… dwa aktywne rekordy z `splitFromId` oraz zakresami, np. `BB 001-010` i `BB 011-020`,
- rekordy `split` nie sÄ… widoczne na gĹ‚Ăłwnej liĹ›cie aktywnych BB.

Import i eksport JSON:

- eksport tworzy strukturÄ™ `schemaVersion: 1`, `appName: LiderApp`, `dataType: bb_backup`, `yards` i `bbRecords`,
- domyĹ›lnie eksportowane sÄ… tylko aktywne BB oraz place potrzebne do przypisania BB,
- opcjonalnie moĹĽna eksportowaÄ‡ archiwum,
- import obsĹ‚uguje tryb poĹ‚Ä…czenia danych oraz zastÄ…pienia danych BB,
- przed zastÄ…pieniem danych aplikacja tworzy lokalnÄ… kopiÄ™ obecnych danych BB.

Dodawanie BB ze zdjÄ™cia i OCR:

- zdjÄ™cie jest wykonywane przez `expo-camera` po naciĹ›niÄ™ciu przycisku `ZrĂłb zdjÄ™cie`,
- aplikacja nie skanuje obrazu stale w trybie live,
- lokalny OCR jest wykonywany przez Google ML Kit Text Recognition (`@react-native-ml-kit/text-recognition`) dopiero po wykonaniu zdjÄ™cia,
- aplikacja nie wysyĹ‚a zdjÄ™Ä‡ do zewnÄ™trznego API,
- po OCR uĹĽytkownik widzi zdjÄ™cie, peĹ‚ny odczytany tekst oraz proponowane wartoĹ›ci,
- parser rozpoznaje zapis w stylu `L-I N339 P565499 BB11-23, plac 3`: `L-I` jako linia, `N339` jako rodzaj sadzy, `P565499` jako numer partii, `BB11-23` jako zakres i `plac 3` jako dopasowanie do istniejÄ…cego placu,
- wynik OCR nigdy nie jest zapisywany automatycznie: uĹĽytkownik musi potwierdziÄ‡ albo poprawiÄ‡ dane przed przejĹ›ciem do zapisu BB,
- ML Kit wymaga natywnego buildu/Expo Dev Client po instalacji paczki.

Przypadki kontrolne:

- dodanie, edycja i usuniÄ™cie placu,
- blokada usuniÄ™cia placu z aktywnymi BB,
- dodanie BB z poprawnym zakresem, pustÄ… paletÄ… i domyĹ›lnymi wartoĹ›ciami `strecz = nie`, `kapturownica = nie`,
- walidacja numeru partii, rodzaju sadzy, placu, linii i zakresu BB,
- wyszukiwanie po partii, sadzy, placu, zakresie i linii,
- filtrowanie po placu, linii, palecie, strechu i kapturownicy,
- ostrzeĹĽenia dla duplikatĂłw oraz nachodzÄ…cych zakresĂłw tej samej partii,
- archiwizacja, przywrĂłcenie i trwaĹ‚e usuniÄ™cie BB,
- automatyczne czyszczenie archiwum po 7 dniach,
- podziaĹ‚ `BB 001-020` na `BB 001-010` i `BB 011-020`,
- eksport aktywnych BB do JSON,
- import JSON w trybie poĹ‚Ä…czenia i zastÄ…pienia,
- OCR z rÄ™cznym potwierdzeniem danych.



