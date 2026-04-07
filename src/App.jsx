import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

const MainApp = () => {
  const { currentUser } = useAppContext();
  
  return (
    <div className="app-container">
      {!currentUser ? <Login /> : <Dashboard />}
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}

export default App;
