import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  res.status(200).json({
    ok: true,
    name: 'FlavorJourney Backend',
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.url,
  });
}
