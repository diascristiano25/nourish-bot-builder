import { Users, Target, Award, Heart } from 'lucide-react';

export default function Sobre() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Sobre o NutriFlow
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Transformando a gestão nutricional com tecnologia inovadora e foco no cuidado humanizado
          </p>
        </div>

        {/* Mission & Vision Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-7 h-7 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nossa Missão</h2>
            <p className="text-slate-600 leading-relaxed">
              Capacitar nutricionistas e profissionais de saúde com ferramentas inteligentes que
              otimizam o atendimento, permitindo que dediquem mais tempo ao que realmente importa:
              o cuidado com seus pacientes.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
            <div className="w-14 h-14 bg-sky-100 rounded-xl flex items-center justify-center mb-6">
              <Award className="w-7 h-7 text-sky-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Nossa Visão</h2>
            <p className="text-slate-600 leading-relaxed">
              Ser a plataforma de referência em gestão nutricional na América Latina,
              reconhecida pela inovação tecnológica e pelo impacto positivo na qualidade
              de vida de milhares de pessoas.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Nossos Valores
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: Heart,
                title: 'Cuidado',
                description: 'Colocamos o bem-estar dos pacientes no centro de tudo'
              },
              {
                icon: Users,
                title: 'Colaboração',
                description: 'Trabalhamos juntos para alcançar melhores resultados'
              },
              {
                icon: Target,
                title: 'Excelência',
                description: 'Buscamos constantemente a melhoria em cada detalhe'
              },
              {
                icon: Award,
                title: 'Inovação',
                description: 'Abraçamos a tecnologia para transformar o cuidado nutricional'
              }
            ].map((value, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 text-center shadow-sm border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{value.title}</h3>
                <p className="text-sm text-slate-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Nossa História
          </h2>
          <div className="max-w-3xl mx-auto space-y-6 text-slate-600 leading-relaxed">
            <p>
              O NutriFlow nasceu da experiência real de nutricionistas que enfrentavam
              diariamente os desafios de gerenciar consultas, acompanhar pacientes e
              manter registros organizados enquanto tentavam oferecer um atendimento
              personalizado e de qualidade.
            </p>
            <p>
              Percebemos que muitos profissionais perdiam horas valiosas com tarefas
              administrativas que poderiam ser automatizadas, enquanto seus pacientes
              precisavam de mais atenção e acompanhamento contínuo.
            </p>
            <p>
              Foi assim que criamos uma plataforma que combina tecnologia de ponta com
              uma interface intuitiva, permitindo que nutricionistas foquem no que fazem
              de melhor: cuidar de pessoas e transformar vidas através da nutrição.
            </p>
            <p className="text-emerald-600 font-medium">
              Hoje, orgulhosamente servimos centenas de profissionais e milhares de
              pacientes em todo o Brasil, construindo juntos um futuro mais saudável.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-4 gap-6 mt-16">
          {[
            { value: '500+', label: 'Nutricionistas' },
            { value: '10k+', label: 'Pacientes Ativos' },
            { value: '50k+', label: 'Consultas Realizadas' },
            { value: '98%', label: 'Satisfação' }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{stat.value}</div>
              <div className="text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
