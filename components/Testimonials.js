"use client";
import React from 'react';
import TestimonialsClient from './TestimonialsClient';

export default function Testimonials({ reviews }) {
    return <TestimonialsClient initialReviews={reviews} />;
}
