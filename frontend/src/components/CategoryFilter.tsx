import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div style={styles.container}>
      {categories.map((category) => (
        <button
          key={category}
          style={{
            ...styles.button,
            ...(selectedCategory === category ? styles.selectedButton : {}),
          }}
          onClick={() => onSelectCategory(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const,
  },
  button: {
    padding: '10px 20px',
    borderRadius: '25px',
    border: '2px solid #D4AF37',
    background: 'transparent',
    color: '#D4AF37',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  selectedButton: {
    background: '#D4AF37',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(212, 175, 55, 0.4)',
  },
};

export default CategoryFilter;
