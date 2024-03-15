/* eslint-disable */
import React from "react";
import { useEffect, useCallback, useState, useRef } from "react";
import "../styles/ListSesions.css";
import firebaseService from "../services/firebaseService2";

function ListSesions(props) {
  let sessionTypeRef = useRef(null);
  let groupRef = useRef(null);
  let userRef = useRef(null);

  const [itsSesionsNull, setItsSesionsNull] = useState(false);
  const [sessions, setSessions] = useState("notReady");

  const [sessionClick, setSessionClick] = useState(0);

  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [nameFilter, setNameFilter] = useState("all");

  const [allSessions, setAllSessions] = useState([
    "reactive",
    "discriminative",
    "applied",
  ]);
  const [allGroup, setAllGroup] = useState([]);
  const [allName, setAllName] = useState([]);

  const [actualSessions, setActualSessions] = useState([
    "reactive",
    "discriminative",
    "applied",
  ]);
  const [actualGroup, setActualGroup] = useState([]);
  const [actualName, setActualName] = useState([]);

  useEffect(() => {
    if (sessionTypeFilter == "all") {
      setActualSessions(allSessions);
    } else {
      setActualSessions([sessionTypeFilter]);
    }

    if (groupFilter == "all") {
      setActualGroup(allGroup);
    } else {
      setActualGroup([groupFilter]);
    }

    if (nameFilter == "all") {
      setActualName(allName[0]);
    } else {
      setActualName([nameFilter]);
    }
  }, [sessionTypeFilter, groupFilter, nameFilter]);
  useEffect(async () => {
    // GET SESSION
    if (sessions === "notReady") {
      firebaseService
        .getAllSessionFromUser(props.sport, props.user)
        .then((querySnapshot) => {
          if (querySnapshot.length != 0) {
            setTimeout(function () {
              setSessions(querySnapshot);
            }, 1500);
          } else {
            setItsSesionsNull(true);
          }
        });
    }
  }, []);
  useEffect(() => {
    // GET SESSION
    let groups = [];
    let players = [[], []];
    for (var session of sessions[1]) {
      if (!groups.includes(session.Group)) {
        groups.push(session.Group);
      }
      if (!players[0].includes(session.IdSportsPerson)) {
        players[0].push(session.IdSportsPerson);
        players[1].push(
          "" + session.Name + " " + session.Surname + " - " + session.Group
        );
      }
    }
    setAllGroup(groups);
    setAllName(players);
    setActualName(players[0]);
    setActualGroup(groups);
  }, [sessions]);

  useEffect(() => {
    return () => {
      props.close();
    };
  }, []);

  const handleToAnalizeSession = useCallback(() => {
    props.changeToAnalizePlay(
      sessions[1][sessionClick].IdSportsPerson,
      sessions[1][sessionClick].DateTime,
      false
    );
  }, [sessions, sessionClick]);

  const handleCopyParameters = useCallback(() => {
    props.getParametersSesion(
      sessions[1][sessionClick].SessionType,
      sessions[1][sessionClick].NumDistractors,
      sessions[1][sessionClick].NumPlays,
      sessions[1][sessionClick].RandomSeed,
      sessions[1][sessionClick].Seed,
      sessions[1][sessionClick].TimeBetweenPlays_ms,
      sessions[1][sessionClick].TransitionTime_ms
    );
  }, [sessions, sessionClick]);

  const handleChangeSessionTypeFiter = useCallback((e) => {
    setSessionTypeFilter(e.target.value);
  });
  const handleChangeUserFiter = useCallback((e) => {
    setNameFilter(e.target.value);
  });
  const handleChangeGroupFilter = useCallback((e) => {
    setGroupFilter(e.target.value);
  });
  const handleFilterSelectedPlayerSessions = useCallback(() => {
    setSessionTypeFilter("all");
    setGroupFilter("all");
    setNameFilter(sessions[1][sessionClick].IdSportsPerson);
    sessionTypeRef.current.value = "all";
    groupRef.current.value = "all";
    userRef.current.value = sessions[1][sessionClick].IdSportsPerson;
  });
  const deleteSelectedSession = useCallback(() => {
    firebaseService.deleteSession(
      sessions[0][
        sessions[0].findIndex(
          (session) => session[0] == sessions[1][sessionClick].IdSportsPerson
        )
      ][1].IdGroup,
      sessions[1][sessionClick].Sport,
      sessions[1][sessionClick].IdSportsPerson,
      sessions[1][sessionClick].DateTime,
      sessions[1][sessionClick].NumPlays
    );
    let newSession = [[...sessions[0]], []];
    for (let [index, session] of sessions[1].entries()) {
      if (!(index == sessionClick)) {
        newSession[1].push(session);
      }
    }
    setSessionClick(0);
    setSessions(newSession);
  });
  if (itsSesionsNull == true || sessions[1].length == 0) {
    return (
      <div className="alert alert-danger" role="alert">
        No existe guardada una sesion!!
      </div>
    );
  } else {
    if (sessions !== "notReady") {
      return (
        <div className="interfaceListSesion">
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
                    ref={sessionTypeRef}
                    className="form-select"
                  >
                    <option value="all" selected>
                      Todas
                    </option>
                    {allSessions.map((group, key) => (
                      <option key={key} value={group}>
                        {group}
                      </option>
                    ))}
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
                    ref={groupRef}
                    className="form-select"
                  >
                    <option value="all" selected>
                      Todos
                    </option>
                    {allGroup.map((group, key) => (
                      <option key={key} value={group}>
                        {group}
                      </option>
                    ))}
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
                    ref={userRef}
                    className="form-select"
                  >
                    <option value="all" selected>
                      Todos
                    </option>
                    {allName[0].map((name, key) => (
                      <option key={name} value={name}>
                        {allName[1][key]}
                      </option>
                    ))}
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
                  <th>Numero de semilla</th>
                  <th>Promedio Motor-visual</th>
                  <th>Promedio Motor</th>
                  <th>Error %</th>
                </tr>
              </thead>
              <tbody>
                {sessions[1].length != 0 &&
                  sessions[1].map((session, index) => {
                    if (
                      actualSessions.includes(session.SessionType) &&
                      actualGroup.includes(session.Group) &&
                      actualName.includes(session.IdSportsPerson)
                    ) {
                      return (
                        <tr
                          className={
                            index == sessionClick
                              ? "table-primary"
                              : "table-light"
                          }
                          onClick={() => {
                            setSessionClick(index);
                          }}
                          key={index}
                        >
                          <td>{session.SessionType}</td>
                          <td>{session.Surname}</td>
                          <td>{session.Name}</td>
                          <td>{session.Group}</td>
                          <td>{session.DateTime}</td>
                          <td>
                            {session.annotations.Complete
                              ? "Complete"
                              : "Incomplete"}
                          </td>
                          <td>{session.RandomSeed ? "Si" : "No"}</td>
                          <td>{session.Seed}</td>
                          <td>
                            {session.annotations.Complete
                              ? session.annotations.VisuMotorMean
                              : ""}
                          </td>
                          <td>
                            {session.annotations.Complete
                              ? session.annotations.MotorMean
                              : ""}
                          </td>
                          <td>
                            {session.annotations.Complete
                              ? session.annotations.WrongPercentaje
                              : ""}
                          </td>
                        </tr>
                      );
                    }
                  })}
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
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].SessionType
                            : ""
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
                      <b>Sesion: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].DateTime
                            : ""
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
                      <b>Grupo: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].Group
                            : ""
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
                      <b>Edad: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Age
                            : ""
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
                      <b>Frecuencia cardiaca max.: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? (sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Gender == "M"
                                ? 220
                                : 226) -
                              sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Age
                            : ""
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
                      <b>Categoria: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Cathegory
                            : ""
                        }
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
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].TimeBetweenPlays_ms
                            : ""
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
                      <b>Numero de jugadas: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].NumPlays
                            : ""
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
                      <b>Nombre: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].Name
                            : ""
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
                      <b>Genero: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Gender
                            : ""
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
                      <b>Peso: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Weight_kg
                            : ""
                        }
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
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].TransitionTime_ms
                            : ""
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
                        value={
                          sessions.length != 0 && sessionClick != -1 ? "1" : ""
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
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[1][sessionClick].Surname
                            : ""
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
                      <b>Experiencia: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Experience
                            : ""
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
                      <b>Altura: </b>
                    </div>
                    <div className="" style={{ width: "50%" }}>
                      <input
                        className="form-control form-control-sm"
                        id="sessionType"
                        type="text"
                        readOnly={true}
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].Height_cm
                            : ""
                        }
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
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].FootballPlayer.SkilfulExtremity
                            : ""
                        }
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
                        value={
                          sessions.length != 0 && sessionClick != -1
                            ? sessions[0][
                                sessions[0].findIndex(
                                  (session) =>
                                    session[0] ==
                                    sessions[1][sessionClick].IdSportsPerson
                                )
                              ][1].FootballPlayer.FieldPosition
                            : ""
                        }
                      ></input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="buttonsControlSession">
              <button
                className="btn btn-secondary btn-lg btn-block sample mt-3"
                disabled={sessionClick == -1}
                onClick={handleCopyParameters}
              >
                
                <div className="mb-3">Copiar parámetros de sesion</div>
              </button>
              <button
                className="btn btn-secondary btn-lg btn-block sample mt-3"
                disabled={sessionClick == -1}
                onClick={deleteSelectedSession}
              >
                
                <div className="mb-3">Eliminar sesion</div>
              </button>
              <button
                className="btn btn-secondary btn-lg btn-block sample mt-3"
                disabled={sessionClick == -1}
                onClick={handleFilterSelectedPlayerSessions}
              >
                
                <div className="mb-3">Filtrar sesiones del jugador</div>
              </button>
              <button
                className="btn btn-secondary btn-lg btn-block sample mt-3"
                disabled={sessionClick == -1}
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
  }
}

export default ListSesions;
