import { Outlet } from '@tanstack/react-router'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[#020403]">
      <header className="bg-[#0a0f0d] shadow-lg border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-display font-bold text-white">
              Dashboard de Operaciones de Estacionamiento
            </h1>
            <p className="text-gray-400 mt-2 font-body">
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
