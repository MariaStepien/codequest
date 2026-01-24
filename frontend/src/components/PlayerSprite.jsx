import { useState, useEffect } from 'react';

export default function PlayerSprite() {
    const [spriteInfo, setSpriteInfo] = useState(null);

    useEffect(() => {
        const fetchPlayerStyle = async () => {
            const token = localStorage.getItem('token');
            try {
                const response = await fetch(`/api/user-equipment/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setSpriteInfo(data);
                }
            } catch (err) {
                console.error("Error fetching player sprite:", err);
            }
        };
        fetchPlayerStyle();
    }, []);

    const spriteFilename = spriteInfo?.sprite_img_source || 'uploads/sprites/sprite_1_1_1_1_1.png';
    const imageUrl = `/api/${spriteFilename}`;

    return (
        <div className="flex flex-col items-center">
            <div className="w-64 h-64 flex items-center justify-center">
                <img 
                    src={imageUrl} 
                    alt="Player Character" 
                    className="h-full w-full object-contain"
                />
            </div>
        </div>
    );
}