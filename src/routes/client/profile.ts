import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(501).json({ message: 'Profile endpoint not implemented yet' });
});

export default router;
