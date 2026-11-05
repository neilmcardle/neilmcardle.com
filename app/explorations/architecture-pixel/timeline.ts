export type Era = {
  name: string;
  range: string;
  start: string;
  styles: string[];
};

export const ERAS: Era[] = [
  {
    name: "Prehistoric & Megalithic Foundations",
    range: "15,000 BCE–3000 BCE",
    start: "15,000 BCE",
    styles: [
      "Paleolithic & Neolithic Cave Settlements",
      "Megalithic Post-and-Lintel Structures",
      "Neolithic Stone-Built Settlements",
    ],
  },
  {
    name: "The Ancient Civilisations",
    range: "3000 BCE–500 BCE",
    start: "3000 BCE",
    styles: [
      "Ancient Egyptian",
      "Mesopotamian",
      "Indus Valley Architecture",
      "Minoan & Mycenaean",
    ],
  },
  {
    name: "The Antiquity / Classical Eras",
    range: "850 BCE–500 CE",
    start: "850 BCE",
    styles: ["Ancient Greek", "Etruscan", "Ancient Roman"],
  },
  {
    name: "The Medieval Eras",
    range: "500 CE–1400 CE",
    start: "500",
    styles: ["Byzantine", "Romanesque / Anglo-Norman", "Gothic"],
  },
  {
    name: "The Renaissance & Early Modern Eras",
    range: "1400s–1700s",
    start: "1400",
    styles: [
      "Renaissance",
      "Tudor",
      "Elizabethan",
      "Jacobean",
      "Baroque",
      "Rococo",
    ],
  },
  {
    name: "The Golden Age of Symmetry",
    range: "1700s–1830s",
    start: "1700",
    styles: [
      "Georgian",
      "Palladian",
      "Neoclassical",
      "Federal & Empire",
      "Regency",
    ],
  },
  {
    name: "The Industrial & Reform Movements",
    range: "1830s–1910s",
    start: "1830",
    styles: [
      "Gothic Revival",
      "Victorian",
      "Arts and Crafts",
      "Art Nouveau",
      "Edwardian",
    ],
  },
  {
    name: "The 20th Century & Rise of Modernism",
    range: "1900s–1970s",
    start: "1900",
    styles: [
      "Expressionism",
      "Art Deco",
      "Bauhaus",
      "International Style",
      "Mid-Century Modern",
      "Brutalism",
    ],
  },
  {
    name: "Postmodern & Contemporary Eras",
    range: "1970s–Present",
    start: "1970",
    styles: [
      "Postmodernism",
      "High-Tech / Industrial",
      "Deconstructivism",
      "Minimalism",
      "Japandi & Sustainable Contemporary",
    ],
  },
];

export type Built = {
  scene: string;
  era: number;
  style: string;
  building: string;
  line: string;
};

