import { useEffect, useState } from 'react';
import { teacherService } from '../services';
import Layout from '../components/Layout';
import Loading from '../components/Loading';

interface Professor {
  id: number;
  user_id: number;
  name: string;
  email: string;
  telefone: string;
  disciplinas: string[];
  cor: string;
  ativo: boolean;
}

export default function Teachers() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setProfessores(data);
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">👨‍🏫 Professores</h1>
          <button className="btn-primary">
            + Novo Professor
          </button>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {professores.map((professor) => (
            <div key={professor.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: professor.cor }}
                >
                  {professor.name.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3">
                  <h3 className="font-bold text-gray-900">{professor.name}</h3>
                  <p className="text-sm text-gray-500">{professor.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {professor.telefone || 'Não informado'}
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 mb-1">Disciplinas:</p>
                  <div className="flex flex-wrap gap-1">
                    {professor.disciplinas.map((disc, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {disc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
                <button className="text-sm text-primary-600 hover:text-primary-900 font-medium">
                  Editar
                </button>
                <button className="text-sm text-red-600 hover:text-red-900 font-medium">
                  {professor.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
