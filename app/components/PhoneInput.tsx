import { useState } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PhoneInput({ value, onChange }: PhoneInputProps) {
  const [countryCode, setCountryCode] = useState('+252');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPhone = e.target.value.replace(/[^0-9]/g, '');
    onChange(`${countryCode}${newPhone}`);
  };

  const handleCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCountryCode = e.target.value;
    setCountryCode(newCountryCode);
    // Keep the existing number part
    const currentNumber = value.startsWith(countryCode)
      ? value.substring(countryCode.length)
      : value;
    onChange(`${newCountryCode}${currentNumber}`);
  };

  return (
    <div className="flex overflow-hidden items-center w-full mt-1 rounded bg-[var(--color-background)] shadow-sm">
      <select
        value={countryCode}
        onChange={handleCountryCodeChange}
        className="px-3 py-3 text-sm bg-[var(--color-surface)] text-[var(--color-dark)]"
      >
        <option value="+252">🇸🇴 +252</option>
        <option value="+254">🇰🇪 +254</option>
        <option value="+251">🇪🇹 +251</option>
        <option value="+255">🇹🇿 +255</option>
        <option value="+256">🇺🇬 +256</option>
        <option value="+250">🇷🇼 +250</option>
        <option value="+257">🇧🇮 +257</option>
        <option value="+211">🇸🇸 +211</option>
        <option value="+253">🇩🇯 +253</option>
        <option value="+291">🇪🇷 +291</option>
      </select>
      <input
        type="tel"
        value={value.startsWith(countryCode) ? value.substring(countryCode.length) : value}
        onChange={handlePhoneChange}
        placeholder="Phone"
        className="w-full px-3 py-2 bg-transparent text-[var(--color-dark)]"
      />
    </div>
  );
}
