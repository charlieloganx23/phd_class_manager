import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { aulasService } from '../services';
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

export default function ProfessorArea() {
  const { user } = useAuth();
  const [aulas, setAulas] = useState<Aula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('1');

  useEffect(() => {
    if (user?.professor) {
      loadAulas();
    }
  }, [user, selectedWeek]);

  const loadAulas = async () => {
    try {
      const allAulas = await aulasService.getAll();
      // Filtrar apenas as aulas do professor logado
      const minhasAulas = allAulas.filter((aula: Aula) => 
        aula.professor_id === user?.professor?.id
      );
      setAulas(minhasAulas);
    } catch (error) {
      console.error('Erro ao carregar aulas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarcarPresenca = async (aulaId: number) => {
    try {
      await aulasService.updateStatus(aulaId, 'realizada');
      loadAulas();
      alert('Presença marcada com sucesso!');
    } catch (error) {
      console.error('Erro ao marcar presença:', error);
      alert('Erro ao marcar presença');
    }
  };

  const handleMarcarFalta = async (aulaId: number) => {
    try {
      await aulasService.updateStatus(aulaId, 'cancelada');
      loadAulas();
      alert('Falta registrada. Uma notificação será enviada aos alunos.');
    } catch (error) {
      console.error('Erro ao marcar falta:', error);
      alert('Erro ao marcar falta');
    }
  };

  if (isLoading) return <Loading />;

  const aulasHoje = aulas.filter(aula => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const dataAula = new Date(aula.data_aula).toLocaleDateString('pt-BR');
    return dataAula === hoje;
  });

  const aulasProximas = aulas
    .filter(aula => new Date(aula.data_aula) > new Date())
    .sort((a, b) => new Date(a.data_aula).getTime() - new Date(b.data_aula).getTime())
    .slice(0, 10);

  const aulasRealizadas = aulas.filter(aula => aula.status === 'realizada').length;
  const aulasCanceladas = aulas.filter(aula => aula.status === 'cancelada').length;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            👨‍🏫 Área do Professor
          </h1>
          <p className="mt-2 text-gray-600">
            Bem-vindo, Prof. {user?.name}!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Aulas</p>
                <p className="text-2xl font-bold text-gray-900">{aulas.length}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Realizadas</p>
                <p className="text-2xl font-bold text-gray-900">{aulasRealizadas}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold text-gray-900">{aulasCanceladas}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aulas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">{aulasHoje.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Aulas de Hoje */}
        {aulasHoje.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Aulas de Hoje</h2>
            <div className="space-y-3">
              {aulasHoje.map((aula) => (
                <div key={aula.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{aula.disciplina}</h3>
                    <p className="text-sm text-gray-600">
                      {aula.turma_nome} • {aula.horario}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {aula.status === 'agendada' && (
                      <>
                        <button
                          onClick={() => handleMarcarPresenca(aula.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                        >
                          ✓ Presente
                        </button>
                        <button
                          onClick={() => handleMarcarFalta(aula.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                        >
                          ✗ Faltei
                        </button>
                      </>
                    )}
                    {aula.status === 'realizada' && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                        ✓ Realizada
                      </span>
                    )}
                    {aula.status === 'cancelada' && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                        ✗ Cancelada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Próximas Aulas */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📆 Próximas Aulas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Disciplina
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Turma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {aulasProximas.map((aula) => (
                  <tr key={aula.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {aula.disciplina}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {aula.turma_nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(aula.data_aula).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {aula.dia_semana}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {aula.horario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        aula.status === 'agendada' ? 'bg-blue-100 text-blue-800' :
                        aula.status === 'confirmada' ? 'bg-green-100 text-green-800' :
                        aula.status === 'realizada' ? 'bg-purple-100 text-purple-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {aula.status}
                      </span>
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
