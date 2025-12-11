/**
 * ELDER TODAY PAGE
 * Phase 2A.1: Today Dashboard for Elder interface
 * 
 * Features:
 * - "Good Morning" greeting
 * - Medications timeline (BigActionCard)
 * - "I'm OK" check-in widget (CheckInWidget)
 */

import { Pill } from 'lucide-react';
import BigActionCard from './components/BigActionCard';
import CheckInWidget from './components/CheckInWidget';

interface Medication {
  id: string;
  title: string;
  time: string;
  status: 'pending' | 'completed';
}

const TodayPage = () => {
  // Mock data - will be replaced with real data later
  const elderName = 'Grandma'; // TODO: Get from user profile
  
  const mockMeds: Medication[] = [
    { id: '1', title: 'Morning Pill', time: '8:00 AM', status: 'pending' },
    { id: '2', title: 'Blood Pressure', time: '12:00 PM', status: 'pending' },
    { id: '3', title: 'Evening Vitamin', time: '6:00 PM', status: 'pending' },
  ];

  const handleMedClick = (medId: string) => {
    // TODO: Implement medication action
    console.log('Medication clicked:', medId);
  };

  const handleCheckIn = () => {
    // TODO: Implement check-in action
    console.log('Check-in clicked');
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 gap-3 sm:gap-4 overflow-hidden">
      {/* Header - Fixed size, doesn't shrink */}
      <header className="flex-shrink-0">
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground">
          Good Morning, {elderName}
        </h1>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 sm:gap-4">
        {/* Section 1: Medications - Can shrink */}
        <section className="flex flex-col gap-2 sm:gap-3 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Medications</h2>
          <div className="flex flex-col gap-2 sm:gap-3">
            {mockMeds.map((med) => (
              <BigActionCard
                key={med.id}
                icon={Pill}
                title={med.title}
                time={med.time}
                status={med.status}
                onClick={() => handleMedClick(med.id)}
              />
            ))}
          </div>
        </section>

        {/* Section 2: Check-in - Can shrink */}
        <section className="flex flex-col gap-2 sm:gap-3 flex-shrink-0">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Check-in</h2>
          <CheckInWidget onCheckIn={handleCheckIn} />
        </section>

      </div>
    </div>
  );
};

export default TodayPage;

