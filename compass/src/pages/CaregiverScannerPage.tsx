import { MedicationScanner } from '../components/MedicationScanner';
import { ScannerMode } from '../../types';

const CaregiverScannerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <MedicationScanner lockMode defaultMode={ScannerMode.MEDICATION} />
    </div>
  );
};

export default CaregiverScannerPage;
