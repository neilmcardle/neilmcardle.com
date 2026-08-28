import {
  Document,
  Image,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { LOGOMARK_PATH, LOGOMARK_VIEWBOX } from "@/app/coverly/logomark";
import { RIGHTS_NOTICE } from "@/lib/coverly/attribution";

export type DeckCover = {
  title: string;
  author: string | null;
  imprint: string | null;
  year: number | null;
  image_url: string;
};

export type DeckProps = {
  boardName: string;
  covers: DeckCover[];
  exportedAt?: Date;
};

const INK = "#1a1a1a";
const MUTED = "#6b6b6b";
const FAINT = "#9a9a9a";
const PAPER = "#fbfaf7";
const PER_PAGE = 10;

const styles = StyleSheet.create({
  page: {
    backgroundColor: PAPER,
    color: INK,
    fontFamily: "Helvetica",
    paddingTop: 42,
    paddingHorizontal: 46,
    paddingBottom: 54,
  },
  titlePage: { justifyContent: "space-between" },
  titleKicker: {
    fontSize: 10,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: MUTED,
  },
  titleName: {
    fontSize: 40,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.5,
    marginTop: 10,
  },
  titleMeta: { fontSize: 11, color: MUTED, marginTop: 12 },
  titleRule: { height: 2, width: 64, backgroundColor: INK, marginTop: 22 },
  brand: { fontSize: 10, color: MUTED },
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -8 },
  cell: { width: "20%", paddingHorizontal: 8, marginBottom: 18 },
  coverFrame: {
    height: 200,
    backgroundColor: "#eceae4",
    borderWidth: 0.5,
    borderColor: "#d9d6cd",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  coverImage: { width: "100%", height: "100%", objectFit: "contain" },
  captionTitle: { fontSize: 7.5, fontFamily: "Helvetica-Bold", marginTop: 6 },
  captionMeta: { fontSize: 7, color: MUTED, marginTop: 1.5 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 46,
    right: 46,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: FAINT,
  },
});

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function caption(cover: DeckCover): string {
  return [cover.imprint, cover.year].filter(Boolean).join("  ·  ");
}

function Footer({ boardName }: { boardName: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text>{boardName} · cover comps</Text>
      <Text>{RIGHTS_NOTICE}</Text>
      <Text
        render={({ pageNumber, totalPages }) =>
          `Coverly · ${pageNumber}/${totalPages}`
        }
      />
    </View>
  );
}

export function DeckDocument({
  boardName,
  covers,
  exportedAt = new Date(),
}: DeckProps) {
  const dateLabel = exportedAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document title={`${boardName} · cover comps`} author="Coverly">
      <Page
        size="A4"
        orientation="landscape"
        style={[styles.page, styles.titlePage]}
      >
        <View>
          <Svg
            viewBox={LOGOMARK_VIEWBOX}
            style={{ width: 30, height: 30, marginBottom: 26 }}
          >
            <Path d={LOGOMARK_PATH} fill={INK} />
          </Svg>
          <Text style={styles.titleKicker}>Cover comps</Text>
          <Text style={styles.titleName}>{boardName}</Text>
          <Text style={styles.titleMeta}>
            {covers.length} covers · {dateLabel}
          </Text>
          <View style={styles.titleRule} />
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Svg viewBox={LOGOMARK_VIEWBOX} style={{ width: 10, height: 10 }}>
            <Path d={LOGOMARK_PATH} fill={MUTED} />
          </Svg>
          <Text style={styles.brand}>Assembled with Coverly</Text>
        </View>
      </Page>

      {chunk(covers, PER_PAGE).map((pageCovers, pi) => (
        <Page key={pi} size="A4" orientation="landscape" style={styles.page}>
          <View style={styles.grid}>
            {pageCovers.map((cover, i) => (
              <View key={i} style={styles.cell} wrap={false}>
                <View style={styles.coverFrame}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image has no alt prop */}
                  <Image src={cover.image_url} style={styles.coverImage} />
                </View>
                <Text style={styles.captionTitle}>{cover.title}</Text>
                <Text style={styles.captionMeta}>
                  {caption(cover) || cover.author || " "}
                </Text>
              </View>
            ))}
          </View>
          <Footer boardName={boardName} />
        </Page>
      ))}
    </Document>
  );
}

export function renderDeck(props: DeckProps): Promise<Buffer> {
  return renderToBuffer(<DeckDocument {...props} />);
}
