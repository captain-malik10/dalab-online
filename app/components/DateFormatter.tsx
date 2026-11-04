import React from 'react';
import { useDateFormatter } from '~/hooks/useDateFormatter';

interface DateFormatterProps {
  dateString: string;
}

const DateFormatter: React.FC<DateFormatterProps> = ({ dateString }) => {
  const formattedDate = useDateFormatter(dateString);
  return <span>{formattedDate}</span>;
};

export default DateFormatter;
