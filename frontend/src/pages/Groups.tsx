import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { turmasService } from '../services';
import { useToast } from '../contexts/ToastContext';

interface Turma {
  id: number;
  nome: string;
  turno: string;
  dias_semana: string;
  horario_inicio: string;
  horario_fim: string;
  sala: string | null;
  capacidade: number | null;
  ativa: boolean;
}

export default function Groups() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    nome: '',
    turno: 'manha',
    dias_semana: '',
    horario_inicio: '',
    horario_fim: '',
    sala: '',
    capacidade: '',
  });

  useEffect(() => {
    loadTurmas();
  }, []);

  const loadTurmas = async () => {
    try {
      setLoading(true);
      const data = await turmasService.getAll();
      setTurmas(data);
    } catch (error) {
      console.error('Erro ao carregar turmas:', error);
      showToast('Erro ao carregar turmas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (turma?: Turma) => {
    if (turma) {
      setEditingTurma(turma);
      setFormData({
        nome: turma.nome,
        turno: turma.turno,
        dias_semana: turma.dias_semana,
        horario_inicio: turma.horario_inicio,
        horario_fim: turma.horario_fim,
        sala: turma.sala || '',
        capacidade: turma.capacidade?.toString() || '',
      });
    } else {
      setEditingTurma(null);
      setFormData({
        nome: '',
        turno: 'manha',
        dias_semana: '',
        horario_inicio: '',
        horario_fim: '',
        sala: '',
        capacidade: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTurma(null);
    setFormData({
      nome: '',
      turno: 'manha',
      dias_semana: '',
      horario_inicio: '',
      horario_fim: '',
      sala: '',
      capacidade: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        capacidade: formData.capacidade ? parseInt(formData.capacidade) : null,
        sala: formData.sala || null,
      };

      if (editingTurma) {
        await turmasService.update(editingTurma.id, data);
        showToast('Turma atualizada com sucesso!', 'success');
      } else {
        await turmasService.create(data);
        showToast('Turma criada com sucesso!', 'success');
      }

      handleCloseModal();
      loadTurmas();
    } catch (error: any) {
      console.error('Erro ao salvar turma:', error);
      showToast(error.response?.data?.error || 'Erro ao salvar turma', 'error');
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir a turma "${nome}"?`)) {
      return;
    }

    try {
      await turmasService.delete(id);
      showToast('Turma excluída com sucesso!', 'success');
      loadTurmas();
    } catch (error: any) {
      console.error('Erro ao excluir turma:', error);
      showToast(error.response?.data?.error || 'Erro ao excluir turma', 'error');
    }
  };

  const getTurnoColor = (turno: string) => {
    const colors: Record<string, string> = {
      manha: 'bg-yellow-100 text-yellow-800',
      tarde: 'bg-orange-100 text-orange-800',
      noite: 'bg-indigo-100 text-indigo-800',
    };
    return colors[turno] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Turmas</h1>
            <p className="text-gray-600 mt-1">Gerencie as turmas do PHD</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Nova Turma</span>
          </button>
        </div>

        {/* Grid de Turmas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turmas.map((turma) => (
            <div key={turma.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{turma.nome}</h3>
                  {turma.turno && (
                    <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getTurnoColor(turma.turno)}`}>
                      {turma.turno.charAt(0).toUpperCase() + turma.turno.slice(1)}
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${turma.ativa ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {turma.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{turma.dias_semana}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{turma.horario_inicio} - {turma.horario_fim}</span>
                </div>
                {turma.sala && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Sala {turma.sala}</span>
                  </div>
                )}
                {turma.capacidade && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>Capacidade: {turma.capacidade} alunos</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleOpenModal(turma)}
                  className="flex-1 bg-primary-50 text-primary-600 px-4 py-2 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(turma.id, turma.nome)}
                  className="flex-1 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>

        {turmas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-gray-600 mt-4">Nenhuma turma cadastrada</p>
            <button
              onClick={() => handleOpenModal()}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Cadastrar primeira turma
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTurma ? 'Editar Turma' : 'Nova Turma'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Turma *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Turma A - Tarde"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Turno *
                  </label>
                  <select
                    required
                    value={formData.turno}
                    onChange={(e) => setFormData({ ...formData, turno: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dias da Semana *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.dias_semana}
                    onChange={(e) => setFormData({ ...formData, dias_semana: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: Seg, Qua, Sex"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Início *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário Fim *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sala
                  </label>
                  <input
                    type="text"
                    value={formData.sala}
                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ex: 101"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacidade
                  </label>
                  <input
                    type="number"
                    value={formData.capacidade}
                    onChange={(e) => setFormData({ ...formData, capacidade: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Nº de alunos"
                    min="1"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingTurma ? 'Atualizar' : 'Criar'} Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
