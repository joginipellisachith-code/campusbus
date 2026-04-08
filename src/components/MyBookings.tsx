import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { Booking, Bus } from '../types';
import { Ticket, Calendar, MapPin, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { formatCurrency } from '../lib/utils';
import { format } from 'date-fns';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { bus?: Bus })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'bookings'),
      where('studentId', '==', user.id),
      orderBy('bookingDate', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      
      // Fetch bus details for each booking
      const busesRef = collection(db, 'buses');
      onSnapshot(busesRef, (busSnapshot) => {
        const busMap = new Map(busSnapshot.docs.map(d => [d.id, { id: d.id, ...d.data() } as Bus]));
        const enrichedBookings = bookingData.map(b => ({
          ...b,
          bus: busMap.get(b.busId)
        }));
        setBookings(enrichedBookings);
        setLoading(false);
      });
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Bookings</h2>
        <p className="text-slate-500">History of your bus seat reservations</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {bookings.map((booking) => (
          <motion.div
            key={booking.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              <div className="bg-green-50 p-3 rounded-xl text-green-600">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{booking.bus?.routeName || 'Unknown Route'}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                  <div className="flex items-center text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 mr-1" />
                    Bus: {booking.bus?.busNumber}
                  </div>
                  <div className="flex items-center text-slate-500 text-sm">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(booking.bookingDate), 'MMM d, yyyy • h:mm a')}
                  </div>
                  <div className="flex items-center text-slate-500 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {booking.bus?.schedule}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0">
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Amount Paid</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(booking.amount)}</p>
              </div>
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                Confirmed
              </div>
            </div>
          </motion.div>
        ))}

        {bookings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500">You haven't made any bookings yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
