import React from 'react';
import { useNavigate } from 'react-router';
import UnderConstructionCard from '~/components/UnderConstructionCard';

export default function UnderConstructionPage() {
  const navigate = useNavigate();
  return <UnderConstructionCard onButtonClick={() => navigate(-1)} />;
}
