export const BARE_STUDIOS = {
  name: "Bare Studios",
  address: "12 N Main St #2, Bel Air, MD 21014",
  phone: "(443) 278-3919",
  conciergePhone: "(443) 278-3919",
  barberPhone: "(443) 559-2037",
  careersPhone: "(443) 564-0030",
  website: "https://www.barestudios.site",
};

export type BareServiceKind = "barber" | "facial" | "body" | "lashExtensions" | "lash" | "brow" | "waxing" | "addon";

export type BareService = {
  name: string;
  duration: string;
  price: string;
  kind: BareServiceKind;
  description?: string;
  bestFor?: string;
  note?: string;
};

export const BARE_SERVICE_CATEGORIES: { name: string; services: BareService[] }[] = [
  {
    name: "Barbering",
    services: [
      {
        name: "Barbering with Andy",
        duration: "Call or text to book",
        price: "Book directly with Andy",
        kind: "barber",
        note: "Andy books barbering directly by call or text.",
      },
    ],
  },
  {
    name: "BARE SKN Facials",
    services: [
      {
        name: "BARE SKN Signature Facial (Tier 1)",
        duration: "60 min",
        price: "$95",
        kind: "facial",
        description:
          "A customized facial designed to rebalance, hydrate, and brighten the skin while supporting overall skin health. Includes skin analysis, deep cleanse, gentle exfoliation, extractions if needed, a customized treatment mask, lymphatic drainage, and relaxing facial massage.",
        bestFor: "All skin types, first-time facial clients, and routine monthly skin maintenance.",
      },
      {
        name: "BARE SKN Anti-Aging Facial (Tier 2)",
        duration: "90 min",
        price: "$145",
        kind: "facial",
        description:
          "A rejuvenating treatment focused on firming, collagen stimulation, and skin renewal. Includes skin analysis, antioxidant deep cleanse, exfoliation, rejuvenating peptide mask, bio-renewal serums, lymphatic drainage, red light therapy, and relaxing facial massage.",
        bestFor: "Mature or aging skin and clients seeking preventative or corrective anti-aging treatments.",
      },
      {
        name: "BARE SKN Dermaplaning Facial (Tier 3)",
        duration: "90 min",
        price: "$200",
        kind: "facial",
        description:
          "An advanced exfoliating facial performed with a medical-grade dermaplaning blade to remove dead skin buildup and fine vellus hair. Includes deep cleanse, dermaplaning, hydrating jelly mask, red light therapy, lymphatic drainage, and massage.",
        bestFor: "Oily, dry, and combination skin types; smoother skin, makeup application, and enhanced skincare results.",
      },
      {
        name: "BARE SKN Aveda Plant Peel (Tier 4)",
        duration: "60 min",
        price: "$120",
        kind: "facial",
        description:
          "A results-driven exfoliating treatment powered by Aveda plant-based peel technology to resurface skin, improve texture, and reduce the appearance of fine lines, uneven tone, and congestion while remaining gentle.",
        bestFor: "Advanced exfoliation, improved skin tone, and visible renewal with minimal irritation.",
      },
    ],
  },
  {
    name: "BARE SKN Body Treatments",
    services: [
      {
        name: "BARE SKN Back Facial",
        duration: "45 min",
        price: "$85",
        kind: "body",
        description:
          "A deep-cleansing treatment for back acne, congestion, and excess buildup. Includes antibacterial cleanse, exfoliating scrub, dry brushing, hot stone massage, hydrating mask, and finishing moisturizer.",
        bestFor: "Back acne, clogged pores, uneven texture, and clearer, smoother skin on the back.",
      },
      {
        name: "BARE SKN Full Body Treatment",
        duration: "90 min",
        price: "$250",
        kind: "body",
        description:
          "A rejuvenating full-body experience designed to exfoliate, stimulate circulation, and deeply nourish the skin. Includes full-body cleanse, exfoliating scrub, dry brushing, relaxing massage, full body mask, and moisturizing body lotion.",
        note: "Optional treatment is performed on all areas of the body except intimate areas.",
      },
    ],
  },
  {
    name: "BARE BEAUTY",
    services: [
      { name: "Korean Lash Lift and Tint", duration: "60 min", price: "$90", kind: "lash" },
      { name: "Classic Lash Extensions", duration: "120 min", price: "$150", kind: "lashExtensions" },
      { name: "Lash Full Set", duration: "120 min", price: "$150", kind: "lashExtensions" },
      { name: "Lash Fill In", duration: "60 min", price: "$80", kind: "lashExtensions" },
      { name: "Lash Half Set", duration: "90 min", price: "$99", kind: "lashExtensions" },
      { name: "Foreign Lash Refill", duration: "90 min", price: "$150", kind: "lashExtensions" },
      { name: "Light Volume / Hybrid Full Set Extensions", duration: "120 min", price: "$220", kind: "lashExtensions" },
      { name: "Fluffy Volume Full Set", duration: "120 min", price: "$230", kind: "lashExtensions" },
      { name: "Megavolume Full Set", duration: "150 min", price: "$250", kind: "lashExtensions" },
      { name: "Lash Removal", duration: "30 min", price: "$55", kind: "lashExtensions" },
      { name: "Light Volume / Hybrid Lash Refill", duration: "90 min", price: "$90", kind: "lashExtensions" },
      { name: "Fluffy Volume Lash Refill", duration: "90 min", price: "$100", kind: "lashExtensions" },
      { name: "Megavolume Lash Refill", duration: "120 min", price: "$145", kind: "lashExtensions" },
    ],
  },
  {
    name: "BARE BROWS",
    services: [
      { name: "Brow Sculpt (Thread or Wax)", duration: "30 min", price: "Price varies", kind: "brow" },
      { name: "Brow Lamination", duration: "45 min", price: "Price varies", kind: "brow", note: "Includes brow sculpt." },
      { name: "Brow Hybrid Stain", duration: "45 min", price: "Price varies", kind: "brow", note: "Includes brow sculpt." },
    ],
  },
  {
    name: "Waxing",
    services: [
      { name: "Face Waxing", duration: "20 min", price: "Price varies", kind: "waxing" },
      { name: "Brow Waxing", duration: "20 min", price: "Price varies", kind: "waxing" },
    ],
  },
  {
    name: "Add-ons",
    services: [
      { name: "Additional 15 Minutes", duration: "+15 min", price: "$30", kind: "addon" },
      { name: "Additional 30 Minutes", duration: "+30 min", price: "$60", kind: "addon" },
      { name: "Additional 60 Minutes", duration: "+60 min", price: "$120", kind: "addon" },
      { name: "Dermaplaning Add-on", duration: "Add-on", price: "$40", kind: "addon" },
      { name: "Hyaluronic Acid Jelly Mask", duration: "Add-on", price: "$20", kind: "addon" },
      { name: "LED Therapy", duration: "Add-on", price: "$25", kind: "addon" },
      { name: "Hot or Cold Stones", duration: "Add-on", price: "$20", kind: "addon" },
      { name: "High Frequency Scalp Massage", duration: "Add-on", price: "$25", kind: "addon" },
      { name: "Lymphatic Drainage", duration: "Add-on", price: "$15", kind: "addon" },
    ],
  },
];

export const BARE_TIME_SLOTS = ["10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM"];
export const NA_LASH_TIME_SLOTS = ["9:00 AM", "10:30 AM", "12:00 PM", "1:30 PM", "3:00 PM", "4:30 PM", "6:00 PM"];
