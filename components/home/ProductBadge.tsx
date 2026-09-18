import { useId } from "react";
import { SPARK_MARK_PATH } from "@/components/spark/SparkMark";
import styles from "./home.module.css";

export type BadgeKey = "makeebook" | "coverly" | "doodlewire" | "spark";

const SHADOW_MATRIX = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0";
const SHADOW_COLOUR = "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0";

const DOT_STEPS = [1, 9.25, 17.5, 25.75, 34, 42.25, 50.5, 58.75];
const DOT_FIRST = DOT_STEPS[0];
const DOT_LAST = DOT_STEPS[DOT_STEPS.length - 1];

export function MarkPlate({ id }: { id: string }) {
  return (
    <>
      <rect
        className={styles.markPlate}
        x="0.5"
        y="0.5"
        width="62"
        height="62"
        rx="10.5"
        fill="#14120E"
        stroke={`url(#${id}-edge)`}
      />
      {DOT_STEPS.map((y) =>
        DOT_STEPS.map((x) =>
          (x === DOT_FIRST || x === DOT_LAST) &&
          (y === DOT_FIRST || y === DOT_LAST) ? null : (
            <rect
              key={`${x}-${y}`}
              className={styles.markDot}
              x={x}
              y={y}
              width="3.25"
              height="3.25"
              fill="#3B3936"
            />
          ),
        ),
      )}
    </>
  );
}

export function MarkEdge({ id }: { id: string }) {
  return (
    <linearGradient
      id={`${id}-edge`}
      x1="2.01667"
      y1="62"
      x2="62"
      y2="2.01667"
      gradientUnits="userSpaceOnUse"
    >
      <stop stopColor="#1E1E1E" />
      <stop offset="0.341346" stopColor="#363636" />
      <stop offset="0.490385" stopColor="#D7D7D7" />
      <stop offset="0.591346" stopColor="#414141" />
      <stop offset="1" stopColor="#353535" />
    </linearGradient>
  );
}

function Shadow({
  id,
  x,
  y,
  width,
  height,
  dy,
  blur,
}: {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  blur: number;
}) {
  return (
    <filter
      id={id}
      x={x}
      y={y}
      width={width}
      height={height}
      filterUnits="userSpaceOnUse"
      colorInterpolationFilters="sRGB"
    >
      <feFlood floodOpacity="0" result="bg" />
      <feColorMatrix
        in="SourceAlpha"
        type="matrix"
        values={SHADOW_MATRIX}
        result="hardAlpha"
      />
      <feOffset dy={dy} />
      <feGaussianBlur stdDeviation={blur} />
      <feComposite in2="hardAlpha" operator="out" />
      <feColorMatrix type="matrix" values={SHADOW_COLOUR} />
      <feBlend mode="normal" in2="bg" result="drop" />
      <feBlend mode="normal" in="SourceGraphic" in2="drop" />
    </filter>
  );
}

const MAKEEBOOK_MARK =
  "M26.16 20.88C26.16 17.44 25.76 15.72 24.96 15.72C24.24 15.72 23.2 16.72 21.84 18.72C20.56 20.72 19.16 22.72 17.64 24.72C16.12 26.8 14.72 27.84 13.44 27.84C12.72 27.84 11.6 26.56 10.08 24C8.64 21.44 7.04 18.92 5.28 16.44C3.52 13.88 1.96 12.6 0.6 12.6C0.2 12.6 0 12.4 0 12C0 10.72 1.52 8.4 4.56 5.04C7.6 1.68 9.76 0 11.04 0C12.4 0 14.36 2.08 16.92 6.24C19.56 10.4 21.32 12.48 22.2 12.48C23.08 12.48 24.84 10.84 27.48 7.56C30.2 4.28 32.32 2.64 33.84 2.64C35.44 2.64 36.6 3.28 37.32 4.56C38.12 5.76 38.56 7.08 38.64 8.52C38.8 9.96 38.96 11.32 39.12 12.6C39.28 13.8 39.6 14.4 40.08 14.4C40.88 14.4 42.92 12.44 46.2 8.52C49.56 4.52 52 2.52 53.52 2.52C55.2 2.52 58 5.04 61.92 10.08C63.36 12 65.16 13.76 67.32 15.36C69.56 16.88 71.4 17.64 72.84 17.64C74.28 17.64 75.68 17.4 77.04 16.92C78.4 16.44 79.56 16.2 80.52 16.2C81.48 16.2 81.96 16.52 81.96 17.16C81.96 17.48 81.8 17.76 81.48 18C81.24 18.24 80.56 18.88 79.44 19.92C78.4 20.88 77.52 21.64 76.8 22.2C76.16 22.76 75.2 23.52 73.92 24.48C72.72 25.52 71.68 26.32 70.8 26.88C68.4 28.32 66.12 29.04 63.96 29.04C61.88 29.04 59.52 27.84 56.88 25.44C54.32 23.12 52.08 20.8 50.16 18.48C48.32 16.08 46.96 14.88 46.08 14.88C45.2 14.88 43.76 16.08 41.76 18.48C39.84 20.88 37.84 23.28 35.76 25.68C33.76 28.08 32 29.28 30.48 29.28C29.04 29.28 27.92 28.6 27.12 27.24C26.4 25.88 26.04 24.4 26.04 22.8L26.16 20.88Z";

