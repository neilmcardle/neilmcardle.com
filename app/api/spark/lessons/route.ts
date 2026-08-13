import { getAllModules } from '@/lib/spark/content';

export async function GET() {
  const modules = await getAllModules();
  return Response.json({ modules });
}
