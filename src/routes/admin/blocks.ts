import { Router } from 'express';
import mongoose from 'mongoose';
import Block from '../../models/Block';
import Building from '../../models/Building';
import Room from '../../models/Room';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { buildingId } = req.query;
    const filter = buildingId ? { buildingId } : {};
    const blocks = await Block.find(filter).lean();
    res.json(blocks);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { buildingId, name, description, totalFloors } = req.body;
    const building = await Building.findById(buildingId).session(session);

    if (!building) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Building not found' });
    }

    const block = await Block.create(
      [
        {
          buildingId,
          name,
          description,
          totalFloors,
        },
      ],
      { session },
    );

    await Building.findByIdAndUpdate(
      buildingId,
      { $inc: { totalBlocks: 1 } },
      { session },
    );

    await session.commitTransaction();
    return res.status(201).json(block[0]);
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const block = await Block.findById(req.params.id).populate('rooms').lean();
    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }
    return res.json(block);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updates: Record<string, unknown> = {};
    const allowedFields = ['name', 'description', 'totalFloors'] as const;

    allowedFields.forEach((field) => {
      if (field in req.body) {
        (updates as Record<string, unknown>)[field] = req.body[field];
      }
    });

    const block = await Block.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!block) {
      return res.status(404).json({ message: 'Block not found' });
    }

    return res.json(block);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const blockId = req.params.id;
    const block = await Block.findById(blockId).session(session);

    if (!block) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Block not found' });
    }

    const rooms = await Room.find({ blockId }).session(session);
    const roomIds = rooms.map((room) => room._id);

    if (roomIds.length > 0) {
      await mongoose.model('Tenant').deleteMany({ roomId: { $in: roomIds } }).session(session);
      await mongoose.model('Invoice').deleteMany({ roomId: { $in: roomIds } }).session(session);
    }

    await Room.deleteMany({ blockId }).session(session);
    await Block.deleteOne({ _id: blockId }).session(session);

    await Building.findByIdAndUpdate(
      block.buildingId,
      { $inc: { totalBlocks: -1 } },
      { session },
    );

    await session.commitTransaction();
    return res.json({ message: 'Block deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

export default router;
