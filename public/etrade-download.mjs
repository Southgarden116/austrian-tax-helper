#!/usr/bin/env node
// ===========================================================================
// Steuerhelfer — eTrade file downloader
// ===========================================================================
// Downloads the two files Steuerhelfer needs for the moving-average
// capital-gains calculation:
//
//   1. BenefitHistory.xlsx          (ESPP buys + RSU vests)   — fully automated
//   2. TradeConfirmations_<year>.pdf (sells, one file/year)   — guided + auto-saved
//
// It opens a REAL Chrome window so you can log in (incl. 2FA) yourself. After
// the first login the session is saved to ./etrade-session.json and reused, so
// re-runs skip the login. Nothing is sent anywhere — everything stays on your
// machine.
//
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// HOW TO RUN
//
// A) You cloned the Steuerhelfer repo (this file lives in public/):
//
//      npm install                 # installs Playwright (already a dev dep)
//      npm run etrade:setup        # one time — downloads the Chromium browser
//      npm run etrade:download             # last 5 years
//      npm run etrade:download -- 2022 2023 # specific years
//
// B) You only have this single file (downloaded from the app) — run it in an
//    empty folder next to the file:
//
//      npm install playwright
//      npx playwright install chromium
//      node etrade-download.mjs                 # last 5 years
//      node etrade-download.mjs 2022 2023 2024  # specific years
//
// Flags (e.g. `npm run etrade:download -- --fresh`):
//   --fresh    discard the saved session and log in again. Use this if the
//              document centre stops listing documents (a reused session can go
//              stale / get throttled even though a new browser still works).
//   --inspect  dump the document-centre controls instead of downloading —
//              used to wire up / debug the automation.
//
// The files land in ./etrade-files/ — drag them into Steuerhelfer's importer.
// ===========================================================================

