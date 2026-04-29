import { Resvg } from '@resvg/resvg-js'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import type { VectorPaintProduct } from './products'

const BUCKET = 'vector-paint-prints'

let bucketEnsured = false

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  if (bucketEnsured) return
  const { data: buckets, error } = await supabase.storage.listBuckets()
  if (error) throw new Error(`Storage listBuckets failed: ${error.message}`)
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
    })
    if (createError && !createError.message.includes('already exists')) {
      throw new Error(`Storage createBucket failed: ${createError.message}`)
    }
  }
  bucketEnsured = true
}

export interface RenderResult {
  url: string
  objectPath: string
  bytes: number
}

export async function rasteriseAndUpload(
  svg: string,
  product: VectorPaintProduct
): Promise<RenderResult> {
  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: product.widthPx },
    background: '#ffffff',
  })
  const png = resvg.render().asPng()

  const supabase = createAdminClient()
  await ensureBucket(supabase)

  const objectPath = `${product.id}/${randomUUID()}.png`
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(objectPath, png, {
      contentType: 'image/png',
      cacheControl: '31536000',
    })
  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
  return { url: data.publicUrl, objectPath, bytes: png.byteLength }
}
