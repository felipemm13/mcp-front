/* eslint-disable */
import { useNavigate, useParams } from "react-router-dom";
import "../styles/PlaysView.css";
import { useContext, useEffect, useRef, useState } from "react";
import { Context } from "../services/Context";
import Routes from "../connection/path";
import Draggable from "react-draggable";

const PlaysView = () => {
  const { CrudApi, tercios, userContext, currentPlay } = useContext(Context);
  const isNewPlay = useParams().play === "create";
  const navigate = useNavigate();
  const playersContainer = useRef(null);
  const [containerMeasure, setContainerMeasure] = useState(null);
  const [maxPlayers, setMaxPlayers] = useState({ red: 4, yellow: 4 });
  const [message, setMessage] = useState(null);
  const [gameState, setGameState] = useState({
    playPositions: {
      IdealPositionX: 8,
      IdealPositionY: 8,
      ballX: 24,
      ballY: 8,
      Team: "Red",
      attack: true,
      test: false,
      enable: true,
    },
    players: [
      { xCoor: 26, yCoor: 8, color: "Red" },
      { xCoor: 40, yCoor: 8, color: "Yellow" },
    ],
    numPlayers: { red: 1, yellow: 1 },
  });

  useEffect(() => {
    if (!currentPlay.current) {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser && currentPlay.current) {
        userContext.current = localUser;
      } else {
        navigate("/list-of-plays");
        return;
      }
    }
    //getPlays();
    if (!isNewPlay) {
      const numPlayers = countPlayers(currentPlay.current.figureCoordinates);
      setGameState({
        playPositions: {
          IdealPositionX: currentPlay.current.IdealPositionX,
          IdealPositionY: currentPlay.current.IdealPositionY,
          ballX: currentPlay.current.ballX,
          ballY: currentPlay.current.ballY,
          Team: currentPlay.current.Team,
          attack: currentPlay.current.attack,
          test: currentPlay.current.test,
          enable: currentPlay.current.enable,
          playsId: currentPlay.current.playsId,
        },
        players: currentPlay.current.figureCoordinates,
        numPlayers: numPlayers,
      });
    } else {
      setGameState(currentPlay.current);
    }
    setContainerMeasure({
      containerWidth: playersContainer.current.clientWidth,
      containerHeight: playersContainer.current.clientHeight,
    });
  }, []);

  const handlePlayers = (color, e) => {
    if (e.target.value <= 4) {
      const colorLower = color.toLowerCase();
      if (e.target.value > gameState.numPlayers[colorLower]) {
        setGameState((prevState) => ({
          ...prevState,
          players: [
            ...prevState.players,
            {
              xCoor: 24,
              yCoor: 24,
              color: colorLower.charAt(0).toUpperCase() + colorLower.slice(1),
            },
          ],
          numPlayers: {
            ...prevState.numPlayers,
            [colorLower]: prevState.numPlayers[colorLower] + 1,
          },
        }));
      } else {
        const lastIndex = gameState.players
          .slice()
          .reverse()
          .findIndex((player) => player.color.toLowerCase() === colorLower);

        if (lastIndex !== -1) {
          const indexToRemove = gameState.players.length - 1 - lastIndex;
          setGameState((prevState) => ({
            ...prevState,
            players: prevState.players.filter(
              (_, index) => index !== indexToRemove
            ),
            numPlayers: {
              ...prevState.numPlayers,
              [colorLower]: prevState.numPlayers[colorLower] - 1,
            },
          }));
        }
      }
    } else {
      return;
    }
  };

  const handleRedPlayers = (e) => {
    handlePlayers("red", e);
  };

  const handleYellowPlayers = (e) => {
    handlePlayers("yellow", e);
  };

  const countPlayers = (figureCoordinates) => {
    const resultado = figureCoordinates.reduce(
      (contador, figura) => {
        if (figura.color === "Red") {
          contador.red++;
        } else if (figura.color === "Yellow") {
          contador.yellow++;
        }
        return contador;
      },
      { red: 0, yellow: 0 } // Inicializar el contador
    );
    return resultado;
  };

  const handleStop = (index, event, color) => {
    const containerRect = playersContainer.current.getBoundingClientRect();
    const newPositionX =
      ((event.pageX - containerRect.left) / containerRect.width) * 48;
    const newPositionY =
      ((event.pageY - containerRect.top) / containerRect.height) * 48;
    if (color === "green") {
      setGameState((prevState) => {
        return {
          ...prevState,
          playPositions: {
            ...prevState.playPositions,
            IdealPositionX: newPositionX,
            IdealPositionY: newPositionY,
          },
        };
      });
    } else if (color === "ball") {
      setGameState((prevState) => {
        return {
          ...prevState,
          playPositions: {
            ...prevState.playPositions,
            ballX: newPositionX,
            ballY: newPositionY,
          },
        };
      });
    } else {
      setGameState((prevState) => {
        const updatedPlayers = [...prevState.players];
        updatedPlayers[index].xCoor = newPositionX;
        updatedPlayers[index].yCoor = newPositionY;
        return { ...prevState, players: updatedPlayers };
      });
    }
  };

  const handleSavePlay = async () => {
    const playSelected = currentPlay.current;
    if (JSON.parse(gameState.playPositions.test)) {
      if (JSON.parse(gameState.playPositions.attack)) {
        if (gameState.numPlayers.red < 4 || gameState.numPlayers.yellow < 4) {
          setMessage("Para las jugadas ofensivas de evaluación, tanto el equipo rojo como el amarillo deben contar con 4 deportistas en el campo.");
          return;
        }
      } else {
        if (
          gameState.playPositions.Team === "Red" &&
          (gameState.numPlayers.red !== 3 || gameState.numPlayers.yellow !== 4)
        ) {
          setMessage("Para  las jugadas defensivas de evaluación del equipo rojo, se necesitan 3 deportistas en el campo por parte del equipo rojo y 4 por parte del equipo amarillo.");
          return;
        } else if (
          gameState.playPositions.Team === "Yellow" &&
          (gameState.numPlayers.red !== 4 || gameState.numPlayers.yellow !== 3)
        ) {
          setMessage("Para  las jugadas defensivas de evaluación del equipo amarillo, deben haber 3 deportistas en el campo, mientras que el equipo rojo debe contar con 4.");
          return;
        }
      }
    }
    setMessage(null);
    document.getElementById("SavePlayButton").disabled = true;
    if (!isNewPlay) {
      const playUpdated = {
        ...playSelected,
        ...gameState.playPositions,
      };
      const responsePosition = {
        x: playUpdated.IdealPositionX,
        y: playUpdated.IdealPositionY,
      };
      const quadrant = getQuadrant(responsePosition);
      const playData = {
        ballX: playUpdated.ballX,
        ballY: playUpdated.ballY,
        IdealPositionX: playUpdated.IdealPositionX,
        IdealPositionY: playUpdated.IdealPositionY,
        Team: playUpdated.Team,
        attack: playUpdated.attack,
        test: playUpdated.test,
        responsePosition: quadrant,
        enable: playUpdated.enable,
      };
      await CrudApi.update(`plays/${playUpdated.playsId}`, playData)
        .then((res) => {})
        .catch((error) => console.log(error));
      const figuresData = gameState.players;
      figuresData.map(async (figure) => {
        const figureData = {
          xCoor: figure.xCoor,
          yCoor: figure.yCoor,
          color: figure.color,
        };

        await CrudApi.update(`figCoord/${figure.figureId}`, figureData)
          .then((res) => {
            document.getElementById("SavePlayButton").innerText =
              "Situacion de juego Actualizada";
          })
          .catch((error) => console.log(error));
      });
      const figuresToDelete = playSelected.figureCoordinates.filter(
        (figure) =>
          !figuresData.some(
            (figureSelected) => figureSelected.figureId === figure.figureId
          )
      );

      figuresToDelete.map(async (figure) => {
        await CrudApi.delete(`figCoord/${figure.figureId}`)
          .then((res) => {})
          .catch((error) => console.log(error));
      });
      const figuresToAdd = figuresData.filter(
        (figure) =>
          !playSelected.figureCoordinates.some(
            (figureSelected) => figureSelected.figureId === figure.figureId
          )
      );

      figuresToAdd.map(async (figure) => {
        await CrudApi.post("figCoord", {
          ...figure,
          playsId: playSelected.playsId,
          orderNum: 0,
        })
          .then((res) => {})
          .catch((error) => console.log(error));
      });
    } else {
      const responsePosition = {
        x: gameState.playPositions.IdealPositionX,
        y: gameState.playPositions.IdealPositionY,
      };
      const quadrant = getQuadrant(responsePosition);
      await CrudApi.post(`plays`, {
        ...gameState.playPositions,
        responsePosition: quadrant,
        UserId: userContext.current.userId,
        SnapshotURL: "",
      })
        .then((response) => {
          gameState.players.map(async (player, index) => {
            await CrudApi.post("figCoord", {
              ...player,
              playsId: response.data.playsId,
              orderNum: index,
            })
              .then((res) => {})
              .catch((error) => console.log(error));
          });
          document.getElementById("SavePlayButton").innerText =
            "Situacion de juego guardada";
        })
        .catch((error) => console.log(error));
    }
  };

  const getQuadrant = (posicion) => {
    if (posicion.x <= 16) {
      if (posicion.y <= 16) {
        return 1;
      } else if (posicion.y > 16 && posicion.y <= 32) {
        return 4;
      } else if (posicion.y > 32 && posicion.y <= 48) {
        return 7;
      }
    } else if (posicion.x > 16 && posicion.x <= 32) {
      if (posicion.y <= 16) {
        return 2;
      } else if (posicion.y > 16 && posicion.y <= 32) {
        return 5;
      } else if (posicion.y > 32 && posicion.y <= 48) {
        return 8;
      }
    } else if (posicion.x > 32 && posicion.x <= 48) {
      if (posicion.y <= 16) {
        return 3;
      } else if (posicion.y > 16 && posicion.y <= 32) {
        return 6;
      } else if (posicion.y > 32 && posicion.y <= 48) {
        return 9;
      }
    }
  };

  useEffect(() => {
    if (JSON.parse(gameState.playPositions.test)) {
      if (JSON.parse(gameState.playPositions.attack)) {
        setMaxPlayers({ red: 4, yellow: 4 });
      } else {
        if (gameState.playPositions.Team === "Red") {
          setMaxPlayers({ red: 3, yellow: 4 });
        } else {
          setMaxPlayers({ red: 4, yellow: 3 });
        }
      }
    }
  }, [gameState.playPositions.Team, gameState.playPositions.attack, gameState.playPositions.test]);
  
  return (
    <div className="PlaysViewContainer">
      <div className="PlaysViewBackButton">
        <button
          className="PlaysViewButtonBack"
          onClick={() => {
            navigate("/list-of-plays");
          }}
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
      </div>
      <div className="PlaysViewPlaysContainer">
        <div className="PlaysViewPlays">
          <div className="PlaysViewPlayImageContainer">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#1bfc08" />
              <line
                x1="0"
                y1={`${tercios[0] * 100}%`}
                x2="100%"
                y2={`${tercios[0] * 100}%`}
                stroke="white"
                strokeWidth="2"
                strokeDasharray="10"
              />
              <line
                x1="0"
                y1={`${tercios[1] * 100}%`}
                x2="100%"
                y2={`${tercios[1] * 100}%`}
                stroke="white"
                strokeWidth="2"
                strokeDasharray="10"
              />
              <line
                x1={`${tercios[0] * 100}%`}
                y1="0"
                x2={`${tercios[0] * 100}%`}
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="10"
              />
              <line
                x1={`${tercios[1] * 100}%`}
                y1="0"
                x2={`${tercios[1] * 100}%`}
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="10"
              />
            </svg>
          </div>
          <div
            ref={(ref) => (playersContainer.current = ref)}
            className="PlaysViewPlayPlayersContainer"
          >
            {containerMeasure && (
              <>
                {gameState.players.map((player, index) => {
                  if (player) {
                    if (index === 0) {
                      return (
                        <>
                          <Draggable
                            bounds="parent"
                            key={`center${index}`}
                            disabled
                            defaultPosition={{
                              x: containerMeasure.containerWidth * 0.5,
                              y: containerMeasure.containerHeight * 0.5,
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              style={{
                                position: "absolute",
                                marginLeft: "-6.5vmin",
                                marginTop: "-6.5vmin",
                              }}
                              width={"13vmin"}
                              height={"13vmin"}
                              fill={gameState.playPositions.Team}
                            >
                              <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z" />
                            </svg>
                          </Draggable>

                          <Draggable
                            bounds="parent"
                            key={`player${index}`}
                            defaultPosition={{
                              x:
                                containerMeasure.containerWidth *
                                (gameState.playPositions.IdealPositionX / 48),
                              y:
                                containerMeasure.containerHeight *
                                (gameState.playPositions.IdealPositionY / 48),
                            }}
                            onStop={(event) =>
                              handleStop(index, event, "green")
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              style={{
                                position: "absolute",
                                marginLeft: "-5vmin",
                                marginTop: "-5vmin",
                              }}
                              width={"10vmin"}
                              height={"10vmin"}
                            >
                              <circle
                                cx={"50%"}
                                cy={"50%"}
                                r={"50%"}
                                fill="green"
                              />
                            </svg>
                          </Draggable>
                          <Draggable
                            bounds="parent"
                            key={`first${index}`}
                            defaultPosition={{
                              x:
                                containerMeasure.containerWidth *
                                (player.xCoor / 48),
                              y:
                                containerMeasure.containerHeight *
                                (player.yCoor / 48),
                            }}
                            onStop={(event) =>
                              handleStop(index, event, player.color)
                            }
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              width={"10vmin"}
                              style={{
                                position: "absolute",
                                marginLeft: "-5vmin",
                                marginTop: "-5vmin",
                              }}
                              height={"10vmin"}
                            >
                              <circle
                                cx={"50%"}
                                cy={"50%"}
                                r={"50%"}
                                fill={player.color}
                              />
                            </svg>
                          </Draggable>
                          <Draggable
                            bounds="parent"
                            key={`ball${index}`}
                            defaultPosition={{
                              x:
                                containerMeasure.containerWidth *
                                (gameState.playPositions.ballX / 48),
                              y:
                                containerMeasure.containerHeight *
                                (gameState.playPositions.ballY / 48),
                            }}
                            onStop={(event) => handleStop(index, event, "ball")}
                          >
                            <svg
                              width={"10vmin"}
                              height={"10vmin"}
                              style={{
                                position: "absolute",
                                marginLeft: "-5vmin",
                                marginTop: "-5vmin",
                              }}
                              viewBox="-2500 -2500 5000 5000"
                            >
                              <g stroke="#000" strokeWidth="24">
                                <circle fill="#fff" r="2376" />
                                <path
                                  fill="none"
                                  d="m-1643-1716 155 158m-550 2364c231 231 538 195 826 202m-524-2040c-491 351-610 1064-592 1060m1216-1008c-51 373 84 783 364 1220m-107-2289c157-157 466-267 873-329m-528 4112c-50 132-37 315-8 510m62-3883c282 32 792 74 1196 303m-404 2644c310 173 649 247 1060 180m-340-2008c-242 334-534 645-872 936m1109-2119c-111-207-296-375-499-534m1146 1281c100 3 197 44 290 141m-438 495c158 297 181 718 204 1140"
                                />
                              </g>
                              <path
                                fill="#000"
                                d="m-1624-1700c243-153 498-303 856-424 141 117 253 307 372 492-288 275-562 544-724 756-274-25-410-2-740-60 3-244 84-499 236-764zm2904-40c271 248 537 498 724 788-55 262-105 553-180 704-234-35-536-125-820-200-138-357-231-625-340-924 210-156 417-296 616-368zm-3273 3033a2376 2376 0 0 1-378-1392l59-7c54 342 124 674 311 928-36 179-2 323 51 458zm1197-1125c365 60 717 120 1060 180 106 333 120 667 156 1000-263 218-625 287-944 420-372-240-523-508-736-768 122-281 257-561 464-832zm3013 678a2376 2376 0 0 1-925 1147l-116-5c84-127 114-297 118-488 232-111 464-463 696-772 86 30 159 72 227 118zm-2287 1527a2376 2376 0 0 1-993-251c199 74 367 143 542 83 53 75 176 134 451 168z"
                              />
                            </svg>
                          </Draggable>
                        </>
                      );
                    }
                    return (
                      <Draggable
                        bounds="parent"
                        key={`${index}`}
                        defaultPosition={{
                          x:
                            containerMeasure.containerWidth *
                            (player.xCoor / 48),
                          y:
                            containerMeasure.containerHeight *
                            (player.yCoor / 48),
                        }}
                        onStop={(event) =>
                          handleStop(index, event, player.color)
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          width={"10vmin"}
                          style={{
                            position: "absolute",
                            marginLeft: "-5vmin",
                            marginTop: "-5vmin",
                          }}
                          height={"10vmin"}
                        >
                          <circle
                            cx={"50%"}
                            cy={"50%"}
                            r={"50%"}
                            fill={player.color}
                          />
                        </svg>
                      </Draggable>
                    );
                  }
                })}
              </>
            )}
          </div>
        </div>
        <div className="PlaysViewHandlePlays">
          <div>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignContent: "center",
                }}
              >
                <h2>
                  {isNewPlay
                    ? "Crear nueva situación de juego"
                    : "Editar situación de juego"}
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1em",
                  justifyContent: "center",
                }}
              >
                {/*
                <div>
                  <h4>Jugada base</h4>
                  <select
                    className=""
                    id="PlaySelected"
                    onChange={(e) =>
                      handleChangePlay(JSON.parse(e.target.value), e)
                    }
                  >
                    <option
                      disabled=""
                      id="CreateNewPlayOption"
                      value={JSON.stringify({
                        playPositions: {
                          IdealPositionX: 10,
                          IdealPositionY: 24,
                          ballX: 25,
                          ballY: 15,
                          Team: "Red",
                          attack: true,
                          test: false,
                        },
                        players: [
                          { xCoor: 20, yCoor: 10, color: "Red" },
                          { xCoor: 15, yCoor: 10, color: "Yellow" },
                        ],
                        numPlayers: { red: 1, yellow: 1 },
                      })}
                    >
                      Crear una nueva jugada
                    </option>
                    {playsFromDb.map((play) => {
                      return (
                        <option key={play.playsId} value={JSON.stringify(play)}>
                          {play.playsId}
                        </option>
                      );
                    })}
                  </select>
                </div>*/}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1em",
                  justifyContent: "center",
                }}
              >
                <div>
                  <h4>Equipo del deportista</h4>
                  <select
                    onChange={(e) =>
                      setGameState((prevState) => ({
                        ...prevState,
                        playPositions: {
                          ...prevState.playPositions,
                          Team: e.target.value,
                        },
                      }))
                    }
                    value={gameState.playPositions.Team}
                  >
                    <option value="Red">Rojo</option>
                    <option value="Yellow">Amarillo</option>
                  </select>
                </div>

                <div>
                  <h4>Deportistas rojos</h4>
                  <input
                    id="sessionType"
                    type="number"
                    min={
                      JSON.parse(gameState.playPositions.test)
                        ? maxPlayers.red
                        : 1
                    }
                    max={maxPlayers.red}
                    step="1"
                    value={gameState.numPlayers.red}
                    onChange={(e) => handleRedPlayers(e)}
                  />
                </div>
                <div>
                  <h4>Deportistas amarillos</h4>
                  <input
                    id="sessionType"
                    type="number"
                    min={
                      JSON.parse(gameState.playPositions.test)
                        ? maxPlayers.yellow
                        : 1
                    }
                    max={maxPlayers.yellow}
                    step="1"
                    value={gameState.numPlayers.yellow}
                    onChange={(e) => handleYellowPlayers(e)}
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "1em",
                justifyContent: "center",
              }}
            >
              <div>
                <h4>Tipo de jugada</h4>
                <select
                  onChange={(e) => {
                    setGameState((prevState) => ({
                      ...prevState,
                      playPositions: {
                        ...prevState.playPositions,
                        attack: e.target.value,
                      },
                    }));
                  }}
                  value={gameState.playPositions.attack}
                >
                  <option value={true}>Ofensiva</option>
                  <option value={false}>Defensiva</option>
                </select>
              </div>

              <div>
                <h4>Modo de jugada</h4>
                <select
                  onChange={(e) =>
                    setGameState((prevState) => ({
                      ...prevState,
                      playPositions: {
                        ...prevState.playPositions,
                        test: e.target.value,
                      },
                    }))
                  }
                  value={gameState.playPositions.test}
                >
                  <option value={true}>Evaluacion</option>
                  <option value={false}>Entrenamiento</option>
                </select>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: "1em",
                justifyContent: "center",
              }}
            >
              <button
                className="PlaysViewSavePlayButton"
                id="SavePlayButton"
                onClick={() => handleSavePlay()}
              >
                {isNewPlay
                  ? "Guardar nueva situación de juego"
                  : "Actualizar situación de juego"}
              </button>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
              }}
            >
              {message && <p className="WarningMessagePlaysView">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaysView;
