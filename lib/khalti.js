import axios from 'axios';

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
const KHALTI_BASE_URL = 'https://dev.khalti.com/api/v2'; // Sandbox v2

if (!KHALTI_SECRET_KEY) {
    console.warn("KHALTI_SECRET_KEY is missing! Payments will fail.");
}

export async function initializeKhaltiPayment({
    return_url,
    website_url,
    amount, // in Paisa
    purchase_order_id,
    purchase_order_name,
    customer_info // { name, email, phone }
}) {
    if (!amount || !purchase_order_id || !purchase_order_name || !return_url) {
        throw new Error("Missing required payment parameters");
    }

    try {
        const payload = {
            return_url,
            website_url: website_url || process.env.NEXT_PUBLIC_APP_URL || "https://eventsolutionnepal.com.np",
            amount, // already in paisa
            purchase_order_id,
            purchase_order_name,
            customer_info,
            product_details: [
                {
                    identity: purchase_order_id.toString(),
                    name: purchase_order_name,
                    total_price: amount,
                    quantity: 1,
                    unit_price: amount
                }
            ]
        };

        const response = await axios.post(
            `${KHALTI_BASE_URL}/epayment/initiate/`,
            payload,
            {
                headers: {
                    'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        return response.data;
    } catch (error) {
        console.error("Khalti Init Error:", error.response?.data || error.message);
        throw new Error("Failed to initiate Khalti payment");
    }
}

export async function verifyKhaltiPayment(pidx) {
    if (!pidx) throw new Error("Missing pidx");

    try {
        const response = await axios.post(
            `${KHALTI_BASE_URL}/epayment/lookup/`,
            { pidx },
            {
                headers: {
                    'Authorization': `Key ${KHALTI_SECRET_KEY}`,
                    'Content-Type': 'application/json',
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Khalti Verify Error:", error.response?.data || error.message);
        throw new Error("Failed to verify Khalti payment");
    }
}
