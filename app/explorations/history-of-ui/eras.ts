export type EraId =
  | "sketchpad"
  | "nls"
  | "unix"
  | "plato"
  | "desktop"
  | "web"
  | "pen"
  | "bevels"
  | "aqua"
  | "ajax"
  | "feed"
  | "touch"
  | "flat"
  | "voice"
  | "prompt"
  | "agents";

export type Era = {
  id: EraId;
  year: string;
  title: string;
  credit: string;
  body: string;
  hint: string;
  theme: {
    bg: string;
    ink: string;
    muted: string;
    rule: string;
  };
};

export const ERAS: Era[] = [
  {
    id: "sketchpad",
    year: "1963",
    title: "Sketchpad",
    credit: "Ivan Sutherland, MIT Lincoln Laboratory",
    body: "A PhD thesis that let a person draw straight onto a screen with a light pen, then tell the computer how the shapes should relate. Rubber-band lines, snapping and constraints all start here, more than a decade before the personal computer.",
    hint: "Drag to draw. Ends snap together. Pick Parallel or Equal, then touch two lines.",
    theme: { bg: "#06090c", ink: "#d8ecf2", muted: "#7f99a3", rule: "#1f2c33" },
  },
  {
    id: "nls",
    year: "1968",
    title: "NLS and the mouse",
    credit: "Douglas Engelbart and the SRI Augmentation Research Center",
    body: "In one ninety-minute demo in San Francisco, Engelbart's team showed a mouse, outlines you could fold, links that jumped between documents and two people editing over a video call. Most of it took twenty years to reach an ordinary desk.",
    hint: "Click a heading to fold it. Change the view level. Follow a link in parentheses.",
    theme: { bg: "#111311", ink: "#e9eee6", muted: "#8d968a", rule: "#2a2e29" },
  },
  {
    id: "unix",
    year: "1971",
    title: "The command line",
    credit: "Ken Thompson and Dennis Ritchie, Bell Labs",
    body: "The first Unix manual is dated November 1971. You typed a short command on a teletype and the answer printed onto a roll of paper. Terse lowercase names and a tree of plain files became habits that every terminal still keeps.",
    hint: "Type a command and press Return. Try ls, cat readme, who or help.",
    theme: { bg: "#e6dfcd", ink: "#26221b", muted: "#6f6656", rule: "#cfc6b0" },
  },
  {
    id: "plato",
    year: "1972",
    title: "PLATO",
    credit: "University of Illinois, with Control Data",
    body: "Built to teach, PLATO IV drew on a plasma panel that glowed orange and felt for your finger through a grid of infrared beams. Its users soon had message boards, chat rooms, multiplayer games and emoticons, decades before most people went online.",
    hint: "Touch an answer. The screen only knows 256 places you can touch. Then open Talkomatic and type.",
    theme: { bg: "#120a04", ink: "#ffb25a", muted: "#b07a3c", rule: "#2e1b0a" },
  },
  {
    id: "desktop",
    year: "1981–84",
    title: "The desktop",
    credit: "Xerox PARC, then Apple",
    body: "Xerox built windows, icons and a mouse-driven desktop on the Alto in 1973 and sold it as the Star in 1981. The Macintosh made the idea affordable in 1984, and its single menu bar meant every program could be learned the same way.",
    hint: "Double-click an icon. Drag windows by their title. Hold a menu open. Drag something to the trash.",
    theme: { bg: "#f4f2ee", ink: "#111111", muted: "#5d5a55", rule: "#d8d4cc" },
  },
  {
    id: "web",
    year: "1993",
    title: "The web",
    credit: "Tim Berners-Lee at CERN, then NCSA Mosaic",
    body: "The web began in 1991 as linked documents for physicists. Mosaic put pictures inside the page next to the text, and within a year everyone wanted a home page. Blue meant a link and purple meant you had been there.",
    hint: "Follow the blue links. Watch the picture arrive over a 14.4k modem. Use Back.",
    theme: { bg: "#d9d9d9", ink: "#111111", muted: "#4f4f4f", rule: "#b9b9b9" },
  },
  {
    id: "pen",
    year: "1993–96",
    title: "Pen computing",
    credit: "Apple Newton, then Palm Pilot",
    body: "The Newton tried to read ordinary handwriting in 1993 and became a punchline when it guessed wrong. The Palm Pilot turned the problem round in 1996. Its Graffiti alphabet gave every letter one simple stroke, people learned it in an afternoon, and the computer fitted in a shirt pocket.",
    hint: "Write in the box under the screen, one stroke per letter. Open the stroke guide if you get stuck. Draw right for a space, left to delete.",
    theme: { bg: "#d7dccd", ink: "#1f2419", muted: "#5b6450", rule: "#bcc3af" },
  },
  {
    id: "bevels",
    year: "1995",
    title: "Bevels and the taskbar",
    credit: "Microsoft Windows 95",
    body: "Windows 95 put a Start button, a taskbar and a close box in front of tens of millions of people. Every control was a grey slab lit from the top left, so you could tell what pressed in and what didn't with nothing but light and shadow.",
    hint: "Close the note to get the Save dialog. Tab between buttons. Try the Start menu.",
    theme: { bg: "#0c6b6b", ink: "#f2f7f7", muted: "#a9d0d0", rule: "#1a7f7f" },
  },
  {
    id: "aqua",
    year: "2001",
    title: "Aqua",
    credit: "Apple Mac OS X",
    body: "Shown in January 2000 and shipped in March 2001, Aqua made controls look wet. Gel buttons, pinstripes, a default button that slowly breathed and a dock that swelled under the pointer. Steve Jobs said the aim was a screen you'd want to lick.",
    hint: "Run the pointer along the dock. Press the yellow button to send the window down to it.",
    theme: { bg: "#dfe8f3", ink: "#14223a", muted: "#566684", rule: "#c3d1e3" },
  },
  {
    id: "ajax",
    year: "2005",
    title: "The web becomes software",
    credit: "Gmail, Google Maps and Jesse James Garrett",
    body: "Before this, a rich website usually meant a Flash intro you wanted to skip. Gmail in 2004 and Google Maps in 2005 changed parts of the page without reloading it, Garrett named the technique Ajax that February, and the browser started to hold software instead of pages.",
    hint: "Drag the map. New tiles stream in while the page stays put. Search for coffee.",
    theme: { bg: "#eef3f8", ink: "#16233a", muted: "#5b6b82", rule: "#cdd8e5" },
  },
  {
    id: "feed",
    year: "2006",
    title: "The feed",
    credit: "Facebook, Twitter, Loren Brichter, Aza Raskin",
    body: "In September 2006 Facebook stopped making you visit friends' pages and started bringing their news to you. Pull to refresh, infinite scroll and the red badge followed. The interface stopped waiting to be used and started competing for your attention.",
    hint: "Scroll. Pull down to refresh. Like something. Try to find the bottom.",
    theme: { bg: "#e9edf3", ink: "#17202e", muted: "#5b6576", rule: "#d0d7e2" },
  },
  {
    id: "touch",
    year: "2007",
    title: "Multi-touch",
    credit: "Apple iPhone",
    body: "The iPhone dropped the stylus and the keypad for glass that answered to a finger. Slide to unlock, momentum scrolling and the rubber-band bounce taught physical rules to a flat screen, and glossy, lifelike icons made the strange thing feel familiar.",
    hint: "Slide to unlock. Open Contacts and flick the list past its end.",
    theme: { bg: "#1b1d22", ink: "#eef0f4", muted: "#9aa1ad", rule: "#2e323a" },
  },
  {
    id: "flat",
    year: "2013",
    title: "The flattening",
    credit: "Microsoft Metro, then Apple iOS 7",
    body: "Microsoft's Metro had already gone flat on Windows Phone in 2010. iOS 7 followed in 2013, trading gloss, linen and drop shadows for thin type, blur and plain colour. Once people knew how touchscreens worked, the textures had nothing left to explain.",
    hint: "Drag the slider from 2007 to 2013 and watch the texture drain out.",
    theme: { bg: "#f3f4f7", ink: "#14161a", muted: "#636a76", rule: "#dcdfe5" },
  },
  {
    id: "voice",
    year: "2014",
    title: "Voice",
    credit: "Apple Siri, then Amazon Echo",
    body: "Siri put an assistant you could talk to on the iPhone in 2011, and the Echo moved one into the kitchen in 2014, with no screen and always listening. It was brilliant at timers, music and the weather and lost quickly beyond that, partly because with nothing to look at you can't see what it's able to do.",
    hint: "Tap the speaker and talk, or pick a request. Then try something complicated.",
    theme: { bg: "#1c1e22", ink: "#eef0f2", muted: "#9aa0a8", rule: "#2f3238" },
  },
  {
    id: "prompt",
    year: "2023",
    title: "Conversational",
    credit: "OpenAI ChatGPT, and everyone after",
    body: "ChatGPT arrived at the end of 2022 and by 2023 a text box had become the front door to software. You describe what you need and an interface can be put together for that one moment, used once and thrown away.",
    hint: "Ask for something, or pick a suggestion. The answer is an interface.",
    theme: { bg: "#fbfaf8", ink: "#1a1918", muted: "#6b6863", rule: "#e6e3de" },
  },
  {
    id: "agents",
    year: "2025",
    title: "Agents",
    credit: "Anthropic computer use, OpenAI Operator, and others",
    body: "From late 2024, AI models started using computers the way people do: reading the screen, moving the pointer, typing into forms. Interfaces built for hands got a second kind of user, and your job moved from operating the screen to approving what happens on it. The next one might not have a screen at all.",
    hint: "Start the agent and watch it work the page. It stops and asks before anything it can't undo.",
    theme: { bg: "#f4f3ef", ink: "#1b1a17", muted: "#6c6960", rule: "#e2dfd7" },
  },
];
