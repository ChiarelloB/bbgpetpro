import React, { useState } from 'react';
import { useNotification } from '../NotificationContext';
import { supabase } from '../src/lib/supabase';

interface RoadmapItem {
    id: number;
    title: string;
    description: string;
    status: 'Lançado' | 'Em Desenvolvimento' | 'Planejado' | 'Futuro';
    date: string;
    progress?: number;
    tags?: string[];
    features: { label: string; done?: boolean }[];
    icon: string;
}

interface ChangelogEntry {
    version: string;
    date: string;
    type: 'major' | 'minor' | 'patch';
    title: string;
    changes: string[];
}

interface TutorialModule {
    id: string;
    title: string;
    icon: string;
    description: string;
    color: string;
    steps: string[];
}

interface SuggestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, content: string) => Promise<void>;
}

// --- DATA ---

const roadmapData: RoadmapItem[] = [
    {
        id: 11,
        title: 'Segurança & Migração (V4)',
        description: 'Lançamento do sistema de Backup total (JSON) e migração assistida de dados entre inquilinos. Padronização inteligente de raças com detecção de espécie e suporte a campos híbridos.',
        status: 'Lançado',
        date: 'Q1 2026',
        progress: 100,
        icon: 'backup',
        tags: ['Segurança', 'Dados', 'Multi-tenant'],
        features: [
            { label: 'Backup & Restore JSON', done: true },
            { label: 'Migração de Tenant', done: true },
            { label: 'Raças Padronizadas', done: true },
            { label: 'Otimização de Banco de Dados', done: true }
        ]
    },
    {

        id: 1,
        title: 'Fundação CRM & Agendamento',
        description: 'Lançamento do núcleo do sistema. Gestão completa de clientes e pets com galeria de fotos, histórico médico e vacinas. Agenda inteligente com gestão de recursos (salas/mesas) e dashboard interativo.',
        status: 'Lançado',
        date: 'Q3 2025',
        progress: 100,
        icon: 'verified',
        features: [
            { label: 'Perfil do Pet & Galeria', done: true },
            { label: 'Agenda Multi-recurso', done: true },
            { label: 'Sincronização Supabase', done: true },
            { label: 'Gestão de Clientes', done: true }
        ]
    },
    {
        id: 2,
        title: 'Operações: PDV & Workflow',
        description: 'Controle operacional total. Checklists de execução de serviços (Banho/Tosa/Vet), monitoramento de status em tempo real e Frente de Caixa (PDV) integrado com estoque e descontos.',
        status: 'Lançado',
        date: 'Q4 2025',
        progress: 100,
        icon: 'storefront',
        features: [
            { label: 'PDV com Carrinho', done: true },
            { label: 'Busca & Filtro de Clientes', done: true },
            { label: 'Workflow de Execução', done: true },
            { label: 'Controle de Estoque', done: true },
            { label: 'Catálogo de Serviços', done: true }
        ]
    },
    {
        id: 3,
        title: 'FLOW PET AI (Gemini)',
        description: 'Integração nativa com Google Gemini. Copiloto global, análise preditiva de estoque, relatórios financeiros inteligentes, sugestão de respostas no chat e análise comportamental de pets.',
        status: 'Lançado',
        date: 'Q1 2026',
        progress: 100,
        icon: 'psychology',
        features: [
            { label: 'Copiloto Global', done: true },
            { label: 'Insights Financeiros IA', done: true },
            { label: 'Relatórios Veterinários IA', done: true },
            { label: 'Otimizador de Agenda', done: true }
        ]
    },
    {
        id: 9,
        title: 'Módulo de Assinaturas (Recorrência)',
        description: 'Motor de receita recorrente (MRR). Gestão de planos com renovação automática. Agora inclui visualização gráfica de consumo de pacotes (Barra de Uso) para controle de benefícios.',
        status: 'Lançado',
        date: 'Q1 2026',
        progress: 100,
        icon: 'loyalty',
        tags: ['MRR', 'UI/UX', 'Fidelidade'],
        features: [
            { label: 'Gestão de Planos', done: true },
            { label: 'Cobrança Recorrente', done: true },
            { label: 'Barra de Progresso (Uso)', done: true },
            { label: 'Configuração de Limites', done: true }
        ]
    },
    {
        id: 4,
        title: 'Suite Financeira & Admin',
        description: 'Módulo financeiro completo e ferramentas administrativas avançadas. Gestão de recursos físicos (salas/mesas), visualizador de banco de dados bruto e configurações fiscais.',
        status: 'Lançado',
        date: 'Q2 2026',
        progress: 100,
        icon: 'admin_panel_settings',
        features: [
            { label: 'Gestão de Despesas', done: true },
            { label: 'Gestão de Recursos', done: true },
            { label: 'Visualizador de DB', done: true },
            { label: 'Permissões (RBAC)', done: true }
        ]
    },
    {
        id: 5,
        title: 'Logística & Gestão de Entrega',
        description: 'Fluxo logístico completo. Sistema de entrega com conferência de valores, impressão de recibos profissionais e integração financeira imediata. Inclui também o rastreamento em tempo real (Táxi Pet).',
        status: 'Lançado',
        date: 'Q3 2025',
        progress: 100,
        icon: 'check_circle',
        tags: ['Entrega', 'Recibos', 'Financeiro'],
        features: [
            { label: 'Modal de Entrega de Pet', done: true },
            { label: 'Impressão de Recibos', done: true },
            { label: 'Integração Financeira', done: true },
            { label: 'Rastreamento Táxi Pet', done: true }
        ]
    },
    {
        id: 6,
        title: 'App do Cliente & Customização',
        description: 'Lançamento oficial do ecossistema de personalização. Agora os pet shops podem definir sua própria identidade visual (Cores, Logo, Nome) e escolher quais módulos estarão visíveis para os tutores.',
        status: 'Lançado',
        date: 'Dez 2025',
        progress: 100,
        icon: 'mobile_friendly',
        tags: ['Mobile', 'Branding', 'Customização'],
        features: [
            { label: 'Identidade Visual (Cores/Logo)', done: true },
            { label: 'Toggles de Funcionalidades', done: true },
            { label: 'Preview Real-time no CRM', done: true },
            { label: 'Agendamento In-App', done: true }
        ]
    },
    {
        id: 7,
        title: 'Hub Fiscal & Bancário',
        description: 'Automação fiscal completa. Emissão automática de NFS-e para serviços e NFC-e para produtos. Conciliação bancária automática via Open Finance e split de pagamentos para comissionados.',
        status: 'Planejado',
        date: 'Q1 2027',
        icon: 'receipt_long',
        tags: ['NFS-e', 'Open Finance', 'Split'],
        features: [
            { label: 'Emissor Fiscal', done: false },
            { label: 'Conciliação Bancária', done: false },
            { label: 'Split Automático', done: false }
        ]
    },
    {
        id: 10,
        title: 'Otimização de Performance',
        description: 'Melhorias contínuas de performance: lazy loading de componentes pesados, memoização de re-renders, paginação de consultas Supabase e cache inteligente de dados.',
        status: 'Lançado',
        date: 'Q4 2025',
        progress: 100,
        icon: 'speed',
        tags: ['Performance', 'UX', 'Infraestrutura'],
        features: [
            { label: 'Lazy Loading de Telas', done: true },
            { label: 'Suspense com Loading Animation', done: true },
            { label: 'Correção de Memory Leaks', done: true },
            { label: 'Otimização de Queries', done: true }
        ]
    },
    {

        id: 8,
        title: 'Expansão: Franquias & Telemedicina',
        description: 'Ferramentas para redes de franquias (multi-loja) e plataforma de telemedicina veterinária integrada com prescrição digital e prontuário na nuvem.',
        status: 'Futuro',
        date: '2027',
        icon: 'hub',
        tags: ['Multi-tenant', 'Saúde Digital'],
        features: []
    }
];

