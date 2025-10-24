import React from 'react';
import { BannerAd } from '../../types';

interface BannerAdDisplayProps {
    ad: BannerAd;
}

const BannerAdDisplay: React.FC<BannerAdDisplayProps> = ({ ad }) => {
    return (
        <a href={ad.ctaLink} target="_blank" rel="noopener noreferrer" className="block group">
            <div className="relative rounded-lg overflow-hidden shadow-lg transition-transform transform group-hover:scale-105">
                <img src={ad.imageUrl} alt={ad.title} className="w-full h-32 sm:h-40 md:h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-4">
                    <h3 className="text-white text-lg font-bold drop-shadow-md">{ad.title}</h3>
                </div>
            </div>
        </a>
    );
};

export default BannerAdDisplay;
