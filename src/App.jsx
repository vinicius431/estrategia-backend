function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white font-sans">
      <div className="bg-white text-gray-800 p-10 rounded-2xl shadow-lg w-full max-w-md border border-blue-600">
        <h1 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Estrateg<span className="text-blue-500">IA</span>
        </h1>
        <p className="text-sm text-center text-gray-600 mb-6">
          Faça login na sua conta para continuar
        </p>
        <form className="space-y-5">
          <div>
            <label className="block mb-1 text-gray-700">E-mail</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 text-gray-700">Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200 font-medium"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
