// Temporary JS shim to satisfy Next type importer during build
// This file is intentionally minimal and mirrors the exported handler signature.
export async function GET(request) {
  return new Response(JSON.stringify({ success: true, data: {} }), {
    headers: { 'content-type': 'application/json' },
  });
}
