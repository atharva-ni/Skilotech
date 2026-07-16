import React, { useState } from 'react';

interface SearchFilterProps {
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  categories?: string[];
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  sortOptions?: { label: string; value: string }[];
  selectedSort: string;
  onSortChange: (value: string) => void;
}

export default function SearchFilter({
  searchPlaceholder = 'Search...',
  searchValue,
  onSearchChange,
  categories = [],
  selectedCategory,
  onCategoryChange,
  sortOptions = [],
  selectedSort,
  onSortChange
}: SearchFilterProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
      alignItems: 'center',
      marginBottom: '24px',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      padding: '16px',
      borderRadius: '16px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Search Input */}
      <div style={{ flex: '1 1 300px', position: 'relative' }}>
        <span style={{ 
          position: 'absolute', 
          left: '16px', 
          top: '50%', 
          transform: 'translateY(-50%)', 
          opacity: isSearchFocused ? 0.7 : 0.4,
          fontSize: '0.9rem',
          transition: 'opacity 0.2s ease',
          pointerEvents: 'none'
        }}>🔍</span>
        <input
          type="text"
          className="input"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          style={{ 
            paddingLeft: '2.75rem',
            background: '#f8fafc',
            borderColor: isSearchFocused ? '#94a3b8' : '#e2e8f0',
            boxShadow: 'none',
            borderRadius: '10px',
            fontSize: '0.875rem',
            height: '42px',
            color: '#1e293b',
            transition: 'all 0.2s ease'
          }}
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="input select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            style={{
              backgroundColor: '#f8fafc',
              borderColor: '#e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              height: '42px',
              color: '#1e293b',
              fontWeight: 500,
              paddingLeft: '14px'
            }}
          >
            <option value="All" style={{ background: '#ffffff', color: '#1e293b' }}>All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} style={{ background: '#ffffff', color: '#1e293b' }}>{cat}</option>
            ))}
          </select>
        </div>
      )}

      {/* Sort Option */}
      {sortOptions.length > 0 && (
        <div style={{ flex: '0 1 180px' }}>
          <select
            className="input select"
            value={selectedSort}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              backgroundColor: '#f8fafc',
              borderColor: '#e2e8f0',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              height: '42px',
              color: '#1e293b',
              fontWeight: 500,
              paddingLeft: '14px'
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ background: '#ffffff', color: '#1e293b' }}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
