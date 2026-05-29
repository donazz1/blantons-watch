type StoreDisplayMeta = {
  groupLabel: string;
  locationLabel: string;
  groupRank: number;
  storeRank: number;
  note?: string;
};

const ONTARIO_RESTRICTION_NOTE =
  "Ontario/LCBO may be affected by current provincial restrictions on U.S. spirits. Check adjacent provinces too.";

const DISPLAY_META: Record<string, StoreDisplayMeta> = {
  "liquor-lane": {
    groupLabel: "Online Retailers",
    locationLabel: "Alberta - Canmore / Calgary area (online)",
    groupRank: 40,
    storeRank: 10,
  },
  "wow-liquor": {
    groupLabel: "Online Retailers",
    locationLabel: "Alberta - Edmonton / Sherwood Park area (online)",
    groupRank: 40,
    storeRank: 20,
  },
  "wow-special-reserve": {
    groupLabel: "Online Retailers",
    locationLabel: "Alberta - Edmonton / Sherwood Park area (in-store listing)",
    groupRank: 40,
    storeRank: 25,
    note: "WOW says online orders for this bottle may be refunded, so call before relying on it.",
  },
  "lcbo-original-store-inventory": {
    groupLabel: "Ontario LCBO",
    locationLabel: "Ontario - Kingston / province-wide LCBO inventory",
    groupRank: 20,
    storeRank: 10,
    note: ONTARIO_RESTRICTION_NOTE,
  },
  "lcbo-special-reserve-store-inventory": {
    groupLabel: "Ontario LCBO",
    locationLabel: "Ontario - Kingston / province-wide LCBO inventory",
    groupRank: 20,
    storeRank: 20,
    note: ONTARIO_RESTRICTION_NOTE,
  },
  "lcbo-original": {
    groupLabel: "Ontario LCBO",
    locationLabel: "Ontario - LCBO online / pickup",
    groupRank: 20,
    storeRank: 30,
    note: ONTARIO_RESTRICTION_NOTE,
  },
  "lcbo-special-reserve": {
    groupLabel: "Ontario LCBO",
    locationLabel: "Ontario - LCBO online / pickup",
    groupRank: 20,
    storeRank: 40,
    note: ONTARIO_RESTRICTION_NOTE,
  },
  "saq-original": {
    groupLabel: "Adjacent Provinces",
    locationLabel: "Quebec - SAQ",
    groupRank: 40,
    storeRank: 10,
    note: "Quebec is adjacent to Ontario and may be worth checking if Ontario/LCBO availability is restricted.",
  },
  "willow-park": {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - Willow Park",
    groupRank: 50,
    storeRank: 10,
  },
  "canadian-liquor-store": {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - Edmonton / Canada-wide shipping",
    groupRank: 50,
    storeRank: 15,
  },
  "craft-cellars": {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - Calgary / online",
    groupRank: 50,
    storeRank: 18,
  },
  liquorano: {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - Liquorano",
    groupRank: 50,
    storeRank: 20,
  },
  "kingsway-liquor": {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - Edmonton / Kingsway",
    groupRank: 50,
    storeRank: 22,
  },
  "south-park-liquor": {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - Edmonton / Stony Plain",
    groupRank: 50,
    storeRank: 24,
  },
  "bsw-liquor": {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - BSW Liquor",
    groupRank: 50,
    storeRank: 30,
  },
  "tag-liquor": {
    groupLabel: "Other Provinces",
    locationLabel: "Alberta - TAG Liquor",
    groupRank: 50,
    storeRank: 40,
  },
  "bcl-original": {
    groupLabel: "Other Provinces",
    locationLabel: "British Columbia - BC Liquor Stores",
    groupRank: 50,
    storeRank: 50,
  },
};

export function getStoreDisplayMeta(
  slug: string,
  region: string,
): StoreDisplayMeta {
  return (
    DISPLAY_META[slug] ?? {
      groupLabel: region || "Other",
      locationLabel: region || "Location not set",
      groupRank: 90,
      storeRank: 90,
    }
  );
}
