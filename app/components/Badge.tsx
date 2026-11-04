import React from 'react';

type BadgeState = 'info' | 'warning' | 'danger' | 'success';

interface BadgeProps {
  state: BadgeState;
  text: string;
}

const Badge: React.FC<BadgeProps> = ({ state, text }) => {
  const stateClasses = {
    info: {
      bg: 'bg-blue-100',
      dot: 'bg-blue-500',
      text: 'text-blue-700',
    },
    warning: {
      bg: 'bg-yellow-100',
      dot: 'bg-yellow-500',
      text: 'text-yellow-700',
    },
    danger: {
      bg: 'bg-red-100',
      dot: 'bg-red-500',
      text: 'text-red-700',
    },
    success: {
      bg: 'bg-green-100',
      dot: 'bg-green-500',
      text: 'text-green-700',
    },
  };

  const { bg, dot, text: textColor } = stateClasses[state];

  return (
    <div
      className={`inline-flex items-center gap-x-1.5 py-1 px-2 rounded-full text-xs font-medium ${bg} ${textColor}`}
    >
      <span className={`w-2 h-2 rounded-full ${dot}`}></span>
      {text}
    </div>
  );
};

export default Badge;
