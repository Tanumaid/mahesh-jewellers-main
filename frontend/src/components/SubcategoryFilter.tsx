import React from 'react';

interface SubcategoryFilterProps {
  subcategories: string[];
  selectedSubcategory: string;
  onSelectSubcategory: (subcategory: string) => void;
}

const SubcategoryFilter: React.FC<SubcategoryFilterProps> = ({ subcategories, selectedSubcategory, onSelectSubcategory }) => {
  if (subcategories.length === 0) return null;

  return (
    <div style={styles.container}>
      <button
        style={{
          ...styles.button,
          ...(selectedSubcategory === "" ? styles.selectedButton : {}),
        }}
        onClick={() => onSelectSubcategory("")}
      >
        All
      </button>
      {subcategories.map((subcategory) => (
        <button
          key={subcategory}
          style={{
            ...styles.button,
            ...(selectedSubcategory === subcategory ? styles.selectedButton : {}),
          }}
          onClick={() => onSelectSubcategory(subcategory)}
        >
          {subcategory}
        </button>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '30px',
    flexWrap: 'wrap' as const,
  },
  button: {
    padding: '8px 16px',
    borderRadius: '20px',
    border: '1px solid #555',
    background: '#fff',
    color: '#555',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  selectedButton: {
    background: '#333',
    color: '#fff',
    borderColor: '#333',
  },
};

export default SubcategoryFilter;
