import defaults from '../../lib/defaults.json';

// Dibaca oleh halaman admin sebagai isi bawaan kalau ada data yang belum pernah disimpan.
export const GET = () =>
  new Response(JSON.stringify(defaults), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
