/* eslint-disable */
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../services/Context";
import Routes from "../connection/path";
import "../styles/ListOfPlays.css";
import Draggable from "react-draggable";

const ListOfPlays = () => {
  const navigate = useNavigate();

  const { tercios, CrudApi, userContext, currentPlay } = useContext(Context);
  const [playsFromDb, setPlaysFromDb] = useState([]);
  const [selectedPlay, setSelectedPlay] = useState(null);
  const playersContainer = useRef(null);
  const [containerMeasure, setContainerMeasure] = useState({
    containerWidth: 700,
    containerHeight: 500,
  });
  const selectedPlayCurrent = useRef(null);
  const [isNewPlay, setIsNewPlay] = useState(false);
  const getPlays = async () => {
    await CrudApi.get(Routes.playsRoutes.GETPLAYFIGCOORD)
      .then((response) => {
        response.sort((a, b) => a.playsId - b.playsId);
        setPlaysFromDb(response);
      })
      .catch((error) => console.log(error));
  };
  useEffect(() => {
    if (!userContext.current) {
      const localUser = JSON.parse(localStorage.getItem("user"));
      if (localUser) {
        userContext.current = localUser;
      } else {
        navigate("/");
      }
    }
    getPlays();
    setContainerMeasure({
      containerWidth: playersContainer.current.clientWidth,
      containerHeight: playersContainer.current.clientHeight,
    });
  }, []);
  const handleSelectRow = (play, index) => {
    const previousSelectedRow = document.getElementById(
      `Play${selectedPlayCurrent.current}`
    );
    const selectedRow = document.getElementById(`Play${index}`);
    if (previousSelectedRow) {
      previousSelectedRow.style.background = "#1a1a1a";
      previousSelectedRow.style.color = "white";
    }
    if (
      selectedPlayCurrent.current !== null &&
      selectedPlayCurrent.current === index
    ) {
      selectedPlayCurrent.current = null;
      setIsNewPlay(false);
      setSelectedPlay(null);
    } else {
      selectedRow.style.background = "rgb(255, 255, 255, 0.75)";
      selectedRow.style.color = "black";
      selectedPlayCurrent.current = index;
      if (selectedPlay !== play) {
        setSelectedPlay(null);
        setTimeout(() => setSelectedPlay(play), 0);
      } else {
        setSelectedPlay(play);
      }
      setIsNewPlay(true);
    }
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

  const handlePlays = async () => {
    const play = selectedPlay;
    play.enable = !play.enable;
    await CrudApi.update(`plays/${play.playsId}`, play)
      .then(() => {
        getPlays();
      })
      .catch((error) => console.log(error));
  };

  const handleEditPlay = (play) => {
    if (play === selectedPlay) {
      currentPlay.current = play;
      navigate("/plays-view/edit");
    }else if(selectedPlay){
      console.log(selectedPlay)
      const numPlayers = countPlayers(selectedPlay.figureCoordinates);
      currentPlay.current = {
        playPositions: {
          IdealPositionX: selectedPlay.IdealPositionX,
          IdealPositionY: selectedPlay.IdealPositionY,
          ballX: selectedPlay.ballX,
          ballY: selectedPlay.ballY,
          Team: selectedPlay.Team,
          attack: selectedPlay.attack,
          test: selectedPlay.test,
          enable: selectedPlay.enable,
        },
        players: selectedPlay.figureCoordinates,
        numPlayers: numPlayers,
      };
      navigate("/plays-view/create");
    }else{
      currentPlay.current ={
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
      }
      navigate("/plays-view/create");
    }
  };
  
  return (
    <div className="ListOfPlaysContainer">
      <div className="ListOfPlaysBackButton">
        <button
          className="ListOfPlaysButtonBack"
          onClick={() => {
            navigate("/");
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
      <div style={{ display: "flex", height: "100%", gap: "1em" }}>
        <div className="ListOfPlaysTable">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Jugada</th>
                <th> Tipo de Jugada</th>
                <th>Modo de Jugada</th>
                <th>Posicion de Respuesta</th>
                <th>Habilitada</th>
                <th>Editar</th>
              </tr>
            </thead>
          </table>
          <div className="table-container">
            <table className="custom-table">
              <tbody>
                {playsFromDb.map((play, index) => (
                  <tr key={play.playsId} id={"Play" + index}>
                    <td onClick={() => handleSelectRow(play, index)}>
                      {play.playName}
                    </td>
                    <td onClick={() => handleSelectRow(play, index)}>
                      {play.attack ? "Ofensiva" : "Defensiva"}
                    </td>
                    <td onClick={() => handleSelectRow(play, index)}>
                      {play.test ? "Evaluacion" : "Prueba"}
                    </td>
                    <td onClick={() => handleSelectRow(play, index)}>
                      {play.responsePosition}
                    </td>
                    <td onClick={() => handleSelectRow(play, index)}>
                      {play.enable ? "Habilitada" : "Deshabilitada"}
                    </td>
                    <td>
                      <button
                        onFocus={() => handleEditPlay(play)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 512 512"
                          width={"2em"}
                          fill={selectedPlay === play ? "white" : "#1a1a1a"}
                        >
                          <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div
            style={{
              height: "7.5%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button className="ListOfPlaysButton" onClick={handleEditPlay}>
              {isNewPlay
                ? "crear basada en jugada actual"
                : "crear nueva jugada"}
            </button>
          </div>
        </div>
        <div
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            gap: "0.5em",
          }}
        >
          <div className="ListOfPlaysImageContainer">
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
            className="ListOfPlaysPlayersContainer"
          >
            {selectedPlay && (
              <>
                <Draggable
                  disabled
                  bounds="parent"
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
                    fill={selectedPlay.Team}
                  >
                    <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z" />
                  </svg>
                </Draggable>
                <Draggable
                  disabled
                  bounds="parent"
                  defaultPosition={{
                    x:
                      containerMeasure.containerWidth *
                      (selectedPlay.IdealPositionX / 48),
                    y:
                      containerMeasure.containerHeight *
                      (selectedPlay.IdealPositionY / 48),
                  }}
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
                    <circle cx={"50%"} cy={"50%"} r={"50%"} fill="green" />
                  </svg>
                </Draggable>
                <Draggable
                  disabled
                  bounds="parent"
                  defaultPosition={{
                    x:
                      containerMeasure.containerWidth *
                      (selectedPlay.ballX / 48),
                    y:
                      containerMeasure.containerHeight *
                      (selectedPlay.ballY / 48),
                  }}
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

                {selectedPlay.figureCoordinates.map((player, index) => {
                  return (
                    <>
                      <Draggable
                        disabled
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
                    </>
                  );
                })}
              </>
            )}
          </div>
          <div
            style={{
              height: "7.5%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button className="ListOfPlaysButton" onClick={handlePlays}>
              {selectedPlay && !selectedPlay?.enable
                ? "habilitar"
                : "deshabilitar"}{" "}
              Jugada
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListOfPlays;
