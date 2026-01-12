import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { substituicoesService, professoresService, aulasService } from '../services';
import { useToast } from '../contexts/ToastContext';

interface Substituicao {
  id: number;
  aula_id: number;
  professor_original_id: number;
  professor_substituto_id: number;
  motivo: string | null;
  observacoes: string | null;
  status: string;
  data_solicitacao: string;
  aula_disciplina: string | null;
  aula_data: string | null;
  aula_horario: string | null;
  professor_original_nome: string | null;
  professor_substituto_nome: string | null;
}

export default function Substitutions() {
  const [substituicoes, setSubstituicoes] = useState<Substituicao[]>([]);
  const [professores, setProfessores] = useState<any[]>([]);
  const [aulas, setAulas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    aula_id: '',
    professor_substituto_id: '',
    motivo: '',
    observacoes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, profsData, aulasData] = await Promise.all([
        substituicoesService.getAll(),
        professoresService.getAll(),
        aulasService.getAll()
      ]);
      setSubstituicoes(subsData);
      setProfessores(profsData);
      setAulas(aulasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      aula_id: '',
      professor_substituto_id: '',
      motivo: '',
      observacoes: '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        aula_id: parseInt(formData.aula_id),
        professor_substituto_id: parseInt(formData.professor_substituto_id),
      };

      await substituicoesService.create(data);
      showToast('Substituição criada com sucesso!', 'success');
      setShowModal(false);
      loadData();
    } catch (error: any) {
      console.error('Erro ao criar substituição:', error);
      showToast(error.response?.data?.error || 'Erro ao criar substituição', 'error');
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await substituicoesService.updateStatus(id, status);
      showToast(`Substituição ${status} com sucesso!`, 'success');
      loadData();
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error);
      showToast(error.response?.data?.error || 'Erro ao atualizar status', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta substituição?')) {
      return;
    }

    try {
      await substituicoesService.delete(id);
      showToast('Substituição excluída com sucesso!', 'success');
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir substituição:', error);
      showToast(error.response?.data?.error || 'Erro ao excluir substituição', 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pendente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredSubstituicoes = filterStatus
    ? substituicoes.filter((s) => s.status === filterStatus)
    : substituicoes;

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Substituições</h1>
            <p className="text-gray-600 mt-1">Gerencie substituições de professores</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos os Status</option>
              <option value="pendente">Pendente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <button
              onClick={handleOpenModal}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nova Substituição</span>
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {filteredSubstituicoes.map((sub) => (
            <div key={sub.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {sub.aula_disciplina}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <p><strong>Data:</strong> {new Date(sub.aula_data || '').toLocaleDateString('pt-BR')}</p>
                      <p><strong>Horário:</strong> {sub.aula_horario}</p>
                    </div>
                    <div>
                      <p><strong>Professor Original:</strong> {sub.professor_original_nome}</p>
                      <p><strong>Professor Substituto:</strong> {sub.professor_substituto_nome}</p>
                    </div>
                    {sub.motivo && (
                      <div className="md:col-span-2">
                        <p><strong>Motivo:</strong> {sub.motivo}</p>
                      </div>
                    )}
                    {sub.observacoes && (
                      <div className="md:col-span-2">
                        <p><strong>Observações:</strong> {sub.observacoes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col gap-2">
                  {sub.status === 'pendente' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(sub.id, 'confirmada')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(sub.id, 'cancelada')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(sub.id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSubstituicoes.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">Nenhuma substituição encontrada</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Nova Substituição</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Aula *</label>
                <select
                  required
                  value={formData.aula_id}
                  onChange={(e) => setFormData({ ...formData, aula_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione...</option>
                  {aulas.map((aula) => (
                    <option key={aula.id} value={aula.id}>
                      {aula.disciplina} - {new Date(aula.data).toLocaleDateString('pt-BR')} - {aula.horario}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor Substituto *</label>
                <select
                  required
                  value={formData.professor_substituto_id}
                  onChange={(e) => setFormData({ ...formData, professor_substituto_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Selecione...</option>
                  {professores.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Atestado médico"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Informações adicionais"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Criar Substituição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
