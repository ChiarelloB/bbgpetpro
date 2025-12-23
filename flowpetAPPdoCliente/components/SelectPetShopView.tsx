import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Store, MapPin, Search, Loader2, Navigation, AlertCircle } from 'lucide-react';

interface PetShop {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    logo_url?: string;
    distance?: number;
}

interface SelectPetShopViewProps {
    onSelectPetShop: (petShop: PetShop) => void;
}

export const SelectPetShopView: React.FC<SelectPetShopViewProps> = ({ onSelectPetShop }) => {
    const [petShops, setPetShops] = useState<PetShop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    useEffect(() => {
        fetchPetShops();
    }, []);

    const fetchPetShops = async () => {
        setLoading(true);
        // Fetch all tenants (pet shops) that are active
        const { data, error } = await supabase
            .from('tenants')
            .select('id, name, slug, logo_url')
            .order('name', { ascending: true });

        if (!error && data) {
            const shops = data.map(t => ({
                id: t.id,
                name: t.name,
                logo_url: t.logo_url
            }));
            setPetShops(shops);
        }
        setLoading(false);
    };

    const requestLocation = async () => {
        setLoadingLocation(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError('Geolocalização não suportada pelo seu navegador.');
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation(position);
                setLoadingLocation(false);
                // In a real app, you would filter/sort shops by distance here
                console.log('Localização obtida:', position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                setLoadingLocation(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        setLocationError('Permissão de localização negada.');
                        break;
                    case error.POSITION_UNAVAILABLE:
                        setLocationError('Localização indisponível.');
                        break;
                    case error.TIMEOUT:
                        setLocationError('Tempo esgotado ao obter localização.');
                        break;
                    default:
                        setLocationError('Erro ao obter localização.');
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const filteredShops = petShops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen p-6">
            {/* Header */}
            <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
                    <Store size={40} className="text-white" />
                </div>
                <h1 className="text-2xl font-black text-white mb-2">Escolha seu Pet Shop</h1>
                <p className="text-white/60 text-sm">Selecione o estabelecimento para continuar</p>
            </div>

            {/* Location Button */}
            <button
                onClick={requestLocation}
                disabled={loadingLocation}
                className={`w-full mb-4 p-4 rounded-2xl border flex items-center justify-center gap-2 transition-all ${userLocation
                        ? 'bg-green-500/10 border-green-500/30 text-green-400'
                        : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                    }`}
            >
                {loadingLocation ? (
                    <Loader2 size={18} className="animate-spin" />
                ) : (
                    <Navigation size={18} />
                )}
                {userLocation
                    ? 'Localização obtida!'
                    : loadingLocation
                        ? 'Obtendo localização...'
                        : 'Usar minha localização'
                }
            </button>

            {locationError && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {locationError}
                </div>
            )}

            {/* Search */}
            <div className="relative mb-6">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                    type="text"
                    placeholder="Buscar por nome..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
            </div>

            {/* Pet Shops List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
                    <p className="text-white/60">Carregando pet shops...</p>
                </div>
            ) : filteredShops.length === 0 ? (
                <div className="text-center py-20 text-white/40">
                    <Store size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold">Nenhum pet shop encontrado</p>
                    {searchTerm && <p className="text-sm mt-2">Tente buscar por outro termo</p>}
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredShops.map(shop => (
                        <button
                            key={shop.id}
                            onClick={() => onSelectPetShop(shop)}
                            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-indigo-500/50 rounded-2xl p-4 transition-all active:scale-[0.98] text-left"
                        >
                            <div className="flex items-center gap-4">
                                {shop.logo_url ? (
                                    <img
                                        src={shop.logo_url}
                                        alt={shop.name}
                                        className="w-14 h-14 rounded-xl object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                        <Store size={24} className="text-white" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{shop.name}</h3>
                                    {shop.address && (
                                        <p className="text-white/50 text-sm truncate flex items-center gap-1 mt-1">
                                            <MapPin size={12} />
                                            {shop.address}
                                        </p>
                                    )}
                                    {userLocation && shop.distance !== undefined && (
                                        <p className="text-indigo-400 text-xs mt-1 font-bold">
                                            {shop.distance.toFixed(1)} km de distância
                                        </p>
                                    )}
                                </div>
                                <div className="text-indigo-400">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-white/30 text-xs">
                    {petShops.length} pet shops disponíveis
                </p>
            </div>
        </div>
    );
};
