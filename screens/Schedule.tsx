import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../NotificationContext';
import { useResources, Resource } from '../ResourceContext';
import { supabase } from '../src/lib/supabase';
import { ScreenType, Appointment } from '../types';
import { AppointmentModal } from '../components/AppointmentModal';

const hours = [
  '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

// Helper to calculate overlap layout
const calculateLayout = (appointments: Appointment[]) => {
  const startHour = 5;
  const pixelsPerHour = 80; // h-20 = 80px

  const parsedEvents = appointments.map(evt => {
    const [h, m] = evt.startTime.split(':').map(Number);
    const start = (h - startHour) * 60 + m;
    const end = start + evt.duration;
    return { ...evt, start, end, original: evt };
  }).sort((a, b) => a.start - b.start || b.duration - a.duration);

  const groups: (typeof parsedEvents)[] = [];
  let currentGroup: typeof parsedEvents = [];
  let groupEnd = -1;

  parsedEvents.forEach(evt => {
    if (currentGroup.length === 0) {
      currentGroup.push(evt);
      groupEnd = evt.end;
    } else {
      if (evt.start < groupEnd) {
        currentGroup.push(evt);
        groupEnd = Math.max(groupEnd, evt.end);
      } else {
        groups.push(currentGroup);
        currentGroup = [evt];
        groupEnd = evt.end;
      }
    }
  });
  if (currentGroup.length > 0) groups.push(currentGroup);

  const result: (Appointment & { style: React.CSSProperties })[] = [];

  groups.forEach(group => {
    const columns: (typeof parsedEvents)[] = [];

    const eventColumns = group.map(evt => {
      let colIndex = -1;
      for (let i = 0; i < columns.length; i++) {
        const lastInCol = columns[i][columns[i].length - 1];
        if (lastInCol.end <= evt.start) {
          colIndex = i;
          break;
        }
      }
      if (colIndex === -1) {
        colIndex = columns.length;
        columns.push([]);
      }
      columns[colIndex].push(evt);
      return { evt, colIndex };
    });

    const widthPercent = 100 / columns.length;

    eventColumns.forEach(({ evt, colIndex }) => {
      const top = (evt.start / 60) * pixelsPerHour;
      const height = (evt.duration / 60) * pixelsPerHour;

      result.push({
        ...evt.original,
        style: {
          top: `${top}px`,
          height: `${height}px`,
          width: `${widthPercent}%`,
          left: `${colIndex * widthPercent}%`,
          position: 'absolute',
          zIndex: 20
        }
      });
    });
  });

  return result;
};

const AppointmentDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartService: () => void;
  appointment: Appointment | null
}> = ({ isOpen, onClose, onEdit, onDelete, onStartService, appointment }) => {
  const { resources } = useResources();
  if (!isOpen || !appointment) return null;

  const resourceName = resources.find(r => r.id === appointment.resourceId)?.name || 'Recurso desconhecido';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Confirmado</span>;
      case 'pending': return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Pendente</span>;
      case 'in-progress': return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Em Andamento</span>;
      case 'completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Concluído</span>;
      default: return null;
    }
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.')) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 border border-slate-100 dark:border-gray-800">
        <div className="p-6 border-b border-slate-100 dark:border-gray-800 flex justify-between items-start bg-slate-50 dark:bg-[#2d3748]">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Detalhes do Agendamento</h2>
            <p className="text-xs text-slate-500 dark:text-gray-400 font-medium">ID: {appointment.id}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-primary border-4 border-white dark:border-[#1f2937] shadow-lg">
              <span className="material-symbols-outlined text-3xl">pets</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{appointment.petName}</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Tutor: {appointment.clientName}</p>
            </div>
            <div className="ml-auto">
              {getStatusBadge(appointment.status)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-[#252525] p-3 rounded-xl border border-slate-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Data</p>
              <div className="flex items-center gap-2 text-slate-700 dark:text-white font-medium">
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                {appointment.date}
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-[#252525] p-3 rounded-xl border border-slate-100 dark:border-gray-700">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Horário</p>
              <div className="flex items-center gap-2 text-slate-700 dark:text-white font-medium">
                <span className="material-symbols-outlined text-sm">schedule</span>
                {appointment.startTime} ({appointment.duration} min)
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">medical_services</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Serviço</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{appointment.service}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 size-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">person</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Profissional</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{appointment.professional || 'Não atribuído'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 size-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-sm">meeting_room</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Local</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{resourceName}</p>
              </div>
            </div>

            {appointment.notes && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-lg">
                <p className="text-xs font-bold uppercase text-yellow-600 dark:text-yellow-500 mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">sticky_note_2</span> Observações
                </p>
                <p className="text-sm text-slate-700 dark:text-yellow-100/80 italic">"{appointment.notes}"</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#2d3748] flex justify-between gap-3">
          <button
            onClick={handleDelete}
            className="px-4 py-2 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold text-xs uppercase hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">delete</span>
          </button>
          <div className="flex gap-3">
            {(appointment.status === 'confirmed' || appointment.status === 'pending') && (
              <button
                onClick={onStartService}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-xs uppercase shadow-lg transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span> Iniciar Atendimento
              </button>
            )}
            <button
              onClick={onEdit}
              className="px-4 py-2 border border-slate-300 dark:border-gray-600 rounded-lg text-slate-600 dark:text-gray-300 font-bold text-xs uppercase hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
            >
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



const MonthView: React.FC<{
  onSelectDate: (date: Date) => void;
  currentDate: Date;
  onAdd: (appt: Omit<Appointment, 'id'>) => void;
  appointments: Appointment[];
}> = ({ onSelectDate, currentDate, onAdd, appointments }) => {
  const [displayDate, setDisplayDate] = useState(currentDate);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState<string | undefined>(undefined);

  useEffect(() => {
    setDisplayDate(currentDate);
  }, [currentDate]);

  const handleOpenAdd = (dateStr?: string) => {
    setPreselectedDate(dateStr);
    setIsModalOpen(true);
  };

  const handleSave = (appt: any) => {
    onAdd(appt);
    setIsModalOpen(false);
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() - 1, 1));
  const handleNextMonth = () => setDisplayDate(new Date(displayDate.getFullYear(), displayDate.getMonth() + 1, 1));

  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  const prevMonthDays = getDaysInMonth(year, month - 1);
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, type: 'prev', date: new Date(year, month - 1, prevMonthDays - i) });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const isToday = new Date().toDateString() === date.toDateString();
    days.push({ day: i, type: 'current', isToday, date });
  }
  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ day: i, type: 'next', date: new Date(year, month + 1, i) });
  }

  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const getDayAppointments = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(appt => appt.date === dateStr);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1a1a1a] animate-in fade-in duration-300">
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        title="Novo Agendamento"
        saveLabel="Agendar"
        initialData={preselectedDate ? { date: preselectedDate } as any : null}
      />

      <div className="px-8 py-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div>
          <h1 className="text-5xl font-black tracking-tight uppercase leading-tight">
            <div className="text-slate-900 dark:text-white">Agenda</div>
            <div className="text-primary italic">{monthNames[month]} {year}</div>
          </h1>
          <p className="text-xs text-gray-400 mt-2">Visualize e gerencie agendamentos</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleOpenAdd()}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/30 transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Novo Agendamento
          </button>
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-1 rounded-xl">
            <button onClick={handlePrevMonth} className="w-9 h-9 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-slate-600 dark:text-gray-300">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button onClick={() => setDisplayDate(new Date())} className="px-3 py-1.5 text-xs font-bold uppercase text-slate-600 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors">
              Hoje
            </button>
            <button onClick={handleNextMonth} className="w-9 h-9 flex items-center justify-center hover:bg-white dark:hover:bg-white/10 rounded-lg transition-colors text-slate-600 dark:text-gray-300">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="grid grid-cols-7 mb-4">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs font-bold uppercase text-slate-400 tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 grid-rows-6 gap-2 h-[calc(100%-40px)] min-h-[500px]">
          {days.map((dayObj, index) => {
            const dayAppts = dayObj.type === 'current' ? getDayAppointments(dayObj.date) : [];
            return (
              <div
                key={index}
                onClick={() => onSelectDate(dayObj.date)}
                className={`
                relative p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group overflow-hidden
                ${dayObj.type === 'current'
                    ? 'bg-white dark:bg-[#222] border-slate-100 dark:border-gray-800 hover:border-primary/50 hover:shadow-md'
                    : 'bg-slate-50/50 dark:bg-[#151515] border-transparent text-slate-400 dark:text-gray-600'
                  }
                ${dayObj.isToday ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-[#1a1a1a]' : ''}
              `}
              >
                <div className="flex justify-between items-start">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${dayObj.isToday ? 'bg-primary text-white' : 'text-slate-700 dark:text-gray-300 group-hover:bg-slate-100 dark:group-hover:bg-white/10'}`}>
                    {dayObj.day}
                  </span>
                  {dayObj.type === 'current' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAdd(dayObj.date.toISOString().split('T')[0]);
                      }}
                      className="w-6 h-6 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <span className="material-symbols-outlined text-[16px]">add</span>
                    </button>
                  )}
                </div>
                {dayObj.type === 'current' && (
                  <div className="mt-1 space-y-1 overflow-y-auto custom-scrollbar max-h-[80px]">
                    {dayAppts.slice(0, 3).map((appt, i) => (
                      <div key={i} className={`text-[9px] px-1.5 py-0.5 rounded truncate font-bold ${appt.status === 'confirmed' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' :
                        appt.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' :
                          appt.status === 'in-progress' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' :
                            'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                        {appt.startTime} - {appt.petName}
                      </div>
                    ))}
                    {dayAppts.length > 3 && (
                      <div className="text-[9px] text-center text-slate-400 font-bold">
                        +{dayAppts.length - 3} mais
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
};

const DayView: React.FC<{
  onBack: () => void;
  appointments: Appointment[];
  onAdd: (appt: Omit<Appointment, 'id'>) => void;
  onUpdate: (appt: any) => void;
  onDelete: (id: string) => void;
  onStartService: (appt: Appointment) => void;
  currentDate: Date;
}> = ({ onBack, appointments, onAdd, onUpdate, onDelete, onStartService, currentDate }) => {
  const [filter, setFilter] = useState('Todos');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const { resources } = useResources();
  const { showNotification } = useNotification();

  const currentDateStr = currentDate.toISOString().split('T')[0];
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'short', day: '2-digit', month: 'long' };
  const formattedDate = currentDate.toLocaleDateString('pt-BR', dateOptions);

  const dailyAppointments = useMemo(() =>
    appointments.filter(a => a.date === currentDateStr),
    [appointments, currentDateStr]);

  const filteredResources = resources.filter(r =>
    filter === 'Todos' || r.type === filter || (filter === 'Banho & Tosa' && r.type.includes('Banho'))
  );

  const handleEditClick = () => setIsEditModalOpen(true);
  const handleDeleteAppt = () => {
    if (selectedAppointment) {
      onDelete(selectedAppointment.id);
      setSelectedAppointment(null);
    }
  };
  const handleStartService = () => {
    if (selectedAppointment) {
      onStartService(selectedAppointment);
      setSelectedAppointment(null);
    }
  };

  const getServiceColor = (service: string) => {
    // Color by service type instead of status
    if (service.toLowerCase().includes('banho') || service.toLowerCase().includes('tosa')) {
      return 'bg-purple-50 border-purple-500 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300';
    }
    if (service.toLowerCase().includes('consulta') || service.toLowerCase().includes('veterinário')) {
      return 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300';
    }
    if (service.toLowerCase().includes('exame')) {
      return 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300';
    }
    if (service.toLowerCase().includes('vacina')) {
      return 'bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300';
    }
    if (service.toLowerCase().includes('cirurgia')) {
      return 'bg-red-50 border-red-500 text-red-700 dark:bg-red-900/20 dark:text-red-300';
    }
    // Default color
    return 'bg-primary/5 border-primary text-primary';
  };

  const handleDragStart = (e: React.DragEvent, apptId: string) => {
    e.dataTransfer.setData("text/plain", apptId);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };
  const handleDrop = (e: React.DragEvent, targetResourceId: string) => {
    e.preventDefault();
    const apptId = e.dataTransfer.getData("text/plain");
    const appointment = appointments.find(a => a.id === apptId);
    if (!appointment) return;

    // Use offsetY which is position relative to the element itself - more accurate!
    const offsetY = e.nativeEvent.offsetY;

    const pixelsPerHour = 80; // Must match calculateLayout (h-20)
    const startHour = 5; // Calendar starts at 5:00

    // Calculate total minutes from start of calendar
    const totalMinutesFromStart = (offsetY / pixelsPerHour) * 60;
    const hours = Math.floor(totalMinutesFromStart / 60);
    const remainingMinutes = totalMinutesFromStart % 60;

    // Snap to 15-minute intervals for precision
    const snappedMinutes = Math.round(remainingMinutes / 15) * 15;

    // Calculate final time
    let finalHour = startHour + hours;
    let finalMinutes = snappedMinutes;

    // Handle minute overflow
    if (finalMinutes >= 60) {
      finalMinutes = 0;
      finalHour += 1;
    }

    // Validate hour range (5:00 - 20:45)
    if (finalHour >= 5 && finalHour <= 20) {
      const newTime = `${finalHour.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
      onUpdate({ ...appointment, resourceId: targetResourceId, startTime: newTime });
    }
  };

  return (
    <div className="flex flex-col h-full bg-background-subtle dark:bg-[#111] overflow-hidden animate-in slide-in-from-right duration-300">
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onAdd}
        title="Novo Agendamento"
        saveLabel="Agendar"
        initialData={{ date: currentDateStr } as any}
      />
      <AppointmentModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(data) => onUpdate({ ...data, id: selectedAppointment?.id })}
        initialData={selectedAppointment}
        title="Editar Agendamento"
        saveLabel="Atualizar"
      />
      <AppointmentDetailsModal
        isOpen={!!selectedAppointment && !isEditModalOpen}
        onClose={() => setSelectedAppointment(null)}
        onEdit={handleEditClick}
        onDelete={handleDeleteAppt}
        onStartService={handleStartService}
        appointment={selectedAppointment}
      />

      <div className="bg-white dark:bg-[#1a1a1a] px-6 pt-4 border-b border-gray-100 dark:border-gray-800 shrink-0 flex flex-col gap-4 shadow-sm z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4 bg-background-subtle dark:bg-white/5 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <button onClick={onBack} className="size-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 text-primary transition-colors">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <div className="flex flex-col items-center px-2 min-w-[140px]">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Visualizando</span>
              <span className="text-sm font-bold text-text-main dark:text-white capitalize">{formattedDate}</span>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="h-10 px-5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/30 flex items-center justify-center gap-2 transition-all transform active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Novo Agendamento
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-6 overflow-x-auto no-scrollbar">
            {['Todos', 'Banho & Tosa', 'Consultas', 'Exames'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-3 border-b-4 font-bold text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${filter === tab ? 'border-primary text-black dark:text-white' : 'border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-white dark:bg-[#1a1a1a] relative">
        <div className="min-w-max">
          <div className="flex sticky top-0 z-30 bg-white dark:bg-[#1a1a1a] border-b-2 border-slate-300 dark:border-gray-700 shadow-sm">
            <div className="w-16 sticky left-0 z-40 bg-slate-100 dark:bg-[#222] border-r-2 border-slate-300 dark:border-gray-700 flex items-center justify-center h-20">
              <span className="material-symbols-outlined text-slate-600 dark:text-gray-400">schedule</span>
            </div>
            {filteredResources.map((resource) => (
              <div key={resource.id} className="w-64 border-r-2 border-slate-300 dark:border-gray-700 p-3 bg-gradient-to-br from-white to-slate-50 dark:from-[#1a1a1a] dark:to-gray-900 h-20 shrink-0">
                <span className="font-bold text-sm text-text-main dark:text-white block truncate mb-1">{resource.name}</span>
                <div className="flex items-center gap-2 mb-1 text-xs text-text-muted">
                  {resource.staff ? (
                    <>
                      <img src={resource.avatar!} alt="Staff" className="h-5 w-5 rounded-full" />
                      <span>{resource.staff}</span>
                    </>
                  ) : <span className="italic">Livre</span>}
                </div>
                <div className="w-full bg-gray-100 dark:bg-white/10 rounded-full h-1">
                  <div className="h-1 rounded-full bg-primary" style={{ width: `${resource.utilization}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex relative">
            <div className="w-16 sticky left-0 z-20 bg-slate-50 dark:bg-[#1a1a1a] border-r-2 border-slate-300 dark:border-gray-700 flex flex-col shrink-0">
              {hours.map((hour, idx) => (
                <div key={hour} className={`h-20 relative border-b border-transparent ${idx % 2 === 0 ? 'bg-slate-50 dark:bg-gray-900/30' : 'bg-white dark:bg-transparent'}`}>
                  <span className="absolute -top-2 left-0 right-0 text-center text-xs font-bold text-slate-700 dark:text-gray-300 bg-inherit px-1">{hour}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 z-0 pointer-events-none w-full ml-16">
              {hours.map((_, i) => <div key={i} className={`h-20 border-b-2 border-slate-300 dark:border-gray-700 w-full ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-gray-900/30' : 'bg-white dark:bg-transparent'}`}></div>)}
            </div>
            {filteredResources.map((resource) => (
              <div
                key={resource.id}
                className="w-64 border-r-2 border-slate-300 dark:border-gray-700 relative h-[1280px] z-10 shrink-0 bg-white dark:bg-[#1a1a1a]"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, resource.id)}
              >
                {calculateLayout(dailyAppointments.filter(a => a.resourceId === resource.id)).map(appt => (
                  <div
                    key={appt.id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, appt.id)}
                    className={`absolute rounded-md p-2.5 cursor-move transition-all border-l-4 flex flex-col overflow-hidden shadow-sm ${getServiceColor(appt.service)}`}
                    style={appt.style}
                    onClick={() => setSelectedAppointment(appt)}
                  >
                    <span className="text-[10px] font-bold opacity-80 mb-1">{appt.startTime}</span>
                    <p className="font-bold text-sm leading-tight truncate">{appt.petName}</p>
                    <p className="text-[10px] opacity-90 truncate">{appt.clientName}</p>
                    <p className="text-[10px] mt-auto truncate opacity-70">{appt.service}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Schedule: React.FC<{ onNavigate: (screen: ScreenType) => void }> = ({ onNavigate }) => {
  const { showNotification } = useNotification();
  const { resources } = useResources();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'day'>('month');
  const [appointmentsList, setAppointmentsList] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(name),
        pets(name)
      `)
      .order('start_time', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      showNotification('Erro ao carregar agenda', 'error');
    } else {
      setAppointmentsList((data || []).map(a => {
        const startTime = new Date(a.start_time);
        // Use local date formatting to avoid UTC conversion
        const year = startTime.getFullYear();
        const month = String(startTime.getMonth() + 1).padStart(2, '0');
        const day = String(startTime.getDate()).padStart(2, '0');
        const hours = String(startTime.getHours()).padStart(2, '0');
        const minutes = String(startTime.getMinutes()).padStart(2, '0');

        const dateStr = `${year}-${month}-${day}`;
        const timeStr = `${hours}:${minutes}`;

        return {
          id: a.id,
          resourceId: a.resource_id || '',
          clientName: a.clients?.name || 'Cliente sem nome',
          petName: a.pets?.name || 'Pet sem nome',
          service: a.service,
          date: dateStr,
          startTime: timeStr,
          duration: a.duration,
          status: a.status || 'pending',
          notes: a.notes,
          professional: a.professional
        };
      }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleAdd = async (appt: any) => {
    // Keep timestamp as local time string - Supabase will store it as-is
    // Format: YYYY-MM-DDTHH:MM:SS (local time, no timezone conversion)
    const startTimestamp = `${appt.date}T${appt.startTime}:00`;

    console.log('Creating appointment with timestamp:', startTimestamp);

    const { data: appointmentData, error } = await supabase
      .from('appointments')
      .insert([{
        resource_id: appt.resourceId || null,
        client_id: appt.clientId || null,
        pet_id: appt.petId || null,
        service: appt.service,
        start_time: startTimestamp,
        duration: appt.duration,
        status: appt.status || 'pending',
        notes: appt.notes,
        professional: appt.professional
      }])
      .select();

    if (error) {
      console.error('Error adding appointment:', error);
      showNotification('Erro ao criar agendamento: ' + error.message, 'error');
    } else {
      // Use subscription if user opted in
      if (appt.useSubscription && appt.subscriptionId) {
        try {
          // Get current subscription to increment usage
          const { data: subscription } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('id', appt.subscriptionId)
            .single();

          if (subscription && subscription.current_usage < subscription.max_usage) {
            const newUsage = subscription.current_usage + 1;
            const { error: updateError } = await supabase
              .from('subscriptions')
              .update({ current_usage: newUsage })
              .eq('id', appt.subscriptionId);

            if (!updateError) {
              showNotification(
                `✨ Uso da assinatura contabilizado! (${newUsage}/${subscription.max_usage} ${subscription.usage_unit})`,
                'success'
              );
            }
          }
        } catch (subError) {
          console.error('Error updating subscription:', subError);
        }
      }

      fetchAppointments();
      showNotification('Agendamento criado!', 'success');
    }
  };

  const handleUpdate = async (updatedAppt: any) => {
    // Keep timestamp as local time string
    const startTimestamp = `${updatedAppt.date}T${updatedAppt.startTime}:00`;

    const { error } = await supabase
      .from('appointments')
      .update({
        resource_id: updatedAppt.resourceId || null,
        client_id: updatedAppt.clientId || null,
        pet_id: updatedAppt.petId || null,
        service: updatedAppt.service,
        start_time: startTimestamp,
        duration: updatedAppt.duration,
        status: updatedAppt.status,
        notes: updatedAppt.notes,
        professional: updatedAppt.professional
      })
      .eq('id', updatedAppt.id);

    if (error) {
      console.error('Error updating appointment:', error);
      showNotification('Erro ao atualizar agendamento', 'error');
    } else {
      fetchAppointments();
      showNotification('Agendamento atualizado!', 'success');
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) {
      console.error('Error deleting appointment:', error);
      showNotification('Erro ao cancelar agendamento', 'error');
    } else {
      fetchAppointments();
      showNotification('Agendamento cancelado.', 'info');
    }
  };

  const handleStartService = async (appt: Appointment) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'in-progress' })
      .eq('id', appt.id);

    if (!error) {
      fetchAppointments();
      showNotification(`Iniciando atendimento para ${appt.petName}...`, 'success');
      onNavigate('execution');
    }
  };

  if (loading && appointmentsList.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return view === 'month' ? (
    <MonthView
      currentDate={currentDate}
      onSelectDate={(date) => { setCurrentDate(date); setView('day'); }}
      onAdd={handleAdd}
      appointments={appointmentsList}
    />
  ) : (
    <DayView
      onBack={() => setView('month')}
      currentDate={currentDate}
      appointments={appointmentsList}
      onAdd={handleAdd}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onStartService={handleStartService}
    />
  );
};