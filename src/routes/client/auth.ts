import { Router } from 'express';

const router = Router();

router.post('/login', (_req, res) => {
  res.status(501).json({ message: 'Login handler not implemented yet' });
});

router.post('/register', (_req, res) => {
  res.status(501).json({ message: 'Register handler not implemented yet' });
});

export default router;
