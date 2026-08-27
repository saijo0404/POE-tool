import React from 'react';

export const AtlasCanvasDefs: React.FC = () => (
  <defs>
    <radialGradient id="keystoneAllocGrad">
      <stop offset="0%" stopColor="#fef08a" />
      <stop offset="60%" stopColor="#eab308" />
      <stop offset="100%" stopColor="#854d0e" />
    </radialGradient>
    <radialGradient id="keystoneUnallocGrad">
      <stop offset="0%" stopColor="#64748b" />
      <stop offset="100%" stopColor="#1e293b" />
    </radialGradient>
    <filter id="glowGoldEffect" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
);
