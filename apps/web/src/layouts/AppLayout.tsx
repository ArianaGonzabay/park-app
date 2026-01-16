import { Outlet } from '@tanstack/react-router'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white">
              Dashboard de Operaciones de Estacionamiento
            </h1>
            <div className="flex justify-center mt-3">
              <div className="w-24 h-1 bg-white/40 rounded-full"></div>
            </div>
            <p className="text-blue-100 mt-3 text-sm">
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
