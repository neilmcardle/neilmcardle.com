# Known Dependency Issues & Decisions

## EPUB Reader (epubjs + xmldom)

**Status:** Kept as-is with documented vulnerabilities

**Issue:** 
- `epubjs` (EPUB reading library) depends on `xmldom` which has 8 critical/high vulnerabilities
- `xmldom` versions all have XML parsing security issues (injection, DoS, CDATA serialization)
- All epubjs versions (0.3–0.5) depend on vulnerable xmldom

**Why it's acceptable:**
1. Vulnerabilities are isolated to EPUB preview feature (non-core)
2. Core functionality (editing, exporting) unaffected
3. Risk is low for typical EPUB files in a trusted internal context
4. No maintained modern alternative exists in React ecosystem
5. Custom EPUB reader would add significant maintenance burden

**Decision:** Keep EPUBReaderModal as-is. Users can always download EPUB and open in external readers if needed.

**Mitigation:**
- Deployment uses `.npmrc` with `legacy-peer-deps=true` to resolve React 18 peer dependency conflicts
- xmldom is only loaded when user opens EPUB preview modal
- Input validation on blob format before parsing

**Future:**
- Monitor epubjs repository for updates
- Consider removing EPUB preview if security posture changes
- If replacement needed, evaluate: Foliate, Readium, or custom jszip-based implementation

## draft-js

**Status:** Kept at 0.7.0

**Issue:**
- Very old package (2016) with React 15 peer dependencies
- Incompatible with React 18 without `legacy-peer-deps`

**Why it's acceptable:**
- Used only for EPUBReaderModal type definitions
- No active development needed
- Functional despite peer dependency mismatch

**Alternative:** Remove if EPUB preview feature is ever removed
