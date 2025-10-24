import { Router } from 'express';
import mongoose from 'mongoose';
import Building from '../../models/Building';
import Block from '../../models/Block';
import Room from '../../models/Room';
import Tenant from '../../models/Tenant';
import Invoice from '../../models/Invoice';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const buildings = await Building.find().lean();
    res.json(buildings);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, address, description, defaultAmenities } = req.body;
    const payload: Record<string, unknown> = {
      name,
      address,
      description,
    };

    if (Array.isArray(defaultAmenities)) {
      payload.defaultAmenities = defaultAmenities;
    }

    const building = await Building.create(payload);
    res.status(201).json(building);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const building = await Building.findById(req.params.id).populate('blocks').lean();
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }
    return res.json(building);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updates: Record<string, unknown> = {};
    const allowedFields = ['name', 'address', 'description', 'defaultAmenities'] as const;

    allowedFields.forEach((field) => {
      if (field in req.body) {
        if (field === 'defaultAmenities' && !Array.isArray(req.body[field])) {
          return;
        }

        (updates as Record<string, unknown>)[field] = req.body[field];
      }
    });

    const building = await Building.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    return res.json(building);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const buildingId = req.params.id;

    const blocks = await Block.find({ buildingId }).session(session);
    const blockIds = blocks.map((block) => block._id);

    const rooms = await Room.find({ blockId: { $in: blockIds } }).session(session);
    const roomIds = rooms.map((room) => room._id);

    await Tenant.deleteMany({ roomId: { $in: roomIds } }).session(session);
    await Invoice.deleteMany({ roomId: { $in: roomIds } }).session(session);
    await Room.deleteMany({ blockId: { $in: blockIds } }).session(session);
    await Block.deleteMany({ buildingId }).session(session);
    const result = await Building.findByIdAndDelete(buildingId).session(session);

    if (!result) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Building not found' });
    }

    await session.commitTransaction();
    return res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

export default router;
