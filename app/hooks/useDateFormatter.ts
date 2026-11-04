import { useState, useEffect } from 'react';

export const useDateFormatter = (dateString: string) => {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const formatDate = () => {
      if (!dateString) {
        setFormattedDate('');
        return;
      }

      const date = new Date(dateString);

      if (isNaN(date.getTime())) {
        // Check if date is valid
        setFormattedDate('');
        return;
      }

      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        setFormattedDate('just now');
        return;
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        setFormattedDate(`${diffInMinutes} min ago`);
        return;
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        setFormattedDate(`${diffInHours}hr ago`);
        return;
      }

      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const dateToCompare = new Date(date.getFullYear(), date.getMonth(), date.getDate());

      if (dateToCompare.getTime() === yesterday.getTime()) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const time = `${hours}:${minutes}`;
        setFormattedDate(`Yesterday ${time}`);
        return;
      }

      const day = date.getDate().toString().padStart(2, '0');
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear();
      setFormattedDate(`${day}-${month}-${year}`);
    };

    formatDate();

    const intervalId = setInterval(formatDate, 60000); // Update every minute

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [dateString]);

  return formattedDate;
};
