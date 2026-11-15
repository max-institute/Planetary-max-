import React, { useEffect, useState } from 'react';
import { ParlayLeg, SportMarketEvent } from '../../shared/types';
import { LiveOddsTicker } from './LiveOddsTicker';
import { KinematicMotionFeed } from './KinematicMotionFeed';
import { BettorHudSimulator } from './BettorHudSimulator';

const INITIAL_EVENTS: SportMarketEvent[] = [
  {
    id: 'sp-1',
    sport: 'NBA',
    matchup: 'NYK vs BOS • Q4 04:12',
    selection: 'NYK Moneyline (Kinematic Surge)',
    odds: 145,
    delta: 12,
    kinematicVelocity: '98.4 idx (+14%)',
    winProbability: 61.8,
  },
  {
    id: 'sp-2',
    sport: 'UFC',
    matchup: 'Main Event • Round 3',
    selection: 'Significant Strike Differential > +18',
    odds: -125,
    delta: 5,
    kinematicVelocity: '112.1 idx (+9%)',
    winProbability: 68.4,
  },
  {
    id: 'sp-3',
    sport: 'F1',
    matchup: 'Sector 3 Telemetry • Lap 44/58',
    selection: 'Fastest Lap Telemetry Lock',
    odds: 210,
    delta: -8,
    kinematicVelocity: '341.8 km/h Apex',
    winProbability: 44.2,
  },
];

export const SportsPredictiveView: React.FC = () => {
  const [events, setEvents] = useState<SportMarketEvent[]>(INITIAL_EVENTS);
  const [legs, setLegs] = useState<ParlayLeg[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEvents((prev) =>
        prev.map((ev) => {
          const shift = Math.random() > 0.5 ? 2 : -2;
          return {
            ...ev,
            odds: ev.odds + shift,
            delta: shift,
          };
        })
      );
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const toggleLeg = (ev: SportMarketEvent) => {
    setLegs((prev) => {
      const exists = prev.some((l) => l.eventId === ev.id);
      if (exists) {
        return prev.filter((l) => l.eventId !== ev.id);
      }
      return [
        ...prev,
        {
          eventId: ev.id,
          matchup: ev.matchup,
          selection: ev.selection,
          odds: ev.odds,
        },
      ];
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <LiveOddsTicker events={events} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <KinematicMotionFeed
            events={events}
            onAddLeg={toggleLeg}
            selectedIds={legs.map((l) => l.eventId)}
          />
        </div>
        <div>
          <BettorHudSimulator
            legs={legs}
            onRemoveLeg={(id) => setLegs((prev) => prev.filter((l) => l.eventId !== id))}
            onClearSlip={() => setLegs([])}
          />
        </div>
      </div>
    </div>
  );
};
