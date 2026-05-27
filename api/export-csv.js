// ============================================================
//  FakeLive Pro — api/export-csv.js
//  Vercel Serverless Function
//  POST /api/export-csv
// ============================================================

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  const { rows } = req.body || {};
  if (!rows || !rows.length) return res.status(400).json({ error: 'No hay filas' });

  const quote  = v => `"${String(v).replace(/"/g, '""')}"`;
  const BOM    = '﻿';
  const header = '"Title","Content","Time","Image"';
  const lines  = rows.map(r =>
    [r.title, r.content, r.time, r.imageUrl || ''].map(quote).join(',')
  );

  const csv     = BOM + header + '\n' + lines.join('\n');
  const ts      = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
  const country = (rows[0]?.country || 'export').replace(/[^a-zA-Z]/g, '');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="livecake_${country}_${ts}.csv"`);
  return res.send(csv);
};
