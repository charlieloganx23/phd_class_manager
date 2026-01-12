import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import { alunosService, turmasService } from '../services';
import { useToast } from '../contexts/ToastContext';

interface Aluno {
  id: number;
  user_id: number;
  turma_id: number;
  matricula: string;
  whatsapp: string | null;
  data_ingresso: string;
  status: string;
  user_name: string | null;
  user_email: string | null;
  turma_nome: string | null;
}

interface Turma {
  id: number;
  nome: string;
}

export default function Students() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [filterTurma, setFilterTurma] = useState<string>('');
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    turma_id: '',
    matricula: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [alunosData, turmasData] = await Promise.all([
        alunosService.getAll(),
        turmasService.getAll()
      ]);
      setAlunos(alunosData);
      setTurmas(turmasData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (aluno?: Aluno) => {
    if (aluno) {
      setEditingAluno(aluno);
      setFormData({
        name: aluno.user_name || '',
        email: aluno.user_email || '',
        phone: '',
        whatsapp: aluno.whatsapp || '',
        turma_id: aluno.turma_id.toString(),
        matricula: aluno.matricula,
      });
    } else {
      setEditingAluno(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        turma_id: '',
        matricula: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAluno(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data = {
        ...formData,
        turma_id: parseInt(formData.turma_id),
      };

      if (editingAluno) {
        await alunosService.update(editingAluno.id, data);
        showToast('Aluno atualizado com sucesso!', 'success');
      } else {
        await alunosService.create(data);
        showToast('Aluno criado com sucesso!', 'success');
      }

      handleCloseModal();
      loadData();
    } catch (error: any) {
      console.error('Erro ao salvar aluno:', error);
      showToast(error.response?.data?.error || 'Erro ao salvar aluno', 'error');
    }
  };

  const handleDelete = async (id: number, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o aluno "${nome}"?`)) {
      return;
    }

    try {
      await alunosService.delete(id);
      showToast('Aluno excluído com sucesso!', 'success');
      loadData();
    } catch (error: any) {
      console.error('Erro ao excluir aluno:', error);
      showToast(error.response?.data?.error || 'Erro ao excluir aluno', 'error');
    }
  };

  const filteredAlunos = filterTurma
    ? alunos.filter((a) => a.turma_id === parseInt(filterTurma))
    : alunos;

  if (loading) return <Loading />;

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestão de Alunos</h1>
            <p className="text-gray-600 mt-1">{alunos.length} alunos cadastrados</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filterTurma}
              onChange={(e) => setFilterTurma(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas as Turmas</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleOpenModal()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Novo Aluno</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aluno
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matrícula
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Turma
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  WhatsApp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlunos.map((aluno) => (
                <tr key={`aluno-${aluno.id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{aluno.user_name}</div>
                      <div className="text-sm text-gray-500">{aluno.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aluno.matricula}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800">
                      {aluno.turma_nome}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {aluno.whatsapp || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      aluno.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {aluno.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(aluno)}
                      className="text-primary-600 hover:text-primary-900 mr-3"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(aluno.id, aluno.user_name || 'aluno')}
                      className="text-red-600 hover:text-red-900"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredAlunos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Nenhum aluno encontrado</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turma *</label>
                  <select
                    required
                    value={formData.turma_id}
                    onChange={(e) => setFormData({ ...formData, turma_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Selecione...</option>
                    {turmas.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matrícula</label>
                  <input
                    type="text"
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Auto-gerada se vazio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingAluno ? 'Atualizar' : 'Criar'} Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
