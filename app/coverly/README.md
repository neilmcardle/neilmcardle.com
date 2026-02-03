# Book Cover Designer

A TLDraw-powered book cover design tool integrated with neilmcardle.com.

## Features

- **Infinite Canvas**: Use TLDraw's powerful drawing tools to create book covers
- **AI Generation**: Generate cover art from text prompts or transform sketches
- **Templates**: Pre-made templates for different book genres
- **Multiple Formats**: Export as PNG, JPEG, or SVG
- **Integration**: Send covers directly to Make eBook

## Setup

### 1. TLDraw License Key

Add your TLDraw Hobby License key to `.env.local`:

```bash
NEXT_PUBLIC_TLDRAW_LICENSE_KEY=your-license-key-here
```

Get your license key from [tldraw.dev/pricing](https://tldraw.dev/pricing)

### 2. AI Image Generation (Optional)

For AI-powered cover generation, you can use one of these services:

**Option A: xAI (Grok)**
Your existing `XAI_API_KEY` will be used if available.

**Option B: OpenAI DALL-E**
Add to `.env.local`:
```bash
OPENAI_API_KEY=your-openai-key
```

**Option C: Stability AI**
Add to `.env.local`:
```bash
STABILITY_API_KEY=your-stability-key
```

## Usage

### Local Development

```bash
npm run dev
# Visit http://localhost:3000/book-cover-designer
```

### Creating a Cover

1. **Choose a template** from the left panel, or start with a blank canvas
2. **Select your cover size** (Kindle eBook, Paperback, etc.)
3. **Draw and design** using TLDraw's tools:
   - Use the draw tool for freehand sketches
   - Add shapes and text elements
   - Drag images from your computer
4. **Generate with AI** (optional):
   - Enter a description of your cover
   - Select a genre style
   - Click "Generate Cover"
5. **Export** your finished cover:
   - Download as PNG/JPEG/SVG
   - Or send directly to Make eBook

### Keyboard Shortcuts

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo
- `V` - Select tool
- `D` - Draw tool
- `T` - Text tool
- `G` - Grab/pan tool

## Cover Size Presets

| Format | Dimensions | Use Case |
|--------|------------|----------|
| Kindle eBook | 1600 × 2560px | Amazon Kindle ebooks |
| Paperback 5×8 | 1500 × 2400px | Standard paperback |
| Paperback 6×9 | 1800 × 2700px | Trade paperback |
| Hardcover | 1800 × 2700px | Hardcover editions |
| Square | 2000 × 2000px | Audiobook covers |

## Integration with Make eBook

When you click "Send to Make eBook", the cover is:
1. Exported as a high-quality PNG
2. Stored temporarily in localStorage
3. Make eBook opens and imports the cover automatically

## File Structure

```
app/book-cover-designer/
├── page.tsx                 # Main page component
├── styles.css              # Custom TLDraw styles
└── components/
    ├── BookCoverCanvas.tsx  # TLDraw canvas wrapper
    ├── AIPanel.tsx         # AI generation controls
    ├── CoverTemplatePanel.tsx # Templates and tools
    ├── ExportPanel.tsx     # Export options
    └── index.ts            # Component exports

app/api/
├── generate-cover/          # AI cover generation
└── generate-cover-from-sketch/ # Sketch-to-cover AI
```

## Future Enhancements

- [ ] Custom font upload support
- [ ] Spine and back cover design (full wrap)
- [ ] Save/load projects
- [ ] Collaboration features
- [ ] More AI models support
- [ ] ISBN barcode generator

## Deployment

The book cover designer is part of neilmcardle.com and will be deployed with the main site. No additional configuration is needed for production.

---

Built with [TLDraw](https://tldraw.dev) infinite canvas SDK.