const MAKEEBOOK_TRANSFORM = "translate(8.5 23.287) scale(0.56098)";

export const COVERLY_MARK =
  "M47.7744 32.1592C47.574 31.9377 47.3631 31.7057 47.131 31.4736C45.686 30.0286 44.0827 29.2269 42.4583 28.9843C44.1144 28.7312 45.686 27.9085 47.0045 26.59C47.2787 26.3157 47.5318 26.0415 47.7534 25.7673C48.0276 25.4297 48.0065 24.9445 47.7006 24.6281L36.3195 13.247C36.0031 12.9306 35.4968 12.92 35.1698 13.2048C34.9483 13.4052 34.7162 13.6162 34.4842 13.8482C33.0391 15.2933 32.248 16.8754 32.0054 18.4893C31.7417 16.8543 30.9296 15.3038 29.6216 13.9959C29.3368 13.7111 29.0731 13.4685 28.7989 13.2364C28.4614 12.9517 27.9762 12.9833 27.6597 13.2892L16.247 24.6808C15.9306 24.9973 15.92 25.5036 16.2048 25.8305C16.4052 26.0626 16.6162 26.2947 16.8588 26.5267C18.2933 27.9612 19.886 28.7628 21.4998 29.0054C19.8543 29.2691 18.2933 30.0813 16.9853 31.3998C16.7005 31.674 16.4579 31.9483 16.2259 32.2225C15.9411 32.5601 15.9727 33.0453 16.2786 33.3617L27.6703 44.7534C27.9867 45.0698 28.493 45.0803 28.82 44.7955C29.0415 44.5951 29.2736 44.3842 29.5056 44.1521C30.9507 42.7071 31.7523 41.1038 31.9949 39.49C32.2586 41.1354 33.0708 42.6965 34.3893 44.015C34.6635 44.2893 34.9377 44.5424 35.212 44.7639C35.5495 45.0381 36.0347 45.0171 36.3512 44.7112L47.7428 33.3195C48.0592 33.0031 48.0698 32.4968 47.785 32.1698L47.7744 32.1592ZM34.8428 31.885C33.1868 33.541 32.2586 35.3763 31.9843 37.2011C31.689 35.2814 30.6659 33.425 29.0942 31.8534C27.4488 30.2079 25.6135 29.2797 23.7992 29.0054C25.7189 28.6996 27.5754 27.687 29.147 26.1153C30.7186 24.5437 31.7312 22.6346 31.9949 20.8203C32.3008 22.7295 33.3239 24.5754 34.885 26.147C36.4461 27.7186 38.3869 28.7418 40.2117 29.0054C38.2814 29.3008 36.4144 30.3239 34.8428 31.9061V31.885Z";

const DOODLEWIRE_TOP =
  "M45.9985 17.1961C44.5979 15.6652 42.5947 14.688 40.4939 14.688H18.9477C17.2866 14.688 16 16.1701 16 17.7661V26.935C16 28.5798 17.3354 29.9967 19.0129 29.9967H40.5264C43.4905 29.9967 46.1288 28.0913 47.3013 25.5181C48.5879 22.6844 48.0668 19.4435 45.9985 17.1798V17.1961ZM40.445 25.7461H20.2669V18.9386H40.4939C42.3505 19.0038 43.751 20.5509 43.751 22.3424C43.751 24.1338 42.3179 25.6647 40.4613 25.7461H40.445Z";

