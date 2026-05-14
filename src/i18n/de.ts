const de: Record<string, string> = {
  // Common
  "common.edit": "Bearbeiten",
  "common.save": "Speichern",
  "common.cancel": "Abbrechen",
  "common.close": "Schließen",
  "common.total": "Gesamt",
  "common.currentYear": "(aktuelles Jahr)",
  "common.purchaseYear": "(Kaufjahr)",

  // Categories
  "category.computer": "Computer (Laptop, Telefon, Tablet)",
  "category.monitor": "Monitor",
  "category.furniture": "Möbel (Schreibtisch, Bürostuhl)",
  "category.other": "Sonstiges",

  // Layout
  "layout.taxYear": "Steuerjahr",
  "layout.menu": "Menü",
  "layout.subtitle": "Österreich — Einkommensteuererklärung (E1)",
  "layout.privacy":
    "Daten werden lokal gespeichert. Es gibt keine Datenweitergabe.",
  "layout.github": "GitHub",
  "layout.legal": "Impressum & Datenschutz",
  "nav.etrade": "eTrade Aktien",

  // Rechtliches
  "legal.title": "Impressum & Datenschutz",
  "legal.subtitle": "Impressum und Datenschutz",
  "legal.impressum.title": "Impressum (§ 25 Abs 5 MedienG)",
  "legal.impressum.body":
    "Medieninhaber: Areen Said\nStandort: Wien, Österreich\nKontakt: areen.said@outlook.com\nGegenstand: Kostenloses, nicht-kommerzielles, privates Hilfswerkzeug zur Erstellung der österreichischen Einkommensteuererklärung.",
  "legal.privacy.title": "Datenschutz",
  "legal.privacy.controller":
    "Verantwortlicher im Sinne der DSGVO: Areen Said, Wien, Österreich, areen.said@outlook.com.",
  "legal.privacy.local":
    "Alle von dir eingegebenen Daten werden ausschließlich im lokalen Speicher (Local Storage) deines Browsers auf deinem eigenen Gerät gespeichert und verlassen dieses nicht. Sie werden nicht an einen Server übertragen; der Verantwortliche hat keinen Zugriff darauf.",
  "legal.privacy.host":
    "Die Website wird bei der World4You Internet Services GmbH betrieben, die zur Auslieferung und Absicherung technische Zugriffsdaten (insbesondere die IP-Adresse) in Server-Logdateien verarbeiten kann (berechtigtes Interesse, Art. 6 Abs. 1 lit. f DSGVO). Zum Abruf der Wechselkurse wird eine Verbindung zur API der Europäischen Zentralbank hergestellt, die dabei deine IP-Adresse erhält.",
  "legal.privacy.rights":
    "Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie ein Widerspruchsrecht (Art. 21 DSGVO) gegen die auf berechtigtem Interesse beruhende Verarbeitung. Außerdem steht dir ein Beschwerderecht bei der österreichischen Datenschutzbehörde zu.",
  "legal.disclaimer.title": "Haftungsausschluss",
  "legal.disclaimer.body":
    "Dieses Werkzeug stellt keine Steuer-, Rechts- oder Finanzberatung dar und ersetzt nicht die Beratung durch eine Steuerberaterin oder einen Steuerberater. Die Berechnungen erfolgen nach bestem Wissen, jedoch ohne Gewähr für Richtigkeit, Vollständigkeit oder Aktualität. Steuerrecht ändert sich, und die Ergebnisse können Fehler enthalten. Die Verwendung erfolgt auf eigenes Risiko: Du bist allein dafür verantwortlich, sämtliche Werte vor der Übermittlung an die Finanzverwaltung selbst zu prüfen. Eine Haftung des Medieninhabers für Schäden, die aus der Nutzung oder der Unrichtigkeit der Ergebnisse entstehen, ist – soweit gesetzlich zulässig – ausgeschlossen.",

  "nav.afa": "Abschreibungen (AfA)",
  "nav.werbungskosten": "Werbungskosten",
  "nav.finanzonline": "FinanzOnline",

  // eTrade
  "etrade.title": "eTrade Aktien & RSUs",
  "etrade.subtitle": "Steuerjahr {year} — E1kv",
  "etrade.summary.title": "Zusammenfassung Kapitalerträge {year}",
  "etrade.summary.totalGains": "Gesamte Kursgewinne",
  "etrade.summary.totalLosses": "Gesamte Kursverluste",
  "etrade.summary.netGains": "Netto Kapitalgewinne",
  "etrade.summary.kest": "KeSt (27,5 %)",

  // Portfolio / Gleitender Durchschnittspreis
  "portfolio.info.title": "Wie wird der Gewinn berechnet?",
  "portfolio.info.avgLabel": "Gleitender Durchschnittspreis:",
  "portfolio.info.avgText":
    "Österreich verlangt den gleitenden Durchschnittspreis (<eStgLink>§ 27a EStG</eStgLink>). Jeder Zukauf (RSU-Vesting, ESPP-Kauf) aktualisiert die laufenden durchschnittlichen Anschaffungskosten über die gesamte Haltedauer hinweg; bei einem Verkauf wird der Gewinn gegen diesen Durchschnitt berechnet. eTrades Gain-&-Loss-Berichte (FIFO/Lot-Auswahl) sind dafür NICHT zulässig.",
  "portfolio.info.sourcesLabel": "Benötigte Dateien:",
  "portfolio.info.sourcesText":
    "BenefitHistory.xlsx (ESPP-Käufe und RSU-Vestings) und Trade-Confirmation-PDFs (Verkäufe). Nur mit der vollständigen Zukaufs-Historie ist der Durchschnitt korrekt.",
  "portfolio.info.currencyText":
    "Verwende den <link>EZB-Referenzkurs</link> des jeweiligen Tages.",
  "portfolio.info.lossText":
    "<b>Verluste</b> können mit Gewinnen im selben Jahr ausgeglichen werden.",
  "portfolio.type.VEST": "Vesting (RSU)",
  "portfolio.type.BUY": "ESPP-Kauf",
  "portfolio.type.EXERCISE": "Optionsausübung",
  "portfolio.type.SELL": "Verkauf",
  "portfolio.deleteAll": "Alle löschen",
  "portfolio.section.title": "Depot-Bewegungen",
  "portfolio.section.subtitle":
    "Alle Vestings, ESPP-Käufe und Verkäufe über alle Jahre — gleitender Durchschnitt, Grundlage für Kennzahl 994/892",
  "portfolio.importBtn": "eTrade-Dateien importieren",
  "portfolio.addManual": "Manuell hinzufügen",
  "portfolio.empty":
    "Noch keine Depot-Bewegungen. Importiere deine eTrade-Dateien (BenefitHistory.xlsx + Trade-Confirmations).",
  "portfolio.deleteAllConfirm":
    "Wirklich ALLE Depot-Bewegungen löschen? Das betrifft alle Jahre.",
  "portfolio.col.date": "Datum",
  "portfolio.col.type": "Typ",
  "portfolio.col.shares": "Stück",
  "portfolio.col.priceUSD": "Kurs (USD)",
  "portfolio.col.priceEUR": "Kurs (EUR)",
  "portfolio.col.rate": "EZB-Kurs",
  "portfolio.col.totalShares": "Bestand",
  "portfolio.col.avgCost": "Ø-Kosten (EUR)",
  "portfolio.col.gainLoss": "Gewinn/Verlust",
  "portfolio.col.year": "Jahr",
  "portfolio.col.gains": "Gewinne",
  "portfolio.col.losses": "Verluste",
  "portfolio.col.kest": "KeSt (27,5 %)",
  "portfolio.import.title": "eTrade-Dateien importieren",
  "portfolio.import.subtitle":
    "BenefitHistory.xlsx und Trade-Confirmation-PDFs hochladen — der gleitende Durchschnitt wird automatisch berechnet",
  "portfolio.import.processing": "Dateien werden verarbeitet …",
  "portfolio.import.drag":
    "Dateien hierher ziehen oder klicken (mehrere möglich)",
  "portfolio.import.formats": "BenefitHistory.xlsx · Trade-Confirmations",
  "portfolio.import.where.title": "Welche Dateien brauchst du?",
  "portfolio.import.where.espp":
    "BenefitHistory.xlsx — ESPP-Käufe und RSU-Vestings (erweiterte Version herunterladen, nicht die reduzierte).",
  "portfolio.import.where.orders":
    "Trade-Confirmation-PDFs — Verkäufe (Dokumenttyp auf „Trade Confirmation“ filtern, Zeitraum wählen, Filter anwenden, alle eines Jahres als eine PDF herunterladen; pro Jahr wiederholen).",
  "portfolio.import.openOnEtrade": "Bei eTrade öffnen",
  "portfolio.import.where.note":
    "Wichtig: Importiere die VOLLSTÄNDIGE Historie ab dem ersten Vesting/Kauf — sonst stimmt der Durchschnitt nicht.",
  "portfolio.import.script.title": "Lieber automatisch herunterladen?",
  "portfolio.import.script.desc":
    "Optionales Helfer-Skript (Node + Playwright). Es öffnet ein echtes Browser-Fenster, du loggst dich selbst ein (inkl. 2FA), dann lädt es BenefitHistory.xlsx und die Trade Confirmations (eine Datei pro Jahr) automatisch herunter. Alles bleibt lokal. In einem leeren Ordner ausführen:",
  "portfolio.import.script.download":
    "Helfer-Skript herunterladen (etrade-download.mjs)",
  "portfolio.import.loadedFiles": "Geladene Dateien",
  "portfolio.import.duplicateFile":
    "{name}: bereits hinzugefügt – übersprungen.",
  "portfolio.import.ratesError":
    "EZB-Kurse konnten nicht geladen werden: {error}",
  "portfolio.import.missingRates":
    "Für folgende Daten fehlt ein EZB-Kurs: {dates}. Bitte erneut versuchen oder den Kurs manuell ergänzen.",
  "portfolio.import.yearSummary": "Vorschau: Kapitalerträge pro Jahr",
  "portfolio.import.finalPosition":
    "Aktueller Bestand: {shares} Stück · Ø-Anschaffungskosten {avg}",
  "portfolio.import.commit": "{count} neue Bewegungen importieren",
  "portfolio.import.cancel": "Abbrechen",
  "portfolio.manual.title": "Depot-Bewegung manuell hinzufügen",
  "portfolio.manual.type": "Typ",
  "portfolio.manual.date": "Datum",
  "portfolio.manual.shares": "Stück",
  "portfolio.manual.priceUSD": "Kurs pro Aktie (USD)",
  "portfolio.manual.ecbRate": "EZB-Kurs USD→EUR am Datum",
  "portfolio.manual.notes": "Notiz (optional)",
  "portfolio.manual.priceEURPreview": "Kurs in EUR",

  "etrade.otherBroker.title": "Verlustausgleich mit anderen Brokern",
  "etrade.otherBroker.subtitle":
    "z.B. Flatex, Dadat, BAWAG — österr. Broker mit automatischer KeSt-Abführung",
  "etrade.otherBroker.gainsLabel": "Kursgewinne (EUR)",
  "etrade.otherBroker.gainsHint":
    "Realisierte Gewinne aus der Jahresabrechnung deines österr. Brokers",
  "etrade.otherBroker.lossesLabel": "Kursverluste (EUR)",
  "etrade.otherBroker.lossesHint":
    "Realisierte Verluste aus der Jahresabrechnung deines österr. Brokers",
  "etrade.otherBroker.paidKestLabel": "Bereits abgeführte KeSt (EUR)",
  "etrade.otherBroker.paidKestHint":
    "KeSt die dein Broker automatisch ans Finanzamt abgeführt hat",

  "flatexImport.button": "Flatex PDF importieren",
  "flatexImport.drag":
    "Flatex Steuerbescheinigung PDF hierher ziehen oder klicken",
  "flatexImport.processing": "PDF wird analysiert...",
  "flatexImport.scanned":
    "Gescanntes PDF erkannt — Textextraktion nicht möglich. Bitte Felder manuell befüllen.",
  "flatexImport.fetchError": "Fehler beim Lesen des PDFs: {error}",
  "flatexImport.gains": "Realisierte Gewinne",
  "flatexImport.losses": "Realisierte Verluste",
  "flatexImport.net": "Netto Gewinn/Verlust",
  "flatexImport.paidKest": "Abgeführte KeSt",
  "flatexImport.apply": "Werte übernehmen",
  "flatexImport.showRaw": "PDF-Text anzeigen (zur Kontrolle)",
  "flatexImport.loadOther": "Andere PDF laden",
  "flatexImport.warning":
    "Bitte Werte vor dem Übernehmen prüfen — automatische Erkennung ist nicht immer exakt.",

  // AfA
  "afa.title": "Abschreibungen (AfA)",
  "afa.subtitle": "Steuerjahr {year} — Arbeitsmittel & Wirtschaftsgüter",
  "afa.assets.title": "Wirtschaftsgüter",
  "afa.assets.add": "Neues Wirtschaftsgut hinzufügen",
  "afa.form.title": "Wirtschaftsgut hinzufügen",
  "afa.form.description": "Beschreibung",
  "afa.form.category": "Kategorie",
  "afa.form.purchaseDate": "Kaufdatum",
  "afa.form.price": "Kaufpreis brutto (EUR inkl. MwSt.)",
  "afa.form.usefulLife": "Nutzungsdauer (Jahre)",
  "afa.form.usefulLifeHint": "Standard: {years} Jahre für {category}",
  "afa.form.businessUse": "Berufliche Nutzung (%)",
  "afa.form.businessUseHint":
    "Bei 100% beruflicher Nutzung ist der Abzug maximal",
  "afa.form.method": "Abschreibungsmethode",
  "afa.form.methodLinear": "Linear (gleichmäßig)",
  "afa.form.methodDegressive":
    "Degressiv (30 % fallend, für Anschaffungen ab Juli 2020)",
  "afa.form.gwgTitle": "Geringwertiges Wirtschaftsgut (GWG)",
  "afa.form.gwgText": "— Sofortabzug von {amount} im Kaufjahr möglich.",
  "afa.form.afaRequired": "AfA erforderlich (Preis über €{limit})",
  "afa.form.totalDeductible": "Abziehbarer Betrag gesamt:",
  "afa.form.annualLinear": "Jährliche Abschreibung (linear):",
  "afa.form.h1":
    "Kauf im 1. Halbjahr (Jän.–Juni) → volle Jahres-AfA: {amount} ab Kaufjahr (§16 Abs. 1 Z 8 lit. b EStG)",
  "afa.form.h2":
    "Kauf im 2. Halbjahr (Juli–Dez.) → Halbjahres-AfA: {amount} im Kaufjahr + {rest} im Abschluss-Jahr (§16 Abs. 1 Z 8 lit. b EStG)",

  "afa.col.name": "Bezeichnung",
  "afa.col.category": "Kategorie",
  "afa.col.categoryHint":
    '<b>Möbel:</b> Hier können nur Aufwendungen für ein steuerlich anerkanntes Arbeitszimmer abgeschrieben werden — ein eigener, klar abgegrenzter Raum, der nahezu ausschließlich beruflich genutzt wird. Für Homeoffice-Einrichtung (Schreibtisch, Bürostuhl usw.) bitte auf der Seite „Werbungskosten" eintragen (bis €300/Jahr absetzbar). (<link16>§16 Abs. 1 Z 7a EStG</link16>; <link20>§20 Abs. 1 Z 2 lit. d</link20>)',
  "afa.col.date": "Kaufdatum",
  "afa.col.price": "Kaufpreis",
  "afa.col.business": "Beruflich",
  "afa.col.type": "Typ",
  "afa.col.deduction": "Abzug {year}",
  "afa.gwgBadge": "GWG Sofortabzug",
  "afa.afaBadge": "AfA {years} J.",
  "afa.plan.title": "Abschreibungsplan",
  "afa.plan.year": "Jahr",
  "afa.plan.deduction": "Abschreibung",
  "afa.plan.bookValue": "Restwert",
  "afa.total": "Gesamt AfA-Abzug {year}",
  "afa.empty": "Noch keine Wirtschaftsgüter eingetragen",
  "afa.emptySubtitle": "Füge z.B. ein Telefon, Laptop oder Möbel hinzu",
  "afa.summary.title": "AfA-Abzug Steuerjahr {year}",
  "afa.summary.note":
    "Fließt in die Kennzahl 169 (digitale Arbeitsmittel) bzw. 724 (sonstige Werbungskosten)",

  // Werbungskosten
  "wk.title": "Werbungskosten",
  "wk.subtitle": "Steuerjahr {year} — Abzugsfähige Ausgaben als Arbeitnehmer",

  "wk.furniture.title": "Ergonomisches Mobiliar",
  "wk.furniture.subtitle":
    "Homeoffice-Einrichtung — max. €300 pro Jahr — KZ 158",
  "wk.furniture.law":
    "§16 Abs. 1 Z 7a EStG — nur bei mind. 26 Homeoffice-Tagen",
  "wk.furniture.cost": "Ausgaben Ergonomie-Mobiliar dieses Jahr (EUR)",
  "wk.furniture.costHint":
    "Schreibtisch, Bürostuhl, Beleuchtung — tatsächliche Kosten (Belege aufheben!)",
  "wk.furniture.carryOver": "Übertrag aus Vorjahr (EUR)",
  "wk.furniture.carryOverHint": "Nicht verbrauchter Rest aus dem Vorjahr",
  "wk.furniture.available": "Gesamt verfügbar",
  "wk.furniture.deduction": "Abzug dieses Jahr",
  "wk.furniture.nextCarryOver": "Übertrag ins nächste Jahr",
  "wk.furniture.carryOverNote": "Ins nächste Jahr übertragen",

  "wk.internet.title": "Internet",
  "wk.internet.subtitle": "Beruflicher Anteil der Internetkosten — KZ 169",
  "wk.internet.law": "§16 Abs. 1 Z 8 EStG",
  "wk.internet.monthly": "Monatliche Internetkosten brutto",
  "wk.internet.monthlyHint":
    "Gesamtkosten deines Internetanschlusses pro Monat",
  "wk.internet.workPercent": "Beruflicher Nutzungsanteil",
  "wk.internet.workPercentHint": "Typisch: 50–80 % bei regelmäßigem Homeoffice",
  "wk.internet.annual": "Jahreskosten:",
  "wk.internet.workShare": "Beruflicher Anteil ({pct}%):",

  "wk.union.title": "Gewerkschaft & Berufsverbände",
  "wk.union.subtitle": "Mitgliedsbeiträge — KZ 717",
  "wk.union.law":
    "§16 Abs. 1 Z 3 EStG — vollständig absetzbar, kein €132-Selbstbehalt",
  "wk.union.label": "Jahresbeitrag gesamt (EUR)",
  "wk.union.labelHint": "Gewerkschaft und Berufsverbands-Mitgliedschaften",
  "wk.union.examples": "Beispiele:",
  "wk.union.exNote": "Achtung: Betriebsratsumlage gehört in KZ 724",
  "wk.union.ex1": "• Gewerkschaftsbeitrag (GPA, vida, etc.)",
  "wk.union.ex2": "• Berufsverband-Mitgliedschaft",
  "wk.union.ex3": "• Interessenvertretungen",

  "wk.literature.title": "Fachliteratur",
  "wk.literature.subtitle":
    "Beruflich notwendige Bücher & Fachzeitschriften — KZ 720",
  "wk.literature.law": "§16 Abs. 1 Z 6 EStG — muss beruflichen Bezug haben",
  "wk.literature.label": "Ausgaben Fachliteratur (EUR)",
  "wk.literature.labelHint":
    "Nur beruflich relevante Literatur — allgemeine Bücher sind nicht absetzbar",
  "wk.literature.examples": "Beispiele:",
  "wk.literature.ex1": "• Fachbücher (z.B. Programmierbücher)",
  "wk.literature.ex2": "• Fachzeitschriften & -magazine",
  "wk.literature.ex3": "• Online-Fachdatenbanken (Jahresabo)",

  "wk.training.title": "Fortbildungs- & Ausbildungskosten",
  "wk.training.subtitle": "Kurse, Seminare, Umschulung — KZ 722",
  "wk.training.law":
    "§16 Abs. 1 Z 10 EStG — muss beruflichen Zusammenhang haben",
  "wk.training.label": "Fortbildungskosten gesamt (EUR)",
  "wk.training.labelHint":
    "Kursgebühren, Seminarkosten, Prüfungsgebühren — Belege aufheben",
  "wk.training.examples": "Beispiele:",
  "wk.training.exNote":
    "Voraussetzung: Kurs muss für deinen aktuellen Beruf nützlich sein",
  "wk.training.ex1": "• Sprachkurse (wenn beruflich notwendig)",
  "wk.training.ex2": "• Fachkurse & Zertifizierungen",
  "wk.training.ex3": "• Online-Lernplattformen (Udemy, Coursera etc.)",
  "wk.training.ex4": "• Kongresse & Fachtagungen",

  "wk.travel.title": "Berufliche Reisekosten",
  "wk.travel.subtitle":
    "Dienstreisen, die nicht vom Arbeitgeber erstattet wurden — KZ 721",
  "wk.travel.law":
    "§16 Abs. 1 Z 9 EStG — Fahrten zur Arbeit gehören nicht hierher (→ Pendlerpauschale KZ 718)",
  "wk.travel.label": "Nicht erstattete Reisekosten (EUR)",
  "wk.travel.labelHint":
    "Fahrtkosten, Tages- und Nächtigungsgelder für Dienstreisen",
  "wk.travel.examples": "Was gehört hierher:",
  "wk.travel.exNote": "Nur der Teil, den der Arbeitgeber nicht erstattet hat",
  "wk.travel.ex1": "• Fahrtkosten für Dienstreisen (Bahn, Flug, km-Geld)",
  "wk.travel.ex2": "• Tagesgeld bei Dienstreisen über 25 km",
  "wk.travel.ex3": "• Nächtigungskosten",

  "wk.other.title": "Sonstige Werbungskosten",
  "wk.other.subtitle": "Alles, was oben nicht erfasst ist — KZ 724",
  "wk.other.law": "§16 Abs. 1 EStG — Sammelposten",
  "wk.other.label": "Sonstige Werbungskosten gesamt (EUR)",
  "wk.other.examples": "Was hierher gehört:",
  "wk.other.ex1": "• Betriebsratsumlage",
  "wk.other.ex2": "• Bewerbungskosten",
  "wk.other.ex3": "• Berufskleidung (nur spezifische Arbeitskleidung)",

  "wk.summary.title": "Werbungskosten-Übersicht {year}",
  "wk.summary.furniture": "Ergonomisches Mobiliar",
  "wk.summary.internet": "Internet (beruflicher Anteil)",
  "wk.summary.union": "Gewerkschaft & Berufsverbände",
  "wk.summary.literature": "Fachliteratur",
  "wk.summary.training": "Fortbildungskosten",
  "wk.summary.travel": "Berufliche Reisekosten",
  "wk.summary.other": "Sonstige Werbungskosten",
  "wk.summary.afaNote": "+ AfA-Abschreibungen (siehe AfA-Seite)",
  "wk.summary.subtotal": "Zwischensumme Werbungskosten",
  "wk.summary.hint":
    "Hinweis: Automatische Werbungskostenpauschale (€132) wird vom Finanzamt berücksichtigt — nur wenn deine Werbungskosten höher sind, lohnt sich die Aufstellung.",

  // FinanzOnline
  "fo.title": "FinanzOnline Anleitung",
  "fo.subtitle": "Steuerjahr {year} — Schritt-für-Schritt Eintragung",
  "fo.open": "FinanzOnline öffnen",
  "fo.openSubtitle": "Einkommensteuererklärung (E1) {year}",
  "fo.openButton": "FinanzOnline",
  "fo.overview.title": "Deine Kennzahlen im Überblick",
  "fo.kz994": "Kursgewinne Ausland (E1kv)",
  "fo.kz892": "Kursverluste Ausland (E1kv)",
  "fo.kz981": "Kursgewinne Inland (E1kv)",
  "fo.kz891": "Kursverluste Inland (E1kv)",
  "fo.kz899": "Einbehaltene KESt Inland (E1kv)",
  "fo.kz158": "Ergonomisches Mobiliar",
  "fo.kz169": "Digitale Arbeitsmittel + Internet",
  "fo.kz717": "Gewerkschaft & Berufsverbände",
  "fo.kz720": "Fachliteratur",
  "fo.kz722": "Fortbildungskosten",
  "fo.kz721": "Berufliche Reisekosten",
  "fo.kz724": "Sonstige Werbungskosten + Möbel-AfA",
  "fo.steps.title": "Schritt-für-Schritt Anleitung",
  "fo.step1.title": "Anmelden bei FinanzOnline",
  "fo.step1.1": "1. Gehe zu finanzonline.bmf.gv.at",
  "fo.step1.2":
    "2. Melde dich mit Handy-Signatur, ID Austria oder deinen Zugangsdaten an",
  "fo.step1.3": '3. Klicke auf „Erklärungen" → „Einkommensteuererklärung (E1)"',
  "fo.step3.title": "Kapitalerträge",
  "fo.step3.text":
    'Kapitalerträge findest du unter „Außerbetriebliche Einkunftsarten" → „Einkünfte aus Kapitalvermögen — Beilage E1kv". Diese Beilage ist für Kapitalerträge aus in- und ausländischen Wertpapieren.',
  "fo.step3.formTitle": "Einkünfte aus Kapitalvermögen — Beilage E1kv",
  "fo.step3.foreignSection": "Ausländische Kapitaleinkünfte",
  "fo.step3.domesticSection": "Inländische Kapitaleinkünfte",
  "fo.step3.taxesSection": "Einbehaltene Steuern",
  "fo.step3.kz994label":
    "Realisierte Wertsteigerungen aus ausländischen Kapitalanlagen",
  "fo.step3.kz994note":
    "Summe aller Kursgewinne aus Verkäufen bei ausländischen Brokern (z.B. eTrade)",
  "fo.step3.kz892label":
    "Verluste aus realisierten Wertsteigerungen aus ausländischen Kapitalanlagen",
  "fo.step3.kz892note":
    "Summe aller Kursverluste aus Verkäufen bei ausländischen Brokern",
  "fo.step3.kz981label":
    "Realisierte Wertsteigerungen aus inländischem Kapitalvermögen",
  "fo.step3.kz981note":
    "Summe aller Kursgewinne aus Verkäufen bei österr. Brokern (z.B. Flatex)",
  "fo.step3.kz891label":
    "Verluste aus realisierten Wertsteigerungen aus inländischem Kapitalvermögen",
  "fo.step3.kz891note":
    "Summe aller Kursverluste aus Verkäufen bei österr. Brokern",
  "fo.step3.kz899label": "Inländische einbehaltene Kapitalertragsteuer",
  "fo.step3.kz899note":
    "KESt bereits abgeführt von österr. Broker (z.B. Flatex) — wird vom Finanzamt gutgeschrieben",
  "fo.step3.howTitle": "Wie du den Wert ermittelst (eTrade):",
  "fo.step3.totalGains": "Gesamte Kursgewinne: {amount}",
  "fo.step3.totalLosses": "− Gesamte Kursverluste: −{amount}",
  "fo.step3.netGains": "= Netto Kursgewinne: {amount}",
  "fo.step3.kest":
    "Die KeSt (27,5 %) berechnet das Finanzamt automatisch: {amount}",
  "fo.step3.transTitle": "Einzelne Transaktionen (für deine Unterlagen):",
  "fo.step3.col.date": "Datum",
  "fo.step3.col.description": "Beschreibung",
  "fo.step3.col.shares": "Stück",
  "fo.step3.col.revenueEUR": "Erlös (EUR)",
  "fo.step3.col.gainLoss": "Gewinn/Verlust",
  "fo.step3.shares": "{shares} Aktien",
  "fo.step4.title": "Werbungskosten",
  "fo.step4.text":
    'Werbungskosten findest du unter „Außerbetriebliche Einkunftsarten" → „Einkünfte aus nichtselbständiger Arbeit (Werbungskosten)". Trage dort folgende Beträge ein:',
  "fo.step4.formTitle":
    "Einkünfte aus nichtselbständiger Arbeit (Werbungskosten)",
  "fo.step4.kz169label":
    "Digitale Arbeitsmittel (Geräte-AfA + Internet + Arbeitsmittel)",
  "fo.step4.kz169note":
    "Computer, Telefon, Tablet, Monitor (AfA) + Internet (beruflicher Anteil) + Zubehör",
  "fo.step4.kz158label": "Ergonomisches Mobiliar (Homeoffice)",
  "fo.step4.kz158note": "Schreibtisch, Bürostuhl — max. €300 pro Jahr",
  "fo.step4.kz717label": "Gewerkschaft & Berufsverbände",
  "fo.step4.kz717note":
    "Gewerkschaftsbeiträge, Berufsverbands-Mitgliedschaften",
  "fo.step4.kz720label": "Fachliteratur",
  "fo.step4.kz720note": "Beruflich notwendige Bücher, Fachzeitschriften",
  "fo.step4.kz722label": "Fortbildungs- & Ausbildungskosten",
  "fo.step4.kz722note":
    "Kurse, Seminare, Sprachkurse (beruflich), Zertifizierungen",
  "fo.step4.kz721label": "Berufliche Reisekosten",
  "fo.step4.kz721note":
    "Dienstreisen — nur nicht vom Arbeitgeber erstatteter Anteil",
  "fo.step4.kz724label": "Sonstige Werbungskosten",
  "fo.step4.kz724note": "Betriebsratsumlage, Bewerbungskosten + Möbel-AfA",
  "fo.stepFinal.title": "Abschicken und warten",
  "fo.stepFinal.1": "1. Überprüfe alle Angaben nochmals",
  "fo.stepFinal.2":
    '2. Klicke auf „Vorschau" um die Erklärung zu kontrollieren',
  "fo.stepFinal.3": '3. Klicke auf „Einreichen"',
  "fo.stepFinal.4":
    "4. Du erhältst den Steuerbescheid innerhalb weniger Wochen per Post oder in FinanzOnline",
  "fo.stepFinal.deadline":
    "<b>Frist:</b> Bei Pflichtveranlagung (z.B. ausländische Kapitalerträge ohne KESt-Abzug über €730) ist die Einkommensteuererklärung bis 30. April des Folgejahres – bei elektronischer Abgabe über FinanzOnline bis 30. Juni – einzureichen.",
  "fo.copy": "Kopieren",

  // PDF Export
  "pdf.export": "Als PDF exportieren",
  "pdf.generated": "Erstellt am {date}",
  "pdf.footer": "Erstellt mit Steuerhelfer",
  "pdf.description": "Beschreibung",
  "pdf.amount": "Betrag (EUR)",
  "pdf.formE1kv": "Formular E1kv — Kapitalerträge",
  "pdf.formE1": "Formular E1 — Werbungskosten",
  "pdf.capital.title": "Kapitalerträge (E1kv)",
  "pdf.kestEstimate": "Geschätzte KeSt (27,5 %)",
  "pdf.wk.detail": "Werbungskosten Aufstellung",
  "pdf.afa.title": "AfA Abschreibungen",

  // PDF import (used in AssetForm)
  "invoiceImport.drag": "Rechnung (PDF) hierher ziehen oder klicken",
  "invoiceImport.processing": "PDF wird analysiert...",
  "invoiceImport.onlyPdf": "Nur PDF-Dateien werden unterstützt.",
  "invoiceImport.fetchError": "Fehler beim Lesen des PDFs: {error}",
  "invoiceImport.scanned":
    "Gescanntes PDF erkannt — Textextraktion nicht möglich. Bitte Felder manuell befüllen.",
  "invoiceImport.success":
    "PDF erfolgreich analysiert. Bitte Werte prüfen und bei Bedarf korrigieren.",
  "invoiceImport.showRaw": "Extrahierter PDF-Text anzeigen (zur Kontrolle)",
  "invoiceImport.loadOther": "Anderes PDF laden",

  // Confidence
  "confidence.high": "Sicher erkannt",
  "confidence.medium": "Unsicher — bitte prüfen",
  "confidence.low": "Nicht gefunden",
};

export default de;
