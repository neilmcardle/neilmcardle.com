"use client";

import type { CSSProperties } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ACCENTS } from "@/lib/design/catalog";
import type { Design, Element } from "@/lib/design/types";
import { cn } from "@/lib/utils";

const WIDTH: Record<Design["width"], string> = {
  narrow: "w-[22rem]",
  medium: "w-[26rem]",
  wide: "w-[34rem]",
};

const SPACING: Record<Design["density"], { card: string; gap: string }> = {
  compact: { card: "[--card-spacing:--spacing(4)]", gap: "gap-3" },
  comfortable: { card: "[--card-spacing:--spacing(6)]", gap: "gap-5" },
  spacious: { card: "[--card-spacing:--spacing(9)]", gap: "gap-7" },
};

const FOOTER: Record<Design["footerAlign"], string> = {
  start: "justify-start",
  end: "justify-end",
  between: "justify-between",
  stretch: "*:flex-1",
};

const HEADING_SIZE = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl tracking-tight",
} as const;
const TEXT_SIZE = { sm: "text-xs", md: "text-sm", lg: "text-base" } as const;
const BUTTON_SIZE = { sm: "sm", md: "default", lg: "lg" } as const;

type Props = {
  design: Design;

  flashIds?: string[];
  flashKey?: number;

  previewIds?: string[];
};

export function DesignRenderer({
  design,
  flashIds = [],
  flashKey = 0,
  previewIds = [],
}: Props) {
  const accent = ACCENTS[design.accent];
  const vars = {
    "--primary": accent.primary,
    "--primary-foreground": accent.foreground,
    "--ring": accent.primary,
  } as CSSProperties;

  const header = design.elements.filter((e) => e.section === "header");
  const body = design.elements.filter((e) => e.section === "body");
  const footer = design.elements.filter((e) => e.section === "footer");
  const spacing = SPACING[design.density];

  const wrap = (el: Element, node: React.ReactNode, className?: string) => (
    <div
      key={flashIds.includes(el.id) ? `${el.id}-${flashKey}` : el.id}
      data-el-id={el.id}
      className={cn(
        "relative rounded-md transition-[outline-color] [&_*]:pointer-events-none",
        flashIds.includes(el.id) && "animate-flash",
        previewIds.includes(el.id) &&
          "outline-[1.5px] outline-offset-4 outline-dashed outline-ochre/80",
        className,
      )}
    >
      {node}
    </div>
  );

  return (
    <div
      data-card
      style={vars}
      className={cn(
        "design-scope max-w-full font-sans transition-[width] duration-300",
        WIDTH[design.width],
      )}
    >
      <Card
        className={cn(
          "shadow-[0_1px_2px_rgb(20_18_14/0.05),0_18px_40px_-16px_rgb(20_18_14/0.18)] transition-all duration-300",
          spacing.card,
        )}
      >
        {header.length > 0 && (
          <CardHeader className="gap-1.5">
            {header.map((el) =>
              wrap(
                el,
                renderElement(el),
                el.kind === "badge" ? "w-fit" : undefined,
              ),
            )}
          </CardHeader>
        )}
        {body.length > 0 && (
          <CardContent className={cn("flex flex-col", spacing.gap)}>
            {body.map((el) => wrap(el, renderElement(el)))}
          </CardContent>
        )}
        {footer.length > 0 && (
          <CardFooter className={cn("gap-2", FOOTER[design.footerAlign])}>
            {footer.map((el) =>
              wrap(el, renderElement(el), el.fullWidth ? "flex-1" : undefined),
            )}
          </CardFooter>
        )}
        {header.length + body.length + footer.length === 0 && (
          <div className="px-(--card-spacing) py-10" />
        )}
      </Card>
    </div>
  );
}

function renderElement(el: Element) {
  switch (el.kind) {
    case "heading":
      return (
        <h2
          className={cn(
            "font-heading leading-snug font-semibold",
            HEADING_SIZE[el.size ?? "md"],
          )}
        >
          {el.text}
        </h2>
      );
    case "text":
      return (
        <p className={cn("text-muted-foreground", TEXT_SIZE[el.size ?? "md"])}>
          {el.text}
        </p>
      );
    case "badge":
      return <Badge variant="secondary">{el.text}</Badge>;
    case "separator":
      return <Separator className="my-1" />;
    case "button":
      return (
        <Button
          tabIndex={-1}
          variant={el.variant ?? "default"}
          size={BUTTON_SIZE[el.size ?? "md"]}
          className={cn(el.fullWidth && "w-full")}
        >
          {el.text}
        </Button>
      );
    case "input":
      return (
        <div className="grid gap-2">
          <FieldLabel el={el} />
          <Input
            tabIndex={-1}
            readOnly
            type={el.inputType === "password" ? "password" : "text"}
            placeholder={el.placeholder}
          />
        </div>
      );
    case "textarea":
      return (
        <div className="grid gap-2">
          <FieldLabel el={el} />
          <Textarea
            tabIndex={-1}
            readOnly
            placeholder={el.placeholder}
            className="min-h-24 resize-none"
          />
        </div>
      );
    case "select":
      return (
        <div className="grid gap-2">
          <FieldLabel el={el} />
          <Select>
            <SelectTrigger tabIndex={-1} className="w-full">
              <SelectValue placeholder={el.placeholder} />
            </SelectTrigger>
          </Select>
        </div>
      );
    case "checkbox":
      return (
        <div className="flex items-center gap-2.5">
          <Checkbox tabIndex={-1} checked={!!el.checked} />
          <Label className="font-normal">
            {el.text}
            {el.required && <span className="text-destructive">*</span>}
          </Label>
        </div>
      );
    case "switch":
      return (
        <div className="flex items-center justify-between gap-4">
          <Label className="font-normal">{el.text}</Label>
          <Switch tabIndex={-1} checked={!!el.checked} />
        </div>
      );
  }
}

function FieldLabel({ el }: { el: Element }) {
  return (
    <Label>
      {el.label}
      {el.required && <span className="text-destructive">*</span>}
    </Label>
  );
}
