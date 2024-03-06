/* eslint-disable */
import { useNavigate } from "react-router-dom";
import "../styles/FootballSession.css";
import FootballSessionView from "../components/FootballSessionView";
import WebCam from "../components/WebCam";
import { useEffect, useState, useRef, useContext } from "react";
import WindowPortal from "../components/WindowPortal";
import { n_rand } from "../utility/math_functions";
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
    isSaveCurrentSession,
    CrudApi,
    listOfPlayers,
    customsUser,
    setCustomsUser,
  } = useContext(Context);
  const navigate = useNavigate();
  const [showWindowPortal, setShowWindowPortal] = useState(false);
  const defaultPlays = useRef(0);
  const currentPlayer = useRef(null);
  const [playersList, setPlayersList] = useState([]);
  const [currentSesionInfo, setCurrentSesionInfo] = useState();
  const [openWindowdDisabled, setOpenWindowDisabled] = useState(true);
  const [playsFromDbLoaded, setPlaysFromDbLoaded] = useState(true);
  const [formPlayerModal, setFormPlayerModal] = useState(false);
  const [formPlayerModalTitle, setFormPlayerModalTitle] = useState("");
  const [appliedMode, setAppliedMode] = useState("aleatorioTotal");
  const [playsInfo, setPlaysInfo] = useState({
    maxOffensive: 0,
    maxDefensive: 0,
    maxTotal: 0,
    evaluative: 0,
    evaluativeOptions: [],
    evaluativeList: [],
  });

  const offensiveRandomPlays = useRef(0);
  const defensiveRandomPlays = useRef(0);
  const lengthEvalSequence = useRef(0);

  const getCustomsUser = async () => {
    if (
      !customsUser ||
      !customsUser.groups ||
      !customsUser.categories ||
      !customsUser.positions
    ) {
      let groups = [];
      let categories = [];
      let positions = [];
      await CrudApi.get(`user/${userContext.current.userId}/groups`)
        .then((response) => {
          groups = response.Groups;
        })
        .catch((error) => {
          console.log(error);
        });
      await CrudApi.get(`user/${userContext.current.userId}/categories`)
        .then((response) => {
          categories = response.Categories;
        })
        .catch((error) => {
          console.log(error);
        });
      await CrudApi.get(`user/${userContext.current.userId}/positions`)
        .then((response) => {
          positions = response.Position;
        })
        .catch((error) => {
          console.log(error);
        });
      setCustomsUser({groups, categories, positions});
    }
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

    window.addEventListener("beforeunload", () => {
      setShowWindowPortal(false);
    });
    document
      .getElementById("OpenAnalizerView")
      .addEventListener("click", openAnalizerView);
    document.getElementById("BackToHome").addEventListener("click", () => {
      if (videoCurrentSession.current && !isSaveCurrentSession.current) {
        Swal.fire({
          title: "Existe una sesión actual sin guardar",
          text: "¿Deseas salir igualmente?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Si, salir!",
          cancelButtonText: "No, cancelar!",
          reverseButtons: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            videoCurrentSession.current = null;
            navigate("/");
          }
        });
      } else {
        navigate("/");
      }
    });
    getCustomsUser();
    if (infoSession.current) {
      if (videoCurrentSession.current) {
        document.getElementById("OpenAnalizerView").removeAttribute("disabled");
        if (!isSaveCurrentSession.current) {
          document
            .getElementById("SaveCaptureVideo")
            .removeAttribute("disabled");
        }
      }
      setCurrentSesionInfo(infoSession.current);
      if (infoSession.current.playsFromDb) {
        getPlaysInfo(infoSession.current.playsFromDb);
      } else {
        getPlays();
      }
      setPlaysFromDbLoaded(false);
    } else {
      infoSession.current = {
        typeOfSession: "reactive",
        numOfDistractors: 1,
        numberOfPlays: 4,
        seed: Math.floor(Math.random() * (6000 - 1)) + 1,
        isRandomSeed: true,
        secondsToNextPlay: 2,
        secondsForPlayTransition: 0,
        sequenceOfPlays: [],
        playerSelected: "default",
      };
      setCurrentSesionInfo({ ...infoSession.current });
      getPlays();
    }
    if (listOfPlayers.current.length === 0) {
      getPlayers();
    } else {
      setPlayersList(listOfPlayers.current);
    }
  }, []);

  const getPlaysInfo = (plays) => {
    let maxOffensive = 0;
    let maxDefensive = 0;
    let maxTotal = 0;
    let evaluative = 0;
    let evaluativeOptions = [];
    let evaluativeList = [];
    for (var play of plays) {
      if (play.attack) {
        maxOffensive++;
      } else {
        maxDefensive++;
      }
      if (play.test) {
        evaluative++;
      }
      maxTotal++;
    }
    if (evaluative >= 8) {
      const multiplos = [];
      for (let i = 8; i <= evaluative; i += 8) {
        if (maxOffensive >= i / 2 && maxDefensive >= i / 2) {
          multiplos.push(i);
        }
      }
      if (multiplos.length) {
        evaluativeOptions = multiplos;
        evaluativeList = generateListOfPlays(plays, multiplos);
      }
    }
    setPlaysInfo({
      maxOffensive,
      maxDefensive,
      maxTotal,
      evaluative,
      evaluativeOptions,
      evaluativeList,
    });
  };

  const generateListOfPlays = (plays, options) => {
    const playsByPosition = {};

    // Agrupar las jugadas por posición
    plays.forEach((play) => {
      const position = play.responsePosition;
      if (!playsByPosition[position]) {
        playsByPosition[position] = [];
      }
      playsByPosition[position].push(play);
    });

    const sequences = [];
    const positions = [1, 2, 3, 4, 6, 7, 8, 9];
    let positionsForLength = [];
    const isPermutation = (sequences, newSequence) => {
      const compararArreglosSinOrden = (arr1, arr2) => {
        if (arr1.length !== arr2.length) return false;
        arr1 = arr1.sort((a, b) => a.playsId - b.playsId);
        arr2 = arr2.sort((a, b) => a.playsId - b.playsId);
        return arr1.every((elemento, indice) => elemento === arr2[indice]);
      };
      let esPermutacion = false;
      sequences.forEach((sequence) => {
        if (!esPermutacion) {
          if (compararArreglosSinOrden(sequence, newSequence)) {
            esPermutacion = true;
          }
        }
      });
      return esPermutacion;
    };

    const generateCombinations = (sequence, index, length) => {
      // Verificar si la secuencia está completa
      if (sequence.length === length) {
        // Verificar si cumple con las condiciones
        const numOffensive = sequence.filter((play) => play.attack).length;
        const numDefensive = sequence.filter((play) => !play.attack).length;

        if (numOffensive === numDefensive) {
          const positionsInSequence = sequence.map(
            (play) => play.responsePosition
          );
          // Verificar si todas las posiciones requeridas están presentes
          const allPositionsPresent = positionsForLength.every((position) =>
            positionsInSequence.includes(position)
          );
          if (allPositionsPresent) {
            // Verificar si la secuencia ya existe en sequences
            const esPermutacion = isPermutation(sequences, sequence);
            if (!esPermutacion) {
              sequences.push(sequence);
            }
          }
        }
        return;
      }

      // Generar la siguiente jugada para esta posición
      const position = positionsForLength[index];
      const playsAtPosition = playsByPosition[position];
      playsAtPosition?.forEach((play) => {
        // Verificar si la jugada ya está en la secuencia
        if (!sequence.some((p) => p === play)) {
          generateCombinations([...sequence, play], index + 1, length);
        }
      });
    };

    // Generar combinaciones para cada longitud especificada en options
    options.forEach((length) => {
      positionsForLength = Array.from(
        { length: length },
        (_, i) => positions[i % 8]
      );
      generateCombinations([], 0, length);
    });
    const groupedSequences = [];

    sequences.forEach((sequence) => {
      const length = sequence.length;
      let group = groupedSequences.find(
        (item) => item.lengthSequences === length
      );

      if (!group) {
        group = {
          lengthSequences: length,
          sequences: [],
        };
        groupedSequences.push(group);
      }

      group.sequences.push(sequence);
    });
    return groupedSequences;
  };

  const handleRegenerateSequence = () => {
    let sequenceGenerated = null;
    let seedSequence = currentSesionInfo.seed;
    if (currentSesionInfo.typeOfSession === "applied") {
      if (appliedMode === "aleatorioTotal") {
        sequenceGenerated = n_rand(
          playsInfo.maxTotal,
          currentSesionInfo.numberOfPlays,
          seedSequence
        );
      } else if (appliedMode === "aleatorioTipo") {
        sequenceGenerated = [];
        let offensivePlays = [];
        let defensivePlays = [];
        for (let play of currentSesionInfo.playsFromDb) {
          if (play.attack) {
            offensivePlays.push(play);
          } else {
            defensivePlays.push(play);
          }
        }
        for (let i = 0; i < offensiveRandomPlays.current; i++) {
          let sr = seedrandom(seedSequence * (i + 1));
          let randomIndex = Math.ceil(sr() * offensivePlays.length) - 1;
          sequenceGenerated.push(offensivePlays[randomIndex].playsId);
          offensivePlays.splice(randomIndex, 1);
        }
        for (let i = 0; i < defensiveRandomPlays.current; i++) {
          let sr = seedrandom(seedSequence * (i + 1));
          let randomIndex = Math.ceil(sr() * defensivePlays.length) - 1;
          sequenceGenerated.push(defensivePlays[randomIndex].playsId);
          defensivePlays.splice(randomIndex, 1);
        }
        sequenceGenerated = sequenceGenerated.sort((a, b) => {
          const rng = seedrandom(seedSequence + a.toString() + b.toString());
          return rng() - 0.5;
        });
      }
    } else if (currentSesionInfo.typeOfSession === "evaluative") {
      if (
        playsInfo.evaluativeOptions.length &&
        playsInfo.evaluativeList.length
      ) {
        let sequenceList = [];
        playsInfo.evaluativeList.forEach((item) => {
          if (item.lengthSequences === lengthEvalSequence.current) {
            sequenceList = item.sequences;
          }
        });
        let sr = seedrandom(seedSequence);
        let randomIndex =
          sequenceList.length > 1
            ? Math.ceil(sr() * sequenceList.length) - 1
            : 0;
        sequenceGenerated = sequenceList[randomIndex].map(
          (play) => play.playsId
        );
        sequenceGenerated = sequenceGenerated.sort((a, b) => {
          const rng = seedrandom(seedSequence + a.toString() + b.toString());
          return rng() - 0.5;
        });
      } else {
        sequenceGenerated = [];
      }
    } else {
      sequenceGenerated = [];
      for (var i = 0; i < currentSesionInfo.numberOfPlays; i++) {
        let sr = seedrandom(seedSequence * (i + 1));
        let numRand = Math.ceil(sr() * 8);
        if (numRand >= 5) {
          numRand = numRand + 1;
        }
        if (sequenceGenerated[i - 1] === numRand) {
          numRand = (numRand + 1) % 8;
          if (numRand === 0) {
            numRand = 1;
          }
          if (numRand >= 5) {
            numRand = numRand + 1;
          }
        }
        sequenceGenerated.push(numRand);
      }
    }
    setSequenceLabel(sequenceGenerated);
  };

  const setSequenceLabel = (sequenceArray) => {
    var strSequence = [];
    for (var number of sequenceArray) {
      if (currentSesionInfo?.typeOfSession === "applied") {
        if (appliedMode === "aleatorioTotal") {
          strSequence.push(
            parseInt(currentSesionInfo.playsFromDb[number - 1].playsId)
          );
        } else if (
          appliedMode === "aleatorioTipo" ||
          appliedMode === "evaluative"
        ) {
          strSequence.push(parseInt(number));
        }
      } else {
        strSequence.push(number);
      }
    }
    if (strSequence.length === 0) {
      strSequence = ["No se genero ninguna secuencia, vuelva a intentar"];
      setCurrentSesionInfo({
        ...currentSesionInfo,
        sequenceOfPlays: strSequence,
      });
    } else {
      setCurrentSesionInfo({
        ...currentSesionInfo,
        sequenceOfPlays: strSequence,
        numberOfPlays: strSequence.length,
      });
    }
  };

  const getPlays = async () => {
    await CrudApi.get(Routes.playsRoutes.GETPLAYFIGCOORD)
      .then((response) => {
        defaultPlays.current = response.length;
        let playsFromDbCurrent = [];
        for (var play of response) {
          if (play.enable) {
            playsFromDbCurrent.push(play);
          }
        }
        getPlaysInfo(playsFromDbCurrent);
        setCurrentSesionInfo({
          ...infoSession.current,
          playsFromDb: playsFromDbCurrent,
        });
        setPlaysFromDbLoaded(false);
      })
      .catch((error) => console.log(error));
  };

  const getPlayers = async () => {
    if (userContext.current?.userId) {
      await CrudApi.get(`user/${userContext.current.userId}/players`)
        .then((response) => {
          listOfPlayers.current = response.Players;
          setPlayersList(response.Players);
        })
        .catch((error) => {
          console.log(error);
        });
    }
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
    setTimeout(
      () =>
        (infoSession.current = {
          ...infoSession.current,
          ...currentSesionInfo,
        }),
      0
    );
  }, [currentSesionInfo]);

  return (
    <>
      <div className="FootballSessionContainer">
        <div className="sessionActions">
          <button id="BackToHome" className="FootballSessionButton">
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
                id="OpenOtherSessions"
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
                checked={currentSesionInfo?.typeOfSession === "reactive"}
                onChange={(e) => {
                  setCurrentSesionInfo({
                    ...currentSesionInfo,
                    typeOfSession: e.target.value,
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
                checked={currentSesionInfo?.typeOfSession === "discriminative"}
                onChange={(e) => {
                  setCurrentSesionInfo({
                    ...currentSesionInfo,
                    typeOfSession: e.target.value,
                  });
                }}
              />
              <label className="" htmlFor="discriminative">
                <b>
                  <h5>Velocidad Cognitiva-Motriz Discriminativa</h5>
                </b>
              </label>
              {currentSesionInfo?.typeOfSession === "discriminative" && (
                <div className="distractorsSelect">
                  <label id="distractorsLabel" htmlFor="distractors">
                    <b>
                      <h5>Distractores</h5>
                    </b>
                  </label>
                  <input
                    type="number"
                    name="distractors"
                    id="distractors"
                    min="1"
                    max="7"
                    step="1"
                    value={currentSesionInfo?.numOfDistractors}
                    onChange={(e) => {
                      if (e.target.value) {
                        if (parseFloat(e.target.value) > 7) {
                          e.target.value = 7;
                        }
                      } else {
                        e.target.value = currentSesionInfo.numOfDistractors;
                      }
                      setCurrentSesionInfo({
                        ...currentSesionInfo,
                        numOfDistractors: parseInt(e.target.value),
                      });
                    }}
                  ></input>
                </div>
              )}
            </div>
            <div className="selectorTypeTest">
              <input
                type="radio"
                id="applied"
                name="typeGame"
                value="applied"
                checked={
                  currentSesionInfo?.typeOfSession === "applied" ||
                  currentSesionInfo?.typeOfSession === "evaluative"
                }
                onChange={(e) => {
                  if (appliedMode === "evaluative") {
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      typeOfSession: "evaluative",
                    });
                  } else {
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      typeOfSession: e.target.value,
                    });
                  }
                }}
              />
              <label className="" htmlFor="applied">
                <b>
                  <h5>Velocidad Cognitiva-Motriz Aplicada</h5>
                </b>
              </label>
              {(currentSesionInfo?.typeOfSession === "applied" ||
                currentSesionInfo?.typeOfSession === "evaluative") && (
                <div className="distractorsSelect">
                  <label id="distractorsLabel" htmlFor="distractors">
                    <b>
                      <h5>Modo generacion secuencia</h5>
                    </b>
                  </label>
                  <select
                    value={appliedMode}
                    onChange={(e) => {
                      if (e.target.value === "evaluative") {
                        setCurrentSesionInfo({
                          ...currentSesionInfo,
                          typeOfSession: e.target.value,
                        });
                      } else {
                        setCurrentSesionInfo({
                          ...currentSesionInfo,
                          typeOfSession: "applied",
                        });
                      }
                      setAppliedMode(e.target.value);
                    }}
                  >
                    <option value="aleatorioTotal">Aleatorio Total</option>
                    <option value="aleatorioTipo">Aleatorio por Tipo</option>
                    <option value="evaluative">Evaluación</option>
                  </select>
                </div>
              )}
            </div>
          </div>
          <div className="sessionInfo">
            <div className="sessionPlaysInfo">
              {(appliedMode === "aleatorioTotal" ||
                (currentSesionInfo?.typeOfSession !== "applied" &&
                  currentSesionInfo?.typeOfSession !== "evaluative")) && (
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
                    value={currentSesionInfo?.numberOfPlays}
                    min="1"
                    max={
                      currentSesionInfo?.typeOfSession === "applied"
                        ? playsInfo?.maxTotal
                        : defaultPlays.current
                    }
                    step="1"
                    onChange={(e) => {
                      if (
                        currentSesionInfo?.typeOfSession === "applied" &&
                        e.target.value > playsInfo?.maxTotal
                      ) {
                        e.target.value = playsInfo?.maxTotal;
                      }

                      setCurrentSesionInfo({
                        ...currentSesionInfo,
                        numberOfPlays: e.target.value,
                      });
                    }}
                  />
                </div>
              )}
              {currentSesionInfo?.typeOfSession === "applied" &&
                appliedMode === "aleatorioTipo" && (
                  <div className="sessionPlaysValues">
                    <label id="numberOfPlaysLabel" htmlFor="numberOfPlays">
                      <b>
                        <h5>Jugadas Ofensivas</h5>
                      </b>
                    </label>
                    <input
                      type="number"
                      name="numberOfPlays"
                      id="numberOfPlays"
                      defaultValue={0}
                      min="0"
                      max={playsInfo?.maxOffensive}
                      step="1"
                      onChange={(e) => {
                        if (e.target.value > playsInfo?.maxOffensive) {
                          e.target.value = playsInfo?.maxOffensive;
                        }
                        offensiveRandomPlays.current = e.target.value;
                      }}
                    />
                    <label id="numberOfPlaysLabel" htmlFor="numberOfPlays">
                      <b>
                        <h5>Jugadas Defensivas</h5>
                      </b>
                    </label>
                    <input
                      type="number"
                      name="numberOfPlays"
                      id="numberOfPlays"
                      defaultValue={0}
                      min="0"
                      max={playsInfo?.maxDefensive}
                      step="1"
                      onChange={(e) => {
                        if (e.target.value > playsInfo?.maxDefensive) {
                          e.target.value = playsInfo?.maxDefensive;
                        }
                        defensiveRandomPlays.current = e.target.value;
                      }}
                    />
                  </div>
                )}
              {currentSesionInfo?.typeOfSession === "evaluative" &&
                appliedMode === "evaluative" && (
                  <div className="playsTestSelect">
                    <label id="distractorsLabel" htmlFor="distractors">
                      <b>
                        <h5>Jugadas</h5>
                      </b>
                    </label>
                    <select
                      onChange={(e) => {
                        lengthEvalSequence.current = parseInt(e.target.value);
                        setCurrentSesionInfo({
                          ...currentSesionInfo,
                          numberOfPlays: e.target.value,
                        });
                      }}
                    >
                      {playsInfo.evaluativeOptions.length ? (
                        playsInfo.evaluativeList.length ? (
                          playsInfo.evaluativeOptions.map((option, index) => {
                            if (index === 0) {
                              lengthEvalSequence.current = parseInt(option);
                            }
                            return <option value={option}>{option}</option>;
                          })
                        ) : (
                          <option value="0">
                            No hay posibles secuencias para evaluación
                          </option>
                        )
                      ) : (
                        <option value="0">
                          No hay suficientes jugadas para evaluación
                        </option>
                      )}
                    </select>
                  </div>
                )}
              <div className="sessionPlaysValues">
                <input
                  className="sessionRandomSeed"
                  type="checkbox"
                  id="randomSeed"
                  name="randomSeed"
                  checked={currentSesionInfo?.isRandomSeed}
                  onChange={() => {
                    let checked = currentSesionInfo.isRandomSeed;
                    if (!checked) {
                      setCurrentSesionInfo({
                        ...currentSesionInfo,
                        seed: Math.floor(Math.random() * (6000 - 1)) + 1,
                        isRandomSeed: !checked,
                      });
                    } else {
                      setCurrentSesionInfo({
                        ...currentSesionInfo,
                        isRandomSeed: !checked,
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
                  value={currentSesionInfo?.seed}
                  readOnly={currentSesionInfo?.isRandomSeed}
                  onChange={(e) => {
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      seed: parseInt(e.target.value),
                    });
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
                  value={currentSesionInfo?.secondsToNextPlay}
                  onChange={(e) => {
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      secondsToNextPlay: parseFloat(e.target.value),
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
                  min="0"
                  step="0.05"
                  defaultValue={
                    currentSesionInfo?.secondsForPlayTransition || 0
                  }
                  onChange={(e) => {
                    setCurrentSesionInfo({
                      ...currentSesionInfo,
                      secondsForPlayTransition: parseFloat(e.target.value),
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
                value={
                  currentSesionInfo?.sequenceOfPlays?.length
                    ? currentSesionInfo?.sequenceOfPlays?.join(" → ")
                    : ""
                }
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
                      playerSelected: parseInt(e.target.value),
                    });
                  }}
                  value={currentSesionInfo?.playerSelected}
                >
                  {playersList.length ? (
                    <option value="default" disabled="disabled">
                      Seleccionar un jugador
                    </option>
                  ) : (
                    <option value="default" disabled="disabled">
                      Cargando jugadores...
                    </option>
                  )}
                  {playersList.map((player, key) => (
                    <option value={parseInt(player.playerId)} key={key}>
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
                      currentSesionInfo?.playerSelected &&
                      currentSesionInfo?.playerSelected === "default"
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
                      currentSesionInfo?.playerSelected &&
                      currentSesionInfo?.playerSelected === "default"
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
