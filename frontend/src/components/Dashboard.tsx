import { Users, FileText, Clock, TrendingUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listarTodosLaudos, atualizarStatusLaudo, LaudoDashboard } from '../../api/laudoservices';
import { listarPacientes } from '../../api/pacienteservices';

type ReportStatus = 'pending' | 'in-progress' | 'completed' | 'reviewed';

const STATUS_LABELS: Record<ReportStatus, string> = {
  'pending': 'Pendente',
  'in-progress': 'Em Andamento',
  'completed': 'Concluído',
  'reviewed': 'Revisado',
};

const STATUS_OPTIONS: { value: ReportStatus; label: string; hoverBg: string; textColor: string; dotColor: string }[] = [
  { value: 'pending',     label: 'Pendente',     hoverBg: 'hover:bg-yellow-50',  textColor: 'text-yellow-600', dotColor: 'bg-yellow-400' },
  { value: 'in-progress', label: 'Em Andamento', hoverBg: 'hover:bg-blue-50',    textColor: 'text-blue-600',   dotColor: 'bg-blue-400'   },
  { value: 'completed',   label: 'Concluído',    hoverBg: 'hover:bg-green-50',   textColor: 'text-green-600',  dotColor: 'bg-green-400'  },
  { value: 'reviewed',    label: 'Revisado',     hoverBg: 'hover:bg-purple-50',  textColor: 'text-purple-600', dotColor: 'bg-purple-400' },
];

export function Dashboard() {
  const navigate = useNavigate();

  const [laudos, setLaudos] = useState<LaudoDashboard[]>([]);
  const [totalPacientes, setTotalPacientes] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [laudosData, pacientesData] = await Promise.all([
          listarTodosLaudos(),
          listarPacientes(),
        ]);
        setLaudos(laudosData);
        setTotalPacientes(pacientesData.length);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-700',
      'in-progress': 'bg-blue-100 text-blue-700',
      'completed': 'bg-green-100 text-green-700',
      'reviewed': 'bg-purple-100 text-purple-700',
    };
    return colors[status] ?? 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string): string => {
    return STATUS_LABELS[status as ReportStatus] ?? status;
  };

  const updateReportStatus = async (laudoId: number, newStatus: ReportStatus) => {
    try {
      await atualizarStatusLaudo(laudoId, newStatus);
      setLaudos(laudos.map(l => l.id === laudoId ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
    setOpenDropdownId(null);
  };

  const toggleDropdown = (laudoId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    if (openDropdownId === laudoId) {
      setOpenDropdownId(null);
      setDropdownPos(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const dropdownHeight = 196;
    const dropdownWidth = 210;
    const spaceBelow = window.innerHeight - rect.bottom;
    const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;
    const left = Math.min(rect.left, window.innerWidth - dropdownWidth - 8);
    setDropdownPos({
      top: openUp ? rect.top - dropdownHeight - 4 : rect.bottom + 4,
      left,
    });
    setOpenDropdownId(laudoId);
  };

  // Compute stats from real data
  const totalLaudos = laudos.length;
  const pendentes = laudos.filter(l => l.status === 'pending').length;
  const concluidos = laudos.filter(l => l.status === 'completed' || l.status === 'reviewed').length;
  const taxaConclusao = totalLaudos > 0 ? Math.round((concluidos / totalLaudos) * 100) : 0;

  const recentLaudos = laudos.slice(0, 10);

  const stats = [
    { label: 'Total de Pacientes', value: String(totalPacientes), icon: Users, color: 'bg-blue-500' },
    { label: 'Laudos Criados', value: String(totalLaudos), icon: FileText, color: 'bg-green-500' },
    { label: 'Pendentes', value: String(pendentes), icon: Clock, color: 'bg-yellow-500' },
    { label: 'Taxa de Conclusão', value: `${taxaConclusao}%`, icon: TrendingUp, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h2>
        <p className="text-gray-600">Visão geral da sua atividade médica</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-1">
                {loading ? '...' : stat.value}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Laudos Recentes</h3>
          <button
            onClick={() => navigate('/reports')}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Ver todos
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Paciente</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo de Exame</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Data</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Carregando...</td>
                </tr>
              ) : recentLaudos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Nenhum laudo encontrado.</td>
                </tr>
              ) : (
                recentLaudos.map((laudo) => (
                  <tr key={laudo.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-gray-800">{laudo.paciente_nome ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-600">{laudo.tipo_laudo_nome ?? '—'}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(laudo.criado_em).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => toggleDropdown(String(laudo.id), e)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(laudo.status)} cursor-pointer hover:opacity-80 transition-opacity select-none`}
                      >
                        {getStatusLabel(laudo.status)} ▾
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlay — fecha o dropdown ao clicar fora */}
      {openDropdownId && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => { setOpenDropdownId(null); setDropdownPos(null); }}
        />
      )}

      {/* Dropdown de status fixo no viewport */}
      {openDropdownId && dropdownPos && (() => {
        const currentStatus = laudos.find(l => String(l.id) === openDropdownId)?.status;
        return (
          <div
            className="fixed z-50 bg-white border border-gray-200 rounded-xl shadow-2xl py-2 w-52 overflow-hidden"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            <p className="px-4 pt-1 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-widest">
              Alterar status
            </p>
            <div className="border-t border-gray-100 mb-1" />
            {STATUS_OPTIONS.map(opt => {
              const isCurrent = currentStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    const laudo = laudos.find(l => String(l.id) === openDropdownId);
                    if (laudo) updateReportStatus(laudo.id, opt.value);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors ${
                    isCurrent ? opt.hoverBg + ' font-medium' : opt.hoverBg
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.dotColor}`} />
                  <span className={isCurrent ? opt.textColor : 'text-gray-700'}>{opt.label}</span>
                  {isCurrent && (
                    <span className={`ml-auto text-xs font-bold ${opt.textColor}`}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}