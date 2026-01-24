import { useState, useEffect } from 'react';

export default function EnemySprite({ enemyId }) {
    const [enemy, setEnemy] = useState(null);

    useEffect(() => {
        const fetchEnemy = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`/api/enemies/${enemyId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setEnemy(data);
                } else {
                    console.error("Server responded with error:", response.status);
                }
            } catch (err) {
                console.error("Error fetching enemy details:", err);
            }
        };
        if (enemyId) fetchEnemy();
    }, [enemyId]);

    if (!enemy) return <div className="w-32 h-40 animate-pulse bg-gray-200 rounded-lg"></div>;

    return (
        <div className="flex flex-col items-center">
            <div className="w-64 h-64 flex items-center justify-center rounded-lg">
                <img 
                    src={`/api/${enemy.imgSource}`} 
                    alt={enemy.name} 
                    className="h-full w-full object-contain" 
                />
            </div>
            <span className="mt-2 text-sm font-bold text-red-700 bg-white/80 px-2 py-1 rounded shadow-sm">
                {enemy.name}
            </span>
        </div>
    );
}