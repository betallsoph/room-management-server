import { Router } from 'express';
import mongoose from 'mongoose';
import Tenant, { TenantStatus } from '../../models/Tenant';
import Room, { RoomStatus } from '../../models/Room';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, roomId, buildingId, blockId } = req.query;
    const filter: Record<string, unknown> = {};

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    if (roomId) {
      filter.roomId = roomId;
    }

    let scopedRoomIds: mongoose.Types.ObjectId[] | undefined;

    if (buildingId || blockId) {
      const roomFilter: Record<string, unknown> = {};

      if (buildingId) {
        roomFilter.buildingId = buildingId;
      }

      if (blockId) {
        roomFilter.blockId = blockId;
      }

      scopedRoomIds = (await Room.find(roomFilter).distinct('_id')) as mongoose.Types.ObjectId[];

      if (scopedRoomIds.length === 0) {
        return res.json([]);
      }
    }

    if (scopedRoomIds) {
      if (filter.roomId) {
        const requestedRoomId = filter.roomId as mongoose.Types.ObjectId | string;
        const matchesScope = scopedRoomIds.some((id) => id.toString() === requestedRoomId.toString());
        if (!matchesScope) {
          return res.json([]);
        }
      } else {
        filter.roomId = { $in: scopedRoomIds };
      }
    }

    const tenants = await Tenant.find(filter).lean();
    res.json(tenants);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      roomId,
      fullName,
      phone,
      email,
      idCard,
      dateOfBirth,
      hometown,
      moveInDate,
      deposit,
      monthlyRent,
      notes,
      emergencyContact,
    } = req.body;

    const room = await Room.findById(roomId).session(session);

    if (!room) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status !== RoomStatus.AVAILABLE) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Room is not available' });
    }

    const existingTenant = await Tenant.findOne({
      roomId,
      status: TenantStatus.ACTIVE,
    }).session(session);

    if (existingTenant) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Room already occupied' });
    }

    const [tenant] = await Tenant.create(
      [
        {
          roomId,
          fullName,
          phone,
          email,
          idCard,
          dateOfBirth,
          hometown,
          moveInDate,
          deposit,
          monthlyRent,
          status: TenantStatus.ACTIVE,
          notes,
          emergencyContact,
        },
      ],
      { session },
    );

    await Room.findByIdAndUpdate(roomId, { status: RoomStatus.OCCUPIED }, { session });

    await session.commitTransaction();
    return res.status(201).json(tenant);
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const tenant = await Tenant.findById(req.params.id)
      .populate({
        path: 'roomId',
        populate: {
          path: 'blockId',
          populate: {
            path: 'buildingId',
          },
        },
      })
      .lean();

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      'fullName',
      'phone',
      'email',
      'idCard',
      'dateOfBirth',
      'hometown',
      'moveInDate',
      'moveOutDate',
      'deposit',
      'monthlyRent',
      'status',
      'notes',
      'emergencyContact',
    ];

    allowedFields.forEach((field) => {
      if (field in req.body) {
        if (field === 'status' && !Object.values(TenantStatus).includes(req.body[field] as TenantStatus)) {
          return;
        }

        if (field === 'emergencyContact' && typeof req.body[field] !== 'object') {
          return;
        }

        updates[field] = req.body[field];
      }
    });

    const tenant = await Tenant.findByIdAndUpdate(req.params.id, updates, { new: true });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    return res.json(tenant);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/move-out', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenant = await Tenant.findById(req.params.id).session(session);

    if (!tenant) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Tenant not found' });
    }

    tenant.status = TenantStatus.MOVED_OUT;
    tenant.moveOutDate = req.body.moveOutDate ? new Date(req.body.moveOutDate) : new Date();
    await tenant.save({ session });

    await Room.findByIdAndUpdate(tenant.roomId, { status: RoomStatus.AVAILABLE }, { session });

    await session.commitTransaction();
    return res.json(tenant);
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

router.delete('/:id', async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const tenant = await Tenant.findById(req.params.id).session(session);

    if (!tenant) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Tenant not found' });
    }

    await Tenant.deleteOne({ _id: tenant._id }).session(session);

    const activeTenant = await Tenant.findOne({
      roomId: tenant.roomId,
      status: TenantStatus.ACTIVE,
    }).session(session);

    if (!activeTenant) {
      await Room.findByIdAndUpdate(tenant.roomId, { status: RoomStatus.AVAILABLE }, { session });
    }

    await session.commitTransaction();
    return res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    return next(error);
  } finally {
    session.endSession();
  }
});

export default router;
