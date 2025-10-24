import { Router } from 'express';
import mongoose from 'mongoose';
import Room, { RoomStatus } from '../../models/Room';
import Block from '../../models/Block';
import Tenant, { TenantStatus } from '../../models/Tenant';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { buildingId, blockId, status, floorNumber } = req.query;
    const filter: Record<string, unknown> = {};

    if (buildingId) {
      filter.buildingId = buildingId;
    }

    if (blockId) {
      filter.blockId = blockId;
    }

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    if (floorNumber !== undefined) {
      const parsedFloor = Number(floorNumber);
      if (!Number.isNaN(parsedFloor)) {
        filter.floorNumber = parsedFloor;
      }
    }

    const rooms = await Room.find(filter).lean();
    res.json(rooms);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      blockId,
      roomNumber,
      name,
      area,
      capacity,
      price,
      floorNumber,
      status,
      amenities,
      description,
      buildingId: payloadBuildingId,
    } = req.body;

    const block = await Block.findById(blockId).session(session);
    if (!block) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Block not found' });
    }

    if (payloadBuildingId && payloadBuildingId.toString() !== block.buildingId.toString()) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Block does not belong to provided building' });
    }

    const parsedFloorNumber =
      typeof floorNumber === 'number' ? floorNumber : Number.parseInt(floorNumber, 10);

    if (Number.isNaN(parsedFloorNumber)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'floorNumber must be a valid number' });
    }

    const statusValue =
      typeof status === 'string' && Object.values(RoomStatus).includes(status as RoomStatus)
        ? (status as RoomStatus)
        : RoomStatus.AVAILABLE;

    const room = await Room.create(
      [
        {
          buildingId: block.buildingId,
          blockId,
          floorNumber: parsedFloorNumber,
          roomNumber,
          name,
          area,
          capacity,
          price,
          status: statusValue,
          amenities,
          description,
        },
      ],
      { session },
    );

    await Block.findByIdAndUpdate(
      blockId,
      { $inc: { totalRooms: 1 }, $max: { totalFloors: parsedFloorNumber } },
      { session },
    );

    await session.commitTransaction();
    return res.status(201).json(room[0]);
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('tenants').lean();
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    return res.json(room);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      'roomNumber',
      'name',
      'area',
      'capacity',
      'price',
      'status',
      'amenities',
      'description',
      'floorNumber',
    ] as const;

    allowedFields.forEach((field) => {
      if (field in req.body) {
        if (field === 'status' && !Object.values(RoomStatus).includes(req.body[field] as RoomStatus)) {
          return;
        }

        if (field === 'amenities' && !Array.isArray(req.body[field])) {
          return;
        }

        if (field === 'floorNumber') {
          const parsed = Number(req.body[field]);
          if (Number.isNaN(parsed)) {
            return;
          }
          updates[field] = parsed;
          return;
        }

        updates[field] = req.body[field];
      }
    });

    const room = await Room.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (updates.floorNumber !== undefined) {
      await Block.findByIdAndUpdate(room.blockId, { $max: { totalFloors: updates.floorNumber } });
    }

    return res.json(room);
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const room = await Room.findById(req.params.id).session(session);
    if (!room) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Room not found' });
    }

    await Tenant.deleteMany({ roomId: room._id }).session(session);
    await mongoose.model('Invoice').deleteMany({ roomId: room._id }).session(session);
    await Room.deleteOne({ _id: room._id }).session(session);

    await Block.findByIdAndUpdate(room.blockId, { $inc: { totalRooms: -1 } }, { session });

    await session.commitTransaction();
    return res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

router.post('/:id/mark-available', async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status: RoomStatus.AVAILABLE },
      { new: true },
    );

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await Tenant.updateMany(
      { roomId: room._id, status: TenantStatus.ACTIVE },
      { status: TenantStatus.MOVED_OUT, moveOutDate: new Date() },
    );

    return res.json(room);
  } catch (error) {
    return next(error);
  }
});

export default router;
