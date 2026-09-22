import { useState } from 'react';
import { ChevronRight, ChevronLeft, Upload, Plus, Trash2 } from 'lucide-react';

export interface CertificateData {
  logos: Array<{ id: string; dataUrl: string | null }>;
  instituteName: string;
  secondInstituteName: string;
  certificateType: string;
  recipientName: string;
  description: string;
  date: string;
  signatures: Array<{ id: string; dataUrl: string | null; signerName: string; title: string }>;
  templateUrl: string;
  skippedSteps: number[];
}

interface CertificateSetupProps {
  onComplete: (data: CertificateData) => void;
}

const TEMPLATES = [
  {
    id: 'classic',
    name: 'Classic Gold',
    description: 'Traditional elegance with gold accents',
    color: '#D4AF37'
  },
  {
    id: 'modern',
    name: 'Modern Blue',
    description: 'Contemporary design with blue tones',
    color: '#4A90E2'
  },
  {
    id: 'elegant',
    name: 'Elegant Purple',
    description: 'Sophisticated style with purple shades',
    color: '#9B59B6'
  },
  {
    id: 'professional',
    name: 'Professional Green',
    description: 'Clean and professional green theme',
    color: '#27AE60'
  }
];

export function CertificateSetup({ onComplete }: CertificateSetupProps) {
  const [view, setView] = useState<'landing' | 'setup'>('landing');
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CertificateData>({
    logos: [{ id: '1', dataUrl: null }],
    instituteName: '',
    secondInstituteName: '',
    certificateType: 'appreciation',
    recipientName: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    signatures: [{ id: '1', dataUrl: null, signerName: '', title: '' }],
    templateUrl: TEMPLATES[0].color,
    skippedSteps: [],
  });

  const totalSteps = 8;

  const handleFileUpload = (
    type: 'logos' | 'signatures',
    id: string,
    file: File | null
  ) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        
        if (type === 'logos') {
          setData((prev) => ({
            ...prev,
            logos: prev.logos.map((logo) =>
              logo.id === id ? { ...logo, dataUrl } : logo
            ),
          }));
        } else {
          setData((prev) => ({
            ...prev,
            signatures: prev.signatures.map((sig) =>
              sig.id === id ? { ...sig, dataUrl } : sig
            ),
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addItem = (type: 'logos' | 'signatures') => {
    const newId = Date.now().toString();
    if (type === 'logos') {
      setData((prev) => ({
        ...prev,
        logos: [...prev.logos, { id: newId, dataUrl: null }],
      }));
    } else {
      setData((prev) => ({
        ...prev,
        signatures: [
          ...prev.signatures,
          { id: newId, dataUrl: null, signerName: '', title: '' },
        ],
      }));
    }
  };

  const removeItem = (type: 'logos' | 'signatures', id: string) => {
    if (type === 'logos') {
      setData((prev) => ({
        ...prev,
        logos: prev.logos.filter((logo) => logo.id !== id),
      }));
    } else {
      setData((prev) => ({
        ...prev,
        signatures: prev.signatures.filter((sig) => sig.id !== id),
      }));
    }
  };

  const updateSignatureInfo = (id: string, field: 'signerName' | 'title', value: string) => {
    setData((prev) => ({
      ...prev,
      signatures: prev.signatures.map((sig) =>
        sig.id === id ? { ...sig, [field]: value } : sig
      ),
    }));
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.logos.some((logo) => logo.dataUrl !== null);
      case 2:
        return data.instituteName.trim() !== '';
      case 3:
        return true; // Optional second institute name
      case 4:
        return data.certificateType !== '';
      case 5:
        return data.recipientName.trim() !== '';
      case 6:
        return data.description.trim() !== '';
      case 7:
        return data.date !== '';
      case 8:
        return data.signatures.some((sig) => sig.dataUrl !== null || sig.signerName.trim() !== '' || sig.title.trim() !== '');
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step === totalSteps) {
      onComplete(data);
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    if (!data.skippedSteps.includes(step)) {
      setData(prev => ({ ...prev, skippedSteps: [...prev.skippedSteps, step] }));
    }
    handleNext();
  };

  const selectTemplate = (url: string) => {
    setData(prev => ({ ...prev, templateUrl: url }));
    setView('setup');
  };

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Professional Certificate Generator
            </h1>
            <p className="text-gray-600 text-lg">Choose a template to start building your certificate</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEMPLATES.map((template) => (
              <div 
                key={template.id}
                className="group relative bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-500"
                onClick={() => selectTemplate(template.color)}
              >
                <div className="aspect-[4/3] relative bg-gray-100">
                  <div 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: template.color }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold shadow-lg">
                      Select Template
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 relative">
        <button 
          onClick={() => setView('landing')}
          className="absolute top-8 left-8 text-gray-400 hover:text-gray-600"
        >
          <ChevronLeft className="w-6 h-6 inline mr-1" />
          Back to Templates
        </button>

        <div className="mt-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Step {step} of {totalSteps}</span>
              <span className="text-sm text-gray-600">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8 min-h-[400px]">
            {step === 1 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Institute Logos</h2>
                <p className="text-gray-600 mb-6">Upload one or more logos for your certificate</p>
                <div className="space-y-4">
                  {data.logos.map((logo, index) => (
                    <div key={logo.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                            {logo.dataUrl ? (
                              <img
                                src={logo.dataUrl}
                                alt={`Logo ${index + 1}`}
                                className="h-20 mx-auto object-contain"
                              />
                            ) : (
                              <div className="flex flex-col items-center text-gray-500">
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-sm">Click to upload logo {index + 1}</span>
                              </div>
                            )}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload('logos', logo.id, e.target.files?.[0] || null)
                            }
                          />
                        </label>
                      </div>
                      {data.logos.length > 1 && (
                        <button
                          onClick={() => removeItem('logos', logo.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addItem('logos')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Logo
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Institute Name</h2>
                <p className="text-gray-600 mb-6">Enter your institution or organization name</p>
                <input
                  type="text"
                  value={data.instituteName}
                  onChange={(e) => setData({ ...data, instituteName: e.target.value })}
                  placeholder="e.g., Harvard University"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Second Institute Name <span className="text-gray-400 text-lg font-normal">(Optional)</span></h2>
                <p className="text-gray-600 mb-6">Add another institution or department name if needed</p>
                <input
                  type="text"
                  value={data.secondInstituteName}
                  onChange={(e) => setData({ ...data, secondInstituteName: e.target.value })}
                  placeholder="e.g., Department of Computer Science"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {step === 4 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Certificate Type</h2>
                <p className="text-gray-600 mb-6">Select the type of certificate</p>
                <div className="grid grid-cols-2 gap-4">
                  {['Appreciation', 'Merit', 'Participation', 'Achievement', 'Completion', 'Excellence'].map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setData({ ...data, certificateType: type.toLowerCase() })}
                        className={`py-4 px-6 rounded-lg border-2 transition-all ${
                          data.certificateType === type.toLowerCase()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        {type}
                      </button>
                    )
                  )}
                </div>
              </div>
            )}

            {step === 5 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Recipient Name</h2>
                <p className="text-gray-600 mb-6">Enter the name of the certificate recipient</p>
                <input
                  type="text"
                  value={data.recipientName}
                  onChange={(e) => setData({ ...data, recipientName: e.target.value })}
                  placeholder="e.g., John Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {step === 6 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Certificate Description</h2>
                <p className="text-gray-600 mb-6">
                  Describe what this certificate is awarded for
                </p>
                <textarea
                  value={data.description}
                  onChange={(e) => setData({ ...data, description: e.target.value })}
                  placeholder="e.g., For successfully completing the Advanced Web Development Course..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            )}

            {step === 7 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Certificate Date</h2>
                <p className="text-gray-600 mb-6">Select the date for this certificate</p>
                <input
                  type="date"
                  value={data.date}
                  onChange={(e) => setData({ ...data, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {step === 8 && (
              <div>
                <h2 className="text-2xl mb-2 font-bold">Signatures</h2>
                <p className="text-gray-600 mb-6">Upload signatures and add signer information (signature image is optional)</p>
                <div className="space-y-6">
                  {data.signatures.map((sig, index) => (
                    <div key={sig.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-1">
                          <label className="block">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer">
                              {sig.dataUrl ? (
                                <img
                                  src={sig.dataUrl}
                                  alt={`Signature ${index + 1}`}
                                  className="h-16 mx-auto object-contain"
                                />
                              ) : (
                                <div className="flex flex-col items-center text-gray-500">
                                  <Upload className="w-6 h-6 mb-2" />
                                  <span className="text-sm">Click to upload signature {index + 1} (Optional)</span>
                                </div>
                              )}
                            </div>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileUpload('signatures', sig.id, e.target.files?.[0] || null)
                              }
                            />
                          </label>
                        </div>
                        {data.signatures.length > 1 && (
                          <button
                            onClick={() => removeItem('signatures', sig.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={sig.signerName}
                          onChange={(e) => updateSignatureInfo(sig.id, 'signerName', e.target.value)}
                          placeholder="Signer Name"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={sig.title}
                          onChange={(e) => updateSignatureInfo(sig.id, 'title', e.target.value)}
                          placeholder="Title/Designation (e.g., Director, Principal)"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => addItem('signatures')}
                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Signature
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-auto gap-4">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <div className="flex gap-3 ml-auto">
              <button
                onClick={handleSkip}
                className="px-6 py-3 rounded-lg border border-gray-400 text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {step === totalSteps ? 'Create Certificate' : 'Next'}
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}