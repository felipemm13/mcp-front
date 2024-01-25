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
      setSessions([[].concat(...sessionsRef.current)]);
    });
  }, []);

  useEffect(() => {
    if (sessions.length) {
      sessions[0].sort((a, b) => {
        /*
        let dateA =
          a.videoURL.split("/")[2] +
          " " +
          a.videoURL.split("/")[3].split("-")[0];
        let dateB =
          b.videoURL.split("/")[2] +
          " " +
          b.videoURL.split("/")[3].split("-")[0];*/
          let dateA = new Date(a.timestamp)
          let dateB = new Date(b.timestamp)
        console.log(a,b)
        if (dateA < dateB) {
          return 1;
        }
        if (dateA > dateB) {
          return -1;
        }
        return 0;
      });
    }
    console.log("use", sessions);
  }, [sessions]);

  const handleToAnalizeSession = () => {
    currentSession.current = selectedSession;
    navigate("/analize-session/" + selectedSession[0].sessionId);
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
        <button
          className="AnalizeSessionBackButton"
          onClick={() => navigate("/football-session", { replace: true })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="25"
            width="25"
            viewBox="0 0 512 512"
          >
            <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z" />
          </svg>
          Volver
        </button>
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
                        <td>
                          {session.videoURL.split("/")[2] +
                            " " +
                            session.videoURL.split("/")[3].split("-")[0]}
                        </td>
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
