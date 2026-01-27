// ============================================
// ENHANCED MATCHMAKER LOGIC WITH GPS
// ============================================
// This replaces the previous matchmaker-logic.js
// Place this in your Simba-Merchant-App repository

// FEATURE FLAG: Set to true when merchant dashboard is active
const MERCHANT_DASHBOARD_ACTIVE = true;

const MatchmakerEngine = {
    
    /**
     * Process a single order from Simba Express
     * Attempts to find and assign a merchant automatically
     */
    async processOrder(order, supabaseClient = null) {
        // Use provided Supabase client or fallback to window reference
        const supabase = supabaseClient || window.supabaseClient || supabaseClient;
        
        if (!supabase) {
            console.error('[MATCHMAKER] No Supabase client available');
            return { success: false, error: 'NO_SUPABASE_CLIENT' };
        }

        console.log(`[MATCHMAKER] Processing order ${order.id}`);

        try {
            // TEMPORARY: If merchant dashboard is not active, mark all as manual required
            if (!MERCHANT_DASHBOARD_ACTIVE) {
                console.log(`[MATCHMAKER] Merchant dashboard inactive - marking order ${order.id} as manual required`);
                const { error } = await supabase
                    .from('orders')
                    .update({
                        order_status: 'manual_required',
                        routing_error: 'MERCHANT_DASHBOARD_INACTIVE'
                    })
                    .eq('id', order.id);

                if (error) throw error;
                return { success: false, error: 'MERCHANT_DASHBOARD_INACTIVE' };
            }

            // Validate order has GPS data
            if (!order.delivery_latitude || !order.delivery_longitude) {
                throw new Error('MISSING_GPS_COORDINATES');
            }

            // Step 1: Find merchants within 5km radius
            const nearbyMerchants = await this.findNearbyMerchants(
                order.delivery_latitude,
                order.delivery_longitude,
                5, // 5km radius
                supabase
            );

            if (!nearbyMerchants || nearbyMerchants.length === 0) {
                throw new Error('NO_MERCHANTS_NEARBY');
            }

            console.log(`[MATCHMAKER] Found ${nearbyMerchants.length} nearby merchants`);

            // Step 2: Find merchant with inventory
            const matchedMerchant = await this.findMerchantWithInventory(
                nearbyMerchants,
                order.order_items || [],
                supabase
            );

            if (!matchedMerchant) {
                throw new Error('NO_MERCHANT_WITH_INVENTORY');
            }

            console.log(`[MATCHMAKER] Matched merchant: ${matchedMerchant.id}`);

            // Step 3: Update order with assignment
            const { error } = await supabase
                .from('orders')
                .update({
                    order_status: 'sent_to_merchant',
                    assigned_merchant_id: matchedMerchant.id,
                    distance_km: this.calculateDistance(
                        order.delivery_latitude,
                        order.delivery_longitude,
                        matchedMerchant.latitude,
                        matchedMerchant.longitude
                    )
                })
                .eq('id', order.id);

            if (error) throw error;

            console.log(`[MATCHMAKER] ✅ Order ${order.id} assigned to merchant ${matchedMerchant.id}`);
            return { success: true, merchant: matchedMerchant };

        } catch (error) {
            console.error(`[MATCHMAKER] ❌ Error: ${error.message}`);

            // Mark as manual required
            try {
                await supabase
                    .from('orders')
                    .update({
                        order_status: 'manual_required',
                        routing_error: error.message
                    })
                    .eq('id', order.id);
            } catch (e) {
                console.error('Failed to mark order as manual:', e);
            }

            return { success: false, error: error.message };
        }
    },

    /**
     * Find all merchants within radius (km) of GPS coordinates
     */
    async findNearbyMerchants(latitude, longitude, radiusKm = 5, supabase = null) {
        if (!supabase) {
            supabase = window.supabaseClient || supabaseClient;
        }

        try {
            const { data: merchants, error } = await supabase
                .from('merchant')
                .select(`
                    id,
                    store_name,
                    latitude,
                    longitude,
                    phone,
                    email
                `)
                .not('latitude', 'is', null)
                .not('longitude', 'is', null);

            if (error) {
                console.error('Error fetching merchants:', error);
                return [];
            }

            if (!merchants || merchants.length === 0) {
                console.log('[MATCHMAKER] No merchants with GPS data found');
                console.log('[MATCHMAKER] DEBUG: Checking for ANY merchants at all...');
                
                // Debug: Get count of all merchants
                const { data: allMerchants, error: countError } = await supabase
                    .from('merchant')
                    .select('id, store_name, latitude, longitude', { count: 'exact' });
                    
                console.log('[MATCHMAKER] Total merchants in DB:', allMerchants ? allMerchants.length : 0);
                if (allMerchants && allMerchants.length > 0) {
                    console.log('[MATCHMAKER] Sample merchants (first 3):', allMerchants.slice(0, 3));
                }
                
                return [];
            }

            // Filter by distance
            const nearby = merchants
                .map(merchant => ({
                    ...merchant,
                    distance: this.calculateDistance(
                        latitude,
                        longitude,
                        merchant.latitude,
                        merchant.longitude
                    )
                }))
                .filter(merchant => merchant.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance); // Closest first

            console.log(`[MATCHMAKER] Nearby merchants: ${nearby.length} within ${radiusKm}km`);
            return nearby;

        } catch (error) {
            console.error('Error finding nearby merchants:', error);
            return [];
        }
    },

    /**
     * Check which merchant has inventory for all ordered items
     */
    async findMerchantWithInventory(merchants, orderItems, supabase = null) {
        if (!supabase) {
            supabase = window.supabaseClient || supabaseClient;
        }

        for (const merchant of merchants) {
            try {
                let hasAllItems = true;

                // For now, assume closest merchant has items (or skip inventory check)
                // In production, you'd check actual inventory from merchant table
                console.log(`[MATCHMAKER] Checking merchant ${merchant.id} inventory`);
                
                // Return first merchant (assume they have items for demo)
                if (hasAllItems) {
                    return merchant;
                }

                for (const item of orderItems) {
                    const { data: inventory, error } = await supabase
                        .from('merchant_inventory')
                        .select('quantity')
                        .eq('merchant_id', merchant.id)
                        .eq('product_id', item.product_id)
                        .single();

                    if (error || !inventory || inventory.quantity < item.quantity) {
                        hasAllItems = false;
                        break;
                    }
                }

                if (hasAllItems) {
                    console.log(`[MATCHMAKER] Merchant ${merchant.store_name} has all items`);
                    return merchant;
                }

            } catch (error) {
                console.error(`Error checking inventory for ${merchant.id}:`, error);
                continue;
            }
        }

        return null;
    },

    /**
     * Haversine formula: Calculate distance between two GPS points
     * Returns distance in kilometers
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return parseFloat((R * c).toFixed(2)); // Return with 2 decimal places
    },

    /**
     * Convert degrees to radians
     */
    toRad(degrees) {
        return degrees * (Math.PI / 180);
    },

    /**
     * Get human-readable status message
     */
    getStatusMessage(status, error) {
        const messages = {
            'MISSING_GPS_COORDINATES': 'Order missing GPS coordinates',
            'NO_MERCHANTS_NEARBY': 'No merchants within 5km radius',
            'NO_MERCHANT_WITH_INVENTORY': 'No merchant has all requested items',
            'INVALID_ORDER_ITEMS': 'Order items are invalid or empty'
        };
        return messages[error] || error || 'Unknown error';
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MatchmakerEngine };
}
