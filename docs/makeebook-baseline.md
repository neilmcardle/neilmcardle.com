# makeEbook performance baseline

Measured 10 November 2026, before the refactor, on a production build (`next build` then `next start`) with `npm run perf:baseline -- http://localhost:3005 3` (median of three runs).

Profile: a 390 × 844 phone, CPU slowed 4×, 1.6 Mbps down, 750 kbps up, 150 ms round trip.

## The landing, which today also carries the editor

`/make-ebook` renders the landing and the editor from the same page component, so the landing downloads the editor's code before anyone signs in.

| Measure                               | Now      | Performance UI budget |
| ------------------------------------- | -------- | --------------------- |
| JavaScript, compressed                | 723 KB   | 150 KB                |
| Everything, compressed                | 1,173 KB | 800 KB                |
| Largest paint                         | 8.1 s    | 1.8 s                 |
| Main-thread blocking (sum over 50 ms) | 472 ms   |                       |
| Long tasks                            | 4        |                       |

## Where the JavaScript goes

| Chunk     | Size   | Contains                                                                             |
| --------- | ------ | ------------------------------------------------------------------------------------ |
| Largest   | 358 KB | the editor, Book Mind, and the export libraries (`docx`, `jszip`, PDF and EPUB code) |
| React DOM | 72 KB  | React                                                                                |
| Next      | 60 KB  | `jszip`, `dompurify`                                                                 |
| Supabase  | 35 KB  | auth client                                                                          |

## Not measured yet

The editor itself, after sign-in. Opening it needs an account on the live Supabase project, which the measurement script can't create. Phase 1 adds a local test login so the editor's open time and typing latency can be measured and tested.
