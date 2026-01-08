import { useState, useEffect } from 'react';
import { Heart, Coins, X, Clock } from 'lucide-react';

export default function HeartModal({ user, onClose, onUpdate }) {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (user.hearts >= 5) return;

        const calculateTime = () => {
            const lastRecovery = new Date(user.lastHeartRecovery);
            const nextRecovery = new Date(lastRecovery.getTime() + 2 * 60000); // 2 mins
            const now = new Date();
            const diff = nextRecovery - now;

            if (diff <= 0) {
                onUpdate();
                return;
            }

            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        };

        const timer = setInterval(calculateTime, 1000);
        calculateTime();
        return () => clearInterval(timer);
    }, [user, onUpdate]);

    const handleBuy = async () => {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/user/buy-heart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
            onUpdate();
        } else {
            const data = await res.json();
            alert(data.error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative text-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="flex justify-center mb-4">
                    <div className="relative">
                        <Heart size={64} className="fill-red-500 text-red-500 animate-pulse" />
                        <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                            {user.hearts}
                        </span>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Twoje Serca</h2>
                
                {user.hearts < 5 ? (
                    <div className="flex items-center justify-center gap-2 text-indigo-600 font-mono text-lg mb-6">
                        <Clock size={20} />
                        <span>Kolejne serce za: {timeLeft}</span>
                    </div>
                ) : (
                    <p className="text-green-600 font-semibold mb-6">Masz maksymalną liczbę serc!</p>
                )}

                <button
                    onClick={handleBuy}
                    disabled={user.hearts >= 5 || user.coins < 20}
                    className="w-full py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:scale-100"
                >
                    <div className="flex items-center justify-center gap-2">
                        <span>Kup 1 Serce</span>
                        <div className="flex items-center bg-black/20 px-2 py-1 rounded-lg">
                            <Coins size={16} className="mr-1" />
                            <span>20</span>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    );
}