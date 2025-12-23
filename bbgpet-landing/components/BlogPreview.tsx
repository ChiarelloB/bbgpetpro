import React, { useState, useEffect } from 'react';
import SpotlightCard from './SpotlightCard';

const posts = [
  {
    category: 'Gestão',
    title: '5 Dicas para aumentar o ticket médio do Banho e Tosa',
    excerpt: 'Descubra como pequenos adicionais no serviço podem transformar o faturamento final do mês.',
    image: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&q=80&w=800', // Dog washing
    readTime: '5 min',
    content: `
      <p class="mb-4">O serviço de Banho e Tosa é a porta de entrada para muitos clientes, mas também pode ser a maior fonte de lucro se bem trabalhado. A chave não está apenas em aumentar o preço do banho, mas em oferecer valor agregado.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">1. Menu de Adicionais</h4>
      <p class="mb-4">Crie um "cardápio" de serviços extras que podem ser adicionados ao banho básico: hidratação de pelos, corte de unhas premium, escovação de dentes, etc. Treine sua equipe para oferecer esses itens no momento do check-in.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">2. Combos de Serviços</h4>
      <p class="mb-4">Ofereça pacotes como "Dia de Spa", que inclui banho, tosa higiênica e hidratação por um preço único, parecendo mais vantajoso que comprar separadamente.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">3. Assinaturas Recorrentes</h4>
      <p class="mb-4">Garanta o faturamento do mês oferecendo planos de assinatura (ex: 4 banhos por mês). Isso fideliza o cliente e melhora sua previsão de caixa.</p>
      
      <p class="mt-4 font-bold">Com o Flow Pet CRM, você consegue configurar esses pacotes e controlar as assinaturas automaticamente, sem planilhas confusas.</p>
    `
  },
  {
    category: 'Finanças', // Updated category to match previous context but ensuring image works
    title: 'Controle Financeiro: Pare de Perder Dinheiro no seu Pet Shop',
    excerpt: 'Misturar contas pessoais com as da empresa é o erro número 1. Veja como organizar.',
    image: 'https://images.unsplash.com/photo-1565514020179-0c2235bb99c0?auto=format&fit=crop&q=80&w=800', // Calculator/Money
    readTime: '8 min',
    content: `
      <p class="mb-4">Muitos donos de Pet Shop trabalham muito e não veem a cor do dinheiro no final do mês. O problema muitas vezes não é falta de vendas, mas falta de gestão.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">Separe as contas</h4>
      <p class="mb-4">O primeiro passo é ter uma conta bancária PJ. Nunca pague fornecedores com seu cartão pessoal e nunca pague contas de casa com o dinheiro do caixa.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">Registre tudo</h4>
      <p class="mb-4">Cada centavo que entra e sai deve ser registrado. Use categorias para entender seus custos: Produtos, Pessoal, Aluguel, Impostos.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">Fluxo de Caixa</h4>
      <p class="mb-4">Acompanhe seu fluxo de caixa diariamente. Saber quanto você tem a receber nas próximas semanas evita surpresas desagradáveis.</p>
      
      <p class="mt-4 font-bold">O módulo financeiro do Flow Pet gera DRE e Fluxo de Caixa em tempo real, mostrando exatamente para onde seu dinheiro está indo.</p>
    `
  },
  {
    category: 'Tendências',
    title: 'O futuro dos Pet Shops: Tecnologia e Humanização',
    excerpt: 'Entenda por que a tecnologia não vai substituir o atendimento humano, mas sim potencializá-lo.',
    image: 'https://images.unsplash.com/photo-1588943211346-0908a1fb0b01?auto=format&fit=crop&q=80&w=800', // Cat/Tech
    readTime: '7 min',
    content: `
      <p class="mb-4">O mercado pet está em constante evolução. Tutores hoje buscam experiências, não apenas serviços. A tecnologia entra como aliada para liberar você da burocracia.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">Agendamento Online</h4>
      <p class="mb-4">Permitir que o cliente agende pelo celular a qualquer hora reduz o tempo da sua recepção no telefone e aumenta a satisfação do cliente.</p>
      
      <h4 class="text-lg font-bold text-black dark:text-white mb-2">Histórico Digital</h4>
      <p class="mb-4">Ter o histórico completo de vacinas e atendimentos do pet na nuvem passa profissionalismo e segurança.</p>
      
      <p class="mt-4 font-bold">O Flow Pet une tudo isso: agendamento inteligente, prontuário digital e comunicação automática via WhatsApp.</p>
    `
  }
];

const BlogPreview: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPost(null);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="max-w-2xl">
            <span className="text-primary font-bold uppercase tracking-widest text-xs mb-2 block">Central de Conhecimento</span>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black dark:text-white">
              Aprenda com <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Especialistas</span>
            </h2>
          </div>
          <button onClick={() => setSelectedPost(0)} className="group flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gray-500 hover:text-black dark:hover:text-white transition-colors">
            Ver todos os artigos
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <SpotlightCard
              key={idx}
              className="group cursor-pointer flex flex-col h-full p-6"
              onClick={() => setSelectedPost(idx)}
              spotlightColor="rgba(124, 58, 237, 0.15)"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[4/3] mb-6 bg-gray-100 dark:bg-gray-800">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10"></div>
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full transform group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800'; // Fallback
                  }}
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="bg-white/90 dark:bg-black/80 backdrop-blur-sm text-black dark:text-white px-3 py-1 rounded-md text-xs font-black uppercase tracking-wide">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-medium uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {post.readTime}
                </div>
                <h3 className="text-xl font-bold text-black dark:text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                  Ler artigo completo
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>

      {/* Blog Modal */}
      {selectedPost !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedPost(null)}></div>

          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-3xl overflow-hidden shadow-2xl animate-[fadeInUp_0.3s_ease-out] flex flex-col max-h-[90vh]">
            <div className="relative h-48 md:h-64 shrink-0">
              <img
                src={posts[selectedPost].image}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 size-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-8 overflow-y-auto">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-black uppercase">
                  {posts[selectedPost].category}
                </span>
                <span className="text-gray-400 text-xs font-bold uppercase">{posts[selectedPost].readTime}</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-6 leading-tight">
                {posts[selectedPost].title}
              </h3>

              {/* Content injected safely or dangerously if trusted */}
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                <div dangerouslySetInnerHTML={{ __html: posts[selectedPost].content }} />
              </div>

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/10">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-4 text-center uppercase tracking-wide">Gostou deste conteúdo?</p>
                <button onClick={() => { setSelectedPost(null); document.getElementById('precos')?.scrollIntoView({ behavior: 'smooth' }); }} className="w-full bg-black dark:bg-white text-white dark:text-black font-black uppercase tracking-wide py-4 rounded-xl hover:opacity-90 transition-opacity">
                  Começar Teste Grátis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BlogPreview;