const changelogHistory: ChangelogEntry[] = [
    {
        version: 'v4.2.0',
        date: '15 Jan 2026',
        type: 'minor',
        title: 'Gestão Inteligente de Serviços & Produtos',
        changes: [
            'Novo controle de Duração por Porte: Defina tempos específicos (Min) para cada tamanho de pet.',
            'Cálculo automático de duração no agendamento baseado no porte do animal.',
            'Módulo de Consumo de Produtos: Adicione itens do estoque (shampoos, laços) diretamente na execução do serviço.',
            'Custo extra automático: O valor dos produtos usados é somado ao total do serviço no checkout.',
            'Melhoria visual na tela de Edição de Serviços com inputs mais claros.'
        ]
    },
    {
        version: 'v4.1.0',
        date: '23 Dez 2025',
        type: 'minor',
        title: 'Personalização do App do Cliente',
        changes: [
            'Lançamento da aba "App do Cliente" nas Configurações do CRM.',
            'Seletor de cor primária interativo com aplicação global no app do tutor.',
            'Upload de logotipo dedicado para a interface do cliente.',
            'Toggles de visibilidade: Controle quais módulos (Veterinária, Galeria, Rastreamento) o cliente vê.',
            'Mockup de pré-visualização em tempo real integrado ao painel de configurações.',
            'Sincronização automática de branding entre CRM e App do Cliente.'
        ]
    },
    {
        version: 'v4.0.0',
        date: '23 Dez 2025',
        type: 'major',
        title: 'Kernel de Dados & Migração Global',
        changes: [
            'Lançamento do Sistema de Backup & Restauração JSON (Painel Database).',
            'Nova padronização de raças: Dropdowns dinâmicos baseados na espécie.',
            'Suporte a "Outras Espécies" com entrada de texto livre para raças.',
            'Motor de Migração de Dados: Transferência de registros entre tenants (Raio Studio Pet).',
            'Melhoria no PDV: Adição de busca de clientes, scroll na listagem e opção rápida para Pessoa Física (Consumidor).',
            'Alinhamento de mensagens no chat: Mensagens recebidas agora aparecem no lado correto em salas de equipe.',
            'Correção de duplicidade na inicialização de estado em modais de cadastro.'
        ]
    },
    {

        version: 'v3.9.0',
        date: '22 Dez 2025',
        type: 'major',
        title: 'Checklists Dinâmicos & Correções Críticas',
        changes: [
            'Implementação de checklists dinâmicos configuráveis por serviço.',
            'Templates personalizados para Check-in e Check-out com campos customizáveis.',
            'Suporte a campos: texto, checkbox, dropdown, data, textarea e foto.',
            'Correção de erro de tela branca no avanço de etapas de serviço.',
            'Correção de agendamentos não visíveis na agenda detalhada (DayView).',
            'Correção do bucket de upload de fotos (service-photos).',
            'Melhoria na compatibilidade de tipos de campos entre TemplateBuilder e modais.',
            'Proteções defensivas em handleUpdateProgress para evitar crashes.',
            'Lazy loading já implementado para todas as telas do sistema.'
        ]
    },
    {

        version: 'v3.8.0',
        date: '22 Dez 2025',
        type: 'major',
        title: 'Dashboard Cockpit & Execução Inteligente',
        changes: [
            'Novo Dashboard "Cockpit" full-width sem rolagem vertical.',
            'Refatoração da Execução: 3 estágios unificados (Check-in, Execução, Checkout).',
            'Cronômetro Live na tela de serviços para monitoramento operacional em tempo real.',
            'Mini-Agenda Mensal integrada com navegação automática para a Agenda Diária.',
            'Marcação de Feriados Nacionais em todos os calendários com etiquetas visuais.',
            'Refatoração do Hub Financeiro: Gráficos de receita movidos para a tela Finance.',
            'Sincronização de cores entre KPIs e valores para melhor legibilidade.',
            'Efeito Neon "Pulse" para o dia atual no Dashboard.',
            'Ajuste global de contraste para o Modo Claro na Mini-Agenda.',
            'Expansão de portes de animais (Mini, Pequeno, Médio, Grande, Gigante).'
        ]
    },
    {
        version: 'v3.7.0',
        date: '22 Dez 2025',
        type: 'major',
        title: 'Gestão de Entrega & Academy Update',
        changes: [
            'Lançamento do modal "Entregar Pet" com gestão de valores e pagamentos.',
            'Integração automática com o Fluxo de Caixa ao finalizar entregas.',
            'Sistema de Impressão de Recibos profissionais direto da Execução.',
            'Melhoria visual nos botões de ação para status "Pronto".',
            'Sincronização imediata de status de agendamento pós-entrega.',
            'Atualização da FLOW PET Academy com tutoriais de IA e Checklist.',
            'Correção de bug no fechamento automático de checklists.'
        ]
    },
    {
        version: 'v3.6.0',
        date: '21 Dez 2025',
        type: 'major',
        title: 'Rebranding PRO & Segurança de Acesso',
        changes: [
            'Rebranding oficial para FLOW PET PRO com identidade visual premium.',
            'Novo sistema de Código de Convite para restringir novos registros de usuários.',
            'Lançamento da aba de Segurança nas configurações para gestão de credenciais.',
            'Upload de foto de perfil e personalização de avatar do usuário.',
            'Sincronização automática entre pagamentos de assinaturas e fluxo de caixa.',
            'Implementação de sistema de notificações globais em tempo real.',
            'Ajuste visual global: Botões e ícones seguem agora o padrão de cores do sistema.'
        ]
    },
    {
        version: 'v3.5.0',
        date: '20 Dez 2025',
        type: 'major',
        title: 'Kernel Sincronizado & Agendamento Global',
        changes: [
            'Migração total para Supabase (Banco de Dados em Tempo Real).',
            'Unificação do Modal de Agendamento (acessível do Dashboard e Agenda).',
            'Refinamento do Workflow de Logística (Status: Ready -> Delivery -> Finished).',
            'Lançamento do painel "Data Core" para visualização de registros brutos.',
            'Melhoria na precisão do Drag-and-Drop no calendário.'
        ]
    },
    {
        version: 'v3.4.1',
        date: '25 Out 2025',
        type: 'patch',
        title: 'Melhorias de UI em Assinaturas',
        changes: [
            'Nova barra de progresso visual para controle de consumo de pacotes.',
            'Ajuste no cálculo automático de porte baseado no peso do pet.',
            'Correção de bug menor na edição de serviços.',
            'Atualização de ícones no menu lateral.'
        ]
    },
    {
        version: 'v3.4.0',
        date: '24 Out 2025',
        type: 'major',
        title: 'Módulo de Clube de Assinaturas',
        changes: [
            'Lançamento do sistema completo de Recorrência (MRR).',
            'Criação de planos personalizados (Semanal, Quinzenal, Mensal).',
            'Integração de status de pagamento (Ativo, Pausado, Inadimplente).',
            'Sugestões de planos via IA baseados no histórico do cliente.'
        ]
    },
    {
        version: 'v3.3.0',
        date: '15 Out 2025',
        type: 'minor',
        title: 'Controle de Qualidade',
        changes: [
            'Implementação de checklists obrigatórios por serviço.',
            'Upload de foto de evidência (Antes/Depois) na execução.',
            'Configuração de etapas de workflow personalizáveis.'
        ]
    },
    {
        version: 'v3.2.0',
        date: '01 Out 2025',
        type: 'major',
        title: 'Módulo Delivery (Táxi Pet)',
        changes: [
            'Rastreamento em tempo real com mapa interativo.',
            'Status de entrega (Coletado, Em Rota, Entregue).',
            'Comunicação direta com motorista via chat interno.',
            'Cálculo automático de distância e ETA.'
        ]
    },
    {
        version: 'v3.0.0',
        date: '10 Set 2025',
        type: 'major',
        title: 'FLOW PET AI Core',
        changes: [
            'Integração profunda com Google Gemini.',
            'Copiloto global para dúvidas e insights.',
            'Análise de sentimentos em mensagens de clientes.',
            'Previsão de estoque inteligente.'
        ]
    },
    {
        version: 'v2.5.0',
        date: '15 Ago 2025',
        type: 'minor',
        title: 'Suite Financeira Avançada',
        changes: [
            'Dashboard financeiro com fluxo de caixa.',
            'Contas a pagar e receber.',
            'Emissão de faturas personalizadas.',
            'Relatórios de lucratividade por serviço.'
        ]
    },
    {
        version: 'v2.0.0',
        date: '01 Jul 2025',
        type: 'major',
        title: 'Operações & PDV',
        changes: [
            'Frente de Caixa (PDV) completo.',
            'Controle de estoque integrado.',
            'Gestão de equipe e comissões.',
            'Tela de execução de serviços (Kanban).'
        ]
    },
    {
        version: 'v1.0.0',
        date: '01 Jan 2025',
        type: 'major',
        title: 'Lançamento Inicial',
        changes: [
            'Cadastro de clientes e pets.',
            'Agenda básica.',
            'Login e autenticação.',
            'Configurações iniciais da loja.'
        ]
    }
];

