interface CountryData {
  cca2: string;
  flags: {
    svg: string;
    png: string;
  };
}

let flagCache: Map<string, string> | null = null;
let fetchPromise: Promise<void> | null = null;

async function loadCountries(): Promise<void> {
  if (flagCache) return;
  if (fetchPromise) {
    await fetchPromise;
    return;
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch(
        "https://restcountries.com/v3.1/all?fields=cca2,flags",
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) {
        flagCache = new Map();
        return;
      }
      const data: CountryData[] = await res.json();
      flagCache = new Map();
      for (const country of data) {
        flagCache.set(country.cca2.toUpperCase(), country.flags.svg);
      }
    } catch {
      flagCache = new Map();
    }
  })();

  await fetchPromise;
}

export async function getCountryFlag(
  cca2: string
): Promise<string | undefined> {
  await loadCountries();
  return flagCache?.get(cca2.toUpperCase());
}
