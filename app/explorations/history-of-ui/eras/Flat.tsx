"use client";

import { useState } from "react";
import { Fit } from "../lib";
import Phone from "./Phone";
import s from "./flat.module.css";

export default function Flat() {
  const [f, setF] = useState(0);
  return (
    <div className={s.wrap}>
      <div className={s.phone}>
        <Fit width={360} height={680} max={1.1}>
          <div style={{ padding: 10 }}>
            <Phone flat={f} startOn="home" />
          </div>
        </Fit>
      </div>
      <label className={s.control}>
        <span className={s.end}>2007</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={f}
          onChange={(e) => setF(Number(e.target.value))}
          aria-label="From 2007 to 2013"
          aria-valuetext={`${Math.round(2007 + f * 6)}`}
        />
        <span className={s.end}>2013</span>
      </label>
    </div>
  );
}
