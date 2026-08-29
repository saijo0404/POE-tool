import React from 'react';

export const AtlasCanvasDefs: React.FC = () => (
  <defs>
    {/* Keystone Allocated Radial Gradient */}
    <radialGradient id="keystoneAllocGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#fffbeb" />
      <stop offset="35%" stopColor="#fef08a" />
      <stop offset="70%" stopColor="#eab308" />
      <stop offset="100%" stopColor="#854d0e" />
    </radialGradient>

    {/* Keystone Unallocated Radial Gradient */}
    <radialGradient id="keystoneUnallocGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#64748b" />
      <stop offset="60%" stopColor="#334155" />
      <stop offset="100%" stopColor="#0f172a" />
    </radialGradient>

    {/* Notable Allocated Radial Gradient */}
    <radialGradient id="notableAllocGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#fef9c3" />
      <stop offset="45%" stopColor="#fde047" />
      <stop offset="85%" stopColor="#ca8a04" />
      <stop offset="100%" stopColor="#713f12" />
    </radialGradient>

    {/* Origin Start Node Radial Gradient */}
    <radialGradient id="originGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#e0f2fe" />
      <stop offset="40%" stopColor="#38bdf8" />
      <stop offset="80%" stopColor="#0284c7" />
      <stop offset="100%" stopColor="#0369a1" />
    </radialGradient>

    {/* Golden Energy Beam Glow Filter */}
    <filter id="glowGoldBeam" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur2" />
      <feMerge>
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* Cyan Path Preview Glow Filter */}
    <filter id="glowCyanPreview" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
      <feMerge>
        <feMergeNode in="blur2" />
        <feMergeNode in="blur1" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    {/* Keystone / Notable Golden Aura Glow Filter */}
    <filter id="glowGoldEffect" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    {/* Matching Node Pulse Glow Filter */}
    <filter id="glowSearchMatch" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
);
