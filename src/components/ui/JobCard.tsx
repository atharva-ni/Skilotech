import React, { useState } from 'react';
import Badge from './Badge';
import Button from './Button';
import { motion } from 'framer-motion';

interface JobCardProps {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
  salary: string;
  skills: string[];
  posted: string;
  applicants: number;
  onApply?: (id: string) => void;
}

export default function JobCard({
  id,
  title,
  company,
  location,
  type,
  salary,
  skills,
  posted,
  applicants,
  onApply
}: JobCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getTypeVariant = (t: string) => {
    switch (t) {
      case 'Full-time': return 'primary';
      case 'Internship': return 'success';
      case 'Contract': return 'info';
      default: return 'warning';
    }
  };

  const getSpotlightColor = () => {
    return 'rgba(0, 0, 0, 0.012)';
  };

  return (
    <motion.div
      className="card"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-card)',
      }}
    >
      {/* Spotlight highlight */}
      {isHovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(300px circle at ${mousePosition.x}px ${mousePosition.y}px, ${getSpotlightColor()}, transparent 80%)`,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 1 }}>
        <div>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--accent-primary-hover)', fontWeight: 550, marginTop: '2px' }}>
            {company}
          </p>
        </div>
        <Badge variant={getTypeVariant(type)}>{type}</Badge>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', zIndex: 1 }}>
        <span>📍 {location}</span>
        <span>💰 {salary}</span>
        <span>⏱️ {posted}</span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '4px 0', zIndex: 1 }}>
        {skills.map((skill) => (
          <span
            key={skill}
            style={{
              fontSize: '10px',
              fontWeight: 500,
              background: '#f4f4f5',
              border: '1px solid #e5e5e5',
              padding: '3px 8px',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
          >
            {skill}
          </span>
        ))}
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: '1px solid #e5e5e5',
        zIndex: 1
      }}>
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', fontWeight: 500 }}>
          👥 {applicants} applicants
        </span>
        <Button size="sm" onClick={() => onApply?.(id)}>
          Apply Now
        </Button>
      </div>
    </motion.div>
  );
}
