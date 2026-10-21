/**
 * Society Search Service
 * Provides local NCR society database with real-time OpenStreetMap Nominatim fallback.
 */

export interface SocietyItem {
  id: string;
  name: string;
  sublocality: string;
  city: string;
  fullAddress: string;
}

export const LOCAL_SOCIETIES: SocietyItem[] = [
  {
    id: "soc-aggarwal",
    name: "Aggarwal Heights",
    sublocality: "Raj Nagar Extension",
    city: "Ghaziabad",
    fullAddress: "Raj Nagar Extension Ghaziabad · Raj Nagar Extension",
  },
  {
    id: "soc-aadhaar-jan",
    name: "Aadhaar Jan Ghar Awas Yojna",
    sublocality: "Ambedkar City",
    city: "Noida",
    fullAddress: "Ambedkar City Noida · Noida",
  },
  {
    id: "soc-amrapali-verona",
    name: "Amrapali Verona Heights",
    sublocality: "Sector 16B",
    city: "Greater Noida West",
    fullAddress: "Greater Noida West · Greater Noida West",
  },
  {
    id: "soc-antalya-2",
    name: "Antalya Heights Phase 2",
    sublocality: "Sector 16B",
    city: "Greater Noida West",
    fullAddress: "Greater Noida West · Greater Noida West",
  },
  {
    id: "soc-antalya-1",
    name: "Antalya Heights Phase I",
    sublocality: "Sector 16B",
    city: "Greater Noida West",
    fullAddress: "Greater Noida West · Greater Noida West",
  },
  {
    id: "soc-gaur-14th",
    name: "Gaur 14th Avenue",
    sublocality: "Gaur City 2",
    city: "Greater Noida West",
    fullAddress: "Gaur City, Greater Noida · Noida Extension",
  },
  {
    id: "soc-ace-divino",
    name: "ACE Divino",
    sublocality: "Sector 1",
    city: "Greater Noida West",
    fullAddress: "Sector 1, Greater Noida West · Greater Noida",
  },
  {
    id: "soc-eco-village-1",
    name: "Supertech Eco Village 1",
    sublocality: "Sector 1",
    city: "Greater Noida West",
    fullAddress: "Greater Noida West · Noida Extension",
  },
  {
    id: "soc-express-astra",
    name: "Express Astra",
    sublocality: "Sector 1",
    city: "Greater Noida West",
    fullAddress: "Sector 1, Greater Noida West · Greater Noida",
  },
  {
    id: "soc-ats-reprisals",
    name: "ATS Picturesque Reprisals",
    sublocality: "Sector 152",
    city: "Noida",
    fullAddress: "Sector 152 Noida Expressway · Noida",
  },
  {
    id: "soc-mahagun-moderne",
    name: "Mahagun Moderne",
    sublocality: "Sector 78",
    city: "Noida",
    fullAddress: "Sector 78, Central Noida · Noida",
  },
  {
    id: "soc-prateek-edifice",
    name: "Prateek Edifice",
    sublocality: "Sector 107",
    city: "Noida",
    fullAddress: "Sector 107, Central Noida · Noida",
  },
  {
    id: "soc-cleo-county",
    name: "Cleo County",
    sublocality: "Sector 121",
    city: "Noida",
    fullAddress: "Sector 121, Central Noida · Noida",
  },
  {
    id: "soc-cherry-county",
    name: "Cherry County",
    sublocality: "Techzone 4",
    city: "Greater Noida West",
    fullAddress: "Techzone 4, Greater Noida West · Noida Extension",
  },
  {
    id: "soc-nirala-estate",
    name: "Nirala Estate",
    sublocality: "Techzone 4",
    city: "Greater Noida West",
    fullAddress: "Techzone 4, Greater Noida West · Noida Extension",
  },
  {
    id: "soc-panchsheel-hynish",
    name: "Panchsheel Hynish",
    sublocality: "Sector 1",
    city: "Greater Noida West",
    fullAddress: "Sector 1, Greater Noida West · Noida Extension",
  },
  {
    id: "soc-arihant-arden",
    name: "Arihant Arden",
    sublocality: "Sector 1",
    city: "Greater Noida West",
    fullAddress: "Sector 1, Greater Noida West · Greater Noida",
  },
  {
    id: "soc-eldeco-live",
    name: "Eldeco Live Greens",
    sublocality: "Sector 150",
    city: "Noida",
    fullAddress: "Sector 150, Noida Expressway · Noida",
  },
  {
    id: "soc-godrej-woods",
    name: "Godrej Woods",
    sublocality: "Sector 43",
    city: "Noida",
    fullAddress: "Sector 43, Central Noida · Noida",
  },
  {
    id: "soc-paramount-emotions",
    name: "Paramount Emotions",
    sublocality: "Sector 1",
    city: "Greater Noida West",
    fullAddress: "Sector 1, Greater Noida West · Greater Noida",
  },
];

/**
 * Search societies locally first; if query >= 3 chars, query OpenStreetMap Nominatim
 * as fallback to fetch real geographic residential data.
 */
export async function searchSocieties(query: string): Promise<SocietyItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return LOCAL_SOCIETIES;

  // 1. Filter local database
  const localMatches = LOCAL_SOCIETIES.filter(
    (item) =>
      item.name.toLowerCase().includes(cleanQuery) ||
      item.sublocality.toLowerCase().includes(cleanQuery) ||
      item.city.toLowerCase().includes(cleanQuery) ||
      item.fullAddress.toLowerCase().includes(cleanQuery)
  );

  // If we have 4 or more local matches or query is short, return them
  if (localMatches.length >= 4 || cleanQuery.length < 3) {
    return localMatches;
  }

  // 2. Query OpenStreetMap Nominatim as fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      cleanQuery + " Noida Ghaziabad"
    )}&addressdetails=1&limit=6`;

    const res = await fetch(osmUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "AashrayoPartnerApp/1.0 (info@aashrayo.in)",
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const osmResults: SocietyItem[] = data.map((item: any, idx: number) => {
          const name = item.name || item.display_name.split(",")[0];
          const address = item.address || {};
          const sub =
            address.suburb ||
            address.neighbourhood ||
            address.residential ||
            address.city_district ||
            "Noida";
          const city = address.city || address.town || address.state_district || "NCR";

          return {
            id: `osm-${item.osm_id || idx}-${Date.now()}`,
            name: name,
            sublocality: sub,
            city: city,
            fullAddress: `${sub} ${city} · ${city}`,
          };
        });

        // Merge without duplicate names
        const existingNames = new Set(localMatches.map((m) => m.name.toLowerCase()));
        const uniqueOsm = osmResults.filter((o) => !existingNames.has(o.name.toLowerCase()));
        return [...localMatches, ...uniqueOsm];
      }
    }
  } catch (err) {
    // If offline or network error, fallback gracefully to local matches
  }

  return localMatches;
}