export const BUILT: Built[] = [
  {
    scene: "caves",
    era: 0,
    style: "Paleolithic & Neolithic Cave Settlements",
    building: "Cave dwellings in a limestone cliff",
    line: "Homes dug into or built around natural rock.",
  },
  {
    scene: "stonehenge",
    era: 0,
    style: "Megalithic Post-and-Lintel Structures",
    building: "Stonehenge, Wiltshire",
    line: "Huge upright stones capped with a horizontal stone: the first beam-on-post structure.",
  },
  {
    scene: "skarabrae",
    era: 0,
    style: "Neolithic Stone-Built Settlements",
    building: "Skara Brae, Orkney",
    line: "A village of eight stone houses on Orkney, with stone beds, dressers and hearths still in place.",
  },
  {
    scene: "pyramid",
    era: 1,
    style: "Ancient Egyptian",
    building: "The Great Pyramid of Khufu, Giza",
    line: "Massive stone pyramids, temples and tombs built to last forever, with thick sloping walls, columns carved like papyrus and painted hieroglyphs.",
  },
  {
    scene: "ziggurat",
    era: 1,
    style: "Mesopotamian",
    building: "The Ziggurat of Ur, Iraq",
    line: "Mud-brick cities between the Tigris and Euphrates.",
  },
  {
    scene: "indus",
    era: 1,
    style: "Indus Valley Architecture",
    building: "Mohenjo-daro, Pakistan",
    line: "Planned grid cities of fired brick with drains under every street, public baths and granaries.",
  },
  {
    scene: "liongate",
    era: 1,
    style: "Minoan & Mycenaean",
    building: "The Lion Gate at Mycenae",
    line: 'Mycenaean Greece built hilltop citadels from giant "Cyclopean" stones.',
  },
  {
    scene: "parthenon",
    era: 2,
    style: "Ancient Greek",
    building: "The Parthenon, Athens",
    line: "Marble temples built on strict proportion, using the Doric, Ionic and Corinthian orders of column.",
  },
  {
    scene: "etruscan",
    era: 2,
    style: "Etruscan",
    building: "Tumulus tombs, Banditaccia necropolis",
    line: "Their timber-and-clay temples are gone, so we know them mostly through rock-cut tombs carved to look like houses inside.",
  },
  {
    scene: "colosseum",
    era: 2,
    style: "Ancient Roman",
    building: "The Colosseum, Rome",
    line: "Greek forms plus engineering: the arch, the vault, the dome and concrete.",
  },
  {
    scene: "hagiasophia",
    era: 3,
    style: "Byzantine",
    building: "Hagia Sophia, Istanbul",
    line: "The eastern Roman Empire’s style: huge central domes on square bases, and interiors covered in gold mosaic.",
  },
  {
    scene: "romanesque",
    era: 3,
    style: "Romanesque / Anglo-Norman",
    building: "A Norman cathedral, after Durham",
    line: "Heavy walls, round arches, thick piers and small windows.",
  },
  {
    scene: "gothic",
    era: 3,
    style: "Gothic",
    building: "A cathedral west front, after Wells",
    line: "Pointed arches, ribbed vaults and flying buttresses moved weight off the walls, so walls could become huge stained-glass windows.",
  },
  {
    scene: "tempietto",
    era: 4,
    style: "Renaissance",
    building: "Bramante’s Tempietto, Rome",
    line: "Italy rediscovered Roman proportion and symmetry.",
  },
  {
    scene: "tudor",
    era: 4,
    style: "Tudor",
    building: "A Tudor timber-framed manor",
    line: "Late Gothic turning domestic: red brick, timber framing, tall clustered chimneys, flattened four-centred arches.",
  },
  {
    scene: "elizabethan",
    era: 4,
    style: "Elizabethan",
    building: "Hardwick Hall, Derbyshire",
    line: "Symmetrical show houses with vast grids of glass, at a time glass was costly.",
  },
  {
    scene: "jacobean",
    era: 4,
    style: "Jacobean",
    building: "Blickling Hall, Norfolk",
    line: "Elizabethan forms with more classical detail, Dutch curved gables and strapwork ornament.",
  },
  {
    scene: "baroque",
    era: 4,
    style: "Baroque",
    building: "A Roman Baroque church, after Sant’Agnese in Agone",
    line: "Drama and movement: curving façades, domes, gilding and painted ceilings that seem to open to the sky.",
  },
  {
    scene: "rococo",
    era: 4,
    style: "Rococo",
    building: "A Rococo pavilion, after the Amalienburg",
    line: "Baroque made light and playful, mostly in interiors: pastel walls, white and gold, asymmetric shell and scroll ornament.",
  },
  {
    scene: "georgian",
    era: 5,
    style: "Georgian",
    building: "A Georgian town house, after Mompesson House",
    line: "Plain, symmetrical brick or stone fronts, sash windows set out by proportion, and a central door with a fanlight.",
  },
  {
    scene: "rotonda",
    era: 5,
    style: "Palladian",
    building: "Villa La Rotonda, near Vicenza",
    line: "Based on the 16th-century Venetian architect Andrea Palladio: temple-front porticos and exact symmetry.",
  },
  {
    scene: "neoclassical",
    era: 5,
    style: "Neoclassical",
    building: "The Petit Trianon, Versailles",
    line: "A stricter return to Greek and Roman originals after Pompeii and Herculaneum were dug up in the mid-1700s: clean columns, flat fronts, little ornament.",
  },
  {
    scene: "federal",
    era: 5,
    style: "Federal & Empire",
    building: "The Massachusetts State House, Boston",
    line: "Federal (USA, 1780–1830) is light and elegant, like Bulfinch’s Massachusetts State House.",
  },
  {
    scene: "regency",
    era: 5,
    style: "Regency",
    building: "Cumberland Terrace, Regent’s Park",
    line: "Late Georgian made sleeker: white stucco terraces, bow windows and fine ironwork balconies.",
  },
  {
    scene: "parliament",
    era: 6,
    style: "Gothic Revival",
    building: "The Houses of Parliament, London",
    line: "Medieval Gothic brought back in the 1800s, often with new materials.",
  },
  {
    scene: "stpancras",
    era: 6,
    style: "Victorian",
    building: "St Pancras station and hotel, London",
    line: "Not one style but many revivals used across Britain and its empire, 1837–1901.",
  },
  {
    scene: "redhouse",
    era: 6,
    style: "Arts and Crafts",
    building: "Red House, Bexleyheath",
    line: "A reaction against factory-made ornament: honest local materials, handcraft and simple cottage forms.",
  },
  {
    scene: "guimard",
    era: 6,
    style: "Art Nouveau",
    building: "Guimard’s Abbesses metro entrance, Paris",
    line: "Flowing lines drawn from plants and insects, in iron, glass and tile, 1890–1911.",
  },
  {
    scene: "edwardian",
    era: 6,
    style: "Edwardian",
    building: "Belfast City Hall",
    line: "Lighter and less cluttered than Victorian, with grand Baroque Revival for public buildings like Belfast City Hall.",
  },
  {
    scene: "einstein",
    era: 7,
    style: "Expressionism",
    building: "Mendelsohn’s Einstein Tower, Potsdam",
    line: "Early modern buildings shaped by emotion rather than rule: sculpted, curving, sometimes crystal-like forms.",
  },
  {
    scene: "artdeco",
    era: 7,
    style: "Art Deco",
    building: "A setback tower, after the Chrysler Building",
    line: "The glamour of the 1920s and 1930s: stepped skylines, sunbursts, zigzags and chevrons in chrome, terracotta and coloured stone.",
  },
  {
    scene: "bauhaus",
    era: 7,
    style: "Bauhaus",
    building: "The Bauhaus building, Dessau",
    line: "The German school (1919–1933) that joined art, craft and industry.",
  },
  {
    scene: "seagram",
    era: 7,
    style: "International Style",
    building: "The Seagram Building, New York",
    line: "Modernism as a global look from the 1930s on: volume over mass, steel and glass, regular grids.",
  },
  {
    scene: "midcentury",
    era: 7,
    style: "Mid-Century Modern",
    building: "A 1960 California house",
    line: "Modernism made domestic, roughly 1945–1969: open plans, low rooflines, exposed beams, big glass walls to the garden.",
  },
  {
    scene: "brutalist",
    era: 7,
    style: "Brutalism",
    building: "A slab and service tower, after Trellick Tower",
    line: "Raw béton brut concrete in heavy, blocky forms, 1950s–1970s.",
  },
  {
    scene: "venturi",
    era: 8,
    style: "Postmodernism",
    building: "Vanna Venturi House, Philadelphia",
    line: "A witty reaction against plain modernism: historical references, bold colour and irony come back.",
  },
  {
    scene: "lloyds",
    era: 8,
    style: "High-Tech / Industrial",
    building: "The Lloyd’s building, London",
    line: "The building’s structure and services put on show: exposed steel, ducts, lifts and stairs on the outside.",
  },
  {
    scene: "disney",
    era: 8,
    style: "Deconstructivism",
    building: "Walt Disney Concert Hall, Los Angeles",
    line: "Forms that look broken apart and reassembled: tilted walls, curving metal skins, no right angles.",
  },
  {
    scene: "churchoflight",
    era: 8,
    style: "Minimalism",
    building: "Tadao Ando’s Church of the Light, Osaka",
    line: "Reduced to essentials: plain surfaces, one or two materials, light used as a material.",
  },
  {
    scene: "bosco",
    era: 8,
    style: "Japandi & Sustainable Contemporary",
    building: "Bosco Verticale, Milan",
    line: "Sustainable contemporary design cuts energy and carbon, often with planting built in.",
  },
];

export const BAND = 1 / ERAS.length;

export function stylePosition(era: number, index: number) {
  const count = ERAS[era].styles.length;
  return (era + (index + 0.5) / count) * BAND;
}

export const TICKS = ERAS.flatMap((era, e) =>
  era.styles.map((name, i) => ({
    name,
    era: e,
    at: stylePosition(e, i),
    built: BUILT.findIndex((b) => b.era === e && b.style === name),
  })),
);

export const BUILT_AT = BUILT.map((b) =>
  stylePosition(b.era, ERAS[b.era].styles.indexOf(b.style)),
);

export function nearestBuilt(p: number) {
  let best = 0;
  for (let i = 1; i < BUILT_AT.length; i++)
    if (Math.abs(BUILT_AT[i] - p) < Math.abs(BUILT_AT[best] - p)) best = i;
  return best;
}

export function eraAt(p: number) {
  return Math.min(ERAS.length - 1, Math.max(0, Math.floor(p / BAND)));
}
