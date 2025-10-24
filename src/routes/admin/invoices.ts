import { Router } from 'express';
import Invoice, { InvoiceStatus, InvoiceAttachment, InvoiceLineItem } from '../../models/Invoice';
import Room from '../../models/Room';
import Tenant from '../../models/Tenant';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { status, buildingId, blockId, roomId, tenantId, period } = req.query;
    const filter: Record<string, unknown> = {};

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    if (buildingId) {
      filter.buildingId = buildingId;
    }

    if (blockId) {
      filter.blockId = blockId;
    }

    if (roomId) {
      filter.roomId = roomId;
    }

    if (tenantId) {
      filter.tenantId = tenantId;
    }

    if (period && typeof period === 'string') {
      filter.period = period;
    }

    const invoices = await Invoice.find(filter).lean();
    res.json(invoices);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      buildingId,
      blockId,
      roomId,
      tenantId,
      period,
      status,
      lineItems,
      totalAmount,
      balanceDue,
      dueDate,
      sentAt,
      paidAt,
      notes,
    } = req.body;

    const roomExists = await Room.exists({ _id: roomId });
    const tenantExists = await Tenant.exists({ _id: tenantId });

    if (!roomExists || !tenantExists) {
      return res.status(400).json({ message: 'Room or tenant not found' });
    }

    if (typeof period !== 'string') {
      return res.status(400).json({ message: 'period is required (format YYYY-MM)' });
    }

    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ message: 'Invoice must include line items' });
    }

    const sanitizedLineItems: InvoiceLineItem[] = [];
    let computedTotal = 0;

    for (const item of lineItems) {
      if (!item?.label || item.amount === undefined) {
        return res.status(400).json({ message: 'Each line item requires label and amount' });
      }

      const amount = Number(item.amount);
      if (Number.isNaN(amount) || amount < 0) {
        return res.status(400).json({ message: 'Line item amount must be a non-negative number' });
      }

      computedTotal += amount;
      sanitizedLineItems.push({
        label: item.label,
        amount,
        description: item.description,
      });
    }

    const resolvedTotalAmount =
      typeof totalAmount === 'number' && totalAmount >= 0 ? totalAmount : computedTotal;
    const resolvedBalanceDue =
      typeof balanceDue === 'number' && balanceDue >= 0 ? balanceDue : resolvedTotalAmount;

    const statusValue =
      typeof status === 'string' && Object.values(InvoiceStatus).includes(status as InvoiceStatus)
        ? (status as InvoiceStatus)
        : InvoiceStatus.DRAFT;

    let resolvedSentAt = sentAt ? new Date(sentAt) : undefined;
    let resolvedPaidAt = paidAt ? new Date(paidAt) : undefined;

    if (statusValue === InvoiceStatus.SENT && !resolvedSentAt) {
      resolvedSentAt = new Date();
    }

    if (statusValue === InvoiceStatus.PAID && !resolvedPaidAt) {
      resolvedPaidAt = new Date();
    }

    const resolvedDueDate = dueDate ? new Date(dueDate) : undefined;

    const invoice = await Invoice.create({
      buildingId,
      blockId,
      roomId,
      tenantId,
      period,
      status: statusValue,
      lineItems: sanitizedLineItems,
      totalAmount: resolvedTotalAmount,
      balanceDue: resolvedBalanceDue,
      dueDate: resolvedDueDate,
      sentAt: resolvedSentAt,
      paidAt: resolvedPaidAt,
      notes,
    });

    return res.status(201).json(invoice);
  } catch (error) {
    if ((error as Error).name === 'MongoServerError') {
      return res.status(400).json({ message: 'Invoice already exists for this period' });
    }
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('tenantId')
      .populate('roomId')
      .lean();

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.json(invoice);
  } catch (error) {
    return next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, paidAt, sentAt, balanceDue } = req.body;

    if (!Object.values(InvoiceStatus).includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatePayload: Record<string, unknown> = {
      status,
    };

    if (status === InvoiceStatus.PAID) {
      updatePayload.paidAt = paidAt ? new Date(paidAt) : new Date();
      updatePayload.balanceDue = 0;
    } else if (paidAt) {
      updatePayload.paidAt = new Date(paidAt);
    }

    if (status === InvoiceStatus.SENT && !sentAt) {
      updatePayload.sentAt = new Date();
    } else if (sentAt) {
      updatePayload.sentAt = new Date(sentAt);
    }

    if (balanceDue !== undefined && typeof balanceDue === 'number') {
      updatePayload.balanceDue = balanceDue;
    }

    const invoice = await Invoice.findByIdAndUpdate(req.params.id, updatePayload, { new: true });

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    return res.json(invoice);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/attachments', async (req, res, next) => {
  try {
    const { fileUrl, fileName, fileType, fileSize, note } = req.body as InvoiceAttachment;

    if (!fileUrl) {
      return res.status(400).json({ message: 'Attachment fileUrl is required' });
    }

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.attachments.push({
      fileUrl,
      fileName,
      fileType,
      fileSize,
      note,
      uploadedAt: new Date(),
    });

    // Keep attachments manageable (placeholder behaviour)
    if (invoice.attachments.length > 10) {
      invoice.attachments = invoice.attachments.slice(-10);
    }

    await invoice.save();

    return res.json(invoice);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/mark-sent', async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (!invoice.sentAt) {
      invoice.sentAt = new Date();
    }

    if (invoice.status === InvoiceStatus.DRAFT) {
      invoice.status = InvoiceStatus.SENT;
    }

    await invoice.save();

    return res.json(invoice);
  } catch (error) {
    return next(error);
  }
});

router.post('/:id/mark-reminder', async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    invoice.status = invoice.status === InvoiceStatus.PAID ? invoice.status : InvoiceStatus.OVERDUE;

    await invoice.save();

    return res.json(invoice);
  } catch (error) {
    return next(error);
  }
});

export default router;
