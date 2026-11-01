import React from 'react';

// Bonti-Styled Minimalist Pencil Stroke Icons (stroke="currentColor", strokeWidth="2")
export const CategoryIcons = {
  All: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2v20" />
      <path d="M6 2v7a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2" />
      <path d="M9 12v10" />
    </svg>
  ),
  Meals: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 11h16" />
      <path d="M20 11c0 4.418-3.582 8-8 8s-8-3.582-8-8" />
      <path d="M7 5c0 1 1 1 1 2s-1 1-1 2" />
      <path d="M12 4c0 1 1 1 1 2s-1 1-1 2" />
      <path d="M17 5c0 1 1 1 1 2s-1 1-1 2" />
    </svg>
  ),
  Beverages: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M5 8h12v9a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
      <path d="M9 2v4" />
      <path d="M13 2v4" />
    </svg>
  ),
  Protein: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m19 5-7 7-4-4L2 14" />
      <circle cx="19" cy="5" r="2" />
      <path d="M15 9l3 3" />
      <path d="M9 15l3 3" />
      <path d="M5 19l2 2" />
    </svg>
  ),
  Starters: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l9 16H3L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </svg>
  ),
  Bites: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 11a8 8 0 0 1 16 0H4Z" />
      <path d="M4 15h16" />
      <path d="M6 15v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3" />
      <path d="M8 11v2" />
      <path d="M16 11v2" />
    </svg>
  ),
  Soups: ({ size = 15, className = "" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 12h18" />
      <path d="M19 12a7 7 0 0 1-14 0" />
      <path d="M7 6c1 0 1 1 2 1s1-1 2-1 1 1 2 1 1-1 2-1" />
      <path d="M9 3v1" />
      <path d="M15 3v1" />
    </svg>
  ),
};