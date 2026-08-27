import React from "react";
import { AsyncTimeline } from "./AsyncTimeline";
import { Check } from "./Check";
import { ClampPlayground } from "./ClampPlayground";
import { FilteringWidget } from "./FilteringWidget";
import { NPlusOneWaterfall } from "./NPlusOneWaterfall";
import { SemanticListen } from "./SemanticListen";
import { SpringBench } from "./SpringBench";
import { StructuralTyping } from "./StructuralTyping";
import { TruthyFalsy } from "./TruthyFalsy";
import { UseStateCycle } from "./UseStateCycle";

type Attrs = Record<string, string>;

const WIDGETS: Record<string, (attrs: Attrs) => React.ReactNode> = {
  Check: (attrs) => (
    <Check
      question={attrs.question ?? ""}
      answer={attrs.answer}
      options={attrs.options}
      correct={attrs.correct}
      why={attrs.why}
    />
  ),
  AsyncTimeline: () => <AsyncTimeline />,
  ClampPlayground: () => <ClampPlayground />,
  FilteringWidget: () => <FilteringWidget />,
  NPlusOneWaterfall: () => <NPlusOneWaterfall />,
  SpringBench: () => <SpringBench />,
  StructuralTyping: () => <StructuralTyping />,
  TruthyFalsy: () => <TruthyFalsy />,
  SemanticListen: () => <SemanticListen />,
  UseStateCycle: () => <UseStateCycle />,
};

export const WIDGET_NAMES = new Set(Object.keys(WIDGETS));

export function renderWidget(
  name: string,
  attrs: Attrs,
  key: number,
): React.ReactNode {
  const build = WIDGETS[name];
  if (!build) return null;
  return <React.Fragment key={key}>{build(attrs)}</React.Fragment>;
}
