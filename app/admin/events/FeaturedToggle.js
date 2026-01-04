"use client";

import { useState } from 'react';
import { toggleFeatured } from './actions';
import { useToast } from '@/components/admin/ToastContext';
import { Star } from 'lucide-react';

export default function FeaturedToggle({ eventId, isFeatured }) {
    const { showToast } = useToast();
    const [featured, setFeatured] = useState(isFeatured);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        try {
            const result = await toggleFeatured(eventId, featured);
            if (result.success) {
                setFeatured(!featured);
                showToast(result.message, "success");
            } else {
                showToast(result.message, "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Failed to toggle featured status", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: isLoading ? 0.5 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
            }}
            title="Toggle Featured"
        >
            <Star
                size={20}
                fill={featured ? "#f59e0b" : "none"}
                color={featured ? "#f59e0b" : "#94a3b8"}
            />
            {featured && <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 'bold' }}>Featured</span>}
        </button>
    );
}
