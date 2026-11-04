import React from 'react';

interface UnderConstructionCardProps {
  onButtonClick: () => void;
}

const UnderConstructionCard: React.FC<UnderConstructionCardProps> = ({ onButtonClick }) => {
  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[var(--color-surface)] rounded p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:space-x-8">
            <div className="flex-shrink-0 w-full sm:w-1/3 aspect-square">
              <img
                src="https://i.pinimg.com/1200x/a1/04/ad/a104adc4ea3a6e28e0a435577273ea25.jpg"
                alt="Under Construction"
                className="w-full h-full object-cover rounded"
              />
            </div>
            <div className="flex-grow text-center sm:text-left mt-6 sm:mt-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-dark)]">
                Page Under Construction
              </h1>
              <p className="text-md text-[var(--color-dark)] mt-2">
                We're sorry, this page is currently unavailable. Our team is working hard to bring
                it to you.
              </p>
              <div className="mt-6">
                <button
                  onClick={onButtonClick}
                  className="px-5 py-2.5 rounded font-semibold bg-[var(--color-accent)] text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] transition-opacity duration-300"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderConstructionCard;
