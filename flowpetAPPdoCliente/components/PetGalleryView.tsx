import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Image, X, ChevronLeft, ChevronRight, Download, Heart,
    Calendar, Loader2, Camera, Sparkles, ZoomIn
} from 'lucide-react';
import { PetProfile } from '../types';

interface GalleryPhoto {
    id: string;
    url: string;
    date?: string;
    type: 'gallery' | 'service';
    caption?: string;
}

interface PetGalleryViewProps {
    pet: PetProfile;
}

export const PetGalleryView: React.FC<PetGalleryViewProps> = ({ pet }) => {
    const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);

    useEffect(() => {
        fetchPhotos();
    }, [pet.id]);

    const fetchPhotos = async () => {
        setLoading(true);
        const allPhotos: GalleryPhoto[] = [];

        try {
            // 1. Fetch gallery from pets table
            const { data: petData } = await supabase
                .from('pets')
                .select('gallery, img')
                .eq('id', pet.id)
                .single();

            if (petData?.gallery && Array.isArray(petData.gallery)) {
                petData.gallery.forEach((url: string, i: number) => {
                    allPhotos.push({
                        id: `gallery-${i}`,
                        url,
                        type: 'gallery',
                        caption: 'Foto do Pet'
                    });
                });
            }

            // Add profile photo if exists
            if (petData?.img && !petData.img.includes('placedog') && !petData.img.includes('placekitten')) {
                allPhotos.unshift({
                    id: 'profile',
                    url: petData.img,
                    type: 'gallery',
                    caption: 'Foto de Perfil'
                });
            }

            // 2. Fetch service photos from appointments
            const { data: appointments } = await supabase
                .from('appointments')
                .select('id, date, service, checklist_state')
                .eq('pet_id', pet.id)
                .order('date', { ascending: false });

            if (appointments) {
                for (const apt of appointments) {
                    // Check if checklist_state contains photo URLs (CHECKIN/CHECKOUT data)
                    if (apt.checklist_state && Array.isArray(apt.checklist_state)) {
                        for (const state of apt.checklist_state) {
                            if (typeof state === 'string') {
                                // Extract CHECKIN/CHECKOUT data
                                if (state.startsWith('CHECKIN:') || state.startsWith('CHECKOUT:')) {
                                    try {
                                        const data = JSON.parse(state.replace(/^(CHECKIN:|CHECKOUT:)/, ''));
                                        if (data.photos && Array.isArray(data.photos)) {
                                            data.photos.forEach((url: string, i: number) => {
                                                allPhotos.push({
                                                    id: `service-${apt.id}-${i}`,
                                                    url,
                                                    date: apt.date,
                                                    type: 'service',
                                                    caption: `${apt.service} - ${new Date(apt.date).toLocaleDateString('pt-BR')}`
                                                });
                                            });
                                        }
                                    } catch (e) {
                                        // Not JSON, skip
                                    }
                                }
                            }
                        }
                    }

                    // Try to list files from storage for this appointment
                    try {
                        const { data: files } = await supabase.storage
                            .from('service-photos')
                            .list(`services/${apt.id}`);

                        if (files && files.length > 0) {
                            for (const file of files) {
                                const { data: { publicUrl } } = supabase.storage
                                    .from('service-photos')
                                    .getPublicUrl(`services/${apt.id}/${file.name}`);

                                allPhotos.push({
                                    id: `storage-${apt.id}-${file.name}`,
                                    url: publicUrl,
                                    date: apt.date,
                                    type: 'service',
                                    caption: `${apt.service} - ${new Date(apt.date).toLocaleDateString('pt-BR')}`
                                });
                            }
                        }
                    } catch (e) {
                        // Storage access error, skip
                    }
                }
            }

            setPhotos(allPhotos);
        } catch (error) {
            console.error('Error fetching photos:', error);
        }

        setLoading(false);
    };

    const openLightbox = (photo: GalleryPhoto, index: number) => {
        setSelectedPhoto(photo);
        setSelectedIndex(index);
    };

    const closeLightbox = () => {
        setSelectedPhoto(null);
    };

    const navigatePhoto = (direction: 'prev' | 'next') => {
        let newIndex = direction === 'next'
            ? (selectedIndex + 1) % photos.length
            : (selectedIndex - 1 + photos.length) % photos.length;
        setSelectedIndex(newIndex);
        setSelectedPhoto(photos[newIndex]);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 size={40} className="text-indigo-500 animate-spin mb-4" />
                <p className="text-white/60">Carregando galeria...</p>
            </div>
        );
    }

    return (
        <div className="animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                        <Sparkles size={24} className="text-indigo-400" />
                        Galeria
                    </h2>
                    <p className="text-white/40 text-sm">{photos.length} fotos de {pet.name}</p>
                </div>
            </div>

            {/* Gallery Grid */}
            {photos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                    {photos.map((photo, index) => (
                        <button
                            key={photo.id}
                            onClick={() => openLightbox(photo, index)}
                            className="aspect-square rounded-xl overflow-hidden relative group"
                        >
                            <img
                                src={photo.url}
                                alt={photo.caption || 'Foto do pet'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                <span className="text-[10px] text-white font-medium truncate">
                                    {photo.type === 'service' ? (
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} />
                                            Serviço
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1">
                                            <Camera size={10} />
                                            Galeria
                                        </span>
                                    )}
                                </span>
                            </div>

                            {/* Zoom indicator */}
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <ZoomIn size={12} className="text-white" />
                            </div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/5 rounded-3xl border border-white/10">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-500/10 flex items-center justify-center">
                        <Image size={32} className="text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Nenhuma foto ainda</h3>
                    <p className="text-white/40 text-sm max-w-xs mx-auto">
                        As fotos dos serviços do seu pet aparecerão aqui automaticamente.
                    </p>
                </div>
            )}

            {/* Lightbox Modal */}
            {selectedPhoto && (
                <div
                    className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                >
                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                    >
                        <X size={24} className="text-white" />
                    </button>

                    {/* Navigation buttons */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigatePhoto('prev'); }}
                                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                            >
                                <ChevronLeft size={28} className="text-white" />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); navigatePhoto('next'); }}
                                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                            >
                                <ChevronRight size={28} className="text-white" />
                            </button>
                        </>
                    )}

                    {/* Photo */}
                    <div
                        className="max-w-4xl max-h-[80vh] px-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedPhoto.url}
                            alt={selectedPhoto.caption || 'Foto'}
                            className="max-w-full max-h-[75vh] object-contain rounded-lg"
                        />

                        {/* Caption */}
                        <div className="mt-4 text-center">
                            <p className="text-white font-bold">{selectedPhoto.caption}</p>
                            {selectedPhoto.date && (
                                <p className="text-white/40 text-sm mt-1">
                                    {new Date(selectedPhoto.date).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            )}
                            <p className="text-white/30 text-xs mt-2">
                                {selectedIndex + 1} de {photos.length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
