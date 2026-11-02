export type Building = {
  id: string;
  name: string;
  place: string;
  year: number;
  date: string;
  tradition: string;
  idea: string;
  body?: string;
};

export type Band = {
  name: string;
  from: number;
  to: number;
};

export const BUILDINGS: Building[] = [
  {
    id: "gobekli-tepe",
    name: "Göbekli Tepe",
    place: "Şanlıurfa, Turkey",
    year: -9500,
    date: "c. 9500 BCE",
    tradition: "Pre-Pottery Neolithic",
    idea: "Monuments came before farming.",
    body: "Rings of carved limestone pillars, the tallest 5.5 metres and eight to ten tonnes, stand on low pedestals carved from the bedrock. They were raised by people who still lived by hunting and gathering, in the centuries when farming was only beginning in the region. Later digs found houses and water cisterns, so it was never the lonely temple first described. It is still among the oldest monumental buildings known.",
  },
  {
    id: "catalhoyuk",
    name: "Çatalhöyük",
    place: "Konya, Turkey",
    year: -7100,
    date: "c. 7100 BCE",
    tradition: "Neolithic",
    idea: "A town with no streets, entered through the roof.",
    body: "In a typical year perhaps 600 to 800 people lived here, in mudbrick houses packed so tightly that there were no streets. You crossed the town on its roofs and climbed down a ladder through a hatch, which also let out the smoke from the oven below. When a house wore out it was filled in and a new one built on top, so over more than a thousand years the town rose into a mound 21 metres high. The dead were buried under the floors.",
  },
  {
    id: "great-pyramid",
    name: "Great Pyramid",
    place: "Giza, Egypt",
    year: -2560,
    date: "c. 2560 BCE",
    tradition: "Old Kingdom",
    idea: "Mass is the structure.",
    body: "Built for the pharaoh Khufu from about 2.3 million blocks, it rose 146.6 metres and stayed the tallest structure on Earth for almost 3,900 years. It is nearly solid: the structure is simply its own weight, stacked at a slope of about 52 degrees. The hard part was the few rooms inside. Over the King's Chamber, five low compartments and a roof of leaning blocks steer the weight of the stone above around the room and into its walls.",
  },
  {
    id: "mohenjo-daro",
    name: "Mohenjo-daro",
    place: "Sindh, Pakistan",
    year: -2500,
    date: "c. 2500 BCE",
    tradition: "Indus Valley",
    idea: "The planned grid and the covered drain.",
    body: "One of the largest cities of the Indus civilisation, laid out with main streets running north to south and east to west, and narrow lanes between blocks of houses. It was built of fired bricks made to the same proportions. Almost every house had a bathing floor, and many had their own well. Waste water ran down chutes into covered brick drains along the streets, with holes where they could be cleared. Few cities had anything like it for thousands of years.",
  },
  {
    id: "parthenon",
    name: "Parthenon",
    place: "Athens, Greece",
    year: -447,
    date: "447–432 BCE",
    tradition: "Classical Greek",
    idea: "Post and lintel, bent so it looks straight.",
    body: "Columns carry stone beams, and the beams carry a roof. The system is ancient; the Parthenon perfects it. The floor rises about 11 centimetres towards the middle of each long side, the columns lean slightly inward and swell as they rise, and the corner columns are thicker. A building made only of straight lines can look like it sags. This one was bent on purpose so that it reads as straight.",
  },
  {
    id: "sanchi",
    name: "Great Stupa",
    place: "Sanchi, India",
    year: -250,
    date: "3rd century BCE",
    tradition: "Mauryan",
    idea: "A building you walk around, not into.",
    body: "The emperor Ashoka built the first stupa here in the 3rd century BCE over relics of the Buddha. About a century later it was cased in stone and roughly doubled in size, and four carved gateways followed. The dome is solid, with no room inside. The building is the route around it: pilgrims walk clockwise on a paved path inside the railing, then climb to a second path on the drum. The stone gateways copy timber joints, a trace of the wooden railings that came first.",
  },
  {
    id: "pantheon",
    name: "Pantheon",
    place: "Rome, Italy",
    year: 126,
    date: "c. 114–126 CE",
    tradition: "Roman",
    idea: "A concrete dome that gets lighter as it rises.",
    body: "The dome is 43.3 metres across, and the floor to the top of the dome is the same, so a perfect sphere would fit inside. Roman builders made it from unreinforced concrete, laid in horizontal layers. The mix changes with height: heavy travertine in the walls, tufa and brick in the lower dome, light volcanic pumice near the top. The shell thins from over 6 metres to 1.2 metres around the open oculus. Nineteen centuries later it is still the largest unreinforced concrete dome in the world.",
  },
  {
    id: "hagia-sophia",
    name: "Hagia Sophia",
    place: "Istanbul, Turkey",
    year: 537,
    date: "532–537",
    tradition: "Byzantine",
    idea: "Pendentives put a round dome on a square.",
    body: "Justinian's church went up in under six years, designed by Anthemius of Tralles and Isidore of Miletus, both mathematicians. A round dome needs a round base, but four piers make a square. The answer was the pendentive: curved triangles of masonry that turn the square into a circle. Pendentives had been used before, never at this size. A ring of 40 windows at the base makes the dome seem to float. The first dome fell in 558 and was rebuilt steeper; it has stood since.",
  },
  {
    id: "horyu-ji",
    name: "Hōryū-ji",
    place: "Nara, Japan",
    year: 680,
    date: "late 7th century",
    tradition: "Asuka",
    idea: "A timber pagoda that sways and does not fall.",
    body: "The temple was founded by Prince Shōtoku in the early 7th century and rebuilt after a fire in 670; its pagoda and main hall are among the oldest timber buildings in the world. The five storeys are stacked rather than fixed together, each smaller than the one below. A tall central pillar runs up the middle without carrying any floor. In an earthquake the storeys sway in turn and the pillar calms them, and Japanese pagodas have very rarely fallen.",
  },
  {
    id: "cordoba",
    name: "Great Mosque",
    place: "Córdoba, Spain",
    year: 785,
    date: "785 onwards",
    tradition: "Umayyad",
    idea: "Arches stacked on arches to lift a low hall.",
    body: "Abd al-Rahman I began the prayer hall in 785, reusing columns from Roman and Visigothic buildings. They were too short for a tall hall, so the builders stood a pier on each column and set two tiers of arches: horseshoe arches below to brace the supports, round arches above to carry the roof. The arches alternate red brick and white stone. Three later extensions turned the hall into a forest of more than 850 columns.",
  },
  {
    id: "borobudur",
    name: "Borobudur",
    place: "Java, Indonesia",
    year: 800,
    date: "c. 800",
    tradition: "Shailendra",
    idea: "A mountain built as a path.",
    body: "Built in central Java around 800, Borobudur has no interior. It is a stepped mountain of stone wrapped around a hill, made to be climbed. Pilgrims walk clockwise round four galleries carved with relief panels, rising level by level, until the walls fall away on three open round terraces. There, 72 latticed stupas each hold a seated Buddha around a great central stupa.",
  },
  {
    id: "durham",
    name: "Durham Cathedral",
    place: "Durham, England",
    year: 1093,
    date: "1093–1133",
    tradition: "Romanesque",
    idea: "The rib vault: a frame of arches under a thin shell.",
    body: "Begun in 1093, Durham was planned from the start to be vaulted in stone, and its vaults are among the earliest rib vaults in Europe. Arched ribs went up first across each bay, and thin panels of stone were filled in between. The nave's transverse arches, finished by about 1133, are pointed, decades before Gothic made that normal. Under the gallery roofs, hidden quarter arches brace the walls: an early form of the flying buttress.",
  },
  {
    id: "angkor-wat",
    name: "Angkor Wat",
    place: "Siem Reap, Cambodia",
    year: 1150,
    date: "c. 1113–1150",
    tradition: "Khmer",
    idea: "Corbelled galleries around a model of the cosmos.",
    body: "Built for Suryavarman II in the first half of the 12th century, Angkor Wat is a model of the Hindu cosmos in stone. Five towers stand for the peaks of Mount Meru, three rings of galleries for the mountain ranges around it, and the moat for the ocean. Khmer builders never used the true arch. Every gallery is roofed by corbelling, stones stepped in course by course until they meet, which keeps the galleries narrow: the outer one is under 2.5 metres wide inside.",
  },
  {
    id: "chartres",
    name: "Chartres Cathedral",
    place: "Chartres, France",
    year: 1194,
    date: "1194–1220",
    tradition: "Gothic",
    idea: "The flying buttress replaces the wall.",
    body: "A stone vault pushes outward as well as down. Romanesque churches resisted the push with thick walls and small windows. At Chartres, rebuilt after a fire in 1194, the push is caught by arches that fly over the aisle roofs to heavy piers outside. With the walls no longer holding anything up, they could become glass. The vault is 37 metres up, and the church still has most of its 13th-century windows.",
  },
  {
    id: "great-zimbabwe",
    name: "Great Zimbabwe",
    place: "Masvingo, Zimbabwe",
    year: 1300,
    date: "c. 1300",
    tradition: "Great Zimbabwe",
    idea: "Granite walls laid without mortar.",
    body: "The capital of a trading state on the Zimbabwe plateau, built between the 13th and 15th centuries by ancestors of the Shona. The outer wall of the Great Enclosure runs about 250 metres round and rises to about 11 metres, made of dressed granite blocks with no mortar at all. Both faces lean inward, so the wall narrows as it rises and its weight holds it together. Inside stands a solid conical tower, and a band of chevrons runs along the top of the wall.",
  },
  {
    id: "forbidden-city",
    name: "Forbidden City",
    place: "Beijing, China",
    year: 1420,
    date: "1406–1420",
    tradition: "Ming",
    idea: "Dougong brackets let a heavy roof flex.",
    body: "The palace was built for the Yongle Emperor between 1406 and 1420; the Hall of Supreme Harmony standing today is a rebuilding of 1695. It is a timber frame of 72 columns on a three-tier marble terrace, under a double hipped roof. Between columns and roof sit dougong: interlocking brackets of small blocks and arms, fitted without nails, that gather the weight of the deep eaves onto the columns and let the joints give a little in an earthquake.",
  },
  {
    id: "florence",
    name: "Florence Cathedral dome",
    place: "Florence, Italy",
    year: 1436,
    date: "1420–1436",
    tradition: "Renaissance",
    idea: "A dome built without scaffolding from the ground.",
    body: "For decades the cathedral had a hole in it: an octagon 45 metres across and 55 metres up, too wide to bridge with wooden centring. Filippo Brunelleschi built the dome from 1420 to 1436 as two shells of brick, a thick inner one carrying a thin outer one, tied by ribs and by chains of stone and timber. The bricks were laid in a herringbone pattern, so each course was locked in place as it went up and the dome held itself while it rose.",
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    place: "Cusco, Peru",
    year: 1450,
    date: "c. 1450",
    tradition: "Inca",
    idea: "Fitted stone that shakes loose and settles back.",
    body: "Built for the Inca ruler Pachacuti around 1450 on a ridge high in the Andes, in a region of frequent earthquakes. Its finest walls are dry-laid: every stone shaped to fit its neighbours so closely that no mortar was needed. Walls lean inward by a few degrees, and doors, windows and niches narrow towards the top. When the ground shakes, the stones can move against each other and settle back into place.",
  },
  {
    id: "suleymaniye",
    name: "Süleymaniye Mosque",
    place: "Istanbul, Turkey",
    year: 1557,
    date: "1550–1557",
    tradition: "Ottoman",
    idea: "A dome held up by a cascade of half-domes.",
    body: "Mimar Sinan built the mosque for Suleiman the Magnificent between 1550 and 1557. He took the plan of Hagia Sophia, a central dome with half-domes on the main axis, and made it his own. The dome is about 26.5 metres across and rises 53 metres, twice its width. Its push passes down through the half-domes into thick walls and buttresses, so from outside the building reads as a stepped hill of domes.",
  },
  {
    id: "katsura",
    name: "Katsura Imperial Villa",
    place: "Kyoto, Japan",
    year: 1641,
    date: "c. 1615–1660",
    tradition: "Edo",
    idea: "A house planned in floor mats.",
    body: "Built in stages from about 1615 by Prince Toshihito and then his son Toshitada, the villa's halls are planned in tatami. Every room is named by the number of mats it holds, from three to fifteen, and every mat is the same size, about 1.91 by 0.955 metres in Kyoto. The halls step back across the garden one behind another, raised on posts, with a bamboo platform for watching the moon over the pond.",
  },
  {
    id: "taj-mahal",
    name: "Taj Mahal",
    place: "Agra, India",
    year: 1653,
    date: "1632–1653",
    tradition: "Mughal",
    idea: "Two domes: one for the room, one for the skyline.",
    body: "Shah Jahan began the tomb for his wife Mumtaz Mahal in 1632; the mausoleum was finished in 1648 and the whole complex in 1653, under the architect Ustad Ahmad Lahori. It has two domes. The inner one is sized to the tomb chamber below it. Above it, an empty space and a tall drum lift the outer dome high enough to rule the skyline, 73 metres to the tip of its finial.",
  },
  {
    id: "crystal-palace",
    name: "Crystal Palace",
    place: "London, England",
    year: 1851,
    date: "1851",
    tradition: "Victorian",
    idea: "A building made in a factory and bolted together.",
    body: "Joseph Paxton, a gardener who built glasshouses, designed the hall for the Great Exhibition of 1851, and it opened within a year of his first sketch. It was made from a few standard parts, cast-iron columns, iron girders and panes of glass 49 by 10 inches, on a 24-foot grid, made in factories and bolted together in Hyde Park. It was 1,848 feet long, needed about 293,000 panes, and was later taken down and rebuilt at Sydenham.",
  },
  {
    id: "home-insurance",
    name: "Home Insurance Building",
    place: "Chicago, USA",
    year: 1885,
    date: "1884–1885",
    tradition: "Chicago School",
    idea: "A metal frame carries the walls.",
    body: "William Le Baron Jenney's office building in Chicago, finished in 1885, is often called the first skyscraper. Its two street fronts were carried on a frame of cast-iron columns and wrought-iron beams, with some of the first steel beams in the upper floors, instead of thick masonry walls carrying everything. The frame was said to weigh a third as much as a masonry building. It was demolished in 1931.",
  },
  {
    id: "colonia-guell",
    name: "Colònia Güell church",
    place: "Santa Coloma de Cervelló, Spain",
    year: 1898,
    date: "1898–1914",
    tradition: "Catalan Modernisme",
    idea: "Hang chains, turn them over, and you have the arches.",
    body: "For the church of a textile workers' colony, Gaudí spent about ten years on a model hung upside down: strings fixed to a board, weighted with bags of lead shot, at a scale of 1 to 10. A hanging string falls into a shape of pure tension; turned over, the same shape carries pure compression. The model found the arches, vaults and leaning columns for him. Only the crypt was built, from 1908, before work stopped in 1914.",
  },
  {
    id: "djenne",
    name: "Great Mosque of Djenné",
    place: "Djenné, Mali",
    year: 1907,
    date: "1907",
    tradition: "Sudano-Sahelian",
    idea: "A mud building the whole town replasters every year.",
    body: "The largest mud-brick building in the world stands on a platform about 75 metres square and 3 metres high in the middle of the town. The present mosque was built in 1906 and 1907 by the masons' guild under Ismaila Traoré, from sun-dried mud brick plastered with mud. Rain washes the surface away, so every year the town replasters it together in a festival, the crépissage. The palm-wood sticks that bristle from the walls are permanent scaffolding.",
  },
  {
    id: "villa-savoye",
    name: "Villa Savoye",
    place: "Poissy, France",
    year: 1931,
    date: "1928–1931",
    tradition: "Modernism",
    idea: "Columns carry the house, so the walls go anywhere.",
    body: "Le Corbusier and Pierre Jeanneret raised the house on thin concrete columns. The columns and floor slabs carry all the weight, so no wall has to. Walls inside can curve wherever the rooms need them, and the outside skin can open into one long window. Underneath, the curved glass wall of the ground floor follows the turning circle of a car. On top, the roof becomes a garden.",
  },
  {
    id: "fallingwater",
    name: "Fallingwater",
    place: "Pennsylvania, USA",
    year: 1937,
    date: "1936–1939",
    tradition: "Organic",
    idea: "Concrete terraces that hang out over a waterfall.",
    body: "Frank Lloyd Wright built the house for the Kaufmann family between 1936 and 1939, over the waterfall rather than facing it. Reinforced concrete terraces cantilever as much as 15 feet from stone piers set on the rock, stacked and turned against each other above the stream. The cantilevers sagged: by 1995 the main terrace had dropped about 7 inches, and in 2002 steel tendons threaded along the beams were tightened to lift and hold it.",
  },
  {
    id: "sydney-opera-house",
    name: "Sydney Opera House",
    place: "Sydney, Australia",
    year: 1973,
    date: "1959–1973",
    tradition: "Expressionist modern",
    idea: "Every shell is cut from one sphere.",
    body: "Jørn Utzon won the competition in 1957 with sketches of white shells that no one yet knew how to build. The answer, after years of work with the engineers Ove Arup and Partners, was to cut every shell from the surface of one sphere, 75.2 metres in radius. Because each curve was the same, the ribs could be cast in standard concrete pieces and covered in a little over a million tiles. Construction ran from 1959 to 1973; Utzon left in 1966 and never saw it finished.",
  },
  {
    id: "pompidou",
    name: "Centre Pompidou",
    place: "Paris, France",
    year: 1977,
    date: "1971–1977",
    tradition: "High-tech",
    idea: "The pipes and stairs move outside.",
    body: "Renzo Piano and Richard Rogers, with the engineer Peter Rice, won the competition in 1971 with a building turned inside out. The steel frame, the ducts, pipes and wiring, and the escalators all sit on the outside, colour-coded by what they carry, so each floor inside is a clear space 45 metres wide and 166 metres long. Cast-steel brackets called gerberettes balance the floor trusses on the columns. It opened in 1977.",
  },
  {
    id: "bilbao",
    name: "Guggenheim Bilbao",
    place: "Bilbao, Spain",
    year: 1997,
    date: "1993–1997",
    tradition: "Contemporary",
    idea: "Software from aircraft design makes the curves buildable.",
    body: "Frank Gehry's museum, opened in 1997, is clad in about 33,000 titanium panels, each less than half a millimetre thick, over curves no drawing board could describe. His office used CATIA, software made by Dassault Systèmes for designing aircraft, to model the shapes, check the structure and cut every panel and steel member to fit. Its effect on the city gave a name to culture-led regeneration: the Bilbao effect.",
  },
];

