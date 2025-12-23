import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
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
import { ServiceTrackingView } from './components/ServiceTrackingView';
import { SelectPetShopView } from './components/SelectPetShopView';
import { PetProfile, Appointment } from './types';
import { Plus, X, CalendarPlus, Dog, Loader2 } from 'lucide-react';

interface PetShop {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  logo_url?: string;
}

function App() {
  // Auth and pet shop state
  const [user, setUser] = useState<any>(null);
  const [selectedPetShop, setSelectedPetShop] = useState<PetShop | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // App state
  const [activeTab, setActiveTab] = useState('home');
  const [showCreationMenu, setShowCreationMenu] = useState(false);

  // Data State
  const [pets, setPets] = useState<PetProfile[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedPetId, setSelectedPetId] = useState('');
  const [editingPet, setEditingPet] = useState<PetProfile | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);

  const currentPet = pets.find(p => p.id === selectedPetId) || pets[0];

  // Check auth on load and restore pet shop selection
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Try to restore pet shop from local storage
        const savedPetShop = localStorage.getItem('flowpet_petshop');
        if (savedPetShop) {
          setSelectedPetShop(JSON.parse(savedPetShop));
        }
      }
      setLoadingAuth(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setSelectedPetShop(null);
        setPets([]);
        setAppointments([]);
        localStorage.removeItem('flowpet_petshop');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch client data when user and petshop are set
  useEffect(() => {
    if (!user || !selectedPetShop) return;

    const fetchClientData = async () => {
      // Get client record
      const { data: client } = await supabase
        .from('clients')
        .select('id')
        .eq('tenant_id', selectedPetShop.id)
        .eq('email', user.email)
        .single();

      if (client) {
        setClientId(client.id);

        // Fetch pets for this client
        const { data: petsData } = await supabase
          .from('pets')
          .select('*')
          .eq('client_id', client.id)
          .order('name');

        if (petsData) {
          // Fetch vaccines and upcoming appointments for all pets
          const petIds = petsData.map(p => p.id);

          // Get medical records (vaccines)
          const { data: medicalRecords } = await supabase
            .from('medical_records')
            .select('*')
            .in('pet_id', petIds)
            .eq('type', 'vaccine')
            .order('date', { ascending: false });

          // Get upcoming appointments for each pet
          const { data: upcomingApts } = await supabase
            .from('appointments')
            .select('*, pets(name)')
            .in('pet_id', petIds)
            .eq('tenant_id', selectedPetShop.id)
            .gte('start_time', new Date().toISOString())
            .neq('status', 'cancelled')
            .order('start_time', { ascending: true });

          const transformedPets: PetProfile[] = petsData.map(pet => {
            // Get vaccines for this pet
            const petVaccines = (medicalRecords || [])
              .filter(v => v.pet_id === pet.id)
              .map(v => ({
                id: v.id,
                name: v.title,
                date: new Date(v.date).toLocaleDateString('pt-BR'),
                status: getVaccineStatus(v.date, v.expires_at)
              }));

            // Get next appointment for this pet
            const nextApt = upcomingApts?.find(a => a.pet_id === pet.id);

            return {
              id: pet.id,
              name: pet.name,
              breed: pet.breed || '',
              age: pet.age || calculateAge(pet.birth_date),
              imageUrl: pet.img || pet.photo_url || 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800',
              stats: {
                weight: pet.weight || 0,
                sex: pet.gender === 'Macho' ? 'male' : 'female',
                size: pet.size || 'M',
              },
              vaccines: petVaccines,
              alerts: [],
              preferences: {
                food: pet.food_brand || '',
                behavior: pet.notes ? [pet.notes] : [],
              },
              nextAppointment: nextApt ? {
                title: nextApt.service || 'Agendamento',
                date: new Date(nextApt.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                time: new Date(nextApt.start_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                type: 'grooming' as 'bath' | 'vet' | 'grooming'
              } : null,
            };
          });
          setPets(transformedPets);
          if (transformedPets.length > 0 && !selectedPetId) {
            setSelectedPetId(transformedPets[0].id);
          }
          // Fetch all appointments for the agenda view
          const { data: appointmentsData } = await supabase
            .from('appointments')
            .select('*, pets(name)')
            .eq('tenant_id', selectedPetShop.id)
            .in('pet_id', petsData.map(p => p.id))
            .order('start_time', { ascending: true });

          console.log('--- DEBUG AGENDA FETCH ---');
          console.log('Pet Shop ID:', selectedPetShop.id);
          console.log('Pet IDs:', petsData.map(p => p.id));
          console.log('Raw DB Appointments:', appointmentsData);

          if (appointmentsData) {
            const transformedAppointments: Appointment[] = appointmentsData.map(apt => {
              const startDate = new Date(apt.start_time);
              const isCompleted = ['completed', 'finished'].includes(apt.status);

              return {
                id: apt.id,
                title: apt.service || 'Serviço',
                date: startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
                time: startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                type: 'grooming',
                petId: apt.pet_id,
                petName: apt.pets?.name || '',
                status: isCompleted ? 'completed' : 'upcoming',
                completed: isCompleted,
              };
            });
            console.log('Transformed Appointments:', transformedAppointments);
            setAppointments(transformedAppointments);
          }
        }
      }
    };


    // Helper function to calculate pet age from birth date
    const calculateAge = (birthDate: string | null): number => {
      if (!birthDate) return 0;
      const birth = new Date(birthDate);
      const now = new Date();
      return Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    };

    // Helper function to determine vaccine status
    const getVaccineStatus = (date: string, expiresAt?: string): 'valid' | 'expiring' | 'expired' => {
      const now = new Date();
      const expires = expiresAt ? new Date(expiresAt) : new Date(new Date(date).setFullYear(new Date(date).getFullYear() + 1));
      const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      if (expires < now) return 'expired';
      if (expires < thirtyDaysFromNow) return 'expiring';
      return 'valid';
    };

    fetchClientData();
  }, [user, selectedPetShop]);

  const handlePetShopSelect = (petShop: PetShop) => {
    setSelectedPetShop(petShop);
    localStorage.setItem('flowpet_petshop', JSON.stringify(petShop));
  };

  const handleLogin = (loggedUser: any) => {
    setUser(loggedUser);
    setActiveTab('home');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedPetShop(null);
    setPets([]);
    setAppointments([]);
    localStorage.removeItem('flowpet_petshop');
  };

  const handlePetSelection = (petId: string) => {
    setSelectedPetId(petId);
    setActiveTab('pets');
  };

  const handleAddClick = () => {
    setShowCreationMenu(true);
  };

  const handleMenuSelection = (option: 'pet' | 'appointment') => {
    setShowCreationMenu(false);
    if (option === 'pet') {
      setEditingPet(null);
      setActiveTab('add-pet');
    } else {
      setActiveTab('add-appointment');
    }
  };

  const handleEditPetClick = (pet: PetProfile) => {
    setEditingPet(pet);
    setActiveTab('add-pet');
  };

  const handleToggleAppointment = (id: string) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === id ? { ...apt, completed: !apt.completed } : apt
    ));
  };

  const handleScheduleVaccine = () => {
    if (!currentPet) return;
    setActiveTab('add-appointment');
  };

  const handleSavePet = async (formData: any) => {
    if (!clientId || !selectedPetShop) {
      console.error('Missing clientId or selectedPetShop:', { clientId, selectedPetShop });
      alert('Erro: Não foi possível identificar seu cadastro. Faça logout e login novamente.');
      return;
    }

    console.log('Creating pet with:', { clientId, tenantId: selectedPetShop.id, formData });

    if (editingPet) {
      // Update existing pet
      const { error } = await supabase
        .from('pets')
        .update({
          name: formData.name,
          breed: formData.breed,
          weight: parseFloat(formData.weight) || 0,
          gender: formData.sex === 'male' ? 'Macho' : 'Fêmea',
          size_category: formData.size,
        })
        .eq('id', editingPet.id);

      if (error) {
        console.error('Error updating pet:', error);
        alert(`Erro ao atualizar pet: ${error.message}`);
        return;
      }

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
        }
      } : p));
    } else {
      // Create new pet - calculate birth_date from age
      const currentYear = new Date().getFullYear();
      const birthYear = formData.age ? currentYear - parseInt(formData.age) : null;
      const birthDate = birthYear ? `${birthYear}-01-01` : null;

      const { data: newPetData, error } = await supabase
        .from('pets')
        .insert({
          tenant_id: selectedPetShop.id,
          client_id: clientId,
          name: formData.name,
          breed: formData.breed,
          species: 'Cachorro',
          weight: parseFloat(formData.weight) || 0,
          gender: formData.sex === 'male' ? 'M' : 'F',
          size_category: formData.size,
          birth_date: birthDate,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating pet:', error);
        alert(`Erro ao criar pet: ${error.message}`);
        return;
      }

      if (newPetData) {
        const newPet: PetProfile = {
          id: newPetData.id,
          name: formData.name,
          breed: formData.breed,
          age: parseInt(formData.age) || 0,
          imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=800',
          stats: {
            weight: parseFloat(formData.weight) || 0,
            sex: formData.sex,
            size: formData.size,
          },
          vaccines: [],
          alerts: [],
          preferences: {
            food: formData.food || '',
            behavior: ['Dócil'],
          },
          nextAppointment: null,
        };
        setPets([...pets, newPet]);
        if (!selectedPetId) setSelectedPetId(newPet.id);
      }
    }
    setEditingPet(null);
    setActiveTab('home');
  };

  const handleDeletePet = async (id: string) => {
    await supabase.from('pets').delete().eq('id', id);

    setPets(prev => prev.filter(p => p.id !== id));
    setAppointments(prev => prev.filter(a => a.petId !== id));

    const remaining = pets.filter(p => p.id !== id);
    if (remaining.length > 0) {
      setSelectedPetId(remaining[0].id);
    } else {
      setSelectedPetId('');
    }
    setActiveTab('home');
  };

  const handleSaveAppointment = async (formData: any) => {
    const pet = pets.find(p => p.id === formData.petId);
    if (!pet || !selectedPetShop || !clientId) {
      console.error('Missing required data:', { pet, selectedPetShop, clientId });
      alert('Erro: Dados incompletos. Por favor, tente novamente.');
      return;
    }

    // Combine date and time into a full timestamp
    const startTimestamp = `${formData.date}T${formData.time}:00`;
    console.log('Creating appointment with:', { startTimestamp, formData });

    // Check availability first - query by date range
    const dateStart = `${formData.date}T00:00:00`;
    const dateEnd = `${formData.date}T23:59:59`;

    const { data: existingAppointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('tenant_id', selectedPetShop.id)
      .gte('start_time', dateStart)
      .lte('start_time', dateEnd)
      .like('start_time', `%T${formData.time}%`);

    if (existingAppointments && existingAppointments.length > 0) {
      alert('Horário não disponível. Por favor, escolha outro.');
      return;
    }

    // Create appointment
    const { data: newAptData, error } = await supabase
      .from('appointments')
      .insert({
        tenant_id: selectedPetShop.id,
        pet_id: pet.id,
        client_id: clientId,
        start_time: startTimestamp,
        service: formData.title,
        status: 'pending',
        notes: formData.notes || '',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      alert(`Erro ao agendar: ${error.message}`);
      return;
    }

    if (newAptData) {

      const newApt: Appointment = {
        id: newAptData.id,
        title: formData.title,
        date: new Date(formData.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
        time: formData.time,
        type: formData.type || 'grooming',
        petId: pet.id,
        petName: pet.name,
        status: 'upcoming',
        completed: false
      };

      setAppointments([newApt, ...appointments]);

      setPets(prev => prev.map(p => p.id === pet.id ? {
        ...p,
        nextAppointment: {
          title: newApt.title,
          date: newApt.date,
          time: newApt.time,
          type: newApt.type as any
        }
      } : p));
    }

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
          userName={user?.user_metadata?.name || user?.email?.split('@')[0]}
          onSelectPet={handlePetSelection}
          onAddPet={() => handleMenuSelection('pet')}
          onToggleAppointment={handleToggleAppointment}
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
        return <AgendaView appointments={appointments} />;
      case 'tracking':
        return <ServiceTrackingView clientId={clientId || undefined} petIds={pets.map(p => p.id)} />;
      case 'profile':
        return <UserProfileView onLogout={handleLogout} />;
      case 'add-pet':
        return <AddPetView onCancel={() => setActiveTab('home')} onSave={handleSavePet} onDelete={handleDeletePet} initialData={editingPet} />;
      case 'add-appointment':
        return <AddAppointmentView pets={pets} onCancel={() => setActiveTab('home')} onSave={handleSaveAppointment} />;
      default:
        return null;
    }
  };

  const getHeaderTitle = () => {
    switch (activeTab) {
      case 'notifications': return 'Notificações';
      case 'home': return selectedPetShop?.name || 'Dashboard';
      case 'pets': return 'Perfil do Pet';
      case 'agenda': return 'Agenda';
      case 'profile': return 'Minha Conta';
      case 'add-pet': return editingPet ? 'Editar Pet' : 'Novo Pet';
      case 'add-appointment': return 'Novo Agendamento';
      default: return 'Flow Pet';
    }
  };

  // Loading screen
  if (loadingAuth) {
    return (
      <div className="flex justify-center min-h-screen bg-dark-950">
        <div className="w-full max-w-md bg-dark-900 shadow-2xl overflow-hidden border-x border-dark-800 relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="text-indigo-500 animate-spin mx-auto mb-4" />
            <p className="text-white/60">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  // Pet Shop Selection Screen
  if (!selectedPetShop) {
    return (
      <div className="flex justify-center min-h-screen bg-dark-950">
        <div className="w-full max-w-md bg-dark-900 shadow-2xl overflow-hidden border-x border-dark-800 relative min-h-screen">
          <SelectPetShopView onSelectPetShop={handlePetShopSelect} />
        </div>
      </div>
    );
  }

  // Login Screen
  if (!user) {
    return (
      <div className="flex justify-center min-h-screen bg-dark-950">
        <div className="w-full max-w-md bg-dark-900 shadow-2xl overflow-hidden border-x border-dark-800 relative min-h-screen">
          <LoginView
            petShopName={selectedPetShop.name}
            petShopId={selectedPetShop.id}
            onLogin={handleLogin}
            onBack={() => setSelectedPetShop(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen bg-dark-950">
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

        {activeTab !== 'add-pet' && activeTab !== 'add-appointment' && activeTab !== 'notifications' && (
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
                <h3 className="text-lg font-bold text-white">Criar Novo</h3>
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
                  onClick={() => handleMenuSelection('pet')}
                  className="flex flex-col items-center gap-3 p-6 rounded-3xl bg-dark-800 border border-white/10 active:scale-95 transition-all hover:bg-dark-700"
                >
                  <Dog size={32} className="text-white/80" />
                  <span className="font-bold text-white/80">Novo Pet</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;