import firebaseService2 from "../services/firebaseService2";

const DataTableSessions = ({ data, onSessionSelect }) => {


  return (
    <table>
      <thead>
        <tr>
            <th>Tipo de sesion</th>
            <th>Apellido</th>
            <th>Nombre</th>
            <th>Grupo</th>
            <th>Sesion</th>
            <th>Estatus</th>
            <th>Semilla aleatoria</th>
            <th>Numero de semilla</th>
            <th>Promedio Motor-visual</th>
            <th>Promedio Motor</th>
            <th>Error %</th>
        </tr>
      </thead>
      <tbody>
        {/*data.map((session, index) => (
          <tr key={index} onClick={() => onSessionSelect(session)}>
            <td>{session.sessionType}</td>
            <td>{session.name}</td>
            <td>{session.group}</td>
          </tr>
        ))*/}
      </tbody>
    </table>
  );
};

export default DataTableSessions;
