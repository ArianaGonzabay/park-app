import { Outlet } from '@tanstack/react-router'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-slate-900">
              Dashboard de Operaciones de Estacionamiento
            </h1>
            <p className="text-slate-500 mt-2 font-body">
              Análisis de datos de transacciones de parking
            </p>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