import { chromium } from "playwright";
import { mkdirSync, existsSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import readline from "node:readline";

const SESSION_FILE = resolve("etrade-session.json");
const OUTPUT_DIR = resolve("etrade-files");

const LOGIN_URL =
  "https://us.etrade.com/etx/sp/stockplan#/myAccount/benefitHistory";
const BENEFIT_HISTORY_URL =
  "https://us.etrade.com/etx/sp/stockplan#/myAccount/benefitHistory";
const DOC_CENTER_URL = "https://edoc.etrade.com/e/t/onlinedocs/docsearch";

// `--inspect` dumps the document-centre HTML + a list of candidate form
// controls, so the trade-confirmation steps can be turned into real clicks.
const INSPECT = process.argv.includes("--inspect");

// `--fresh` discards the saved session and logs in anew. Use this if the
// document centre stops listing documents — a reused session can go stale or
// get throttled by eTrade, even though a brand-new browser still works.
const FRESH = process.argv.includes("--fresh");

// Years to fetch trade confirmations for. Override via CLI args. Default is the
// last 5 years (the current year is included but skipped automatically, since
// it isn't offered as a filter option until it's over).
const years = process.argv
  .slice(2)
  .map(Number)
  .filter((y) => y > 2000);
if (years.length === 0) {
  const now = new Date().getFullYear();
  for (let y = now; y >= now - 5; y--) years.push(y);
  years.reverse();
}

function waitForEnter(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((res) =>
    rl.question(`\n👉 ${message}\n   Press ENTER here when done… `, () => {
      rl.close();
      res();
    }),
  );
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  // Drop a stale/throttled session when asked, forcing a clean login.
  if (FRESH && existsSync(SESSION_FILE)) {
    rmSync(SESSION_FILE);
    console.log("Discarded saved session (--fresh) — you'll log in again.");
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(
    existsSync(SESSION_FILE) ? { storageState: SESSION_FILE } : {},
  );
  const page = await context.newPage();

  // Auto-save every download into OUTPUT_DIR. We rename trade-confirmation
  // downloads per year below; everything else keeps its suggested name. If a
  // year ever yields several files, later ones get a _2, _3… suffix instead of
  // overwriting.
  let downloadNameOverride = null;
  page.on("download", async (download) => {
    const name = downloadNameOverride ?? download.suggestedFilename();
    let dest = resolve(OUTPUT_DIR, name);
    if (existsSync(dest)) {
      const dot = name.lastIndexOf(".");
      const base = dot > 0 ? name.slice(0, dot) : name;
      const ext = dot > 0 ? name.slice(dot) : "";
      let k = 2;
      do dest = resolve(OUTPUT_DIR, `${base}_${k++}${ext}`);
      while (existsSync(dest));
    }
    await download.saveAs(dest);
    console.log(`   ✓ saved ${dest.split(/[\\/]/).pop()}`);
  });

  // --- 1. Log in (manual, once) -------------------------------------------
  console.log("\nOpening eTrade… log in if prompted (incl. 2FA).");
  await page.goto(LOGIN_URL);
  try {
    await page.waitForURL(
      (url) => `${url}`.includes("stockplan") && !`${url}`.includes("login"),
      {
        timeout: 15000,
      },
    );
  } catch {
    await waitForEnter(
      "Log in to eTrade in the browser window until you see your Stock Plan.",
    );
  }
  // Persist the session so the next run skips login.
  await context.storageState({ path: SESSION_FILE });

  // --- 2. BenefitHistory.xlsx (expanded) — fully automated ----------------
  console.log("\nDownloading BenefitHistory.xlsx (expanded)…");
  try {
    await page.goto(BENEFIT_HISTORY_URL);
    await page
      .getByRole("button", { name: "Download" })
      .waitFor({ timeout: 20000 });
    downloadNameOverride = "BenefitHistory.xlsx";
    await page.getByRole("button", { name: "Download" }).click();
    await page.getByRole("menuitem", { name: "Download Expanded" }).click();
    // give the download handler a moment to flush
    await page.waitForTimeout(2500);
  } catch (e) {
    console.log(`   ⚠ Could not auto-download BenefitHistory: ${e.message}`);
    console.log("     Do it manually: click Download → 'Download Expanded'.");
    await waitForEnter("Download the EXPANDED BenefitHistory in the browser.");
  } finally {
    downloadNameOverride = null;
  }

  // --- 3. Trade confirmations — one PDF per year (guided) -----------------
  // The document centre's filters/selectors aren't stable enough to click
  // blindly, so we navigate there once and walk you through each year. Each
  // file you download is saved automatically with the right name.
  console.log("\nNow the trade confirmations — ONE combined PDF per year.");
  await page.goto(DOC_CENTER_URL);

  // --- Inspect mode: dump the page so exact selectors can be written --------
  if (INSPECT) {
    await waitForEnter(
      "Set Document Type = 'Trade Confirmation' and pick ONE year, click Apply, " +
        "and WAIT until the list of trade confirmations is visible on screen.",
    );

    const describe = (el) => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute("type"),
      id: el.id || null,
      testId: el.getAttribute("data-test-id"),
      ariaLabel: el.getAttribute("aria-label"),
      role: el.getAttribute("role"),
      text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
    });

    // 1) Filter dropdowns: open each mat-select, record its options, close it.
    const dropdowns = [];
    const matSelects = page.locator("mat-select");
    const n = await matSelects.count();
    for (let i = 0; i < n; i++) {
      const sel = matSelects.nth(i);
      const current =
        (await sel.textContent())?.replace(/\s+/g, " ").trim() ?? "";
      let options = [];
      try {
        await sel.click();
        await page.waitForTimeout(400);
        options = await page
          .locator("mat-option, [role=option]")
          .allTextContents()
          .then((a) => a.map((s) => s.replace(/\s+/g, " ").trim()));
        await page.keyboard.press("Escape");
        await page.waitForTimeout(200);
      } catch (e) {
        options = [`<could not open: ${e.message}>`];
      }
      dropdowns.push({ index: i, current, options });
    }

    // 2) Selection controls, captured with Playwright LOCATORS — these pierce
    //    open shadow DOM, which page.content()/querySelector cannot (eTrade's
    //    ms-* components render their checkboxes/buttons inside shadow roots).
    const grab = async (loc, max = 20) => {
      const total = await loc.count();
      const items = [];
      for (let i = 0; i < Math.min(total, max); i++) {
        const el = loc.nth(i);
        items.push({
          name:
            (await el.getAttribute("aria-label").catch(() => null)) ||
            (await el.innerText().catch(() => ""))
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 60),
          role: await el.getAttribute("role").catch(() => null),
          checked: await el.isChecked().catch(() => null),
          visible: await el.isVisible().catch(() => false),
        });
      }
      return { total, items };
    };

    const selection = {
      checkboxes: await grab(page.getByRole("checkbox")),
      switches: await grab(page.getByRole("switch")),
      downloadButtons: await grab(
        page.getByRole("button", { name: /download/i }),
      ),
      selectAllText: await grab(page.getByText(/select all/i)),
      confirmish: await grab(
        page.getByRole("button", {
          name: /combine|continue|confirm|submit|ok|download/i,
        }),
      ),
    };

    writeFileSync(
      resolve(OUTPUT_DIR, "doc-center-debug.html"),
      await page.content(),
    );
    writeFileSync(
      resolve(OUTPUT_DIR, "doc-center-controls.json"),
      JSON.stringify(
        {
          dropdowns,
          applyButton: await page
            .getByRole("button", { name: "Apply" })
            .first()
            .evaluate(describe)
            .catch(() => null),
          selection,
        },
        null,
        2,
      ),
    );
    console.log(
      `\n✅ Inspect dump written to:\n   ${OUTPUT_DIR}/doc-center-controls.json\n   ${OUTPUT_DIR}/doc-center-debug.html\n   Send the .json to your helper to enable full automation.`,
    );
    await browser.close();
    process.exit(0);
  }

  // The filter bar has three Angular-Material dropdowns, in order:
  //   [0] account   [1] document type   [2] timeframe
  // Their element ids are randomised per session, so we target them by index
  // and pick options by visible text. The active option is shown with a
  // "Selected " prefix, hence the `…$` regexes below match either form.
  const docTypeSel = page.locator("mat-select").nth(1);
  const timeSel = page.locator("mat-select").nth(2);

  // Open a mat-select and pick an option. Material options carry role="option",
  // so we match by ARIA name with a short timeout; if that misses we fall back
  // to the mat-select's built-in keyboard typeahead (type text → Enter).
  const selectFromDropdown = async (selLocator, nameRe, typeahead) => {
    await selLocator.click(); // open the overlay
    await page.waitForTimeout(600);
    try {
      await page
        .getByRole("option", { name: nameRe })
        .first()
        .click({ timeout: 4000 });
      await page.waitForTimeout(600);
      return true;
    } catch {
      /* fall through to typeahead */
    }
    try {
      await page.keyboard.type(typeahead, { delay: 60 });
      await page.waitForTimeout(400);
      await page.keyboard.press("Enter");
      await page.waitForTimeout(600);
      return true;
    } catch {
      await page.keyboard.press("Escape").catch(() => {});
      return false;
    }
  };

  // Document type → Trade Confirmations (once).
  try {
    const dt = ((await docTypeSel.textContent()) || "").trim();
    if (!/Trade Confirmations/.test(dt)) {
      const ok = await selectFromDropdown(
        docTypeSel,
        /Trade Confirmations/i,
        "Trade",
      );
      if (!ok) throw new Error("option not found");
    }
  } catch (e) {
    console.log(`   ⚠ Could not set Document Type automatically: ${e.message}`);
    await waitForEnter("Set Document Type = 'Trade Confirmations' yourself.");
  }

  // Read which years the timeframe filter offers — ONCE, here in a clean state
  // (no Download menu open yet). Doing this per-year right after a download was
  // unreliable: the leftover menu swallowed the click, the dropdown didn't open,
  // and a real year looked "unavailable". If this read fails, availableYears
  // stays empty and we treat every requested year as available.
  const availableYears = new Set();
  try {
    await timeSel.click();
    await page.waitForTimeout(600);
    for (const o of await page.getByRole("option").allTextContents()) {
      const m = o.match(/\b(20\d{2})\b/);
      if (m) availableYears.add(Number(m[1]));
    }
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(300);
  } catch {
    /* leave availableYears empty → don't skip anything */
  }
  if (availableYears.size > 0) {
    console.log(`Years offered by the filter: ${[...availableYears].sort().join(", ")}`);
  }

  for (const year of years) {
    console.log(`\n— Year ${year} —`);
    downloadNameOverride = `TradeConfirmations_${year}.pdf`;
    // Skip years the filter doesn't offer (e.g. the current year, until it's
    // over). Uses the list read once up front, so it never re-opens the dropdown
    // here right after a download.
    if (availableYears.size > 0 && !availableYears.has(year)) {
      console.log(`   – ${year} not offered by the filter, skipping.`);
      continue;
    }

    try {
      // The previous year's Download menu may still be open; an open menu would
      // swallow the first click on the year dropdown. Close anything lingering.
      await page.keyboard.press("Escape").catch(() => {});
      await page.waitForTimeout(300);

      // Pick the year (skip if already the active timeframe), and VERIFY it
      // actually changed — selecting can silently fail (typeahead reports
      // success, or a leftover menu eats the click), which would re-download the
      // previous year. Retry with an Escape between attempts.
      const yearText = () =>
        page
          .locator("mat-select")
          .nth(2)
          .textContent()
          .then((t) => (t || "").replace(/\s+/g, " ").trim());

      const needYear = (await yearText()) !== String(year);
      if (needYear) {
        const yearRe = new RegExp(`\\b${year}\\b`);
        for (let attempt = 0; attempt < 4 && (await yearText()) !== String(year); attempt++) {
          await page.keyboard.press("Escape").catch(() => {});
          await page.waitForTimeout(250);
          await selectFromDropdown(timeSel, yearRe, String(year));
          await page.waitForTimeout(400);
        }
        if ((await yearText()) !== String(year)) {
          throw new Error(`year stayed at "${await yearText()}", wanted ${year}`);
        }
      }

      // Apply whenever a filter changed — the year just now, and/or the document
      // type before the loop on the first iteration. Its accessible name flips
      // to "Apply" only once enabled, so we poll for it to become clickable.
      const apply = page.getByRole("button", { name: "Apply" }).first();
      for (
        let t = 0;
        t < 12 && !(await apply.isEnabled().catch(() => false));
        t++
      ) {
        await page.waitForTimeout(300);
      }
      if (await apply.isEnabled().catch(() => false)) {
        await apply.click();
        await page.waitForTimeout(3000); // let the results reload
      } else if (needYear) {
        throw new Error(`Apply never enabled for ${year}`);
      }

      // Years with no confirmations show "No documents match selected criteria"
      // and have no Download button — skip to the next year.
      const empty = await page
        .getByText(/no documents match/i)
        .first()
        .isVisible()
        .catch(() => false);
      if (empty) {
        console.log(`   – no confirmations for ${year}, skipping.`);
        continue;
      }

      // When a year has several confirmations the list shows one checkbox per
      // row (no "select all") and nothing downloads until they're all ticked.
      // (Single-document years have no checkbox — this just no-ops.)
      //
      // The inputs (<input id="ms-checkbox" type="checkbox">) are visually hidden
      // behind a styled label, so Playwright's .check()/.click() fail the
      // actionability checks AND scrolling to each one looks janky. Instead we
      // tick them all in-page in a single pass: el.click() toggles the box and
      // fires the change event Angular binds to, without any scrolling.
      const countChecked = () =>
        page
          .getByRole("checkbox")
          .evaluateAll((els) => els.filter((e) => e.checked).length)
          .catch(() => 0);

      const boxCount = await page.getByRole("checkbox").count();
      if (boxCount > 0) {
        await page
          .getByRole("checkbox")
          .evaluateAll((els) =>
            els.forEach((el) => {
              if (!el.checked) el.click();
            }),
          )
          .catch(() => {});
        await page.waitForTimeout(400);
        // Fallback for any that didn't take: tick them individually in-page.
        let checked = await countChecked();
        if (checked < boxCount) {
          const boxes = page.getByRole("checkbox");
          for (let i = 0; i < (await boxes.count()); i++) {
            await boxes
              .nth(i)
              .evaluate((el) => {
                if (!el.checked) el.click();
              })
              .catch(() => {});
          }
          checked = await countChecked();
        }
        console.log(`   selected ${checked}/${boxCount} confirmations`);
      }

      // The Download button (aria-haspopup) opens a menu; the option we want is
      // a <span role="menuitem"> "Download selections as one file" → one combined
      // PDF. The file is saved by the page.on("download") handler above.
      const dlBtn = page
        .locator("ms-documents-download-button")
        .getByRole("button", { name: "Download" })
        .first();

      // Open the menu and confirm via aria-expanded. A plain click sometimes
      // doesn't open these menu-buttons, so fall back to keyboard activation.
      let opened = false;
      for (let attempt = 0; attempt < 3 && !opened; attempt++) {
        await dlBtn.click().catch(() => {});
        await page.waitForTimeout(500);
        opened =
          (await dlBtn.getAttribute("aria-expanded").catch(() => null)) ===
          "true";
        if (!opened) {
          await dlBtn.focus().catch(() => {});
          await page.keyboard.press("Enter").catch(() => {});
          await page.waitForTimeout(400);
          opened =
            (await dlBtn.getAttribute("aria-expanded").catch(() => null)) ===
            "true";
        }
      }
      if (!opened) console.log("   ⚠ Download menu did not open.");

      const oneFile = page.getByRole("menuitem", {
        name: /selections as one file/i,
      });
      await oneFile.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});

      // Combining can take a few seconds, so allow a generous timeout.
      const downloadPromise = page.waitForEvent("download", { timeout: 60000 });
      await oneFile
        .click({ timeout: 5000 })
        .catch(() => oneFile.evaluate((el) => el.click()).catch(() => {}));
      await downloadPromise;
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log(`   ⚠ Auto-download failed for ${year}: ${e.message}`);
      await waitForEnter(
        `Do year ${year} by hand: set timeframe ${year}, Apply, then click Download.`,
      );
    } finally {
      downloadNameOverride = null;
    }
  }

  console.log(`\n✅ Done. Files are in:\n   ${OUTPUT_DIR}`);
  console.log(
    "   Drag BenefitHistory.xlsx + the TradeConfirmations_*.pdf into Steuerhelfer.",
  );
  await browser.close();
  process.exit(0);
}

main().catch((e) => {
  console.error("\nFehler / Error:", e);
  process.exit(1);
});
