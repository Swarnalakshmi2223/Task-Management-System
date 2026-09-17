import { useState } from 'react';
import Navbar    from './components/Navbar';
import Dashboard from './pages/Dashboard';
import AddTask   from './pages/AddTask';
import EditTask  from './pages/EditTask';

function App() {
  // Simple page state — replaces React Router for now
  // page can be: 'dashboard' | 'add' | 'edit'
  const [page,          setPage]          = useState('dashboard');
  const [editingTaskId, setEditingTaskId] = useState(null);

  // Incrementing this key forces Dashboard to re-fetch tasks
  // whenever the user navigates back from Add or Edit
  const [refreshKey, setRefreshKey] = useState(0);

  // Navigate back to Dashboard and trigger a fresh task fetch
  const goToDashboard = () => {
    setPage('dashboard');
    setRefreshKey((prev) => prev + 1); // causes Dashboard useEffect to re-run
  };

  // Navigate to Edit page with a specific task ID
  const goToEdit = (id) => {
    setEditingTaskId(id);
    setPage('edit');
  };

  // Render the correct page based on state
  const renderPage = () => {
    if (page === 'add') {
      return <AddTask onBack={goToDashboard} />;
    }
    if (page === 'edit') {
      return <EditTask taskId={editingTaskId} onBack={goToDashboard} />;
    }
    // Default: Dashboard — refreshKey causes re-fetch after add/edit
    return (
      <Dashboard
        key={refreshKey}
        onAddTask={() => setPage('add')}
        onEditTask={goToEdit}
      />
    );
  };

  return (
    <>
      <Navbar />
      {renderPage()}
    </>
  );
}

export default App;
