import type { Drawings } from "./kit";
import { angkorWat } from "./angkor-wat";
import { bilbao } from "./bilbao";
import { djenne } from "./djenne";
import { fallingwater } from "./fallingwater";
import { pompidou } from "./pompidou";
import { sydney } from "./sydney";
import { coloniaGuell } from "./colonia-guell";
import { crystalPalace } from "./crystal-palace";
import { homeInsurance } from "./home-insurance";
import { katsura } from "./katsura";
import { tajMahal } from "./taj-mahal";
import { florence } from "./florence";
import { forbiddenCity } from "./forbidden-city";
import { greatZimbabwe } from "./great-zimbabwe";
import { machuPicchu } from "./machu-picchu";
import { suleymaniye } from "./suleymaniye";
import { catalhoyuk } from "./catalhoyuk";
import { borobudur } from "./borobudur";
import { chartres } from "./chartres";
import { cordoba } from "./cordoba";
import { durham } from "./durham";
import { gobekliTepe } from "./gobekli-tepe";
import { greatPyramid } from "./great-pyramid";
import { hagiaSophia } from "./hagia-sophia";
import { horyuJi } from "./horyu-ji";
import { mohenjoDaro } from "./mohenjo-daro";
import { pantheon } from "./pantheon";
import { parthenon } from "./parthenon";
import { sanchi } from "./sanchi";
import { villaSavoye } from "./villa-savoye";

export const DRAWINGS: Record<string, Drawings> = {
  "gobekli-tepe": gobekliTepe,
  catalhoyuk,
  "great-pyramid": greatPyramid,
  "mohenjo-daro": mohenjoDaro,
  parthenon,
  sanchi,
  pantheon,
  "hagia-sophia": hagiaSophia,
  "horyu-ji": horyuJi,
  cordoba,
  borobudur,
  durham,
  "angkor-wat": angkorWat,
  chartres,
  "great-zimbabwe": greatZimbabwe,
  "forbidden-city": forbiddenCity,
  florence,
  "machu-picchu": machuPicchu,
  suleymaniye,
  katsura,
  "taj-mahal": tajMahal,
  "crystal-palace": crystalPalace,
  "home-insurance": homeInsurance,
  "colonia-guell": coloniaGuell,
  djenne,
  fallingwater,
  "sydney-opera-house": sydney,
  pompidou,
  bilbao,
  "villa-savoye": villaSavoye,
};