export type Period = Band & { id: string; short: string; about: string };

export const PERIODS: Period[] = [
  {
    id: "prehistory",
    short: "Prehistory",
    name: "Prehistory",
    from: -9500,
    to: -3000,
    about:
      "People first gathered to raise monuments, then settled into towns of mud brick. Whole communities did the work, with no sign of rulers yet.",
  },
  {
    id: "first-cities",
    short: "First cities",
    name: "The first cities",
    from: -3000,
    to: -800,
    about:
      "Kings and cities could now organise thousands of workers. Building showed off power, and planned the streets, water and drains a whole population needed.",
  },
  {
    id: "classical",
    short: "Classical",
    name: "The classical world",
    from: -800,
    to: 500,
    about:
      "Greece, Rome and India’s first empires turned building into rules that could be learned and repeated. Roman concrete let rooms grow wider than ever before.",
  },
  {
    id: "medieval",
    short: "Medieval",
    name: "The medieval world",
    from: 500,
    to: 1400,
    about:
      "Religion paid for most great buildings, from cathedrals and mosques to temples and stupas. Builders across the world found new ways to raise roofs higher and let in light.",
  },
  {
    id: "early-modern",
    short: "Early modern",
    name: "The early modern world",
    from: 1400,
    to: 1750,
    about:
      "Empires and rich patrons hired designers whose names we still know. Domes, palaces and gardens were worked out with geometry before building began.",
  },
  {
    id: "industrial",
    short: "Industrial",
    name: "The industrial age",
    from: 1750,
    to: 1914,
    about:
      "Factories made iron, steel and glass cheap enough to build with, and trade and growing cities paid for it. Elsewhere, older ways of building carried on and were renewed.",
  },
  {
    id: "modern",
    short: "Modernism",
    name: "Modernism",
    from: 1914,
    to: 1975,
    about:
      "Architects dropped decoration and let frames of steel and concrete shape the building. Governments and cities paid for new homes, schools and public buildings.",
  },
  {
    id: "contemporary",
    short: "Contemporary",
    name: "Contemporary",
    from: 1975,
    to: 2026,
    about:
      "Computers let architects design shapes no drawing board could describe, and build them. Cities began to commission buildings to draw visitors and money.",
  },
];

