export const INTRO_KEY = "nm-intro";

export const MARK_EVENT = "nm-mark-assemble";

export const INTRO_SCRIPT = `try{if(!(/[?&](filter|q)=/.test(location.search)||location.hash||sessionStorage.getItem("${INTRO_KEY}")||matchMedia("(prefers-reduced-motion: reduce)").matches))document.documentElement.dataset.intro="on"}catch(e){}`;

export const INTRO_CSS = `#${INTRO_KEY}{display:none}html[data-intro=on]:has(#${INTRO_KEY}){overflow:hidden}html[data-intro=on] #${INTRO_KEY}{display:block}[data-home-mark]{transition:opacity 450ms ease}html[data-intro=on]:has(#${INTRO_KEY}:not([data-handoff])) [data-home-mark]{opacity:0}`;
