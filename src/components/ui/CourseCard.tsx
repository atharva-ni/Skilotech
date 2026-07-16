import React, { useState } from 'react';
import Link from 'next/link';
import ProgressBar from './ProgressBar';
import { motion } from 'framer-motion';
import { Code, Bot, Settings, Palette, Lock, Laptop } from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  instructor: string;
  category: string;
  price: number;
  rating: number;
  studentsEnrolled: number;
  duration: string;
  progress?: number;
}

export default function CourseCard({
  id,
  title,
  instructor,
  category,
  price,
  rating,
  studentsEnrolled,
  duration,
  progress
}: CourseCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryStyles = (cat: string) => {
    const monochromeBg = '#f9fafb';
    const monochromeText = 'var(--text-secondary, #6b7280)';
    const monochromeIconBg = 'var(--accent-primary, #000000)';

    switch (cat) {
      case 'Web Development':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'code'
        };
      case 'Computer Science':
        return {
          bg: monochromeBg,
          iconBg: '#ffffff', // white bg for abacus logo container
          textColor: monochromeText,
          iconType: 'abacus'
        };
      case 'AI & ML':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'bot'
        };
      case 'DevOps':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'cpu'
        };
      case 'Design':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'palette'
        };
      case 'Security':
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'lock'
        };
      default:
        return {
          bg: monochromeBg,
          iconBg: monochromeIconBg,
          textColor: monochromeText,
          iconType: 'laptop'
        };
    }
  };

  const renderIcon = (type: string) => {
    const size = 18;
    const color = '#ffffff';
    switch (type) {
      case 'abacus':
        return <span style={{ fontSize: '1.45rem', lineHeight: 1 }}>🧮</span>;
      case 'code':
        return <Code size={size} color={color} strokeWidth={2.5} />;
      case 'bot':
        return <Bot size={size} color={color} strokeWidth={2} />;
      case 'cpu':
        return <Settings size={size} color={color} strokeWidth={2} />;
      case 'palette':
        return <Palette size={size} color={color} strokeWidth={2} />;
      case 'lock':
        return <Lock size={size} color={color} strokeWidth={2} />;
      default:
        return <Laptop size={size} color={color} strokeWidth={2} />;
    }
  };

  const styles = getCategoryStyles(category);

  return (
    <Link href={`/dashboard/courses/${id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
      <motion.div
        className="card card-interactive"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 22 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          padding: 0,
          overflow: 'hidden',
          position: 'relative',
          border: '1px solid #e2e8f0',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: isHovered ? '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)' : 'none'
        }}
      >
        {/* Course Card Header */}
        <div style={{
          height: '140px',
          background: styles.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          borderBottom: '1px solid #f1f5f9',
          zIndex: 1
        }}>
          {/* Central category icon container */}
          <div style={{
            width: '42px',
            height: '42px',
            backgroundColor: styles.iconBg,
            borderRadius: styles.iconType === 'abacus' || styles.iconType === 'bot' ? '10px' : '50%',
            border: styles.iconType === 'abacus' ? '2.5px solid #ff5e3a' : 'none', // orange-red border for abacus
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}>
            {renderIcon(styles.iconType)}
          </div>

          {/* Duration Badge at top right */}
          <span style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#ffffff',
            color: '#1e293b',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.65rem',
            fontWeight: 700,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
            letterSpacing: '0.02em',
            textTransform: 'uppercase'
          }}>
            {duration.toUpperCase()}
          </span>
        </div>

        {/* Card Body */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          zIndex: 1,
          position: 'relative'
        }}>
          {/* Category Tag */}
          <span style={{
            fontSize: '10px',
            fontWeight: 700,
            color: styles.textColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em'
          }}>
            {category}
          </span>

          {/* Title */}
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 700,
            margin: '8px 0',
            color: '#0f172a',
            lineHeight: 1.4,
            minHeight: '2.8em',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {title}
          </h3>

          {/* Instructor */}
          <p style={{
            fontSize: '0.75rem',
            color: '#64748b',
            marginBottom: '12px'
          }}>
            by {instructor}
          </p>

          {/* Ratings & Students */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '20px',
            fontSize: '0.75rem',
            color: '#64748b'
          }}>
            {rating > 0 ? (
              <>
                <span style={{ color: 'var(--text-primary, #171717)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                  ★ {rating.toFixed(1)}
                </span>
                <span>·</span>
                <span>{studentsEnrolled} students</span>
              </>
            ) : (
              <>
                <span>No ratings yet</span>
                <span>·</span>
                <span>{studentsEnrolled} students</span>
              </>
            )}
          </div>

          {/* Progress or Footer Row */}
          {progress !== undefined ? (
            <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
              <ProgressBar progress={progress} showLabel />
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: 'auto',
              paddingTop: '4px'
            }}>
              {/* Price */}
              <span style={{
                fontSize: '1.05rem',
                fontWeight: 800,
                color: '#0f172a'
              }}>
                {price === 0 ? 'Free' : `₹${price.toLocaleString('en-IN')}`}
              </span>

              {/* Learn More pill button */}
              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-on-accent, #ffffff)',
                backgroundColor: 'var(--accent-primary, #000000)',
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s ease',
                transform: isHovered ? 'translateX(2px)' : 'none'
              }}>
                Learn more <span style={{ transition: 'transform 0.2s ease', transform: isHovered ? 'translateX(2px)' : 'none' }}>→</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