export function period(building: Building) {
  return (
    PERIODS.find(
      (band) => building.year >= band.from && building.year < band.to,
    ) ?? PERIODS[PERIODS.length - 1]
  );
}

export const WEST: Band[] = [
  { name: "Neolithic", from: -9500, to: -3000 },
  { name: "Bronze Age", from: -3000, to: -800 },
  { name: "Greek", from: -800, to: -146 },
  { name: "Roman", from: -146, to: 476 },
  { name: "Early medieval", from: 476, to: 1000 },
  { name: "Romanesque", from: 1000, to: 1150 },
  { name: "Gothic", from: 1150, to: 1400 },
  { name: "Renaissance", from: 1400, to: 1600 },
  { name: "Baroque", from: 1600, to: 1750 },
  { name: "Industrial", from: 1750, to: 1890 },
  { name: "Art Nouveau", from: 1890, to: 1914 },
  { name: "Modernism", from: 1914, to: 1975 },
  { name: "Contemporary", from: 1975, to: 2026 },
];

export const ELSEWHERE: Band[] = [
  { name: "Old Kingdom Egypt", from: -2700, to: -2200 },
  { name: "Indus Valley", from: -2600, to: -1900 },
  { name: "Mauryan", from: -322, to: -185 },
  { name: "Asuka", from: 538, to: 710 },
  { name: "Umayyad", from: 756, to: 1031 },
  { name: "Shailendra", from: 750, to: 850 },
  { name: "Khmer", from: 802, to: 1431 },
  { name: "Great Zimbabwe", from: 1100, to: 1450 },
  { name: "Ming", from: 1368, to: 1644 },
  { name: "Inca", from: 1438, to: 1533 },
  { name: "Ottoman", from: 1453, to: 1700 },
  { name: "Mughal", from: 1526, to: 1857 },
  { name: "Edo", from: 1603, to: 1868 },
  { name: "Sudano-Sahelian", from: 1300, to: 2026 },
];

