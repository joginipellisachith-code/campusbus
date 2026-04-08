import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Bus } from '../types';
import { useAuth } from '../AuthContext';
import { X, CreditCard, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { formatCurrency } from '../lib/utils';

// @ts-ignore - Vite environment variable
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutForm({ bus, onClose }: { bus: Bus; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    setLoading(true);
    try {
      // 1. Create Payment Intent on server
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bus.price,
          busId: bus.id,
          studentId: user.id,
        }),
      });

      const { clientSecret, error: serverError } = await response.json();
      if (serverError) throw new Error(serverError);

      // 2. Confirm payment on client
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement) as any,
          billing_details: { name: user.name, email: user.email },
        },
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent.status === 'succeeded') {
        // 3. Save booking to Firestore
        await addDoc(collection(db, 'bookings'), {
          busId: bus.id,
          studentId: user.id,
          studentName: user.name,
          bookingDate: new Date().toISOString(),
          status: 'confirmed',
          paymentIntentId: result.paymentIntent.id,
          amount: bus.price,
        });

        // 4. Update bus booked seats
        await updateDoc(doc(db, 'buses', bus.id), {
          bookedSeats: increment(1),
        });

        toast.success('Booking confirmed! Seat reserved.');
        onClose();
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">Card Details</label>
        <div className="bg-white p-3 rounded-lg border border-slate-300">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#1e293b',
                '::placeholder': { color: '#94a3b8' },
              },
            },
          }} />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-green-600" />
        Secure, encrypted, and PCI compliant transaction.
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>Pay {formatCurrency(bus.price)} & Confirm</>
        )}
      </button>
    </form>
  );
}

export default function BookingModal({ bus, onClose }: { bus: Bus; onClose: () => void }) {
  // @ts-ignore - Vite environment variable
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  const isInvalidKey = publishableKey && !publishableKey.startsWith('pk_');

  if (!publishableKey || isInvalidKey) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white p-8 rounded-3xl max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            {isInvalidKey ? 'Invalid Stripe Key' : 'Stripe Keys Missing'}
          </h2>
          <p className="text-slate-600 mb-6">
            {isInvalidKey 
              ? 'The provided VITE_STRIPE_PUBLISHABLE_KEY is invalid. It should start with "pk_".'
              : 'Please add your VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY in the Secrets panel to enable payments.'}
          </p>
          <button onClick={onClose} className="bg-slate-100 px-6 py-2 rounded-xl font-semibold">Close</button>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Confirm Booking</h2>
              <p className="text-sm text-slate-500">{bus.routeName} • {bus.schedule}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-8 p-4 bg-blue-50 rounded-2xl">
              <div className="bg-blue-600 p-3 rounded-xl">
                <CreditCard className="text-white w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium uppercase tracking-wider">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(bus.price)}</p>
              </div>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm bus={bus} onClose={onClose} />
            </Elements>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