const tutorialModules: TutorialModule[] = [
    {
        id: 'dashboard',
        title: 'Dashboard & KPIs',
        icon: 'dashboard',
        color: 'bg-indigo-500',
        description: 'Visão geral estratégica do negócio em tempo real.',
        steps: [
            'Acompanhe faturamento diário, semanal e mensal.',
            'Visualize os próximos agendamentos do dia.',
            'Acesse ações rápidas como "Novo Cliente" ou "Nova Venda".',
            'Gere relatórios inteligentes com um clique usando IA.'
        ]
    },
    {
        id: 'agenda',
        title: 'Agenda & Recepção',
        icon: 'calendar_month',
        color: 'bg-primary',
        description: 'O coração da sua operação. Agende, confirme e gerencie a fila de espera.',
        steps: [
            'Clique na grade para criar um novo agendamento.',
            'Arraste e solte para mudar horários rapidamente.',
            'Filtre por profissional ou tipo de serviço.',
            'Envie lembretes automáticos via WhatsApp.'
        ]
    },
    {
        id: 'pos',
        title: 'Frente de Caixa (PDV)',
        icon: 'point_of_sale',
        color: 'bg-teal-600',
        description: 'Vendas rápidas de produtos e fechamento de serviços em poucos cliques.',
        steps: [
            'Adicione produtos pelo leitor de código de barras ou busca.',
            'Selecione o cliente para pontuar no fidelidade.',
            'Aplique descontos e escolha a forma de pagamento.',
            'Emita a nota fiscal automaticamente ao finalizar.'
        ]
    },
    {
        id: 'execution',
        title: 'Workflow de Serviços',
        icon: 'playlist_play',
        color: 'bg-green-500',
        description: 'Controle etapa por etapa do Banho, Tosa e Atendimentos Clínicos.',
        steps: [
            'Acompanhe o status: Aguardando -> Em Andamento -> Pronto.',
            'Checklists obrigatórios garantem a qualidade.',
            'Anexe fotos do "Antes e Depois" no prontuário.',
            'Notifique o tutor automaticamente quando estiver pronto.'
        ]
    },
    {
        id: 'clients',
        title: 'CRM de Clientes',
        icon: 'groups',
        color: 'bg-blue-500',
        description: 'Visão 360° dos seus clientes e seus pets.',
        steps: [
            'Histórico completo de vacinas e consultas.',
            'Perfil comportamental e preferências do pet.',
            'Análise de LTV (Valor Vitalício) e frequência.',
            'Alertas de vacinas vencendo para reagendamento.'
        ]
    },
    {
        id: 'finance',
        title: 'Gestão Financeira',
        icon: 'attach_money',
        color: 'bg-emerald-600',
        description: 'Controle de fluxo de caixa, contas a pagar e receber.',
        steps: [
            'Conciliação automática de pagamentos.',
            'Gestão de comissões de funcionários.',
            'DRE gerencial e previsibilidade de caixa.',
            'Use a IA para analisar riscos de inadimplência.'
        ]
    },
    {
        id: 'inventory',
        title: 'Controle de Estoque',
        icon: 'inventory_2',
        color: 'bg-orange-500',
        description: 'Evite rupturas e perdas com gestão inteligente de produtos.',
        steps: [
            'Controle de lote e validade de perecíveis.',
            'Sugestão de compras baseada no giro.',
            'Inventário rápido e ajuste de quebras.',
            'Alerta automático de estoque mínimo.'
        ]
    },
    {
        id: 'subscriptions',
        title: 'Planos & Assinaturas',
        icon: 'loyalty',
        color: 'bg-purple-600',
        description: 'Receita recorrente com clubes de benefícios e pacotes.',
        steps: [
            'Crie planos mensais (ex: 4 banhos + 1 tosa).',
            'Cobrança recorrente no cartão ou Pix.',
            'Controle visual de consumo de saldo.',
            'Reduza o churn com benefícios exclusivos.'
        ]
    },
    {
        id: 'delivery',
        title: 'Táxi Pet & Delivery',
        icon: 'local_shipping',
        color: 'bg-indigo-600',
        description: 'Logística integrada para buscar e levar os pets.',
        steps: [
            'Rastreamento em tempo real do motorista.',
            'Otimização de rotas de coleta e entrega.',
            'Comunicação direta motorista-cliente.',
            'Comprovante digital de entrega.'
        ]
    },
    {
        id: 'communication',
        title: 'Marketing & Chat',
        icon: 'campaign',
        color: 'bg-rose-600',
        description: 'Centralize o atendimento e crie campanhas que convertem.',
        steps: [
            'Chat unificado (WhatsApp, Instagram, Site).',
            'Disparo de campanhas segmentadas.',
            'IA sugere respostas rápidas e profissionais.',
            'Automação de mensagens de aniversário.'
        ]
    },
    {
        id: 'services',
        title: 'Catálogo de Serviços',
        icon: 'medical_services',
        color: 'bg-pink-600',
        description: 'Configure preços, tempos e comissões dos seus serviços.',
        steps: [
            'Precificação diferenciada por porte e pelo.',
            'Definição de tempo padrão para agenda.',
            'Configuração de insumos consumidos.',
            'Checklists personalizados por serviço.'
        ]
    },
    {
        id: 'team',
        title: 'Gestão de Equipe',
        icon: 'badge',
        color: 'bg-cyan-600',
        description: 'Gerencie escalas, produtividade e acessos do time.',
        steps: [
            'Controle de permissões de acesso por cargo.',
            'Relatório de produtividade individual.',
            'Cálculo automático de comissões.',
            'Gestão de horários e folgas.'
        ]
    },
    {
        id: 'reports',
        title: 'Relatórios & BI',
        icon: 'bar_chart',
        color: 'bg-slate-700',
        description: 'Dados estratégicos para tomada de decisão.',
        steps: [
            'Dashboards personalizáveis com filtros de data.',
            'Análise de tendências de vendas e ticket médio.',
            'Relatórios fiscais consolidando serviços e produtos.',
            'Insights de IA (Gemini) sobre oportunidades de crescimento.'
        ]
    },
    {
        id: 'security',
        title: 'Segurança & Admin',
        icon: 'admin_panel_settings',
        color: 'bg-red-600',
        description: 'Controle total sobre quem acessa e como os dados são protegidos.',
        steps: [
            'Configure o Código de Convite para novos membros da equipe.',
            'Gerencie recursos físicos como salas e mesas de banho.',
            'Monitore o banco de dados bruto via Data Core.',
            'Defina permissões granulares por cargo (RBAC).'
        ]
    },
    {
        id: 'settings',
        title: 'Configurações',
        icon: 'settings',
        color: 'bg-slate-600',
        description: 'Personalize o sistema para a sua identidade visual e regras.',
        steps: [
            'Defina cores e tema (Claro/Escuro).',
            'Configure taxas financeiras e de cartão.',
            'Gerencie usuários e permissões.',
            'Personalize os portes de animais.'
        ]
    },
    {
        id: 'database',
        title: 'Banco de Dados',
        icon: 'database',
        color: 'bg-red-600',
        description: 'Acesso administrativo bruto aos registros do sistema.',
        steps: [
            'Visualize registros crus (JSON).',
            'Auditoria de alterações.',
            'Exportação em massa de dados.',
            'Backup de segurança.'
        ]
    },
    {
        id: 'ai_copilot',
        title: 'IA Copilot & Inteligência',
        icon: 'psychology',
        color: 'bg-gradient-to-r from-purple-600 to-blue-600',
        description: 'Potencialize sua produtividade com inteligência artificial generativa.',
        steps: [
            'Use o Copiloto Global para tirar dúvidas sobre o negócio.',
            'Solicite resumos de históricos médicos e comportamentais.',
            'Gere insights financeiros automáticos no Dashboard.',
            'Receba sugestões de mensagens personalizadas para clientes.'
        ]
    },
    {
        id: 'pet_delivery',
        title: 'Entregar Pet & Recibos',
        icon: 'check_circle',
        color: 'bg-emerald-600',
        description: 'Finalize atendimentos com profissionalismo e transparência.',
        steps: [
            'Confirme os valores finais e forma de pagamento no modal.',
            'Marque o pet como entregue para liberar espaço operacional.',
            'Imprima o recibo profissional para o cliente na hora.',
            'O sistema gera automaticamente o registro financeiro.'
        ]
    },
    {
        id: 'checklist_templates',
        title: 'Templates de Checklist',
        icon: 'rule',
        color: 'bg-amber-600',
        description: 'Padronize seus processos e garanta a excelência no atendimento.',
        steps: [
            'Crie modelos de checklist para cada tipo de serviço.',
            'Defina campos obrigatórios e validação por foto.',
            'Garanta que toda a equipe siga o mesmo padrão de qualidade.',
            'Acompanhe o preenchimento em tempo real na execução.'
        ]
    }
];

const TutorialDetailModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    module: TutorialModule | null;
}> = ({ isOpen, onClose, module }) => {
    if (!isOpen || !module) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-lg relative z-10 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 flex flex-col overflow-hidden">
                <div className={`${module.color} p-6 flex items-center gap-4 text-white`}>
                    <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                        <span className="material-symbols-outlined text-3xl">{module.icon}</span>
                    </div>
                    <div>
                        <h2 className="text-xl font-black uppercase italic tracking-tight leading-none">{module.title}</h2>
                        <p className="text-sm font-medium opacity-90 mt-1">Guia Rápido</p>
                    </div>
                    <button onClick={onClose} className="ml-auto text-white/80 hover:text-white bg-white/10 rounded-full p-1 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-6 text-lg leading-relaxed border-l-4 border-slate-200 dark:border-gray-700 pl-4 italic">
                        {module.description}
                    </p>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">checklist</span>
                        Como Usar
                    </h3>

                    <div className="space-y-4">
                        {module.steps.map((step, idx) => (
                            <div key={idx} className="flex gap-4 items-start bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-gray-800">
                                <div className="size-6 rounded-full bg-primary/10 dark:bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                    {idx + 1}
                                </div>
                                <p className="text-sm text-slate-700 dark:text-gray-300 font-medium leading-relaxed">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-[#222] flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        Entendi
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuggestionModal: React.FC<SuggestionModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        await onSubmit(title, content);
        setSubmitting(false);
        setTitle('');
        setContent('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10 border border-slate-100 dark:border-gray-800 animate-in zoom-in-95 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white leading-none">Nova Sugestão</h2>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Sua ideia pode moldar o CRM</p>
                        </div>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Título da Ideia</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm dark:text-white"
                                placeholder="Do que se trata?"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Descrição Detalhada</label>
                            <textarea
                                required
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-black p-5 rounded-2xl font-bold border-none outline-none shadow-sm dark:text-white resize-none"
                                placeholder="Descreva como isso ajudaria no seu dia a dia..."
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full h-16 bg-primary text-white font-black uppercase italic tracking-[0.2em] rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? 'Enviando...' : 'Enviar para o Time'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const Roadmap: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Todos');
    const [search, setSearch] = useState('');
    const [selectedTutorial, setSelectedTutorial] = useState<TutorialModule | null>(null);
    const [isSuggestionModalOpen, setIsSuggestionModalOpen] = useState(false);
    const { showNotification } = useNotification();

    const handleSubmitSuggestion = async (title: string, content: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase.from('user_suggestions').insert([{
            user_id: user.id,
            user_name: user.user_metadata?.full_name || user.email,
            title,
            content
        }]);

        if (error) {
            showNotification('Erro ao enviar sugestão.', 'error');
        } else {
            showNotification('Sugestão enviada com sucesso! Obrigado por colaborar.', 'success');
        }
    };

    const filteredItems = roadmapData.filter(item => {
        const matchesTab = activeTab === 'Todos' || item.status === activeTab;
        const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
            item.description.toLowerCase().includes(search.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const isSpecialTab = activeTab === 'Changelog' || activeTab === 'Tutorial';

    return (
        <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#1a1a1a] overflow-hidden animate-in fade-in duration-500">

            <TutorialDetailModal
                isOpen={!!selectedTutorial}
                onClose={() => setSelectedTutorial(null)}
                module={selectedTutorial}
            />

            <SuggestionModal
                isOpen={isSuggestionModalOpen}
                onClose={() => setIsSuggestionModalOpen(false)}
                onSubmit={handleSubmitSuggestion}
            />

            {/* Header */}
            <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 px-8 py-4 bg-white dark:bg-[#1a1a1a] z-20 shrink-0">
                <div className="flex items-center gap-10">
                    <h2 className="text-text-muted text-sm font-bold uppercase tracking-widest hidden md:block">Evolução do Produto</h2>
                </div>
                <div className="flex items-center gap-6">
                    <div className="relative hidden lg:block w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted material-symbols-outlined text-[20px]">search</span>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background-subtle dark:bg-[#111] dark:text-white border-none rounded-full py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary placeholder:text-text-muted outline-none"
                            placeholder="Buscar atualizações..."
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="size-10 flex items-center justify-center rounded-full hover:bg-background-subtle dark:hover:bg-[#111] transition-colors">
                            <span className="material-symbols-outlined text-black dark:text-white">notifications</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex overflow-hidden">
                <section className="flex-1 flex flex-col bg-white dark:bg-[#1a1a1a] overflow-y-auto nike-scroll relative">
                    <div className="px-10 pt-10 pb-2 flex flex-col md:flex-row justify-between items-start md:items-end">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-[0.9] italic mb-2 text-black dark:text-white">
                                {activeTab === 'Tutorial' ? 'BBG CRM' : 'Roadmap de'} <br />
                                <span className="text-primary">{activeTab === 'Changelog' ? 'Histórico' : activeTab === 'Tutorial' ? 'Academy' : 'Atualizações'}</span>
                            </h1>
                            <p className="text-text-muted font-medium mt-4 max-w-xl">
                                {activeTab === 'Changelog'
                                    ? 'Veja todas as alterações, correções e melhorias aplicadas em cada versão.'
                                    : activeTab === 'Tutorial'
                                        ? 'Aprenda a extrair o máximo do seu sistema com nossos guias rápidos.'
                                        : 'Acompanhe a evolução do nosso CRM. Transparência total sobre o que estamos construindo.'
                                }
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-text-muted uppercase tracking-widest mb-1">Versão Atual</span>
                                <span className="text-2xl font-black italic text-primary">v4.2.0</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="px-10 mt-8 mb-8 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex gap-6 overflow-x-auto no-scrollbar">
                            {['Todos', 'Lançado', 'Em Desenvolvimento', 'Planejado', 'Futuro', 'Changelog', 'Tutorial'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`pb-3 border-b-4 font-bold text-xs uppercase tracking-wide whitespace-nowrap transition-colors ${activeTab === tab
                                        ? 'border-primary text-black dark:text-white'
                                        : 'border-transparent text-slate-400 dark:text-gray-500 hover:text-slate-600 dark:hover:text-gray-300'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-10 pt-0">

                        {/* --- ROADMAP VIEW --- */}
                        {!isSpecialTab && (
                            <div className="relative animate-in fade-in duration-500">
                                <div className="absolute left-[29px] top-0 bottom-0 w-1 bg-gray-100 dark:bg-gray-800 rounded-full"></div>

                                {filteredItems.map((item, index) => (
                                    <div key={item.id} className={`relative flex gap-10 mb-16 group`} style={{ animationDelay: `${index * 100}ms` }}>
                                        <div className="flex flex-col items-center shrink-0 z-10">
                                            <div className={`size-[60px] rounded-full border-4 border-white dark:border-[#1a1a1a] shadow-xl flex items-center justify-center ${item.status === 'Em Desenvolvimento' ? 'bg-primary text-white shadow-primary/30' :
                                                item.status === 'Lançado' ? 'bg-green-500 text-white shadow-green-500/30' :
                                                    item.status === 'Planejado' ? 'bg-white dark:bg-[#1a1a1a] text-gray-400 dark:text-gray-600 border-gray-100 dark:border-gray-800 group-hover:border-primary group-hover:text-primary transition-colors' :
                                                        'bg-white dark:bg-[#1a1a1a] text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800'
                                                }`}>
                                                <span className={`material-symbols-outlined text-3xl ${item.status === 'Em Desenvolvimento' ? 'animate-pulse' : ''}`}>{item.icon}</span>
                                            </div>
                                        </div>
                                        <div className={`flex-1 bg-background-subtle dark:bg-[#111] rounded-2xl p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300 ${item.status !== 'Futuro' ? 'hover:border-primary/30 hover:shadow-lg' : 'opacity-70 hover:opacity-100 hover:shadow-sm'}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <span className={`text-xs font-black uppercase px-3 py-1.5 rounded-md tracking-wider mb-3 inline-block ${item.status === 'Em Desenvolvimento' ? 'bg-primary/10 text-primary' :
                                                        item.status === 'Lançado' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                                            item.status === 'Planejado' ? 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400' :
                                                                'bg-gray-50 dark:bg-white/5 text-gray-400'
                                                        }`}>
                                                        {item.status} • {item.date}
                                                    </span>
                                                    <h3 className={`text-2xl md:text-3xl font-black uppercase italic tracking-tight mb-1 ${item.status === 'Futuro' ? 'text-gray-800 dark:text-gray-200' : 'text-black dark:text-white'}`}>{item.title}</h3>
                                                    {item.status === 'Em Desenvolvimento' && <p className="text-text-muted font-medium">Previsão: {item.date}</p>}
                                                </div>
                                                {item.progress && (
                                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 text-xs font-black ${item.progress === 100
                                                        ? 'border-green-500/20 text-green-600'
                                                        : 'border-primary/20 text-primary'
                                                        }`}>
                                                        {item.progress}%
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                                {item.description}
                                            </p>

                                            {item.features.length > 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {item.features.map((feature, idx) => (
                                                        <div key={idx} className={`flex items-center gap-3 bg-white dark:bg-[#222] p-3 rounded-xl border border-gray-100 dark:border-gray-800 ${!feature.done ? 'opacity-60' : ''}`}>
                                                            <div className={`size-8 rounded-full flex items-center justify-center shrink-0 ${feature.done ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-white/10 text-gray-400'}`}>
                                                                <span className="material-symbols-outlined text-sm">{feature.done ? 'check' : 'hourglass_empty'}</span>
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{feature.label}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {item.tags && (
                                                <div className="flex flex-wrap gap-2 mt-6">
                                                    {item.tags.map(tag => (
                                                        <span key={tag} className="px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-500">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {filteredItems.length === 0 && (
                                    <div className="text-center py-20 text-slate-400">
                                        <span className="material-symbols-outlined text-4xl mb-2">search_off</span>
                                        <p className="text-sm font-medium">Nenhum item encontrado.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- CHANGELOG VIEW --- */}
                        {activeTab === 'Changelog' && (
                            <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
                                <div className="absolute left-[88px] top-4 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800"></div>

                                {changelogHistory.map((entry, idx) => (
                                    <div key={entry.version} className="relative flex gap-8 mb-12 group">
                                        {/* Date Column */}
                                        <div className="w-20 pt-1 text-right shrink-0">
                                            <span className="text-xs font-bold text-gray-400 block">{entry.date.split(' ')[0]} {entry.date.split(' ')[1]}</span>
                                            <span className="text-[10px] text-gray-300 dark:text-gray-600 font-bold">{entry.date.split(' ')[2]}</span>
                                        </div>

                                        {/* Timeline Marker */}
                                        <div className={`relative z-10 size-4 rounded-full border-2 mt-1.5 shrink-0 transition-all ${idx === 0 ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-white dark:bg-[#1a1a1a] border-gray-300 dark:border-gray-600 group-hover:border-primary group-hover:bg-primary'}`}></div>

                                        {/* Content */}
                                        <div className="flex-1 bg-background-subtle dark:bg-[#111] rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xl font-black text-black dark:text-white tracking-tight">{entry.version}</span>
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${entry.type === 'major' ? 'bg-purple-100 text-primary' :
                                                        entry.type === 'minor' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                                                        }`}>
                                                        {entry.type}
                                                    </span>
                                                </div>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-3">{entry.title}</h3>
                                            <ul className="space-y-2">
                                                {entry.changes.map((change, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="material-symbols-outlined text-[16px] text-green-500 mt-0.5">check</span>
                                                        {change}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* --- TUTORIAL VIEW --- */}
                        {activeTab === 'Tutorial' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {tutorialModules.map((module) => (
                                    <div key={module.id} className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden hover:shadow-xl transition-all group hover:-translate-y-1">
                                        <div className={`${module.color} p-6 flex justify-between items-start text-white`}>
                                            <span className="material-symbols-outlined text-4xl">{module.icon}</span>
                                            <span className="text-white/60 font-black text-6xl opacity-20 absolute top-2 right-4 pointer-events-none">{module.title.charAt(0)}</span>
                                        </div>
                                        <div className="p-6">
                                            <h3 className="text-xl font-black uppercase italic text-black dark:text-white mb-2">{module.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 min-h-[40px]">{module.description}</p>

                                            <div className="space-y-3">
                                                {module.steps.slice(0, 2).map((step, idx) => (
                                                    <div key={idx} className="flex gap-3 items-start">
                                                        <div className="size-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0 mt-0.5">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{step}</p>
                                                    </div>
                                                ))}
                                                {module.steps.length > 2 && (
                                                    <p className="text-xs text-slate-400 pl-8 italic">+{module.steps.length - 2} passos...</p>
                                                )}
                                            </div>

                                            <button
                                                onClick={() => setSelectedTutorial(module)}
                                                className="w-full mt-6 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold uppercase hover:bg-primary hover:text-white hover:border-primary transition-colors flex items-center justify-center gap-2 group-hover:border-primary group-hover:text-primary"
                                            >
                                                Ver Detalhes <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    <div className="mt-auto p-10 bg-black dark:bg-[#111] border-t border-gray-800 text-white flex flex-col md:flex-row gap-4 justify-between items-center rounded-t-[2.5rem] mx-4 shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
                        <div>
                            <h3 className="text-2xl font-black uppercase italic leading-none mb-2">Tem uma sugestão?</h3>
                            <p className="text-gray-400 font-medium">Sua ideia pode ser nossa próxima funcionalidade.</p>
                        </div>
                        <button
                            onClick={() => setIsSuggestionModalOpen(true)}
                            className="bg-white hover:bg-gray-100 text-black h-12 px-8 rounded-full font-black uppercase tracking-widest text-sm transition-all transform hover:scale-105 flex items-center gap-2"
                        >
                            Enviar Sugestão <span className="material-symbols-outlined text-lg">send</span>
                        </button>
                    </div>
                </section>

                {/* Sidebar Column */}
                {!isSpecialTab && (
                    <section className="w-[400px] shrink-0 bg-white dark:bg-[#1a1a1a] flex flex-col border-l border-gray-100 dark:border-gray-800 h-full shadow-2xl z-10 hidden xl:flex">
                        <div className="flex-1 overflow-y-auto nike-scroll p-8">
                            <div className="mb-8">
                                <h2 className="text-xs font-bold text-text-muted uppercase tracking-widest mb-6">Últimos Lançamentos</h2>

                                <div className="mb-6 group cursor-pointer" onClick={() => setActiveTab('Changelog')}>
                                    <div className="flex gap-3 mb-2">
                                        <div className="size-2 bg-blue-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">v4.1.0 • Branding</span>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight text-black dark:text-white group-hover:text-primary transition-colors">Customização do App</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                                        Agora você pode definir cores, logo e nome para o aplicativo do seu cliente, além de gerenciar a visibilidade de módulos.
                                    </p>
                                </div>

                                <div className="mb-6 group cursor-pointer border-t border-gray-50 dark:border-gray-800 pt-6" onClick={() => setActiveTab('Changelog')}>
                                    <div className="flex gap-3 mb-2">
                                        <div className="size-2 bg-green-500 rounded-full mt-1.5 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">v4.0.0 • Data Core</span>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight text-black dark:text-white group-hover:text-primary transition-colors">Backup & Migração</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                                        Lançamento do sistema de Backup JSON e migração de dados entre inquilinos para maior segurança.
                                    </p>
                                </div>

                                <div className="mb-6 group cursor-pointer border-t border-gray-50 dark:border-gray-800 pt-6" onClick={() => setActiveTab('Changelog')}>
                                    <div className="flex gap-3 mb-2">
                                        <div className="size-2 bg-gray-300 dark:bg-gray-600 rounded-full mt-1.5"></div>
                                        <span className="text-xs font-bold text-gray-400 uppercase">v3.3.0 • Outubro</span>
                                    </div>
                                    <h3 className="font-bold text-lg leading-tight text-black dark:text-white group-hover:text-primary transition-colors">Controle de Qualidade</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-3">
                                        Checklists personalizáveis por serviço com opção de upload obrigatório de foto.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-background-subtle dark:bg-[#111] rounded-xl p-6 border border-gray-100 dark:border-gray-800">
                                <h4 className="font-black uppercase italic text-sm mb-3 text-black dark:text-white">Changelog Completo</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Veja o histórico detalhado de todas as alterações feitas no sistema.</p>
                                <button
                                    onClick={() => setActiveTab('Changelog')}
                                    className="text-primary text-xs font-black uppercase hover:underline flex items-center gap-1"
                                >
                                    Acessar Changelog <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};