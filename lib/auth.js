import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = "secret-key-change-me"; // using a hardcoded secret for simplicity as per user request context not specified
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key);
}

export async function decrypt(input) {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function login(formData) {
    // Logic to be called from Server Action
    // Verify credentials then create session
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    return await decrypt(session);
}
