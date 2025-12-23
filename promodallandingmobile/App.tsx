import React, { useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PetProfileView } from './components/PetProfileView';
import { HomeView } from './components/HomeView';
import { AgendaView } from './components/AgendaView';
import { UserProfileView } from './components/UserProfileView';
import { AddPetView } from './components/AddPetView';
import { AddAppointmentView } from './components/AddAppointmentView';
import { LoginView } from './components/LoginView';
import { NotificationsView } from './components/NotificationsView';
import { AiChatView } from './components/AiChatView';
import { PETS, APPOINTMENTS } from './constants';
import { PetProfile, Appointment } from './types';
import { Plus, X, CalendarPlus, Dog, Sparkles } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showCreationMenu, setShowCreationMenu] = useState(false);

  // Data State
  const [pets, setPets] = useState<PetProfile[]>(PETS);
  const [appointments, setAppointments] = useState<Appointment[]>(APPOINTMENTS);
  const [selectedPetId, setSelectedPetId] = useState(PETS[0]?.id || '');
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);

  const currentPet = pets.find(p => p.id === selectedPetId) || pets[0];

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('home');
  };

  const handlePetSelection = (petId: string) => {
    setSelectedPetId(petId);
    setActiveTab('pets');
  };

  const handleAddClick = () => {
    setShowCreationMenu(true);
  };

  const handleMenuSelection = (option: 'pet' | 'appointment' | 'ai') => {
    setShowCreationMenu(false);
    if (option === 'pet') {
        setEditingPet(null);
        setActiveTab('add-pet');
    } else if (option === 'appointment') {
        setActiveTab('add-appointment');
    } else if (option === 'ai') {
        setActiveTab('ai-chat');
    }
  };

  const handleEditPetClick = (pet: PetProfile) => {
    setEditingPet(pet);
    setActiveTab('add-pet');
  }

  const handleToggleAppointment = (id: string) => {
    setAppointments(prev => prev.map(apt => 
        apt.id === id ? { ...apt, completed: !apt.completed } : apt
    ));
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
  };

  const handleScheduleVaccine = () => {
    if (!currentPet) return;
    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      title: 'Reforço Antirrábica',
      date: 'Amanhã',
      time: '14:00',
      type: 'vaccine',
      petId: currentPet.id,
      petName: currentPet.name,
      status: 'upcoming',
      completed: false
    };
    setAppointments([newApt, ...appointments]);
    alert(`Agendamento de reforço criado para ${currentPet.name}!`);
  };

  const handleSavePet = (formData: any) => {
    if (editingPet) {
        // Update existing pet
        setPets(prev => prev.map(p => p.id === editingPet.id ? {
            ...p,
            name: formData.name,
            breed: formData.breed,
            age: parseInt(formData.age) || p.age,
            stats: { 
                ...p.stats, 
                sex: formData.sex,
                weight: parseFloat(formData.weight) || p.stats.weight,
                size: formData.size
            },
            preferences: {
                ...p.preferences,
                food: formData.food
            }
        } : p));
    } else {
        // Create new pet
        const newPet: PetProfile = {
            id: `pet-${Date.now()}`,
            name: formData.name,
            breed: formData.breed,
            age: parseInt(formData.age) || 0,
            imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800&auto=format&fit=crop',
            stats: {
                weight: parseFloat(formData.weight) || 0,
                sex: formData.sex,
                size: formData.size,
            },
            vaccines: [],
            alerts: [],
            preferences: {
                food: formData.food || 'Ração Padrão',
                behavior: ['Dócil'],
            },
            nextAppointment: null,
        };
        setPets([...pets, newPet]);
        if (!selectedPetId) setSelectedPetId(newPet.id);
    }
    setActiveTab('home');
  };

  const handleDeletePet = (id: string) => {
    setPets(prev => prev.filter(p => p.id !== id));
    // Remove appointments for this pet
    setAppointments(prev => prev.filter(a => a.petId !== id));
    
    // Select another pet or clear selection
    const remaining = pets.filter(p => p.id !== id);
    if (remaining.length > 0) {
        setSelectedPetId(remaining[0].id);
    } else {
        setSelectedPetId('');
    }
    setActiveTab('home');
  };

  const handleSaveAppointment = (formData: any) => {
    const pet = pets.find(p => p.id === formData.petId);
    if (!pet) return;

    const newApt: Appointment = {
        id: `apt-${Date.now()}`,
        title: formData.title,
        date: formData.date,
        time: formData.time,
        type: formData.type,
        petId: pet.id,
        petName: pet.name,
        status: 'upcoming',
        completed: false
    };

    setAppointments([newApt, ...appointments]);
    
    // Update pet's next appointment if it's the soonest (simple logic: just update it)
    setPets(prev => prev.map(p => p.id === pet.id ? {
        ...p,
        nextAppointment: {
            title: newApt.title,
            date: newApt.date,
            time: newApt.time,
            type: newApt.type as any
        }
    } : p));

    setActiveTab('agenda');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'notifications':
        return <NotificationsView onClose={() => setActiveTab('home')} />;
      case 'home':
        return <HomeView 
            pets={pets} 
            appointments={appointments}
            onSelectPet={handlePetSelection} 
            onAddPet={() => handleMenuSelection('pet')} 
            onToggleAppointment={handleToggleAppointment}
            onManagePets={() => setActiveTab('pets')}
        />;
      case 'pets':
        return currentPet ? (
            <PetProfileView 
              pet={currentPet} 
              onEdit={handleEditPetClick} 
              onScheduleVaccine={handleScheduleVaccine}
            />
        ) : (
            <div className="flex flex-col items-center justify-center h-[50vh] text-white/40">
                <Dog size={48} className="mb-4 opacity-50" />
                <p>Nenhum pet selecionado.</p>
                <button onClick={() => handleMenuSelection('pet')} className="mt-4 text-indigo-400 font-bold">Adicionar Pet</button>
            </div>
        );
      case 'agenda':
        return <AgendaView appointments={appointments} onDelete={handleDeleteAppointment} />;
      case 'profile':
        return <UserProfileView onLogout={handleLogout} />;
      case 'add-pet':
        return <AddPetView onCancel={() => setActiveTab('home')} onSave={handleSavePet} onDelete={handleDeletePet} initialData={editingPet} />;
      case 'add-appointment':
        return <AddAppointmentView pets={pets} onCancel={() => setActiveTab('home')} onSave={handleSaveAppointment} />;
      case 'ai-chat':
        return <AiChatView currentPet={currentPet} onClose={() => setActiveTab('home')} />;
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'notifications': return 'Notificações';
      case 'home': return 'Dashboard';
      case 'pets': return 'Perfil do Pet';
      case 'agenda': return 'Agenda';
      case 'profile': return 'Minha Conta';
      case 'add-pet': return editingPet ? 'Editar Pet' : 'Novo Pet';
      case 'add-appointment': return 'Novo Agendamento';
      case 'ai-chat': return 'Veterinário IA';
      default: return 'Flow Pet Pro';
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="flex justify-center min-h-screen bg-dark-950">
        <div className="w-full max-w-md bg-dark-900 shadow-2xl overflow-hidden border-x border-dark-800 relative min-h-screen">
          <LoginView onLogin={handleLogin} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-dark-950">
      {/* Mobile container constraint */}
      <div className="w-full max-w-md bg-dark-900 shadow-2xl overflow-hidden border-x border-dark-800 relative min-h-screen">
        
        {/* Background decorative blobs */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none z-0"></div>
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

        <Header 
          title={getHeaderTitle()} 
          showBack={activeTab !== 'home'}
          onBack={() => setActiveTab('home')}
          onNotificationsClick={() => setActiveTab('notifications')}
        />
        
        <main className="relative z-10 px-6 pb-32 pt-4 min-h-[calc(100vh-160px)]">
          {renderContent()}
        </main>

        {activeTab !== 'add-pet' && activeTab !== 'add-appointment' && activeTab !== 'notifications' && activeTab !== 'ai-chat' && (
          <BottomNav 
            activeTab={activeTab} 
            onTabChange={setActiveTab} 
            onAddClick={handleAddClick}
          />
        )}

        {/* Creation Menu Overlay */}
        {showCreationMenu && (
            <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end animate-[fadeIn_0.2s_ease-out]">
                <div onClick={() => setShowCreationMenu(false)} className="absolute inset-0"></div>
                <div className="relative w-full bg-dark-900 rounded-t-3xl p-6 pb-12 animate-[slideUp_0.3s_ease-out] border-t border-white/10">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-white">O que deseja fazer?</h3>
                        <button onClick={() => setShowCreationMenu(false)} className="p-2 bg-white/5 rounded-full text-white/60">
                            <X size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => handleMenuSelection('appointment')}
                            className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-indigo-600 shadow-neon border border-indigo-500 active:scale-95 transition-all"
                        >
                            <CalendarPlus size={32} className="text-white" />
                            <span className="font-bold text-white">Agendamento</span>
                        </button>
                         <button 
                             onClick={() => handleMenuSelection('ai')}
                            className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 active:scale-95 transition-all hover:bg-emerald-500/20"
                        >
                            <Sparkles size={32} className="text-emerald-400" />
                            <span className="font-bold text-emerald-400">Veterinário IA</span>
                        </button>
                    </div>
                     <button 
                             onClick={() => handleMenuSelection('pet')}
                            className="w-full mt-4 flex items-center justify-center gap-3 p-4 rounded-2xl bg-dark-800 border border-white/10 active:scale-95 transition-all hover:bg-dark-700"
                        >
                            <Dog size={24} className="text-white/60" />
                            <span className="font-bold text-white/60">Cadastrar Novo Pet</span>
                        </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}

export default App;