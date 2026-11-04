import React from 'react';

interface InfoSectionProps {
  title: string;
  data: { label: string; value: React.ReactNode }[];
}

const InfoSection: React.FC<InfoSectionProps> = ({ title, data }) => {
  return (
    <div className="bg-white shadow rounded p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <table className="w-full">
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="">
              <td className="w-1/6 py-1 font-semibold">{item.label}</td>
              <td className="w-5/6 py-1">{item.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InfoSection;
