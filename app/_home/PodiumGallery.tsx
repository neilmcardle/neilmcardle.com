import Gallery, { type GalleryItem } from "./Gallery";

type Item = GalleryItem;

const still = (name: string, alt: string): Item => ({
  src: `/home/podium/stills/${name}.jpg`,
  alt,
  width: 1600,
  height: 904,
});

const ITEMS: Item[] = [
  still(
    "01-wake",
    "A boy wakes in the only pool of light in the car park under the podium",
  ),
  still("03-ramp", "He walks up the car park ramp into blinding mist"),
  still("02-hand", "A small hand in a blue sleeve touches a puddle"),
  still(
    "05-searchlight",
    "A searchlight sweeps the deck as he drops behind a planter",
  ),
  still(
    "13-pigeons",
    "A storm of pigeons lifts off around him in front of the tower",
  ),
  {
    src: "/home/podium/tower.jpg",
    alt: "The boy alone on the deck below Petticoat Tower, the City's towers in the fog behind",
    width: 1600,
    height: 905,
  },
  still("20-looking-up", "Behind his head, looking up at the tower"),
  still("12-bin-puzzle", "He shoulders a wheelie bin under the wall"),
  still("11-ledge", "He hauls himself up a wet concrete ledge"),
  still("09-shutters", "Shutters slam over him on Petticoat Lane after hours"),
  still(
    "14-washing-lines",
    "He runs through white sheets whipping on rooftop washing lines",
  ),
  still("08-the-jump", "The walkway runs out and he jumps the gap"),
  still(
    "15-train",
    "A train strobes under the footbridge at Liverpool Street as he crosses",
  ),
  still(
    "22-dream",
    "The podium decks fold and turn in the sky around the tower",
  ),
  still(
    "21-the-door",
    "A door at the foot of the tower opens and warm light floods the wet concrete",
  ),
];

export default function PodiumGallery() {
  return <Gallery items={ITEMS} label="View gallery" name="Podium stills" />;
}
