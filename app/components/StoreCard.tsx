import React from 'react';
import { Link } from 'react-router';

interface Props {
  id: number;
  name: string;
  country: string;
  city: string;
  verified: boolean;
  shipsWorldwide: boolean;
  flag?: string;
  logo?: string;
  description?: string;
}

function StoreCard({
  id,
  name = '',
  country = '',
  city = '',
  verified = false,
  shipsWorldwide = false,
  flag = 'https://flagcdn.com/w20/so.png',
  logo,
  description,
}: Props) {
  const initial = name ? name.charAt(0).toUpperCase() : '';

  return (
    <div className="font-sans bg-white p-5 max-w-sm rounded shadow-sm">
      <div className="rounded p-4 bg-gray-50 shadow-sm">
        <div className="flex items-center mb-4">
          {logo ? (
            <img
              src={logo}
              alt={`${name} logo`}
              className="w-12 h-12 rounded object-cover mr-3 shadow-md"
            />
          ) : (
            <div className="w-12 h-12 rounded bg-blue-600 text-white flex items-center justify-center font-bold text-lg mr-3 shadow-md">
              {initial}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 m-0">Seller</p>
            <p className="text-base font-semibold text-gray-900 m-0">{name}</p>
          </div>
        </div>

        <div className="text-sm leading-relaxed mb-5">
          <div className="flex items-center mb-2">
            {flag ? (
              <img src={flag} alt={`${country} Flag`} className="w-6 h-4 rounded mr-2 shadow-sm" />
            ) : (
              <div className="w-6 h-4 rounded mr-2 bg-gray-200" />
            )}
            <span className=" text-blue-900">
              {country}
              {country && city ? ', ' : ''}
              {city}
            </span>
          </div>

          {verified && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-lg">🛡️</span>
              <span className=" text-blue-900">Verified Seller</span>
            </div>
          )}

          {shipsWorldwide && (
            <div className="flex items-center mb-2">
              <span className="mr-2 text-lg ">🌍</span>
              <span className="text-blue-900">Ships Worldwide</span>
            </div>
          )}

          {description && (
            <div className="mt-3">
              <p className="text-gray-600 text-xs leading-relaxed">{description}</p>
            </div>
          )}
        </div>

        <Link
          to={`/store/${id}`}
          className="block bg-blue-600 text-white py-2.5 rounded cursor-pointer w-full font-semibold text-sm hover:bg-blue-700 transition text-center"
        >
          View Store
        </Link>
      </div>
    </div>
  );
}

StoreCard.Skeleton = function StoreCardSkeleton() {
  return (
    <div className="font-sans bg-white p-5 max-w-sm rounded shadow-sm animate-pulse">
      <div className="rounded p-4 bg-gray-50 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 rounded bg-gray-200 mr-3"></div>
          <div>
            <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
            <div className="h-5 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        <div className="space-y-2 mb-5">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto"></div>
      </div>
    </div>
  );
};

export default StoreCard;
