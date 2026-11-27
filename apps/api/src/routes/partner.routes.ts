import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requirePartnerPortal } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { getPartnerDashboardData, updatePartnerVoucher } from '../services/partner.service.js';

export const partnerRouter = Router();

partnerRouter.use(requireAuth, requirePartnerPortal);

partnerRouter.get(
  '/me',
  asyncHandler(async (req, res) => {
    const data = await getPartnerDashboardData(req.user!.userId);
    res.json({ success: true, data });
  }),
);

partnerRouter.patch(
  '/voucher',
  asyncHandler(async (req, res) => {
    const body = z
      .object({
        code: z.string().min(4).max(20).optional(),
        isActive: z.boolean().optional(),
      })
      .parse(req.body ?? {});

    const updated = await updatePartnerVoucher({
      userId: req.user!.userId,
      code: body.code,
      isActive: body.isActive,
    });
    res.json({ success: true, data: updated });
  }),
);
