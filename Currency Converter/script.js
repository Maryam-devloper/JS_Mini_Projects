// ===== Config =====
// Free, no-API-key endpoint. Updated roughly once a day with official mid-market rates.
// Their terms ask for attribution (already in index.html) and reasonable use —
// caching results for a few minutes is good practice so we don't hammer the free tier.
const API_BASE = "https://open.er-api.com/v6/latest/";

// A curated, friendly list of common currencies for the dropdowns.
// (The live API actually supports 160+ codes — add more rows here if you need them.)
const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "PKR", name: "Pakistani Rupee" },
  { code: "INR", name: "Indian Rupee" },
  { code: "AED", name: "UAE Dirham" },
  { code: "SAR", name: "Saudi Riyal" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "CNY", name: "Chinese Yuan" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "CHF", name: "Swiss Franc" },
  { code: "SGD", name: "Singapore Dollar" },
  { code: "MYR", name: "Malaysian Ringgit" },
  { code: "THB", name: "Thai Baht" },
  { code: "TRY", name: "Turkish Lira" },
  { code: "ZAR", name: "South African Rand" },
  { code: "NGN", name: "Nigerian Naira" },
  { code: "EGP", name: "Egyptian Pound" },
  { code: "BDT", name: "Bangladeshi Taka" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "KRW", name: "South Korean Won" },
  { code: "NZD", name: "New Zealand Dollar" },
  { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SEK", name: "Swedish Krona" },
  { code: "NOK", name: "Norwegian Krone" },
  { code: "DKK", name: "Danish Krone" },
  { code: "RUB", name: "Russian Ruble" },
  { code: "BRL", name: "Brazilian Real" },
  { code: "MXN", name: "Mexican Peso" },
];

// ===== DOM References =====
const fromSelect = document.querySelector(".from-currency");
const toSelect = document.querySelector(".to-currency");
const amountInput = document.querySelector(".amount-input");
const swapBtn = document.querySelector(".swap-btn");
const convertBtn = document.querySelector(".convert-btn");
const resultEl = document.querySelector(".result");
const tickerEl = document.querySelector(".rate-ticker");
const updatedEl = document.querySelector(".last-updated");

// ===== State =====
let cachedBase = null;
let cachedRates = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes, so switching back and forth doesn't refetch every time

// ===== Populate the two dropdowns =====
function populateSelect(selectEl, defaultCode) {
  CURRENCIES.forEach(({ code, name }) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = `${code} — ${name}`;
    if (code === defaultCode) option.selected = true;
    selectEl.appendChild(option);
  });
}

populateSelect(fromSelect, "USD");
populateSelect(toSelect, "PKR");

// ===== Fetch rates for a base currency, with a short cache =====
async function getRates(baseCode) {
  const isFresh = cachedBase === baseCode && Date.now() - cachedAt < CACHE_TTL;
  if (isFresh) return cachedRates;

  const response = await fetch(API_BASE + baseCode);
  if (!response.ok) throw new Error("Rate service unavailable");

  const data = await response.json();
  if (data.result !== "success") throw new Error("Rate service returned an error");

  cachedBase = baseCode;
  cachedRates = data.rates;
  cachedAt = Date.now();
  updatedEl.textContent = `Rates last updated: ${data.time_last_update_utc}`;

  return cachedRates;
}

// ===== Keep the ticker line showing the current pair's rate =====
async function updateTicker() {
  const from = fromSelect.value;
  const to = toSelect.value;
  tickerEl.textContent = "Fetching latest rate…";

  try {
    const rates = await getRates(from);
    const rate = rates[to];
    tickerEl.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
  } catch (err) {
    tickerEl.textContent = "Couldn't reach the rates service.";
  }
}

// ===== Convert button =====
convertBtn.addEventListener("click", async () => {
  const amount = parseFloat(amountInput.value);
  const from = fromSelect.value;
  const to = toSelect.value;

  if (!amount || amount <= 0) {
    resultEl.textContent = "Enter an amount greater than 0.";
    return;
  }

  resultEl.textContent = "Converting…";

  try {
    const rates = await getRates(from);
    const rate = rates[to];
    const converted = amount * rate;

    resultEl.textContent = `${amount.toLocaleString()} ${from} = ${converted.toLocaleString(
      undefined,
      { maximumFractionDigits: 2 }
    )} ${to}`;

    tickerEl.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
  } catch (err) {
    resultEl.textContent = "Couldn't reach the rates service — try again in a moment.";
  }
});

// ===== Swap "from" and "to" =====
swapBtn.addEventListener("click", () => {
  const temp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = temp;
  updateTicker();
});

// ===== Refresh the ticker whenever a dropdown changes =====
fromSelect.addEventListener("change", updateTicker);
toSelect.addEventListener("change", updateTicker);

// ===== Initial load =====
updateTicker();
