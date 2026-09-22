import { useState } from 'react';
import { CertificateSetup, CertificateData } from './components/CertificateSetup';
import { CertificateEditor } from './components/CertificateEditor';

export default function App() {
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);

  const handleSetupComplete = (data: CertificateData) => {
    setCertificateData(data);
  };

  const handleBack = () => {
    setCertificateData(null);
  };

  return (
    <div className="min-h-screen">
      {!certificateData ? (
        <CertificateSetup onComplete={handleSetupComplete} />
      ) : (
        <CertificateEditor data={certificateData} onBack={handleBack} />
      )}
    </div>
  );
}
