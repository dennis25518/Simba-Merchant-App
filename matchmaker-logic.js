// This script runs on the Admin Control page
const MatchmakerEngine = {
    async processOrder(order) {
        console.log("ATC: Analyzing Order " + order.id);

        try {
            // 1. Scan for Merchants with INVENTORY
            const { data: merchants } = await supabase
                .from('merchant_inventory')
                .select('merchant_id, quantity')
                .eq('sku', order.sku)
                .gt('quantity', order.required_qty);

            // 2. UNCERTAINTY CHECK A: No Stock
            if (!merchants || merchants.length === 0) {
                throw new Error("INVENTORY_EXHAUSTED");
            }

            // 3. Scan for NEARBY Drivers
            const { data: drivers } = await supabase.rpc('get_nearby_drivers', {
                lat: order.lat, 
                lng: order.lng, 
                radius_km: 5
            });

            // 4. UNCERTAINTY CHECK B: No Drivers
            if (!drivers || drivers.length === 0) {
                throw new Error("ZERO_FLEET_RADIUS");
            }

            // 5. SUCCESS: AUTO-MATCH
            await supabase.from('orders').update({
                status: 'sent_to_merchant',
                assigned_merchant_id: merchants[0].merchant_id,
                assigned_driver_id: drivers[0].id
            }).eq('id', order.id);

        } catch (err) {
            // 6. FAILURE: Trigger Manual Control Sidebar
            console.error("Routing Error:", err.message);
            await supabase.from('orders').update({
                status: 'manual_required',
                error_reason: err.message
            }).eq('id', order.id);
        }
    }
};