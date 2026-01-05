import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.adminUser.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'Username already exists' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.adminUser.create({
            data: {
                username,
                password: hashedPassword,
            },
            select: {
                id: true,
                username: true,
                createdAt: true,
            },
        });

        return NextResponse.json(
            { success: true, message: 'Admin user created successfully', user: newUser },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating admin user:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
