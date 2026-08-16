export async function GET() {
  return Response.json({
    googleEnabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  });
}

export const dynamic = 'force-dynamic';
