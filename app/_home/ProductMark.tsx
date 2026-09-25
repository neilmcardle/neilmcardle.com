import {
  COVERLY_MARK,
  DOODLEWIRE_BOTTOM,
  DOODLEWIRE_TOP,
  MAKEEBOOK_MARK,
  MAKEEBOOK_TRANSFORM,
} from "@/components/home/ProductBadge";
import { SPARK_MARK_PATH } from "@/components/spark/SparkMark";

export type MarkKey = "makeebook" | "coverly" | "doodlewire" | "spark";

const VIEW: Record<MarkKey, string> = {
  makeebook: "8 22 48 18",
  doodlewire: "15 14 34 31",
  coverly: "15 12 34 34",
  spark: "20 13 23 37",
};

export default function ProductMark({
  mark,
  className,
}: {
  mark: MarkKey;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox={VIEW[mark]}
      fill="currentColor"
      aria-hidden="true"
      data-mark={mark}
    >
      {mark === "makeebook" && (
        <path d={MAKEEBOOK_MARK} transform={MAKEEBOOK_TRANSFORM} />
      )}
      {mark === "coverly" && <path d={COVERLY_MARK} />}
      {mark === "spark" && <path d={SPARK_MARK_PATH} />}
      {mark === "doodlewire" && (
        <>
          <path fillRule="evenodd" clipRule="evenodd" d={DOODLEWIRE_TOP} />
          <path d={DOODLEWIRE_BOTTOM} />
        </>
      )}
    </svg>
  );
}
