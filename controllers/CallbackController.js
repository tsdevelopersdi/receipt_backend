/**
 * CallbackController
 * Handles asynchronous responses from external services like n8n.
 */

export const priceFinderCallback = (req, res) => {
    console.log('[Callback] Received request body:', JSON.stringify(req.body, null, 2));

    const { draft_id, draftId, items, results } = req.body;
    const finalDraftId = draft_id || draftId;

    if (!finalDraftId) {
        return res.status(400).json({ status: 'error', message: 'Missing draftId or draft_id' });
    }

    // Determine the data source (support both 'items' and 'results' from n8n)
    let finalItems = items || results || [];

    // If data comes in n8n's [{json: {...}}] format, unwrap it
    if (Array.isArray(finalItems)) {
        finalItems = finalItems.map(item => item.json ? item.json : item);
    }

    console.log(`[Callback] Emitting 'price_finder_done' for draft_${finalDraftId} with ${finalItems.length} items`);

    // Get io instance from app
    const io = req.app.get('io');

    // Emit event to the specific room
    io.to(`draft_${finalDraftId}`).emit('price_finder_done', {
        success: true,
        items: finalItems
    });

    res.json({ status: 'success', message: 'Callback received and signal emitted', draftId: finalDraftId });
};
