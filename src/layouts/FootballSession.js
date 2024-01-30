import { useNavigate } from "react-router-dom";
import "../styles/FootballSession.css";
import FootballSessionView from "../components/FootballSessionView";
import WebCam from "../components/WebCam";
import { useEffect, useState, useRef, useContext } from "react";
import WindowPortal from "../components/WindowPortal";
import { n_rand, rand } from "../utility/math_functions";
import FormPlayer from "../components/FormPlayer";
import { Context } from "../services/Context";
import Swal from "sweetalert2";
import Routes from "../connection/path";
import seedrandom from "seedrandom";

const FootballSession = () => {
  const {
    userContext,
    infoSession,
    videoCurrentSession,
    CrudApi,
    listOfPlayers,
  } = useContext(Context);
  const navigate = useNavigate();
  const [showWindowPortal, setShowWindowPortal] = useState(false);

  const numberOfPlays = useRef(3);
  const isRandomSeed = useRef(true);
  const seed = useRef(infoSession.current?.seed?.current || Math.floor(Math.random() * (6000 - 1)) + 1);
  const secondsToNextPlay = useRef(2);
  const secondsForPlayTransition = useRef(0.1);
  const playsFromDb = useRef([]);
  const defaultPlays = useRef(0);
  const sequenceOfPlays = useRef([]);
  const typeOfSession = useRef("reactive");
  const numOfDistractors = useRef(1);
  const listOfPLayers = useRef([]);
  const currentPlayer = useRef(null);
  const [playersList, setPlayersList] = useState([]);
  const [currentSesionInfo, setCurrentSesionInfo] = useState(null);
  const [openWindowdDisabled, setOpenWindowDisabled] = useState(true);
  const [playsFromDbLoaded, setPlaysFromDbLoaded] = useState(true);
  const [formPlayerModal, setFormPlayerModal] = useState(false);
  const [formPlayerModalTitle, setFormPlayerModalTitle] = useState("");

  useEffect(() => {
    console.log(infoSession.current);
    listOfPLayers.current = [];
    window.addEventListener("beforeunload", () => {
      setShowWindowPortal(false);
    });
    document.getElementById("randomSeed").addEventListener("click", () => {
      if (!isRandomSeed.current) {
        document
          .getElementById("seed")
          .setAttribute("readonly", `${isRandomSeed.current}`);
      } else {
        document.getElementById("seed").removeAttribute("readonly");
      }
    });
    document
      .getElementById("OpenAnalizerView")
      .addEventListener("click", openAnalizerView);
    getPlays();
    getPlayers();
  }, []);

  const handleRegenerateSequence = () => {
    let sequenceGenerated = null;
    let seedSequence = seed.current
    /*let checkbox = document.getElementById("randomSeed").checked;
    if (checkbox) {
      if (seed.current) {
        seedSequence = seed.current;
      }
    }*/
    if (typeOfSession.current === "applied") {
      sequenceGenerated = n_rand(
        playsFromDb.current.length,
        numberOfPlays.current,
        seed.current
      );
    } else {
      //do {
      sequenceGenerated = [];
      console.log(seedSequence)
      for (var i = 0; i < numberOfPlays.current; i++) {
        let sr = seedrandom(seedSequence * (i+1));
        let numRand = Math.ceil(sr() * 8);
        if (numRand >= 5) {
          numRand = numRand + 1;
        }
        sequenceGenerated.push(numRand);
      }
      /*} while (
        sequenceGenerated.includes(5) ||
        hasConsecutiveDuplicates(sequenceGenerated)
      );*/
    }
    sequenceOfPlays.current = sequenceGenerated;
    setSequenceLabel(sequenceGenerated);
  };

  const setSequenceLabel = (sequenceArray)=>{
    var strSequence = [];
    for (var number of sequenceArray) {
      if (number <= defaultPlays.current) {
        //strSequence.push(parseInt(playsFromDb.current[number - 1].id));
        strSequence.push(parseInt(playsFromDb.current[number - 1].playsId));
      } else {
        //strSequence.push("U-" + parseInt(playsFromDb.current[number - 1].id));
        strSequence.push(parseInt(playsFromDb.current[number - 1].playsId));
      }
    }
    document.getElementById("showSessionSequence").value =
      strSequence.join(" → ");
  }

  const getPlays = async () => {
    await CrudApi.get(Routes.playsRoutes.GETPLAYFIGCOORD)
      .then((response) => {
        defaultPlays.current = response.length;
        playsFromDb.current = response;
        setCurrentSesionInfo({
          ...currentSesionInfo,
          playsFromDb: playsFromDb,
        });
        setPlaysFromDbLoaded(false);
      })
      .catch((error) => console.log(error));
  };

  const getPlayers = async () => {
    await CrudApi.get(`user/${userContext.current.userId}/players`)
      .then((response) => {
        listOfPlayers.current = response.Players;
        setPlayersList(response.Players);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleEditPlayer = (idPlayer) => {
    idPlayer = parseInt(idPlayer);
    if (idPlayer) {
      currentPlayer.current = playersList.filter(
        (player) => player.playerId == idPlayer
      )[0];
    }
    setFormPlayerModalTitle("Editar Jugador");
    setFormPlayerModal(true);
  };

  const handleDeletePlayer = async (idPlayer) => {
    idPlayer = parseInt(idPlayer);
    if (idPlayer) {
      Swal.fire({
        title: "¿Seguro que deseas eliminar al jugador?",
        text: "No podrás revertir esta acción!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Eliminar!",
        cancelButtonText: "Cancelar!",
        reverseButtons: true,
      }).then(async (result) => {
        if (result.isConfirmed) {
          await CrudApi.delete(`player/${idPlayer}`).then((response) => {
            if (response) {
              Swal.fire({
                title: "Jugador eliminado",
                text: "El jugador fue eliminado correctamente",
                icon: "success",
                showCloseButton: true,
                timer: 2000,
              });
              getPlayers();
            }
          });
        }
      });
    }
  };

  const openAnalizerView = () => {
    if (videoCurrentSession.current && infoSession.current) {
      navigate("/analize-session/current");
    } else {
      Swal.fire({
        title: "Error",
        text: "No hay datos de sesión actual!",
        icon: "error",
        showCloseButton: true,
        timer: 2000,
      });
    }
  };

  useEffect(() => {
    infoSession.current = { ...infoSession.current, ...currentSesionInfo };
    //console.log(infoSession.current);
  }, [currentSesionInfo]);

  return (
    <>
      <div className="FootballSessionContainer">
        <div className="sessionActions">
          <button
            className="FootballSessionButton"
            onClick={() => navigate("/")}
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
          <div className="sessionViewContainer">
            <FootballSessionView
              infoSession={currentSesionInfo}
              view={"coach"}
            />
          </div>
          <div className="actionsButtons">
            <div className="videoActionsButtons">
              <button
                className="buttonActionsVideo"
                id="StartCaptureVideo"
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25"
                  width="25"
                  viewBox="0 0 512 512"
                >
                  <path d="M435.4 361.3l-89.7-6c-5.2-.3-10.3 1.1-14.5 4.2s-7.2 7.4-8.4 12.5l-22 87.2c-14.4 3.2-29.4 4.8-44.8 4.8s-30.3-1.7-44.8-4.8l-22-87.2c-1.3-5-4.3-9.4-8.4-12.5s-9.3-4.5-14.5-4.2l-89.7 6C61.7 335.9 51.9 307 49 276.2L125 228.3c4.4-2.8 7.6-7 9.2-11.9s1.4-10.2-.5-15L100.4 118c19.9-22.4 44.6-40.5 72.4-52.7l69.1 57.6c4 3.3 9 5.1 14.1 5.1s10.2-1.8 14.1-5.1l69.1-57.6c27.8 12.2 52.5 30.3 72.4 52.7l-33.4 83.4c-1.9 4.8-2.1 10.1-.5 15s4.9 9.1 9.2 11.9L463 276.2c-3 30.8-12.7 59.7-27.6 85.1zM256 48l.9 0h-1.8l.9 0zM56.7 196.2c.9-3 1.9-6.1 2.9-9.1l-2.9 9.1zM132 423l3.8 2.7c-1.3-.9-2.5-1.8-3.8-2.7zm248.1-.1c-1.3 1-2.7 2-4 2.9l4-2.9zm75.2-226.6l-3-9.2c1.1 3 2.1 6.1 3 9.2zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm14.1-325.7c-8.4-6.1-19.8-6.1-28.2 0L194 221c-8.4 6.1-11.9 16.9-8.7 26.8l18.3 56.3c3.2 9.9 12.4 16.6 22.8 16.6h59.2c10.4 0 19.6-6.7 22.8-16.6l18.3-56.3c3.2-9.9-.3-20.7-8.7-26.8l-47.9-34.8z" />
                </svg>
                Empezar
              </button>
              <button
                className="buttonActionsVideo"
                id="SaveCaptureVideo"
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25"
                  width="25"
                  viewBox="0 0 448 512"
                >
                  <path d="M48 96V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V170.5c0-4.2-1.7-8.3-4.7-11.3l33.9-33.9c12 12 18.7 28.3 18.7 45.3V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H309.5c17 0 33.3 6.7 45.3 18.7l74.5 74.5-33.9 33.9L320.8 84.7c-.3-.3-.5-.5-.8-.8V184c0 13.3-10.7 24-24 24H104c-13.3 0-24-10.7-24-24V80H64c-8.8 0-16 7.2-16 16zm80-16v80H272V80H128zm32 240a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z" />
                </svg>
                Guardar Sesion
              </button>
            </div>
            <div className="videoActionsButtons">
              <button
                className="buttonActionsVideo"
                id="OpenAnalizerView"
                disabled
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25"
                  width="25"
                  viewBox="0 0 448 512"
                >
                  <path d="M96 0C60.7 0 32 28.7 32 64V288H144c6.1 0 11.6 3.4 14.3 8.8L176 332.2l49.7-99.4c2.7-5.4 8.3-8.8 14.3-8.8s11.6 3.4 14.3 8.8L281.9 288H352c8.8 0 16 7.2 16 16s-7.2 16-16 16H272c-6.1 0-11.6-3.4-14.3-8.8L240 275.8l-49.7 99.4c-2.7 5.4-8.3 8.8-14.3 8.8s-11.6-3.4-14.3-8.8L134.1 320H32V448c0 35.3 28.7 64 64 64H352c35.3 0 64-28.7 64-64V160H288c-17.7 0-32-14.3-32-32V0H96zM288 0V128H416L288 0z" />
                </svg>
                Analizar Sesión Actual
              </button>
              <button
                className="buttonActionsVideo"
                id='OpenOtherSessions'
                onClick={() => navigate("/other-sessions")}
                disabled={!playersList.length}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25"
                  width="25"
                  viewBox="0 0 512 512"
                >
                  <path d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9V168c0 13.3 10.7 24 24 24H134.1c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24V256c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65V152c0-13.3-10.7-24-24-24z" />
                </svg>
                Otras sesiones
              </button>
            </div>
          </div>
        </div>
        <div className="sessionSettings">
          <div className="sessionWebcamContainer">
            <WebCam
              infoSession={currentSesionInfo}
              openWindow={setOpenWindowDisabled}
              user={userContext}
              showWindowPortal={showWindowPortal}
            />
          </div>
          <div className="sessionSelectTest">
            <div className="selectorTypeTest">
              <input
                type="radio"
                id="reactive"
                name="typeGame"
                value="reactive"
                defaultChecked={
                  infoSession.current?.typeOfSession?.current === "reactive"|| typeOfSession.current === "reactive"
                }
                onClick={(e) => {
                  document
                    .getElementById("distractors")
                    .setAttribute("hidden", "true");
                  document
                    .getElementById("distractorsLabel")
                    .setAttribute("hidden", "true");
                  typeOfSession.current = e.target.value;
                  setCurrentSesionInfo({
                    ...currentSesionInfo,
                    typeOfSession: typeOfSession,
                  });
                }}
              />
              <label className="" htmlFor="reactive">
                <b>
                  <h5>Velocidad Cognitiva-Motriz Simple</h5>
                </b>
              </label>
            </div>
            <div className="selectorTypeTest">
              <input
                type="radio"
                id="discriminative"
                name="typeGame"
                value="discriminative"
                defaultChecked={
                  infoSession.current?.typeOfSession?.current ===
                  "discriminative" 
                }
                onChange={(e) => {
                  if (e.target.select) {
                    document
                      .getElementById("distractors")
                      .removeAttribute("hidden");
                    document
                      .getElementById("distractorsLabel")
                      .removeAttribute("hidden");
                  } else {
                    document
                      .getElementById("distractors")
                      .setAttribute("hidden", "true");
                    document
                      .getElementById("distractorsLabel")
                      .setAttribute("hidden", "true");
                  }
                  typeOfSession.current = e.target.value;
                  setCurrentSesionInfo({
                    ...currentSesionInfo,
                    typeOfSession: typeOfSession,
                  });
                }}
              />
              <label className="" htmlFor="discriminative">
                <b>
                  <h5>Velocidad Cognitiva-Motriz Discriminativa</h5>
                </b>
              </label>
              <div className="distractorsSelect">
                <label
                  id="distractorsLabel"
                  htmlFor="distractors"
                  hidden={
                    infoSession.current?.typeOfSession?.current !==
                    "discriminative"
                  }
                >
                  <b>
                    <h5>Distractores</h5>
                  </b>
                </label>
                <input
                  hidden={
                    infoSession.current?.typeOfSession?.current !==
                    "discriminative"
                  }
                  type="number"
                  name="distractors"
                  id="distractors"
                  min="1"
                  max="7"
                  step="1"
                  defaultValue={infoSession.current?.numOfDistractors?.current || 1}
                  onChange={(e) => {
                    if (e.target.value > 7) {
                      e.target.value = 7;
                    }
                    numOfDistractors.current = e.target.value;
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      numOfDistractors: numOfDistractors,
                    });
                  }}
                ></input>
              </div>
            </div>
            <div className="selectorTypeTest">
              <input
                type="radio"
                id="applied"
                name="typeGame"
                value="applied"
                defaultChecked={
                  infoSession.current?.typeOfSession?.current === "applied"
                }
                onClick={(e) => {
                  document
                    .getElementById("distractors")
                    .setAttribute("hidden", "true");
                  document
                    .getElementById("distractorsLabel")
                    .setAttribute("hidden", "true");
                  typeOfSession.current = e.target.value;
                  setCurrentSesionInfo({
                    ...currentSesionInfo,
                    typeOfSession: typeOfSession,
                  });
                }}
              />
              <label className="" htmlFor="applied">
                <b>
                  <h5>Velocidad Cognitiva-Motriz Aplicada</h5>
                </b>
              </label>
              <br></br>
            </div>
          </div>
          <div className="sessionInfo">
            <div className="sessionPlaysInfo">
              <div className="sessionPlaysValues">
                <label id="numberOfPlaysLabel" htmlFor="numberOfPlays">
                  <b>
                    <h5>Número de Jugadas</h5>
                  </b>
                </label>
                <input
                  type="number"
                  name="numberOfPlays"
                  id="numberOfPlays"
                  defaultValue={infoSession.current?.numberOfPlays?.current || 3}
                  min="1"
                  step="1"
                  onChange={(e) => {
                    numberOfPlays.current = e.target.value;
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      numberOfPlays: numberOfPlays,
                    });
                  }}
                />
              </div>
              <div className="sessionPlaysValues">
                <input
                  className="sessionRandomSeed"
                  type="checkbox"
                  id="randomSeed"
                  name="randomSeed"
                  defaultChecked={infoSession.current?.isRandomSeed?.current || true}
                  onChange={() => {
                    console.log(seed.current,infoSession.current?.isRandomSeed?.current);
                    isRandomSeed.current = !isRandomSeed.current;
                    if (isRandomSeed.current) {
                      document.getElementById("seed").value =
                        Math.floor(Math.random() * (6000 - 1)) + 1;
                      seed.current = document.getElementById("seed").value;
                      setCurrentSesionInfo({
                        ...currentSesionInfo,
                        seed: seed,
                      });
                    }
                  }}
                />
                <label id="seedLabel" htmlFor="seed">
                  <b>
                    <h5>Semilla aleatoria</h5>
                  </b>
                </label>
                <input
                  type="number"
                  name="seed"
                  id="seed"
                  min="1"
                  step="1"
                  defaultValue={infoSession.current?.seed?.current || seed.current}
                  readOnly
                  onChange={(e) => {
                    seed.current = e.target.value;
                  }}
                />
              </div>
              <div className="sessionPlaysValues">
                <label id="secondsToNextPlayLabel" htmlFor="secondsToNextPlay">
                  <b>
                    <h5>Segundos de exhibición</h5>
                  </b>
                </label>
                <input
                  type="number"
                  name="secondsToNextPlay"
                  id="secondsToNextPlay"
                  min="1"
                  step="0.5"
                  defaultValue={infoSession.current?.secondsToNextPlay?.current || 2}
                  onChange={(e) => {
                    secondsToNextPlay.current = e.target.value;
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      secondsToNextPlay: secondsToNextPlay,
                    });
                  }}
                ></input>
              </div>
              <div className="sessionPlaysValues">
                <label
                  id="secondsForPlayTransitionLabel"
                  htmlFor="secondsForPlayTransition"
                >
                  <b>
                    <h5>Segundos transición</h5>
                  </b>
                </label>
                <input
                  type="number"
                  name="secondsForPlayTransition"
                  id="secondsForPlayTransition"
                  min="0.25"
                  step="0.05"
                  defaultValue={infoSession.current?.secondsForPlayTransition?.current || 0.1}
                  onChange={(e) => {
                    secondsForPlayTransition.current = e.target.value;
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      secondsForPlayTransition: secondsForPlayTransition,
                    });
                  }}
                ></input>
              </div>
            </div>
            <div className="sessionSequenceButtons">
              <button
                className="sessionGenerateSequence"
                onClick={() => handleRegenerateSequence()}
                disabled={playsFromDbLoaded}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25"
                  width="25"
                  viewBox="0 0 512 512"
                >
                  <path d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z" />
                </svg>
                Regenerar Secuencia
              </button>
              <button
                onClick={() => {
                  if (!showWindowPortal) {
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      numberOfPlays: numberOfPlays,
                      seed: seed,
                      secondsToNextPlay: secondsToNextPlay,
                      secondsForPlayTransition: secondsForPlayTransition,
                      typeOfSession: typeOfSession,
                      numOfDistractors: numOfDistractors,
                      playsFromDb: playsFromDb,
                      sequenceOfPlays: sequenceOfPlays,
                    });
                  }
                  setShowWindowPortal(!showWindowPortal);
                }}
                className="sessionOpenPlayerWindow"
                id="sessionOpenPlayerWindow"
                disabled={openWindowdDisabled}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="25"
                  width="25"
                  viewBox="0 0 640 512"
                >
                  <path d="M64 64V352H576V64H64zM0 64C0 28.7 28.7 0 64 0H576c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM128 448H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
                </svg>
                {!showWindowPortal ? "Abrir " : "Cerrar "}Ventana Jugador
              </button>
              {showWindowPortal && (
                <WindowPortal closeWindowPortal={setShowWindowPortal}>
                  <FootballSessionView
                    infoSession={currentSesionInfo}
                    view={"player"}
                  />
                </WindowPortal>
              )}
            </div>
            <div className="sessionSequenceContainer">
              <input
                type="text"
                readOnly
                disabled
                id="showSessionSequence"
                className="sessionSequence"
                placeholder="Secuencia de la sesión"
              />
            </div>
            <div className="sessionPlayer">
              <div className="sessionPlayerPlayer">Jugador</div>
              <div className="sessionPlayerSelectContainer">
                <select
                  className="sessionPlayerSelect"
                  onChange={(e) => {
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      playerSelected: e.target.value,
                    });
                  }}
                  defaultValue={infoSession.current?.playerSelected?.current || "default"}
                >
                  {playersList.length ? (
                    <option selected value="default" disabled="disabled">
                      Seleccionar un jugador
                    </option>
                  ) : (
                    <option selected value="default" disabled="disabled">
                      Cargando jugadores...
                    </option>
                  )}
                  {playersList.map((player, key) => (
                    <option value={player.playerId} key={key}>
                      {player.Name +
                        " " +
                        player.Surname +
                        " - " +
                        player.SportGroup}
                    </option>
                  ))}
                </select>
                <div className="sessionPlayerConfigButtons">
                  <button
                    onClick={() => {
                      setFormPlayerModalTitle("Agregar Jugador");
                      setFormPlayerModal(true);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="25"
                      width="25"
                      viewBox="0 0 512 512"
                    >
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      handleDeletePlayer(
                        currentSesionInfo
                          ? currentSesionInfo.playerSelected
                          : null
                      )
                    }
                    disabled={
                      !currentSesionInfo || !currentSesionInfo.playerSelected
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="25"
                      width="25"
                      viewBox="0 0 512 512"
                    >
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM184 232H328c13.3 0 24 10.7 24 24s-10.7 24-24 24H184c-13.3 0-24-10.7-24-24s10.7-24 24-24z" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      handleEditPlayer(
                        currentSesionInfo
                          ? currentSesionInfo.playerSelected
                          : null
                      )
                    }
                    disabled={
                      !currentSesionInfo || !currentSesionInfo.playerSelected
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="25"
                      width="25"
                      viewBox="0 0 384 512"
                    >
                      <path d="M280 64h40c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40 9.6C121 27.5 153.3 0 192 0s71 27.5 78.4 64H280zM64 112c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16H320c8.8 0 16-7.2 16-16V128c0-8.8-7.2-16-16-16H304v24c0 13.3-10.7 24-24 24H192 104c-13.3 0-24-10.7-24-24V112H64zm128-8a24 24 0 1 0 0-48 24 24 0 1 0 0 48z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {formPlayerModal && (
        <FormPlayer
          setOpenModal={setFormPlayerModal}
          title={formPlayerModalTitle}
          player={currentPlayer.current}
          updatePlayers={getPlayers}
        />
      )}
    </>
  );
};
export default FootballSession;
