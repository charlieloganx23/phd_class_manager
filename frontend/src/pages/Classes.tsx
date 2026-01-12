import { useEffect, useState } from 'react';
import { classService } from '../services';
import Layout from '../components/Layout';
import Loading from '../components/Loading';

interface Aula {
  id: number;
  turma_id: number;
  turma_nome: string;
  professor_id: number;
  professor_nome: string;
  disciplina: string;
  data_aula: string;
  dia_semana: string;
  horario: string;
  status: string;
  semana: string;
}

export default function Classes() {
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const data = await classService.getAll();
      setAulas(data);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAulas = aulas.filter(aula => {
    if (filter === 'todas') return true;
    return aula.status === filter;
  });

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">📚 Aulas</h1>
          <button className="btn-primary">
            + Nova Aula
          </button>
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('todas')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'todas'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todas ({aulas.length})
          </button>
          <button
            onClick={() => setFilter('agendada')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'agendada'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Agendadas
          </button>
          <button
            onClick={() => setFilter('confirmada')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'confirmada'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Confirmadas
          </button>
          <button
            onClick={() => setFilter('cancelada')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'cancelada'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Canceladas
          </button>
        </div>

        {/* Classes Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Disciplina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Professor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAulas.map((aula, index) => (
                  <tr key={`aula-${aula.id}-${index}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{aula.disciplina}</div>
                      <div className="text-sm text-gray-500">{aula.dia_semana}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aula.turma_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aula.professor_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(aula.data_aula).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {aula.horario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        aula.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                        aula.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                        aula.status === 'cancelada' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {aula.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Cancelar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
