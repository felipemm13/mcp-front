import React, { useState } from 'react';

import DataTableSessions from '../components/DataTableSessions';

const OtherSessions = () => {
  const [selectedSession, setSelectedSession] = useState(null);

  const handleFilterChange = (event) => {
    // Lógica para manejar cambios en los filtros
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
  };

  const handleDeleteSession = () => {
    // Lógica para eliminar la sesión seleccionada
  };

  return (
    <div>
      <div className="filters">
        <h3>Filtros</h3>
      </div>

      <DataTableSessions data={['xd','xd']} onSessionSelect={handleSessionSelect} />

      <div className="action-buttons">
        {/* Aquí irían tus botones para copiar, eliminar, filtrar, etc. */}
      </div>
    </div>
  );
};

export default OtherSessions;