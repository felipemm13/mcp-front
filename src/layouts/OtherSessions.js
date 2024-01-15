import React, { useContext } from "react";
import { useEffect, useCallback, useState, useRef } from "react";
import "../styles/OtherSessions.css";
import { Context } from "../services/Context";

const OtherSessions = () => {
  const { CrudApi, listOfPlayers } = useContext(Context);
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    listOfPlayers.current.forEach(async (player) => {
      await CrudApi.get(`player/${player.playerId}/sessions`)
        .then((res) => {
          setSessions([...sessions,res.Sessions])
        })
        .catch((error) => {
          console.log(error);
        });
    });
  }, []);

  useEffect(()=>console.log(sessions),[sessions])

  const handleToAnalizeSession = useCallback(() => {}, []);

  const handleCopyParameters = useCallback(() => {}, []);

  const handleChangeSessionTypeFiter = useCallback((e) => {});
  const handleChangeUserFiter = useCallback((e) => {});
  const handleChangeGroupFilter = useCallback((e) => {});
  const handleFilterSelectedPlayerSessions = useCallback(() => {});
  const deleteSelectedSession = useCallback(() => {});
  if (sessions.length) {
    return (
      <div className="interfaceListSesion" style={{color:'white'}}>
        <div className="filters">
          <div className="filtersTitle">
            <h3>
              <b>Filtros</b>
            </h3>
          </div>
          <div className="filtersSelects">
            <div
              className="px-5"
              style={{ width: "100%", display: "flex", flexDirection: "row" }}
            >
              <div className="" style={{ width: "30%" }}>
                <b>Tipo de sesion: </b>
              </div>
              <div className="" style={{ width: "70%" }}>
                <select
                  onChange={handleChangeSessionTypeFiter}
                  className="form-select"
                >
                  <option value="all" selected>
                    Todas
                  </option>
                </select>
              </div>
            </div>
            <div
              className="px-5"
              style={{ width: "100%", display: "flex", flexDirection: "row" }}
            >
              <div className="" style={{ width: "30%" }}>
                <b>Grupo: </b>
              </div>
              <div className="" style={{ width: "70%" }}>
                <select
                  onChange={handleChangeGroupFilter}
                  className="form-select"
                >
                  <option value="all" selected>
                    Todos
                  </option>
                </select>
              </div>
            </div>
            <div
              className="px-5"
              style={{ width: "100%", display: "flex", flexDirection: "row" }}
            >
              <div className="" style={{ width: "15%" }}>
                <b>Nombre: </b>
              </div>
              <div className="" style={{ width: "85%" }}>
                <select
                  onChange={handleChangeUserFiter}
                  className="form-select"
                >
                  <option value="all" selected>
                    Todos
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="tableOfSessions">
          Seleccionar una sesion
          <table className="table table-sm">
            <thead className="thead-light">
              <tr>
                <th>Tipo de sesion</th>
                <th>Apellido</th>
                <th>Nombre</th>
                <th>Grupo</th>
                <th>Sesion</th>
                <th>Estatus</th>
                <th>Semilla aleatoria</th>
                <th>Promedio Motor-visual</th>
                <th>Promedio Motor</th>
                <th>Error %</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(player =>
              player.map(session => {
                let currentPlayer = listOfPlayers.current.filter(player => player.playerId === session.playerId)[0]
                return (<tr>
                  <td>{session.sessionType}</td>
                  <td>{currentPlayer.Surname}</td>
                  <td>{currentPlayer.Name}</td>
                  <td>{currentPlayer.SportGroup}</td>
                  <td></td>
                  <td>{session.seed}</td>
                </tr>)
                }
                  )
                )}
            </tbody>
          </table>
        </div>
        <div className="botTable">
          <div className="selectedSesion">
            <div className="selectedSesionTitle">
              <h4>
                <b>Jugador sesion seleccionada</b>
              </h4>
            </div>
            <div className="selectedSesionInfo">
              <div className="selectedSesionInfoLeft p-2">
                <div
                  className=""
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Tipo de sesion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Sesion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Grupo: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Edad: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Frecuencia cardiaca max.: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Categoria: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
              </div>
              <div className="selectedSesionInfoCenter p-2">
                <div
                  className=""
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Tiempo entre jugadas: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Numero de jugadas: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Nombre: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Genero: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Peso: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
              </div>
              <div className="selectedSesionInfoRight p-2">
                <div
                  className=""
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Tiempo transicion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                    visibility: "hidden",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Sesion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Apellido: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Experiencia: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-3"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Altura: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-2"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Extremidad habil: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
                <div
                  className="mt-2"
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <div className="" style={{ width: "50%" }}>
                    <b>Posicion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                    ></input>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="buttonsControlSession">
            <button
              className="btn btn-secondary btn-lg btn-block sample mt-3"
              onClick={handleCopyParameters}
            >
              <div className="mb-3">Copiar parámetros de sesion</div>
            </button>
            <button
              className="btn btn-secondary btn-lg btn-block sample mt-3"
              onClick={deleteSelectedSession}
            >
              <div className="mb-3">Eliminar sesion</div>
            </button>
            <button
              className="btn btn-secondary btn-lg btn-block sample mt-3"
              onClick={handleFilterSelectedPlayerSessions}
            >
              <div className="mb-3">Filtrar sesiones del jugador</div>
            </button>
            <button
              className="btn btn-secondary btn-lg btn-block sample mt-3"
              onClick={handleToAnalizeSession}
            >
              <div className="mb-3">Abrir sesion</div>
            </button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="alert alert-primary" role="alert">
        CARGANDO...{" "}
      </div>
    );
  }
};

export default OtherSessions;
