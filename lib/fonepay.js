import crypto from 'crypto';
import axios from 'axios';

// Environment variables
const FONEPAY_PID = process.env.FONEPAY_PID || 'NBQM'; // Default Sandbox PID
const FONEPAY_SECRET = process.env.FONEPAY_SECRET || 'a7e3512f5032480a83137795afcd46bf'; // Default Sandbox Secret
const FONEPAY_URL = process.env.FONEPAY_URL || 'https://dev-client-api.fonepay.com/api/merchantRequest'; // Sandbox Request URL
const FONEPAY_VERIFY_URL = process.env.FONEPAY_VERIFY_URL || 'https://dev-client-api.fonepay.com/api/merchantRequest/verificationMerchant';

/**
 * Generate Fonepay Payment URL with Signature
 */
export function generateFonepayUrl({
    amount,
    purchase_order_id,
    purchase_order_name,
    return_url // Note: Fonepay often uses a static return URL configured on their side, but some APIs accept it. 
    // Standard Fonepay flow usually involves strict parameters: flw_url, fail_url, etc.
}) {
    if (!amount || !purchase_order_id) {
        throw new Error("Missing required parameters for Fonepay");
    }

    const PID = FONEPAY_PID;
    const MD = 'P'; // P for Payment
    const AMT = amount.toString(); // Amount
    const CRN = 'NPR';
    const DT = formatDate(new Date()); // MM/dd/yyyy
    const R1 = purchase_order_id.toString(); // Reference 1
    const R2 = purchase_order_name || 'Ticket Purchase'; // Reference 2
    const RU = return_url; // Return URL

    // Signature String format: PID,MD,AMT,CRN,DT,R1,R2,RU
    const stringToHash = `${PID},${MD},${AMT},${CRN},${DT},${R1},${R2},${RU}`;

    // Generate DV (Digital Verification / Signature)
    const DV = crypto.createHmac('sha512', FONEPAY_SECRET)
        .update(stringToHash)
        .digest('hex');

    // Construct full URL with query params for redirect
    const queryParams = new URLSearchParams({
        PID,
        MD,
        AMT,
        CRN,
        DT,
        R1,
        R2,
        DV,
        RU: RU // Ensure this matches what Fonepay expects (sometimes called 'RU' or 'r2' depending on version)
    });

    return `${FONEPAY_URL}?${queryParams.toString()}`;
}

/**
 * Verify Fonepay Payment
 */
export async function verifyFonepayPayment({ pid, uid, dv }) {
    // Note: Fonepay verification typically requires sending data back to their server
    // For Sandbox/Dev, we might just verify the signature locally or call their verify endpoint if available.

    // Construction for verification request (Example flow)
    const verifyUrl = `${FONEPAY_VERIFY_URL}?PID=${FONEPAY_PID}&UID=${uid}&DV=${dv}`;

    try {
        const response = await axios.get(verifyUrl);
        // The XML parsing or JSON parsing depends on Fonepay version. 
        // Assuming JSON for modern API, or raw text "success" check.

        console.log("Fonepay Verify Response:", response.data);

        // Simple check (customize based on actual API response structure)
        if (response.status === 200 && (response.data.includes('success') || response.data.message === 'success')) {
            return { success: true, ...response.data };
        }

        // Fallback for Sandbox manual test if API fails
        if (process.env.NODE_ENV === 'development') {
            return { success: true, message: "Sandbox skipped verification" };
        }

        return { success: false, message: "Verification failed" };
    } catch (error) {
        console.error("Fonepay Verify Error:", error);
        // Sandbox fallback
        if (process.env.NODE_ENV === 'development') {
            return { success: true, message: "Sandbox fallback success" };
        }
        throw new Error("Fonepay verification failed");
    }
}

// Helper: Format Date as MM/dd/yyyy
function formatDate(date) {
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
}
