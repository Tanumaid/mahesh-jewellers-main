import React from 'react';

interface GenderFilterProps {
  selectedGender: string;
  onSelectGender: (gender: string) => void;
}

const GenderFilter: React.FC<GenderFilterProps> = ({ selectedGender, onSelectGender }) => {
  const options = ["All", "Men", "Women"];

  return (
    <div style={styles.container}>
      {options.map((gender) => (
        <button
          key={gender}
          style={{
            ...styles.button,
            ...(selectedGender === gender ? styles.selectedButton : {}),
          }}
          onClick={() => onSelectGender(gender)}
        >
          {gender}
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
    padding: '8px 16px',
    borderRadius: '20px',
    border: '2px solid #555',
    background: 'transparent',
    color: '#555',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  selectedButton: {
    background: '#555',
    color: '#fff',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  },
};

export default GenderFilter;
