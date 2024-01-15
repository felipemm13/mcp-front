import React, { useContext } from "react";
import { useEffect, useCallback, useState, useRef } from "react";
import "../styles/OtherSessions.css";
import { Context } from "../services/Context";
import { useNavigate } from "react-router-dom";

const OtherSessions = () => {
  const { CrudApi, listOfPlayers, currentSession } = useContext(Context);
  const [sessions, setSessions] = useState([]);
  const sessionsRef = useRef(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    sessionsRef.current = [];
    listOfPlayers.current.forEach(async (player) => {
      await CrudApi.get(`player/${player.playerId}/sessions`)
        .then((res) => {
          if (sessionsRef.current) {
            sessionsRef.current = [...sessionsRef.current, res.Sessions];
          } else {
            sessionsRef.current = [res.Sessions];
          }
        })
        .catch((error) => {
          console.log(error);
        });
      setSessions([...sessionsRef.current]);
    });
  }, []);

  useEffect(() => console.log(sessions), [sessions]);

  const handleToAnalizeSession = () => {
    currentSession.current = selectedSession;
    navigate("/analize-session/"+selectedSession[0].sessionId);
  };

  const handleSelectSession = (session, currentPlayer) => {
    // Actualiza el estado con la sesión seleccionada
    setSelectedSession([session, currentPlayer]);
  };
  useEffect(() => console.log(selectedSession), [selectedSession]);
  const calculateAge = (birthday) => {
    let today = new Date();
    let birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    let month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleChangeSessionTypeFiter = useCallback((e) => {});
  const handleChangeUserFiter = useCallback((e) => {});
  const handleChangeGroupFilter = useCallback((e) => {});
  const handleFilterSelectedPlayerSessions = useCallback(() => {});
  const deleteSelectedSession = useCallback(() => {});
  {
    return sessions.length ? (
      <div className="OtherSessionsContainer">
        <div className="OtherSessionsFilters">
          <div className="filtersTitle">
            <h3>
              <b>Filtros</b>
            </h3>
          </div>
          <div className="OtherSessionsFilters">
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
        <div className="OtherSessionsTable">
          Seleccionar una sesion
          <table className="custom-table">
            <thead className="">
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
          </table>
          <div className="table-container">
            <table className="custom-table">
              <tbody>
                {sessions.map((player) =>
                  player.map((session) => {
                    let currentPlayer = listOfPlayers.current.filter(
                      (player) => player.playerId === session.playerId
                    )[0];
                    return (
                      <tr
                        key={session.sessionId}
                        onClick={() =>
                          handleSelectSession(session, currentPlayer)
                        }
                        className={
                          selectedSession
                            ? selectedSession[0] === session
                              ? "selected-row"
                              : ""
                            : ""
                        }
                      >
                        <td>{session.sessionType}</td>
                        <td>{currentPlayer.Surname}</td>
                        <td>{currentPlayer.Name}</td>
                        <td>{currentPlayer.SportGroup}</td>
                        <td>{session.timestamp.split("T")[0]}</td>
                        <td>
                          {session.SessionAnalytics[0]
                            ? session.SessionAnalytics[0].complete === 1
                              ? "complete"
                              : "incomplete"
                            : 0}
                        </td>
                        <td>{session.seed}</td>
                        <td>
                          {session.SessionAnalytics[0]
                            ? session.SessionAnalytics[0].visuMotorMean
                            : 0}
                        </td>
                        <td>
                          {session.SessionAnalytics[0]
                            ? session.SessionAnalytics[0].motorMean
                            : 0}
                        </td>
                        <td>
                          {session.SessionAnalytics[0]
                            ? session.SessionAnalytics[0].wrongPercentage
                            : 0}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="" style={{ width: "100%" }}>
          <div className="">
            <div className="">
              <h4>
                <b>Jugador sesion seleccionada</b>
              </h4>
            </div>
            <div className="">
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
                      value={
                        selectedSession ? selectedSession[0].sessionType : ""
                      }
                      readOnly={true}
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Sesion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      value={
                        selectedSession
                          ? selectedSession[0].timestamp.split("T")[0]
                          : ""
                      }
                      readOnly={true}
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Grupo: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      value={
                        selectedSession ? selectedSession[1].SportGroup : ""
                      }
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
                      value={
                        selectedSession
                          ? calculateAge(selectedSession[1].Birthday)
                          : ""
                      }
                      readOnly={true}
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Categoria: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                      value={selectedSession ? selectedSession[1].Category : ""}
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
                      value={
                        selectedSession
                          ? selectedSession[0].timeBetweenPlays
                          : ""
                      }
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Numero de jugadas: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                      value={selectedSession ? selectedSession[0].numPlays : ""}
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
                      value={selectedSession ? selectedSession[1].Name : ""}
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Genero: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                      value={selectedSession ? selectedSession[1].Gender : ""}
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
                      value={selectedSession ? selectedSession[1].Weight : ""}
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Tiempo transicion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                      value={
                        selectedSession ? selectedSession[0].transitionTime : ""
                      }
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
                      value={selectedSession ? selectedSession[1].Surname : ""}
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Experiencia: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                      value={
                        selectedSession ? selectedSession[1].Experience : ""
                      }
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Altura: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                      value={selectedSession ? selectedSession[1].Height : ""}
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
                      value={
                        selectedSession ? selectedSession[1].SkillfulLeg : ""
                      }
                    ></input>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <b>Posicion: </b>
                  </div>
                  <div className="" style={{ width: "50%" }}>
                    <input
                      className="form-control form-control-sm"
                      id="sessionType"
                      type="text"
                      readOnly={true}
                      value={
                        selectedSession ? selectedSession[1].FieldPosition : ""
                      }
                    ></input>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="buttonsControlSession">
            <button className="btn btn-secondary btn-lg btn-block sample mt-3">
              <div className="mb-3">Copiar parámetros de sesion</div>
            </button>
            <button
              className="btn btn-secondary btn-lg btn-block sample mt-3"
              onClick={deleteSelectedSession}
            >
              <div className="mb-3">Eliminar sesion</div>
            </button>
            <button className="" onClick={handleFilterSelectedPlayerSessions}>
              <div className="mb-3">Filtrar sesiones del jugador</div>
            </button>
            <button className="" onClick={handleToAnalizeSession}>
              <div className="mb-3">Abrir sesion</div>
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="OtherSessionsLoading">
        CARGANDO{" "}
        <svg
          width="55"
          height="55"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle class="spinner_b2T7" cx="4" cy="12" r="3" />
          <circle class="spinner_b2T7 spinner_YRVV" cx="12" cy="12" r="3" />
          <circle class="spinner_b2T7 spinner_c9oY" cx="20" cy="12" r="3" />
        </svg>
      </div>
    );
  }
};

export default OtherSessions;