const DOODLEWIRE_BOTTOM =
  "M46.9268 39.019L43.2462 41.5433C42.3342 42.1785 41.4222 42.7159 40.331 43.0091C38.1487 43.6116 36.0967 43.2533 34.1261 42.1948C32.7581 41.4619 31.1621 41.4782 29.7941 42.2273C27.5304 43.4813 25.0224 43.6768 22.6283 42.6671C21.9118 42.3576 21.3092 41.9505 20.674 41.5108L17.0749 39.0516C16.0977 38.3839 15.8697 37.0484 16.5212 36.0876C17.1726 35.1267 18.4917 34.8661 19.4852 35.5339L23.2635 38.1233C23.8823 38.5467 24.4524 38.9213 25.2178 39.019C26.0321 39.133 26.8789 38.9702 27.6118 38.563C30.3641 36.9996 33.6701 37.0322 36.4061 38.5956C37.1064 39.0027 37.9533 39.133 38.735 39.019C39.4842 38.9213 40.0704 38.5467 40.6893 38.1233L44.4513 35.5502C45.4285 34.8824 46.7151 35.0942 47.3991 36.0387C48.0831 36.967 47.9202 38.335 46.9268 39.019Z";

export const N_MARK_SHAPE =
  '<path d="M45 45L32 31.2985V18H45V45Z"/>' +
  '<path d="M18 18L32 31.6343L32 45L18 45L18 18Z"/>';

export const MARK_SHAPES: Record<BadgeKey, string> = {
  makeebook: `<g transform="${MAKEEBOOK_TRANSFORM}"><path d="${MAKEEBOOK_MARK}"/></g>`,
  coverly: `<path d="${COVERLY_MARK}"/>`,
  doodlewire: `<path fill-rule="evenodd" clip-rule="evenodd" d="${DOODLEWIRE_TOP}"/><path d="${DOODLEWIRE_BOTTOM}"/>`,
  spark: `<path d="${SPARK_MARK_PATH}"/>`,
};

const SHADOWS: Record<
  BadgeKey,
  {
    x: number;
    y: number;
    width: number;
    height: number;
    dy: number;
    blur: number;
  }
> = {
  makeebook: { x: 5, y: 19, width: 53, height: 25, dy: 2, blur: 2 },
  coverly: { x: 12, y: 11, width: 39.9897, height: 40.0004, dy: 2, blur: 2 },
  doodlewire: {
    x: 12,
    y: 12.688,
    width: 40.0004,
    height: 36.6247,
    dy: 2,
    blur: 2,
  },
  spark: { x: 20, y: 14, width: 22.927, height: 36.7288, dy: 1, blur: 0.5 },
};

export default function ProductBadge({
  badge,
  size = 40,
}: {
  badge: BadgeKey;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const id = `badge-${badge}-${uid}`;
  const shadow = SHADOWS[badge];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 63 63"
      fill="none"
      aria-hidden="true"
    >
      <MarkPlate id={id} />

      {badge === "makeebook" && (
        <g className={styles.markGlyph} filter={`url(#${id}-drop)`}>
          <path
            d={MAKEEBOOK_MARK}
            transform={MAKEEBOOK_TRANSFORM}
            fill="#FBF9F3"
          />
        </g>
      )}

      {badge === "coverly" && (
        <g className={styles.markGlyph} filter={`url(#${id}-drop)`}>
          <path d={COVERLY_MARK} fill="#FBF9F3" />
        </g>
      )}

      {badge === "spark" && (
        <g className={styles.markGlyph} filter={`url(#${id}-drop)`}>
          <path d={SPARK_MARK_PATH} fill="#FEFEFE" />
        </g>
      )}

      {badge === "doodlewire" && (
        <g className={styles.markGlyph} filter={`url(#${id}-drop)`}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d={DOODLEWIRE_TOP}
            fill="#FBF9F3"
          />
          <path d={DOODLEWIRE_BOTTOM} fill="#FBF9F3" />
        </g>
      )}

      <defs>
        <MarkEdge id={id} />
        <Shadow id={`${id}-drop`} {...shadow} />
      </defs>
    </svg>
  );
}
