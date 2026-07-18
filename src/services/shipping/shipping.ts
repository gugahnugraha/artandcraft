export interface ShippingOption {
  courier: string;
  service: string;
  name: string;
  cost: number;
  etd: string;
}

const RAJAONGKIR_API_KEY = process.env.RAJAONGKIR_API_KEY;
const RAJAONGKIR_ORIGIN_CITY_ID = process.env.RAJAONGKIR_ORIGIN_CITY_ID || "444"; // Default to Yogyakarta (city ID 444)

// Simple mapping for common cities to RajaOngkir Starter IDs for basic integration
const cityIdMap: Record<string, string> = {
  yogyakarta: "444",
  jogja: "444",
  sleman: "419",
  bantul: "39",
  jakarta: "152", // Jakarta Pusat default
  bandung: "23",
  surabaya: "444",
  semarang: "399",
  surakarta: "445",
  solo: "445",
  medan: "278",
  makassar: "246",
  denpasar: "114",
  bali: "114",
  tangerang: "455",
  bekasi: "54",
  depok: "115",
  bogor: "75",
};

function getCityId(cityName: string): string | null {
  const norm = cityName.toLowerCase().trim();
  for (const [key, val] of Object.entries(cityIdMap)) {
    if (norm.includes(key) || key.includes(norm)) {
      return val;
    }
  }
  return null;
}

export async function calculateShippingRates(
  destinationCity: string,
  destinationProvince: string,
  weightInGrams: number
): Promise<ShippingOption[]> {
  const weight = Math.max(weightInGrams, 100); // Minimum 100 grams

  // If API key is present, try real API
  if (RAJAONGKIR_API_KEY) {
    const destCityId = getCityId(destinationCity);
    if (destCityId) {
      try {
        const rates: ShippingOption[] = [];
        const couriers = ["jne", "pos", "tiki"];

        for (const courier of couriers) {
          const res = await fetch("https://api.rajaongkir.com/starter/cost", {
            method: "POST",
            headers: {
              key: RAJAONGKIR_API_KEY,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              origin: RAJAONGKIR_ORIGIN_CITY_ID,
              destination: destCityId,
              weight: weight.toString(),
              courier: courier,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const results = data?.rajaongkir?.results?.[0];
            if (results) {
              const costs = results.costs || [];
              costs.forEach((c: any) => {
                rates.push({
                  courier: courier.toUpperCase(),
                  service: c.service,
                  name: `${results.name} (${c.service})`,
                  cost: c.cost?.[0]?.value || 15000,
                  etd: c.cost?.[0]?.etd ? `${c.cost[0].etd} hari` : "2-3 hari",
                });
              });
            }
          }
        }

        if (rates.length > 0) {
          return rates;
        }
      } catch (err) {
        console.error("RajaOngkir integration error, falling back to mock calculator:", err);
      }
    }
  }

  // Fallback Mock Calculator based on destination
  return calculateMockRates(destinationCity, destinationProvince, weight);
}

function calculateMockRates(
  city: string,
  province: string,
  weight: number
): ShippingOption[] {
  const normCity = city.toLowerCase();
  const normProv = province.toLowerCase();

  // Base rate based on distance from origin (Yogyakarta default)
  let baseRate = 18000; // Default to Java regions

  if (normCity.includes("jogja") || normCity.includes("yogyakarta") || normCity.includes("sleman") || normCity.includes("bantul")) {
    baseRate = 9000;
  } else if (normProv.includes("jakarta") || normProv.includes("banten") || normProv.includes("jawa barat")) {
    baseRate = 15000;
  } else if (normProv.includes("jawa timur")) {
    baseRate = 16000;
  } else if (normProv.includes("bali") || normProv.includes("nusa tenggara")) {
    baseRate = 26000;
  } else if (normProv.includes("sumatera")) {
    baseRate = 32000;
  } else if (normProv.includes("kalimantan")) {
    baseRate = 38000;
  } else if (normProv.includes("sulawesi")) {
    baseRate = 42000;
  } else if (normProv.includes("maluku") || normProv.includes("papua")) {
    baseRate = 58000;
  }

  // Scale based on weight (every 1kg adds 80% of base rate)
  const weightMultiplier = Math.ceil(weight / 1000);
  const calculatedCost = baseRate + (weightMultiplier - 1) * Math.round(baseRate * 0.8);

  return [
    {
      courier: "JNE",
      service: "REG",
      name: "JNE Reguler",
      cost: calculatedCost,
      etd: "2-3 hari",
    },
    {
      courier: "JNE",
      service: "OKE",
      name: "JNE Oke (Ekonomis)",
      cost: Math.round(calculatedCost * 0.85),
      etd: "3-5 hari",
    },
    {
      courier: "POS",
      service: "KILAT",
      name: "POS Kilat Khusus",
      cost: Math.round(calculatedCost * 0.9),
      etd: "2-4 hari",
    },
    {
      courier: "TIKI",
      service: "REG",
      name: "TIKI Reguler",
      cost: calculatedCost,
      etd: "2-3 hari",
    },
  ];
}
