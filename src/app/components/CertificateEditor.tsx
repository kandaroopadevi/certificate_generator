import { useRef, useState } from 'react';
import { Download, Edit2, RotateCcw } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DraggableElement } from './DraggableElement';
import { CertificateData } from './CertificateSetup';

interface ElementPosition {
  x: number;
  y: number;
}

interface CertificateEditorProps {
  data: CertificateData;
  onBack: () => void;
}

export function CertificateEditor({ data, onBack }: CertificateEditorProps) {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isEditMode, setIsEditMode] = useState(true);
  
  // Debug logging
  console.log('CertificateEditor - received data:', {
    secondInstituteName: data.secondInstituteName,
    skippedSteps: data.skippedSteps,
    isStep3Skipped: data.skippedSteps.includes(3)
  });
  
  const initializePositions = () => {
    const positions: Record<string, ElementPosition> = {
      instituteName: { x: 200, y: 140 },
      secondInstituteName: { x: 200, y: 180 },
      certificateTitle: { x: 153, y: 230 },
      recipientName: { x: 153, y: 350 },
      description: { x: 78, y: 480 },
      date: { x: 100, y: 680 },
    };

    data.logos.forEach((logo, index) => {
      if (logo.dataUrl) {
        if (index === 0) {
          positions[`logo-${logo.id}`] = { x: 40, y: 40 };
        } else if (index === 1) {
          positions[`logo-${logo.id}`] = { x: 916, y: 40 };
        } else {
          positions[`logo-${logo.id}`] = { x: 400 + ((index - 2) * 100), y: 40 };
        }
      }
    });

    data.signatures.forEach((sig, index) => {
      positions[`signature-${sig.id}`] = { x: 150 + (index * 380), y: 620 };
    });

    return positions;
  };

  const [positions, setPositions] = useState<Record<string, ElementPosition>>(initializePositions());
  const [isGenerating, setIsGenerating] = useState(false);

  const handlePositionChange = (id: string, position: ElementPosition) => {
    setPositions((prev) => ({ ...prev, [id]: position }));
  };

  const resetPositions = () => {
    setPositions(initializePositions());
  };

  const downloadPDF = async () => {
    if (!certificateRef.current || isGenerating) return;

    try {
      setIsGenerating(true);
      setIsEditMode(false);
      
      await new Promise((resolve) => setTimeout(resolve, 500));

      const element = certificateRef.current;
      
      if (!element) {
        throw new Error('Certificate element not found');
      }

      console.log('Starting PDF generation...');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        imageTimeout: 0,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('[data-certificate-container]') as HTMLElement;
          if (clonedElement) {
            // Force all styles to use RGB only
            clonedElement.style.cssText = clonedElement.style.cssText.replace(/oklch\([^)]+\)/g, 'rgb(0,0,0)');
          }
        }
      });

      console.log('Canvas captured:', canvas.width, 'x', canvas.height);

      const imgData = canvas.toDataURL('image/png', 1.0);
      
      if (!imgData || imgData === 'data:,') {
        throw new Error('Failed to convert canvas to image');
      }

      console.log('Creating PDF...');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
        compress: true,
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2, undefined, 'FAST');
      
      const safeName = (data.recipientName || 'certificate')
        .trim()
        .replace(/[^a-z0-9]/gi, '-')
        .toLowerCase();
      
      const fileName = `certificate-${safeName}-${Date.now()}.pdf`;
      
      console.log('Saving PDF:', fileName);
      
      pdf.save(fileName);
      
      console.log('PDF generated successfully!');
      
      alert('Certificate downloaded successfully!');
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setIsGenerating(false);
      setIsEditMode(true);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const certificateTypeText = {
    appreciation: 'Certificate of Appreciation',
    merit: 'Certificate of Merit',
    participation: 'Certificate of Participation',
    achievement: 'Certificate of Achievement',
    completion: 'Certificate of Completion',
    excellence: 'Certificate of Excellence',
  };

  const isStepSkipped = (step: number) => data.skippedSteps.includes(step);

  // Convert hex color to RGB for html2canvas compatibility
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
      : 'rgb(200, 200, 200)';
  };

  const borderColor = hexToRgb(data.templateUrl);
  const gradientStart = hexToRgb(data.templateUrl);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Certificate Editor</h1>
              <p className="text-gray-600">
                {isGenerating
                  ? 'Generating your professional PDF...'
                  : isEditMode
                  ? 'Drag elements to position them on your certificate'
                  : 'Preview mode - ready to export'}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetPositions}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Positions
              </button>
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <Edit2 className="w-4 h-4" />
                {isEditMode ? 'Preview' : 'Edit'}
              </button>
              <button
                onClick={downloadPDF}
                disabled={isGenerating}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Download className="w-5 h-5" />
                )}
                {isGenerating ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={onBack}
                disabled={isGenerating}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center overflow-auto pb-12">
          <div className="bg-white rounded-xl shadow-2xl p-4 inline-block">
            <div
              ref={certificateRef}
              data-certificate-container
              style={{
                position: 'relative',
                backgroundColor: 'rgb(255, 255, 255)',
                color: 'rgb(0, 0, 0)',
                overflow: 'hidden',
                width: '1056px',
                height: '816px',
                margin: 0,
                padding: 0,
                boxSizing: 'border-box',
              }}
            >
              <div 
                style={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                  background: `linear-gradient(135deg, ${borderColor}15 0%, ${borderColor}05 100%)`,
                  border: `8px double ${borderColor}`,
                  boxSizing: 'border-box',
                }}
              />

              {!isStepSkipped(1) && data.logos
                .filter((logo) => logo.dataUrl !== null)
                .map((logo) => {
                  const LogoContent = (
                    <img
                      src={logo.dataUrl!}
                      alt="Institute logo"
                      style={{ height: '128px', width: '128px', objectFit: 'contain', display: 'block' }}
                    />
                  );

                  return isEditMode ? (
                    <DraggableElement
                      key={logo.id}
                      id={`logo-${logo.id}`}
                      position={positions[`logo-${logo.id}`]}
                      onPositionChange={handlePositionChange}
                    >
                      {LogoContent}
                    </DraggableElement>
                  ) : (
                    <div
                      key={logo.id}
                      style={{ 
                        position: 'absolute',
                        left: `${positions[`logo-${logo.id}`].x}px`, 
                        top: `${positions[`logo-${logo.id}`].y}px` 
                      }}
                    >
                      {LogoContent}
                    </div>
                  );
                })}

              {!isStepSkipped(2) && data.instituteName && (
                isEditMode ? (
                  <DraggableElement
                    id="instituteName"
                    position={positions.instituteName}
                    onPositionChange={handlePositionChange}
                  >
                    <div className="text-center text-[25px] text-gray-800 tracking-widest uppercase font-serif font-bold break-words leading-snug px-4" style={{ width: '656px' }}>
                      {data.instituteName}
                    </div>
                  </DraggableElement>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${positions.instituteName.x}px`,
                      top: `${positions.instituteName.y}px`,
                      width: '656px',
                      textAlign: 'center',
                      fontSize: '25px',
                      color: 'rgb(31, 41, 55)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontFamily: 'Georgia, serif',
                      fontWeight: 'bold',
                      wordBreak: 'break-word',
                      lineHeight: '1.375',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      margin: 0,
                    }}
                  >
                    {data.instituteName}
                  </div>
                )
              )}

              {!isStepSkipped(3) && data.secondInstituteName && (
                isEditMode ? (
                  <DraggableElement
                    id="secondInstituteName"
                    position={positions.secondInstituteName}
                    onPositionChange={handlePositionChange}
                  >
                    <div className="text-center text-[25px] text-gray-800 tracking-widest uppercase font-serif font-bold break-words leading-snug px-4" style={{ width: '656px' }}>
                      {data.secondInstituteName}
                    </div>
                  </DraggableElement>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${positions.secondInstituteName.x}px`,
                      top: `${positions.secondInstituteName.y}px`,
                      width: '656px',
                      textAlign: 'center',
                      fontSize: '25px',
                      color: 'rgb(31, 41, 55)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontFamily: 'Georgia, serif',
                      fontWeight: 'bold',
                      wordBreak: 'break-word',
                      lineHeight: '1.375',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      margin: 0,
                    }}
                  >
                    {data.secondInstituteName}
                  </div>
                )
              )}

              {!isStepSkipped(4) && (
                isEditMode ? (
                  <DraggableElement
                    id="certificateTitle"
                    position={positions.certificateTitle}
                    onPositionChange={handlePositionChange}
                  >
                    <div className="text-center text-[38px] text-gray-900 tracking-wide uppercase font-serif whitespace-nowrap leading-tight px-4" style={{ width: '750px' }}>
                      {certificateTypeText[data.certificateType as keyof typeof certificateTypeText]}
                    </div>
                  </DraggableElement>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${positions.certificateTitle.x}px`,
                      top: `${positions.certificateTitle.y}px`,
                      width: '750px',
                      textAlign: 'center',
                      fontSize: '38px',
                      color: 'rgb(17, 24, 39)',
                      letterSpacing: '0.025em',
                      textTransform: 'uppercase',
                      fontFamily: 'Georgia, serif',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.25',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      margin: 0,
                      fontWeight: 'normal',
                    }}
                  >
                    {certificateTypeText[data.certificateType as keyof typeof certificateTypeText]}
                  </div>
                )
              )}

              {!isStepSkipped(5) && (
                isEditMode ? (
                  <DraggableElement
                    id="recipientName"
                    position={positions.recipientName}
                    onPositionChange={handlePositionChange}
                  >
                    <div className="text-center" style={{ width: '750px' }}>
                      <div className="text-lg text-gray-700 mb-4 italic font-serif">This certificate is proudly presented to</div>
                      <div className="text-5xl text-blue-900 border-b-2 border-blue-200 pb-3 px-8 inline-block font-serif break-words max-w-full">
                        {data.recipientName || '________________________'}
                      </div>
                    </div>
                  </DraggableElement>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${positions.recipientName.x}px`,
                      top: `${positions.recipientName.y}px`,
                      width: '750px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ 
                      fontSize: '18px', 
                      color: 'rgb(55, 65, 81)', 
                      marginBottom: '16px', 
                      fontStyle: 'italic', 
                      fontFamily: 'Georgia, serif',
                      margin: '0 0 16px 0',
                    }}>
                      This certificate is proudly presented to
                    </div>
                    <div style={{ 
                      fontSize: '48px', 
                      color: 'rgb(30, 58, 138)', 
                      borderBottom: '2px solid rgb(191, 219, 254)', 
                      paddingBottom: '12px', 
                      paddingLeft: '32px', 
                      paddingRight: '32px', 
                      display: 'inline-block', 
                      fontFamily: 'Georgia, serif', 
                      wordBreak: 'break-word', 
                      maxWidth: '100%',
                      margin: 0,
                      fontWeight: 'normal',
                    }}>
                      {data.recipientName || '________________________'}
                    </div>
                  </div>
                )
              )}

              {!isStepSkipped(6) && (
                isEditMode ? (
                  <DraggableElement
                    id="description"
                    position={positions.description}
                    onPositionChange={handlePositionChange}
                  >
                    <div className="text-justify text-gray-800 leading-relaxed text-lg px-4 font-sans italic break-words" style={{ width: '900px' }}>
                      {data.description || 'For their exceptional contribution and dedication to the program.'}
                    </div>
                  </DraggableElement>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${positions.description.x}px`,
                      top: `${positions.description.y}px`,
                      width: '900px',
                      textAlign: 'justify',
                      color: 'rgb(31, 41, 55)',
                      lineHeight: '1.625',
                      fontSize: '18px',
                      paddingLeft: '16px',
                      paddingRight: '16px',
                      fontFamily: 'Arial, sans-serif',
                      fontStyle: 'italic',
                      wordBreak: 'break-word',
                      margin: 0,
                      fontWeight: 'normal',
                    }}
                  >
                    {data.description || 'For their exceptional contribution and dedication to the program.'}
                  </div>
                )
              )}

              {!isStepSkipped(7) && (
                isEditMode ? (
                  <DraggableElement
                    id="date"
                    position={positions.date}
                    onPositionChange={handlePositionChange}
                  >
                    <div className="text-gray-700 text-base font-serif">
                      <span className="font-bold">Date:</span> {formatDate(data.date) || '________________'}
                    </div>
                  </DraggableElement>
                ) : (
                  <div
                    style={{
                      position: 'absolute',
                      left: `${positions.date.x}px`,
                      top: `${positions.date.y}px`,
                      color: 'rgb(55, 65, 81)',
                      fontSize: '16px',
                      fontFamily: 'Georgia, serif',
                      margin: 0,
                      fontWeight: 'normal',
                    }}
                  >
                    <span style={{ fontWeight: 'bold' }}>Date:</span> {formatDate(data.date) || '________________'}
                  </div>
                )
              )}

              {!isStepSkipped(8) && data.signatures.map((sig) => {
                return isEditMode ? (
                  <DraggableElement
                    key={sig.id}
                    id={`signature-${sig.id}`}
                    position={positions[`signature-${sig.id}`]}
                    onPositionChange={handlePositionChange}
                  >
                    <div className="text-center">
                      <div className="h-16 flex items-end justify-center mb-2">
                        {sig.dataUrl ? (
                          <img
                            src={sig.dataUrl}
                            alt="Signature"
                            className="h-full object-contain mx-auto"
                          />
                        ) : (
                          <div className="w-48 border-b-2 border-gray-400 h-10" />
                        )}
                      </div>
                      <div className="min-w-[220px]">
                        <div className="text-gray-900 font-bold font-serif text-sm">
                          {sig.signerName || '________________'}
                        </div>
                        <div className="text-xs text-gray-600 font-serif">
                          {sig.title || '________________'}
                        </div>
                      </div>
                    </div>
                  </DraggableElement>
                ) : (
                  <div
                    key={sig.id}
                    style={{ 
                      position: 'absolute',
                      left: `${positions[`signature-${sig.id}`].x}px`, 
                      top: `${positions[`signature-${sig.id}`].y}px`,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ height: '64px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', marginBottom: '8px', margin: '0 0 8px 0' }}>
                      {sig.dataUrl ? (
                        <img
                          src={sig.dataUrl}
                          alt="Signature"
                          style={{ height: '100%', objectFit: 'contain', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: '192px', borderBottom: '2px solid rgb(156, 163, 175)', height: '40px' }} />
                      )}
                    </div>
                    <div style={{ minWidth: '220px' }}>
                      <div style={{ color: 'rgb(17, 24, 39)', fontWeight: 'bold', fontFamily: 'Georgia, serif', fontSize: '14px', margin: 0 }}>
                        {sig.signerName || '________________'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgb(75, 85, 99)', fontFamily: 'Georgia, serif', margin: 0, fontWeight: 'normal' }}>
                        {sig.title || '________________'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isEditMode && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-4xl mx-auto">
            <h3 className="text-blue-900 mb-2 font-semibold">💡 Editing Tips</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Hover over any element to see the drag handle (grip icon)</li>
              <li>• Click and drag the grip icon to reposition elements</li>
              <li>• Use "Preview" to see the final result without drag handles</li>
              <li>• Click "Download PDF" to generate a high-quality 2x resolution certificate</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}