"use client";

import { Fit } from "../lib";
import Phone from "./Phone";

export default function Touch() {
  return (
    <Fit width={360} height={680} max={1.15}>
      <div style={{ padding: 10 }}>
        <Phone />
      </div>
    </Fit>
  );
}
