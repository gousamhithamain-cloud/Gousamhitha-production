const router = require('express').Router();
const supabase = require('../config/supabase');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { successResponse, batchResponse } = require('../utils/response');
const { authenticate, requireRole } = require('../middleware/auth');

// GET /api/payouts — list all payouts with vendor info (admin only)
router.get('/', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
    const { data: payouts, error } = await supabase
        .from('vendor_payouts')
        .select('*, vendors(business_name)')
        .order('created_at', { ascending: false });

    if (error) throw new AppError('Failed to fetch payouts: ' + error.message, 500);

    return batchResponse(res, 200, payouts || [], (payouts || []).length, 'Payouts retrieved');
}));

// PUT /api/payouts/:id/pay — mark payout as paid (admin only)
router.put('/:id/pay', authenticate, requireRole(['admin']), asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from('vendor_payouts')
        .update({ payout_status: 'paid', payout_date: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

    if (error) throw new AppError('Failed to update payout: ' + error.message, 500);
    if (!data) throw new AppError('Payout not found', 404);

    return successResponse(res, 200, data, 'Payout marked as paid');
}));

module.exports = router;