const START = -9500;
const END = 2026;
const K = 2100;

export function position(year: number) {
  const f = (y: number) => Math.log(K - y);
  return (f(START) - f(year)) / (f(START) - f(END));
}

export function yearLabel(year: number) {
  if (year < 0) return `${Math.abs(year).toLocaleString("en-GB")} BCE`;
  if (year === 0) return "1 CE";
  return year < 1000 ? `${year} CE` : `${year}`;
}

export function era(building: Building) {
  return (
    ELSEWHERE.find((band) => band.name.startsWith(building.tradition)) ??
    WEST.find(
      (band) => building.year >= band.from && building.year < band.to,
    ) ??
    WEST[WEST.length - 1]
  );
}

export function eraLabel(band: Band) {
  return `${band.name}, ${yearLabel(band.from)} to ${band.to >= END ? "now" : yearLabel(band.to)}`;
}

export const SCALE_YEARS = [
  -9500, -5000, -2500, -1000, 0, 1000, 1500, 1800, 1900, 2000,
];

export function lanes(bands: Band[]) {
  const ends: number[] = [];
  return [...bands]
    .sort((a, b) => a.from - b.from)
    .map((band) => {
      let lane = ends.findIndex((end) => end <= band.from);
      if (lane === -1) lane = ends.push(band.to) - 1;
      else ends[lane] = band.to;
      return { ...band, lane };
    });
}
