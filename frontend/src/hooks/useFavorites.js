import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (id) => {
    setFavorites(prev => {
      if (!prev.includes(id)) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const removeFavorite = (id) => {
    setFavorites(prev => prev.filter(favId => favId !== id));
  };

  const isFavorite = (id) => {
    return favorites.includes(id);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
