import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Bus } from '../types';
import { BusFront, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import BookingModal from './BookingModal';

export default function BusList() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'buses'), where('active', '==', true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const busData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bus));
      setBuses(busData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Available Bus Routes</h2>
          <p className="text-slate-500">Real-time seat availability and schedules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buses.map((bus) => {
          const availableSeats = bus.capacity - (bus.bookedSeats || 0);
          const isFull = availableSeats <= 0;

          return (
            <motion.div
              key={bus.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                    <BusFront className="w-6 h-6" />
                  </div>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(bus.price)}</span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">{bus.routeName}</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-slate-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2" />
                    Bus No: {bus.busNumber}
                  </div>
                  <div className="flex items-center text-slate-600 text-sm">
                    <Clock className="w-4 h-4 mr-2" />
                    {bus.schedule}
                  </div>
                  <div className="flex items-center text-slate-600 text-sm">
                    <Users className="w-4 h-4 mr-2" />
                    <span className={cn(
                      "font-semibold",
                      isFull ? "text-red-600" : "text-green-600"
                    )}>
                      {availableSeats} seats left
                    </span>
                    <span className="text-slate-400 ml-1">/ {bus.capacity} total</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBus(bus)}
                  disabled={isFull}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold transition-all active:scale-95",
                    isFull 
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-100"
                  )}
                >
                  {isFull ? 'Full' : 'Book Now'}
                  {!isFull && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {buses.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500">No active bus routes available at the moment.</p>
        </div>
      )}

      {selectedBus && (
        <BookingModal 
          bus={selectedBus} 
          onClose={() => setSelectedBus(null)} 
        />
      )}
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
