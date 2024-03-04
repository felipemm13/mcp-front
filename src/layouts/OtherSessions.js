import React, { useContext } from "react";
import { useEffect, useCallback, useState, useRef } from "react";
import "../styles/OtherSessions.css";
import { Context } from "../services/Context";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AWS from "aws-sdk";

const OtherSessions = () => {
  const {
    CrudApi,
    listOfPlayers,
    currentSession,
    videoCurrentSession,
    isSaveCurrentSession,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    S3_BUCKET,
    REGION,
    showSessionType,
  } = useContext(Context);
  const [sessions, setSessions] = useState([]);
  const sessionsRef = useRef(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isSorted, setIsSorted] = useState(false);
  const navigate = useNavigate();
  const [sessionType, setSessionType] = useState("all");
  const [group, setGroup] = useState("all");
  const [user, setUser] = useState("all");

  const getSessions = async () => {
    if (listOfPlayers.current.length) {
      sessionsRef.current = [];
      let players = [];
      let groups = [];
      let types = [];

      try {
        const requests = listOfPlayers.current.map(async (player) => {
          const res = await CrudApi.get(`player/${player.playerId}/sessions`);
          if (res.Sessions.length) {
            players.push(player.Name + " " + player.Surname);
            groups.push(player.SportGroup);
            sessionsRef.current.push(res.Sessions);
          }
        });

        await Promise.all(requests);

        sessionsRef.current = sessionsRef.current.flat();
        types = [
          ...new Set(sessionsRef.current.map((session) => session.sessionType)),
        ];

        if (sessionsRef.current.length) {
          sessionsRef.current.sort((a, b) => {
            const extractDateAndTime = (url) => {
              const [, datePart, timePart] = url.match(
                /(\d{4}-\d{2}-\d{2})\/(\d{2}_\d{2}_\d{2})/
              );
              return `${datePart} ${timePart.replace(/_/g, ":")}`;
            };
            const dateA = new Date(extractDateAndTime(a.videoURL));
            const dateB = new Date(extractDateAndTime(b.videoURL));

            return dateB - dateA;
          });

          setSessions(sessionsRef.current);
          setGroup([...new Set(groups)]);
          setUser([...new Set(players)]);
          setSessionType([...types]);
          setIsSorted(true);
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      navigate("/football-session");
    }
  };
  useEffect(() => {
    getSessions();
  }, []);

  const handleToAnalizeSession = () => {
    if(videoCurrentSession.current && !isSaveCurrentSession.current){
      Swal.fire({
        title: "Existe una sesión actual sin guardar",
        text: "Si abres una sesión anterior se perdera la sesion actual sin guardar, ¿Deseas continuar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Si, continuar!",
        cancelButtonText: "No, cancelar!",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          videoCurrentSession.current = null;
          navigate("/");
        }
      });
    }else{
      currentSession.current = selectedSession;
      navigate("/analize-session/" + selectedSession[0].sessionId);
    }
  };

  const handleSelectSession = (session, currentPlayer) => {
    // Actualiza el estado con la sesión seleccionada
    setSelectedSession([session, currentPlayer]);
    console.log(session)
  };
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

  const handleFilterSelectedPlayerSessions = useCallback(() => {});
  const deleteSelectedSession = () => {
    Swal.fire({
      title: "¿Estas seguro?",
      text: "No podras revertir esta accion",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await CrudApi.delete(`sessions/${selectedSession[0].sessionId}`)
          .then((res) => {
            AWS.config.update({
              accessKeyId: AWS_ACCESS_KEY_ID,
              secretAccessKey: AWS_SECRET_ACCESS_KEY,
            });
            const s3 = new AWS.S3({
              region: REGION,
            });
            selectedSession[0].SessionMoves.map((move) => {
              console.log(move.imageUrl);
              deleteS3Files(s3, move.imageUrl);
            });
            deleteS3Files(s3, selectedSession[0].videoURL);
            Swal.fire("Eliminado", "La sesion ha sido eliminada", "success");
            getSessions();
          })
          .catch((error) => {
            Swal.fire("Error", "No se pudo eliminar la sesion", "error");
          });
      }
    });
  };

  const deleteS3Files = async (s3, key) => {
    return new Promise(() => {
      try {
        let params = { Bucket: S3_BUCKET, Key: key };
        s3.deleteObject(params, (err, data) => {
          if (err) console.log(err, err.stack); // error
          else console.log(data); // deleted
        });
      } catch (e) {
        console.log(e);
      }
    });
  };
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [userFilter, setUserFilter] = useState("all");

  const handleChangeSessionTypeFiter = (event) => {
    setSessionTypeFilter(event.target.value);
  };

  const handleChangeGroupFilter = (event) => {
    setGroupFilter(event.target.value);
  };

  const handleChangeUserFiter = (event) => {
    setUserFilter(event.target.value);
  };

  const filteredSessions = sessions.filter((session) => {
    if (
      sessionTypeFilter !== "all" &&
      session.sessionType !== sessionTypeFilter
    ) {
      return false;
    }
    if (groupFilter !== "all") {
      const currentPlayer = listOfPlayers.current.find(
        (player) => player.playerId === session.playerId
      );
      if (currentPlayer.SportGroup !== groupFilter) {
        return false;
      }
    }
    if (userFilter !== "all") {
      const currentPlayer = listOfPlayers.current.find(
        (player) => player.playerId === session.playerId
      );
      const playerName = currentPlayer.Name + " " + currentPlayer.Surname;
      if (playerName !== userFilter) {
        return false;
      }
    }
    return true;
  });

  return sessions.length ? (
    <div className="OtherSessionsContainer">
      <button
        className="OtherSessionsBackButton"
        onClick={() => navigate("/football-session")}
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
      <div className="OtherSessionsFiltersContainer">
        <div className="filtersTitle">
          <b>Filtros</b>
        </div>
        <div className="OtherSessionsFilters">
          <div className="OtherSessionsLabelInput">
            <b>Tipo de sesion: </b>

            <select
              onChange={handleChangeSessionTypeFiter}
              className="form-select"
            >
              <option value="all" selected>
                Todas
              </option>
              {sessionType.map((type) => (
                <option value={type}>{showSessionType(type)}</option>
              ))}
            </select>
          </div>
          <div className="OtherSessionsLabelInput">
            <b>Grupo: </b>

            <select onChange={handleChangeGroupFilter} className="form-select">
              <option value="all" selected>
                Todos
              </option>
              {group.map((group) => (
                <option value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div className="OtherSessionsLabelInput">
            <b>Nombre: </b>

            <select onChange={handleChangeUserFiter} className="form-select">
              <option value="all" selected>
                Todos
              </option>
              {user.map((user) => (
                <option value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="OtherSessionsTable">
        <b className="OtherSessionsSelectTitle">Seleccionar una sesion</b>
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
        <div className="table-containerA">
          <table className="custom-table">
            <tbody>
              {isSorted ? (
                filteredSessions.map((session) => {
                  let currentPlayer = listOfPlayers.current.find(
                    (player) => player.playerId === session.playerId
                  );
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
                      <td>{showSessionType(session.sessionType)}</td>
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
              ) : (
                <svg
                  width="55"
                  height="55"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle className="spinner_b2T7" cx="4" cy="12" r="3" />
                  <circle
                    className="spinner_b2T7 spinner_YRVV"
                    cx="12"
                    cy="12"
                    r="3"
                  />
                  <circle
                    className="spinner_b2T7 spinner_c9oY"
                    cx="20"
                    cy="12"
                    r="3"
                  />
                </svg>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="OtherSessionsInfo">
        <b>Jugador sesion seleccionada</b>
        <div>
          <div className="OtherSessionsRow">
            <div className="OtherSessionsLabelInput">
              <b>Tipo de sesion: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                value={selectedSession ? showSessionType(selectedSession[0].sessionType) : ""}
                readOnly={true}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Sesion: </b>

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
            <div className="OtherSessionsLabelInput">
              <b>Nombre: </b>
              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].Name : ""}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Apellido: </b>
              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].Surname : ""}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Grupo: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                value={selectedSession ? selectedSession[1].SportGroup : ""}
                readOnly={true}
              ></input>
            </div>
          </div>
          <div className="OtherSessionsRow">
            <div className="OtherSessionsLabelInput">
              <b>Genero: </b>
              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].Gender : ""}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Edad: </b>

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
            <div className="OtherSessionsLabelInput">
              <b>Peso: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].Weight : ""}
              ></input>
            </div>

            <div className="OtherSessionsLabelInput">
              <b>Altura: </b>
              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].Height : ""}
              ></input>
            </div>
          </div>
          <div className="OtherSessionsRow">
            <div className="OtherSessionsLabelInput">
              <b>Tiempo entre jugadas: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={
                  selectedSession ? selectedSession[0].timeBetweenPlays : ""
                }
              ></input>
            </div>

            <div className="OtherSessionsLabelInput">
              <b>Numero de jugadas: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[0].numPlays : ""}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Tiempo transicion: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[0].transitionTime : ""}
              ></input>
            </div>
          </div>
          <div className="OtherSessionsRow">
            <div className="OtherSessionsLabelInput">
              <b>Categoria: </b>
              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].Category : ""}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Experiencia: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].Experience : ""}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Posicion: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].FieldPosition : ""}
              ></input>
            </div>
            <div className="OtherSessionsLabelInput">
              <b>Extremidad habil: </b>

              <input
                className="form-control form-control-sm"
                id="sessionType"
                type="text"
                readOnly={true}
                value={selectedSession ? selectedSession[1].SkillfulLeg : ""}
              ></input>
            </div>
          </div>
        </div>
      </div>
      <div className="OtherSessionsControlSessionButtons">
        <button className="OtherSessionsButtons" disabled={!selectedSession}>
          Copiar parámetros de sesion
        </button>
        <button
          className="OtherSessionsButtons"
          onClick={deleteSelectedSession}
          disabled={!selectedSession}
        >
          Eliminar sesion
        </button>
        <button
          className="OtherSessionsButtons"
          onClick={handleFilterSelectedPlayerSessions}
        >
          Filtrar sesiones del jugador
        </button>
        <button
          className="OtherSessionsButtons"
          onClick={handleToAnalizeSession}
          disabled={!selectedSession}
        >
          Abrir sesion
        </button>
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
        <circle className="spinner_b2T7" cx="4" cy="12" r="3" />
        <circle className="spinner_b2T7 spinner_YRVV" cx="12" cy="12" r="3" />
        <circle className="spinner_b2T7 spinner_c9oY" cx="20" cy="12" r="3" />
      </svg>
    </div>
  );
};

export default OtherSessions;
