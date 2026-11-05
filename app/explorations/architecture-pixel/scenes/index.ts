import type { Scene } from "../engine/engine";
import { artdeco } from "./artdeco";
import { baroque } from "./baroque";
import { bauhaus } from "./bauhaus";
import { bosco } from "./bosco";
import { brutalist } from "./brutalist";
import { caves } from "./caves";
import { churchOfLight } from "./churchoflight";
import { colosseum } from "./colosseum";
import { disney } from "./disney";
import { edwardian } from "./edwardian";
import { einstein } from "./einstein";
import { elizabethan } from "./elizabethan";
import { etruscan } from "./etruscan";
import { federal } from "./federal";
import { georgian } from "./georgian";
import { gothic } from "./gothic";
import { guimard } from "./guimard";
import { hagiaSophia } from "./hagiasophia";
import { indus } from "./indus";
import { jacobean } from "./jacobean";
import { lionGate } from "./liongate";
import { lloyds } from "./lloyds";
import { midCentury } from "./midcentury";
import { neoclassical } from "./neoclassical";
import { parliament } from "./parliament";
import { parthenon } from "./parthenon";
import { greatPyramid } from "./pyramid";
import { redHouse } from "./redhouse";
import { regency } from "./regency";
import { rococo } from "./rococo";
import { romanesque } from "./romanesque";
import { rotonda } from "./rotonda";
import { seagram } from "./seagram";
import { skaraBrae } from "./skarabrae";
import { stonehenge } from "./stonehenge";
import { stPancras } from "./stpancras";
import { tempietto } from "./tempietto";
import { tudor } from "./tudor";
import { venturi } from "./venturi";
import { ziggurat } from "./ziggurat";

export const SCENES: Record<string, Scene> = {
  caves,
  stonehenge,
  skarabrae: skaraBrae,
  pyramid: greatPyramid,
  ziggurat,
  indus,
  liongate: lionGate,
  parthenon,
  etruscan,
  colosseum,
  hagiasophia: hagiaSophia,
  romanesque,
  gothic,
  tempietto,
  tudor,
  elizabethan,
  jacobean,
  baroque,
  rococo,
  georgian,
  rotonda,
  neoclassical,
  federal,
  regency,
  parliament,
  stpancras: stPancras,
  redhouse: redHouse,
  guimard,
  edwardian,
  einstein,
  artdeco,
  bauhaus,
  seagram,
  midcentury: midCentury,
  brutalist,
  venturi,
  lloyds,
  disney,
  churchoflight: churchOfLight,
  bosco,
};
