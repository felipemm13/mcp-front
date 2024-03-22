/* eslint-disable */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "../styles/AnalizeSession.css";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../services/Context";
import AWS from "aws-sdk";
import ReactPlayer from "react-player";
import Swal from "sweetalert2";
import axios from "axios";

const AnalizeSession = () => {
  const {
    urlVision,
    videoCurrentSession,
    isSaveCurrentSession,
    listOfPlayers,
    infoSession,
    currentFPS,
    CrudApi,
    currentSession,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    preloadImages,
    S3_BUCKET,
    REGION,
    userContext,
    showSessionType,
    currentCalibration,
    currentBackground,
  } = useContext(Context);
  const navigate = useNavigate();
  const session = useParams().session;
  const FPS = useRef(currentFPS.current ? currentFPS.current : 29.97);
  const currentPlayer = useRef(null);
  const [videoSession, setVideoSession] = useState(null);
  const [videoState, setVideoState] = useState("Play");
  const [currentFrame, setCurrentFrame] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [imagePlay, setImagePlay] = useState({
    currentPlay: null,
    prevPlay: null,
  });
  const [currentStimulus, setCurrentStimulus] = useState(0);
  const selectedRowIndex = useRef(0);
  const selectedPlayID = useRef(null);
  const [playingVideo, setPlayingVideo] = useState(false);
  const videoRefs = useRef([]);
  const [processing, setProcessing] = useState({
    value: false,
    message: "Procesar Pasos",
  });
  const [metrics, setMetrics] = useState({
    totalVisuMotor: 0,
    averageVisuMotor: 0,
    standardDeviationVisuMotor: 0,
    totalMotor: 0,
    averageMotor: 0,
    standardDeviationMotor: 0,
    totalCognitiveMotor: 0,
    averageCognitiveMotor: 0,
    standardDeviationCognitiveMotor: 0,
    correctPercentage: 0,
    errorPercentage: 0,
  });

  const initialData = Array.from({ length: 0 }, (_, index) => ({
    sequence: index + 1,
    playID: index + 1,
    error: false,
    estimulo: 0,
    decisionMaking: 0,
    arrival: 0,
    visuMotor: 0,
    motor: 0,
    cognitiveMotor: 0,
  }));

  const [tableData, setTableData] = useState(initialData);

  const handleCheckboxChange = (index) => {
    const newData = [...tableData];
    newData[index].error = !newData[index].error;
    setTableData(newData);
    updateMetrics();
  };

  const getVideoDuration = (blob) => {
    const videoTemp = document.createElement("video");
    const durationP = new Promise((resolve, reject) => {
      videoTemp.addEventListener("loadedmetadata", () => {
        if (videoTemp.duration === Infinity) {
          videoTemp.currentTime = Number.MAX_SAFE_INTEGER;
          videoTemp.ontimeupdate = () => {
            videoTemp.ontimeupdate = null;
            resolve(videoTemp.duration);
            videoTemp.currentTime = 0;
          };
        } else resolve(videoTemp.duration);
      });
      videoTemp.onerror = (event) => reject(event.target.error);
    });
    videoTemp.src =
      typeof blob === "string" || blob instanceof String
        ? blob
        : window.URL.createObjectURL(blob);
    durationP
      .then((d) => setVideoDuration(d))
      .catch((e) => console.log("error", e));
  };

  useEffect(() => {
    videoRefs.current = Array(5)
      .fill()
      .map((_, index) => videoRefs.current[index]);
    if (videoRefs.current.some((ref) => ref === undefined)) {
      navigate("/football-session");
      return;
    }
    videoRefs.current[0]?.seekTo(-2 / FPS.current, "seconds");
    videoRefs.current[1]?.seekTo(-1 / FPS.current, "seconds");
    videoRefs.current[2]?.seekTo(0 / FPS.current, "seconds");
    videoRefs.current[3]?.seekTo(1 / FPS.current, "seconds");
    videoRefs.current[4]?.seekTo(2 / FPS.current, "seconds");

    if (session === "current" && videoCurrentSession.current) {
      //infoSession.current.imageSequences.pop()
      const url = URL.createObjectURL(videoCurrentSession.current);
      currentPlayer.current = listOfPlayers.current.find(
        () => infoSession.current.playerSelected
      );
      getVideoDuration(url);
      //console.log(videoDuration);
      setVideoSession(url);
      setImagePlay({
        currentPlay: infoSession.current.imageSequences[0],
        prevPlay: infoSession.current.imageSequences[0],
      });

      setTableData(
        Array.from(
          { length: infoSession.current.sequenceOfPlays.length },
          (element, index) => ({
            sequence: index + 1,
            playID: infoSession.current.sequenceOfPlays[index],
            error: false,
            estimulo: infoSession.current.stimulusTime[index],
            decisionMaking: 0,
            arrival: 0,
            visuMotor: 0,
            motor: 0,
            cognitiveMotor: 0,
          })
        )
      );
    } else {
      if (currentSession.current === null) {
        navigate("/other-sessions");
        return;
      }
      FPS.current = currentSession.current[0].fps ?? 30;
      infoSession.current = {
        stimulusTime: currentSession.current[0].SessionMoves.map(
          (move) => move.stimulus
        ),
        imageSequences: currentSession.current[0].SessionMoves.map(
          (move) =>
            "https://mcp-wildsense.s3.us-east-2.amazonaws.com/" + move.imageUrl
        ),
        sequenceOfPlays: currentSession.current[0].SessionMoves.map(
          (move) => move.moveNum
        ),
        numberOfPlays: currentSession.current[0].numPlays,
      };
      infoSession.current.imageSequences.sort();
      preloadImages(infoSession.current.imageSequences);
      getAWSVideo();
    }
    updateMetrics();
  }, []);

  const getAWSVideo = async () => {
    AWS.config.update({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });
    let blob = await fetch(
      `https://mcp-wildsense.s3.us-east-2.amazonaws.com/${currentSession.current[0].videoURL}`
    )
      .then((r) => r.blob())
      .catch((err) => console.log(err));
    const url = URL.createObjectURL(blob);
    getVideoDuration(url);
    setVideoSession(url);
    setImagePlay({
      currentPlay: infoSession.current.imageSequences[0],
      prevPlay: infoSession.current.imageSequences[0],
    });
    if (infoSession.current) {
      infoSession.current.stimulusTime.sort((a, b) => a - b);
      currentSession.current[0].SessionMoves.sort(
        (a, b) => a.stimulus - b.stimulus
      );
      setTableData(
        Array.from(
          { length: infoSession.current.sequenceOfPlays.length },
          (element, index) => ({
            sequence: index + 1,
            playID: infoSession.current.sequenceOfPlays[index],
            error: currentSession.current[0].SessionMoves[index].error,
            estimulo: currentSession.current[0].SessionMoves[index].stimulus,
            decisionMaking:
              currentSession.current[0].SessionMoves[index].decisionMaking,
            arrival: currentSession.current[0].SessionMoves[index].arrival,
            visuMotor:
              currentSession.current[0].SessionMoves[index].presentedMs,
            motor: currentSession.current[0].SessionMoves[index].motor,
            cognitiveMotor:
              currentSession.current[0].SessionMoves[index].cognitiveMotor,
          })
        )
      );
    }
  };

  useEffect(() => {
    if (videoRefs.current.length) {
      if (currentFrame > 0) {
        const currentTime = Math.round((currentFrame / FPS.current) * 1000);
        const stimulusTime = infoSession.current.stimulusTime;
        let newStimulus = currentStimulus;

        for (let i = 0; i < stimulusTime.length; i++) {
          if (currentTime >= stimulusTime[i]) {
            newStimulus = i;
          } else {
            break;
          }
        }
        setCurrentStimulus(newStimulus);
        setTimeout(() => {
          setImagePlay({
            currentPlay: infoSession.current.imageSequences[newStimulus],
            prevPlay:
              infoSession.current.imageSequences[Math.max(0, newStimulus - 1)],
          });
        }, 0);

        if (videoState === "Play") {
          videoRefs.current[0].seekTo(
            (currentFrame - 2) / FPS.current,
            "seconds"
          );
          videoRefs.current[1].seekTo(
            (currentFrame - 1) / FPS.current,
            "seconds"
          );
          videoRefs.current[2].seekTo(currentFrame / FPS.current, "seconds");
          videoRefs.current[3].seekTo(
            (currentFrame + 1) / FPS.current,
            "seconds"
          );
          videoRefs.current[4].seekTo(
            (currentFrame + 2) / FPS.current,
            "seconds"
          );
        }
      } else {
        videoRefs.current[0]?.seekTo(0);
        videoRefs.current[1]?.seekTo(0);
        videoRefs.current[2]?.seekTo(0);
        videoRefs.current[3]?.seekTo(0);
        videoRefs.current[4]?.seekTo(0);
        setCurrentStimulus(0);
        setTimeout(() => {
          if (infoSession.current.imageSequences) {
            setImagePlay({
              currentPlay: infoSession.current.imageSequences[0],
              prevPlay: infoSession.current.imageSequences[0],
            });
          }
        }, 0);
      }
    }
  }, [currentFrame]);

  const handleRowClick = (index, playID) => {
    const previousSelectedRow = document.getElementById(
      `RowSequenceIndex${selectedRowIndex.current}`
    );
    const selectedRow = document.getElementById(`RowSequenceIndex${index}`);
    if (previousSelectedRow) {
      previousSelectedRow.style.background = "#1a1a1a";
      previousSelectedRow.style.color = "white";
    }

    if (selectedRowIndex.current === index) {
      selectedRowIndex.current = null;
      selectedPlayID.current = null;
      document.getElementById("SaveAnalizeSession").disabled = true;
      document.getElementById("AddDecisionMakingMark").disabled = true;
      document.getElementById("AddArrivalMark").disabled = true;
    } else {
      selectedRow.style.background = "rgb(255, 255, 255, 0.75)";
      selectedRow.style.color = "black";
      selectedRowIndex.current = index;
      selectedPlayID.current = playID;
      document.getElementById("SaveAnalizeSession").disabled = false;
      document.getElementById("AddDecisionMakingMark").disabled = false;
      document.getElementById("AddArrivalMark").disabled = false;
    }
  };

  const AddDecisionMakingMark = () => {
    const decisionMakingRow = document.getElementById(
      `RowSequenceDecisionMaking${selectedRowIndex.current}`
    );
    const visuMotorRow = document.getElementById(
      `RowSequenceVisuMotor${selectedRowIndex.current}`
    );
    const motorRow = document.getElementById(
      `RowSequenceMotor${selectedRowIndex.current}`
    );
    const stimulRow = document.getElementById(
      `RowSequenceStimul${selectedRowIndex.current}`
    );
    const cognitiveMotorRow = document.getElementById(
      `RowSequenceCognitiveMotor${selectedRowIndex.current}`
    );

    if (decisionMakingRow) {
      const newDecisionMakingValue = Math.round(
        (currentFrame / FPS.current) * 1000
      );
      const existingDecisionMakingValue = parseInt(decisionMakingRow.innerHTML);

      if (existingDecisionMakingValue !== 0) {
        Swal.fire({
          title: "Valor Existente",
          text: "Ya existe un valor en la fila de Decision Making. ¿Desea reemplazarlo?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, reemplazar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            updateDecisionMakingValue(newDecisionMakingValue);
          }
        });
      } else {
        updateDecisionMakingValue(newDecisionMakingValue);
      }
    }

    function updateDecisionMakingValue(newValue) {
      decisionMakingRow.innerHTML = newValue;
      visuMotorRow.innerHTML = newValue - parseInt(stimulRow.innerHTML);

      if (
        parseInt(visuMotorRow.innerHTML) > 0 &&
        parseInt(motorRow.innerHTML) > 0
      ) {
        cognitiveMotorRow.innerHTML =
          parseInt(motorRow.innerHTML) + parseInt(visuMotorRow.innerHTML);
      }

      updateMetrics();
    }
  };

  const AddArrivalMark = () => {
    const currentRowIndex = selectedRowIndex.current;

    const arrivalRow = document.getElementById(
      `RowSequenceArrival${currentRowIndex}`
    );
    const decisionMakingRow = document.getElementById(
      `RowSequenceDecisionMaking${currentRowIndex}`
    );
    const visuMotorRow = document.getElementById(
      `RowSequenceVisuMotor${currentRowIndex}`
    );
    const motorRow = document.getElementById(
      `RowSequenceMotor${currentRowIndex}`
    );
    const cognitiveMotorRow = document.getElementById(
      `RowSequenceCognitiveMotor${currentRowIndex}`
    );

    if (arrivalRow) {
      const newArrivalValue = Math.round((currentFrame / FPS.current) * 1000);
      const existingArrivalValue = parseInt(arrivalRow.innerHTML);

      if (existingArrivalValue !== 0) {
        Swal.fire({
          title: "Valor Existente",
          text: "Ya existe un valor en la fila de Arrival. ¿Desea reemplazarlo?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Sí, reemplazar",
          cancelButtonText: "Cancelar",
        }).then((result) => {
          if (result.isConfirmed) {
            updateArrivalValue(newArrivalValue);
          }
        });
      } else {
        updateArrivalValue(newArrivalValue);
      }
    }

    function updateArrivalValue(newValue) {
      arrivalRow.innerHTML = newValue;
      if (parseInt(decisionMakingRow.innerHTML) > 0) {
        motorRow.innerHTML =
          parseInt(arrivalRow.innerHTML) -
          parseInt(decisionMakingRow.innerHTML);
      }
      if (
        parseInt(visuMotorRow.innerHTML) > 0 &&
        parseInt(motorRow.innerHTML) > 0
      ) {
        cognitiveMotorRow.innerHTML =
          parseInt(motorRow.innerHTML) + parseInt(visuMotorRow.innerHTML);
      }
      const currentSelectedRow = document.getElementById(
        `RowSequenceIndex${currentRowIndex}`
      );
      const nextSelectedRow = document.getElementById(
        `RowSequenceIndex${currentRowIndex + 1}`
      );

      if (currentSelectedRow) {
        currentSelectedRow.style.background = "#1a1a1a";
        currentSelectedRow.style.color = "white";
      }

      if (nextSelectedRow) {
        nextSelectedRow.style.background = "rgb(255, 255, 255, 0.75)";
        nextSelectedRow.style.color = "black";
        selectedRowIndex.current++;
      }
    }
  };

  const getTotalMetrics = (metric) => {
    if (
      session !== "current" &&
      currentSession.current[0].SessionAnalytics[0] &&
      currentSession.current[0].SessionAnalytics[0].motorTotal !== 0 &&
      currentSession.current[0].SessionAnalytics[0].responseTotal !== 0 &&
      currentSession.current[0].SessionAnalytics[0].visuMotorTotal !== 0
    ) {
      switch (metric) {
        case "Motor":
          return currentSession.current[0].SessionAnalytics[0].motorTotal;
        case "CognitiveMotor":
          return currentSession.current[0].SessionAnalytics[0].responseTotal;
        case "VisuMotor":
          return currentSession.current[0].SessionAnalytics[0].visuMotorTotal;
        default:
          return 0;
      }
    } else {
      let total = 0;
      for (let i = 0; i < tableData.length; i++) {
        total +=
          document.getElementById(`RowSequence${metric}${i}`) &&
          parseInt(
            document.getElementById(`RowSequence${metric}${i}`).innerHTML
          );
      }
      return total;
    }
  };

  const getAverageMetrics = (metric) => {
    if (
      session !== "current" &&
      currentSession.current[0].SessionAnalytics[0] &&
      currentSession.current[0].SessionAnalytics[0].motorMean !== 0 &&
      currentSession.current[0].SessionAnalytics[0].responseMean !== 0 &&
      currentSession.current[0].SessionAnalytics[0].visuMotorMean !== 0
    ) {
      switch (metric) {
        case "Motor":
          return currentSession.current[0].SessionAnalytics[0].motorMean;
        case "CognitiveMotor":
          return currentSession.current[0].SessionAnalytics[0].responseMean;
        case "VisuMotor":
          return currentSession.current[0].SessionAnalytics[0].visuMotorMean;
        default:
          return 0;
      }
    } else {
      let total = 0;
      let average = 0;
      if (tableData.length > 0) {
        for (let i = 0; i < tableData.length; i++) {
          total += parseInt(
            document.getElementById(`RowSequence${metric}${i}`).innerHTML
          );
        }
        average = total / tableData.length;
        return Math.floor(average);
      } else {
        return 0;
      }
    }
  };

  const getStandardDeviationMetrics = (metric) => {
    if (
      session !== "current" &&
      currentSession.current[0].SessionAnalytics[0] &&
      currentSession.current[0].SessionAnalytics[0].motorSd !== 0 &&
      currentSession.current[0].SessionAnalytics[0].responseSd !== 0 &&
      currentSession.current[0].SessionAnalytics[0].visuMotorSd !== 0
    ) {
      switch (metric) {
        case "Motor":
          return currentSession.current[0].SessionAnalytics[0].motorSd;
        case "CognitiveMotor":
          return currentSession.current[0].SessionAnalytics[0].responseSd;
        case "VisuMotor":
          return currentSession.current[0].SessionAnalytics[0].visuMotorSd;
        default:
          return 0;
      }
    } else {
      let total = 0;
      let average = 0;
      let standardDeviation = 0;
      if (tableData.length > 0) {
        for (let i = 0; i < tableData.length; i++) {
          total += parseInt(
            document.getElementById(`RowSequence${metric}${i}`).innerHTML
          );
        }
        average = total / tableData.length;
        for (let i = 0; i < tableData.length; i++) {
          standardDeviation += Math.pow(
            parseInt(
              document.getElementById(`RowSequence${metric}${i}`).innerHTML
            ) - average,
            2
          );
        }
        return (
          Math.floor(Math.sqrt(standardDeviation / tableData.length) * 100) /
          100
        );
      } else {
        return 0;
      }
    }
  };

  const getCorrectPercentage = () => {
    let error = getErrorPercentage();
    if (error) {
      return Math.floor(100 - error);
    } else {
      return 100;
    }
  };

  const getErrorPercentage = () => {
    let error = 0;
    if (tableData.length > 0) {
      for (let i = 0; i < tableData.length; i++) {
        if (document.getElementById(`RowSequenceError${i}`).checked) {
          error += 1;
        }
      }
      let errorPercentage = (error / tableData.length) * 100;
      if (errorPercentage) {
        return Math.floor(errorPercentage);
      } else {
        return 0;
      }
    } else {
      return 0;
    }
  };

  const padZero = (value) => {
    return value < 10 ? "0" + value : value;
  };

  const saveCurrentSession = async () => {
    document
      .getElementById("SaveAnalizeSession")
      .setAttribute("disabled", "true");
    document.getElementById("SaveAnalizeSession").innerText =
      "Guardando información...";
    const currentDate = new Date();
    const sessionDate =
      padZero(currentDate.getFullYear()) +
      "-" +
      padZero(currentDate.getMonth() + 1) +
      "-" +
      padZero(currentDate.getDate()) +
      "/" +
      padZero(currentDate.getHours()) +
      "_" +
      padZero(currentDate.getMinutes()) +
      "_" +
      padZero(currentDate.getSeconds());
    var video = new File(
      [videoCurrentSession.current],
      `${sessionDate}-player${infoSession.current.playerSelected}.mp4`,
      {
        type: "video/webm",
      }
    );
    var images = infoSession.current.imageSequences.map((image) => {
      const byteCharacters = atob(image.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new File(
        [byteArray],
        `${sessionDate}/player${infoSession.current.playerSelected}`,
        {
          type: "image/jpeg",
        }
      );
    });

    AWS.config.update({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });
    const s3 = new AWS.S3({
      params: { Bucket: S3_BUCKET },
      region: REGION,
    });

    const videoURL = `videos/${userContext.current.userId}/${video.name}`;

    const imagesUrls = infoSession.current.imageSequences.map(
      (image, index) => {
        return `images/${userContext.current.userId}/${images[index].name}-play${index}.jpg`;
      }
    );

    const paramsVideo = {
      ACL: "public-read",
      Bucket: S3_BUCKET,
      Key: videoURL,
      Body: video,
      ContentType: video.type,
    };
    const sessionData = {
      userId: userContext.current.userId,
      playerId: parseInt(infoSession.current.playerSelected),
      timestamp: currentDate.toISOString(),
      duration: 0,
      numPlays: infoSession.current.numberOfPlays,
      seed: infoSession.current.seed,
      sessionType: infoSession.current.typeOfSession,
      timeBetweenPlays: infoSession.current.secondsToNextPlay,
      transitionTime: infoSession.current.secondsForPlayTransition,
      videoURL: videoURL,
      numDistractors: infoSession.current.numOfDistractors,
      fps: currentFPS.current,
      calibration: currentCalibration.current,
    };
    const sessionAnalyticData = {
      complete: 0,
      correctPercentage: getCorrectPercentage(),
      motorMean: getAverageMetrics("Motor"),
      motorSd: getStandardDeviationMetrics("Motor"),
      motorTotal: getTotalMetrics("Motor"),
      responseMean: getAverageMetrics("CognitiveMotor"),
      responseSd: getStandardDeviationMetrics("CognitiveMotor"),
      responseTotal: getTotalMetrics("CognitiveMotor"),
      visuMotorMean: getAverageMetrics("VisuMotor"),
      visuMotorSd: getStandardDeviationMetrics("VisuMotor"),
      visuMotorTotal: getTotalMetrics("VisuMotor"),
      wrongPercentage: getErrorPercentage(),
    };
    const movesTableRows = document.querySelectorAll(".scrollable-body tr");
    const updatedTableData = Array.from(movesTableRows).map((row, index) => ({
      playID: index + 1,
      error: row.querySelector(`input[type="checkbox"]`).checked,
      estimulo: row.querySelector(`#RowSequenceStimul${index}`).innerText,
      decisionMaking: row.querySelector(`#RowSequenceDecisionMaking${index}`)
        .innerText,
      arrival: row.querySelector(`#RowSequenceArrival${index}`).innerText,
      visuMotor: row.querySelector(`#RowSequenceVisuMotor${index}`).innerText,
      motor: row.querySelector(`#RowSequenceMotor${index}`).innerText,
      cognitiveMotor: row.querySelector(`#RowSequenceCognitiveMotor${index}`)
        .innerText,
    }));
    const sessionMovesData = updatedTableData.map((row, index) => ({
      moveNum: row.playID,
      arrival: row.arrival,
      cognitiveMotor: row.cognitiveMotor,
      error: row.error,
      imageUrl: imagesUrls[index],
      motor: row.motor,
      presentedMs: row.visuMotor,
      stimulus: row.estimulo,
      decisionMaking: row.decisionMaking,
    }));
    await CrudApi.post("sessions", sessionData)
      .then(async (res) => {
        await CrudApi.post(`sessionAnalytics`, {
          ...sessionAnalyticData,
          sessionId: res.data.sessionId,
        }).then(async () => {});
        sessionMovesData.forEach(async (move) => {
          await CrudApi.post(`sessionMoves`, {
            ...move,
            sessionId: res.data.sessionId,
          }).then(async () => {});
        });
        images.forEach((image, index) => {
          const paramsImage = {
            ACL: "public-read",
            Bucket: S3_BUCKET,
            Key: imagesUrls[index],
            Body: image,
            ContentType: image.type,
          };
          s3.putObject(paramsImage)
            .on("httpUploadProgress", (evt) => {
              document.getElementById("SaveAnalizeSession").innerText =
                "Subiendo Imagen " +
                parseInt((evt.loaded * 100) / evt.total) +
                "%";
            })
            .promise();
        });
        var upload = s3
          .putObject(paramsVideo)
          .on("httpUploadProgress", (evt) => {
            document.getElementById("SaveAnalizeSession").innerText =
              "Subiendo Video " +
              parseInt((evt.loaded * 100) / evt.total) +
              "%";
          })
          .promise();

        await upload.then(() => {
          document.getElementById("SaveAnalizeSession").innerText = `
          Guardado Exitosamente`;
          document.getElementById("SaveAnalizeSession").disabled = false;
          isSaveCurrentSession.current = true;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const SaveAnalizeSession = async () => {
    if (session === "current" && !isSaveCurrentSession.current) {
      saveCurrentSession();
    } else {
      const dataAnalytic = {
        sessionId: currentSession.current[0].sessionId,
        complete: checkSessionCompleteness(),
        correctPercentage: getCorrectPercentage(),
        motorMean: getAverageMetrics("Motor"),
        motorSd: getStandardDeviationMetrics("Motor"),
        motorTotal: getTotalMetrics("Motor"),
        responseMean: getAverageMetrics("CognitiveMotor"),
        responseSd: getStandardDeviationMetrics("CognitiveMotor"),
        responseTotal: getTotalMetrics("CognitiveMotor"),
        visuMotorMean: getAverageMetrics("VisuMotor"),
        visuMotorSd: getStandardDeviationMetrics("VisuMotor"),
        visuMotorTotal: getTotalMetrics("VisuMotor"),
        wrongPercentage: getErrorPercentage(),
      };
      document.getElementById("SaveAnalizeSession").disabled = true;
      document.getElementById("SaveAnalizeSession").innerHTML =
        "Guardando información...";

      await CrudApi.update(
        `sessionAnalytics/${currentSession.current[0].SessionAnalytics[0].sessionAnalyticId}`,
        dataAnalytic
      ).then((response) => {});
      const movesTableRows = document.querySelectorAll(".scrollable-body tr");
      const updatedTableData = Array.from(movesTableRows).map((row, index) => ({
        error: row.querySelector(`input[type="checkbox"]`).checked,
        playID: index + 1,
        estimulo: row.querySelector(`#RowSequenceStimul${index}`).innerText,
        decisionMaking: row.querySelector(`#RowSequenceDecisionMaking${index}`)
          .innerText,
        arrival: row.querySelector(`#RowSequenceArrival${index}`).innerText,
        visuMotor: row.querySelector(`#RowSequenceVisuMotor${index}`).innerText,
        motor: row.querySelector(`#RowSequenceMotor${index}`).innerText,
        cognitiveMotor: row.querySelector(`#RowSequenceCognitiveMotor${index}`)
          .innerText,
      }));
      const dataMoves = updatedTableData.map((row, index) => ({
        sessionId: currentSession.current[0].sessionId,
        moveNum: row.playID,
        arrival: row.arrival,
        cognitiveMotor: row.cognitiveMotor,
        error: row.error,
        motor: row.motor,
        presentedMs: row.visuMotor,
        stimulus: row.estimulo,
        decisionMaking: row.decisionMaking,
      }));
      console.log(updatedTableData, dataMoves);
      currentSession.current[0].SessionMoves.map(async (move, index) => {
        await CrudApi.update(
          `sessionMoves/${move.sessionMovesId}`,
          dataMoves[index]
        ).then((response) => {
          document.getElementById("SaveAnalizeSession").innerHTML =
            "Guardado Exitosamente";
          document.getElementById("SaveAnalizeSession").disabled = false;
        });
      });
    }
  };

  const updateMetrics = () => {
    setMetrics({
      totalVisuMotor: getTotalMetrics("VisuMotor"),
      averageVisuMotor: getAverageMetrics("VisuMotor"),
      standardDeviationVisuMotor: getStandardDeviationMetrics("VisuMotor"),
      totalMotor: getTotalMetrics("Motor"),
      averageMotor: getAverageMetrics("Motor"),
      standardDeviationMotor: getStandardDeviationMetrics("Motor"),
      totalCognitiveMotor: getTotalMetrics("CognitiveMotor"),
      averageCognitiveMotor: getAverageMetrics("CognitiveMotor"),
      standardDeviationCognitiveMotor:
        getStandardDeviationMetrics("CognitiveMotor"),
      correctPercentage: getCorrectPercentage(),
      errorPercentage: getErrorPercentage(),
    });
  };

  const checkSessionCompleteness = () => {
    const tableRows = document.querySelectorAll(".scrollable-body tr");
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      const visuMotor = parseInt(
        row.querySelector(`#RowSequenceVisuMotor${i}`).textContent
      );
      const motor = parseInt(
        row.querySelector(`#RowSequenceMotor${i}`).textContent
      );
      const cognitiveMotor = parseInt(
        row.querySelector(`#RowSequenceCognitiveMotor${i}`).textContent
      );
      if (visuMotor === 0 || motor === 0 || cognitiveMotor === 0) {
        return 0;
      }
    }
    return 1;
  };

  const clearAnalysis = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "¿Deseas borrar los valores de Decision Making y Arrival de todas las filas?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, borrar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        const rowCount = tableData.length;
        for (let i = 0; i < rowCount; i++) {
          const decisionMakingRow = document.getElementById(
            `RowSequenceDecisionMaking${i}`
          );
          const arrivalRow = document.getElementById(`RowSequenceArrival${i}`);
          const visuMotorRow = document.getElementById(
            `RowSequenceVisuMotor${i}`
          );
          const motorRow = document.getElementById(`RowSequenceMotor${i}`);
          const cognitiveMotorRow = document.getElementById(
            `RowSequenceCognitiveMotor${i}`
          );
          const errorRow = document.getElementById(`RowSequenceError${i}`);
          if (decisionMakingRow) decisionMakingRow.innerHTML = "0";
          if (arrivalRow) arrivalRow.innerHTML = "0";
          if (visuMotorRow) visuMotorRow.innerHTML = "0";
          if (motorRow) motorRow.innerHTML = "0";
          if (cognitiveMotorRow) cognitiveMotorRow.innerHTML = "0";
          if (errorRow) errorRow.checked = false;
        }
        Swal.fire(
          "¡Borrado!",
          "Los valores de Análisis han sido borrados exitosamente.",
          "success"
        );
      }
    });
  };

  const autoAnalysis = async () => {
    // verificar si hay valores de arrival y decision making en por lo menos una fila
    const tableRows = document.querySelectorAll(".scrollable-body tr");
    let hasValues = false;
    for (let i = 0; i < tableRows.length; i++) {
      const row = tableRows[i];
      const decisionMaking = parseInt(
        row.querySelector(`#RowSequenceDecisionMaking${i}`).textContent
      );
      const arrival = parseInt(
        row.querySelector(`#RowSequenceArrival${i}`).textContent
      );
      if (decisionMaking !== 0 || arrival !== 0) {
        hasValues = true;
        break;
      }
    }
    if (hasValues) {
      Swal.fire({
        title: "¿Estás seguro?",
        text: "¿Deseas sobreescribir los valores de analisis actuales?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Sí, sobreescribir",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await processingSteps();
        }
      });
    } else {
      await processingSteps();
    }
  };
  const processingSteps = async () => {
    document.getElementById("AutoAnalysis").disabled = true;
    setProcessing({ value: true, message: "Procesando..." });
    console.log(currentSession.current[0]);
    let dataAutoAnalysis = {};
    if (session === "current") {
      console.log("sesion actual");
    } else {
      let marks = currentSession.current[0].SessionMoves.map((move) => ({
        mark_correct: move.correctResponse,
        frame: Math.round(
          (move.stimulus * currentSession.current[0].fps) / 1000
        ),
      }));
      dataAutoAnalysis = {
        contourjson: JSON.stringify(currentSession.current[0].calibration),
        videoUrl:
          "https://mcp-wildsense.s3.us-east-2.amazonaws.com/" +
          currentSession.current[0].videoURL,
        imageUrl:
          "https://mcp-wildsense.s3.us-east-2.amazonaws.com/" +
          currentSession.current[0].imageCalibration,
        jsonString: JSON.stringify(marks),
      };
      console.log(dataAutoAnalysis);

      await axios
        .post(`${urlVision}autoAnalysis`, dataAutoAnalysis, {
          timeout: 240000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        })
        .then(
          (response) => {
            setProcessing({ value: false, message: "Procesar Pasos" });
            document.getElementById("AutoAnalysis").disabled = false;
            refillAnalysisTable(JSON.parse(response.data.response.output));
          },
          (error) => {
            console.log(error);
          }
        );
    }
  };

  const refillAnalysisTable = (data) => {
    //console.log(data);
    const updatedData = tableData.map((row, index) => {
      if (index < data.length) {
        const newRow = data[index];
        //ver frames totales del video para no excederse
        return {
          ...row,
          arrival: newRow.arrival_frame,
          decisionMaking: newRow.takeoff_frame
        };
      } else {
        return row;
      }
    });
    setTableData(updatedData);
    console.log(updatedData)
  };

  if (!infoSession?.current?.stimulusTime) {
    if (session !== "current") {
      if (currentSession.current === null) {
        navigate("/other-sessions");
        return;
      } else {
        infoSession.current = {
          stimulusTime: currentSession.current[0].SessionMoves.map(
            (move) => move.stimulus
          ),
        };
      }
    }
  }
  return (
    <div className="AnalizeSessionContainer">
      <button
        className="AnalizeSessionBackButton"
        onClick={() => {
          if (session === "current") {
            navigate("/football-session");
          } else {
            infoSession.current = null;
            navigate("/other-sessions");
          }
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
      <div className="AnalizeSessionVideoContainer">
        <div className="AnalizeSessionVideoInfoSessionContainer">
          <div className="AnalizeSessionVideoInfoSession">
            <div className="">
              <label>Tipo de sesión: </label>
              <input
                className="AnalizeSessionInputInfo"
                type="text"
                readOnly
                disabled
                value={
                  session !== "current"
                    ? currentSession.current[0]
                      ? showSessionType(currentSession.current[0].sessionType)
                      : ""
                    : showSessionType(infoSession.current.typeOfSession)
                }
              ></input>
              <label>Grupo: </label>
              <input
                className="AnalizeSessionInputInfo"
                type="text"
                readOnly={true}
                style={{ width: "50%" }}
                value={
                  session !== "current"
                    ? currentSession.current[1]
                      ? currentSession.current[1].SportGroup
                      : ""
                    : currentPlayer.current
                    ? currentPlayer.current.SportGroup
                    : ""
                }
              ></input>
            </div>
            <div className="">
              <label>Nombre: </label>
              <input
                className="AnalizeSessionInputInfo"
                type="text"
                readOnly
                disabled
                value={
                  session !== "current"
                    ? currentSession.current[1]
                      ? currentSession.current[1].Name
                      : ""
                    : currentPlayer.current
                    ? currentPlayer.current.Name
                    : ""
                }
              ></input>
              <label>Apellido: </label>
              <input
                className="AnalizeSessionInputInfo"
                type="text"
                readOnly
                disabled
                value={
                  session !== "current"
                    ? currentSession.current[1]
                      ? currentSession.current[1].Surname
                      : ""
                    : currentPlayer.current
                    ? currentPlayer.current.Surname
                    : ""
                }
              ></input>
              <label>Fecha: </label>
              <input
                className="AnalizeSessionInputInfo"
                type="text"
                readOnly
                disabled
                value={
                  session !== "current"
                    ? currentSession.current[0]
                      ? currentSession.current[0].timestamp.split("T")[0]
                      : ""
                    : new Date().toISOString().split("T")[0]
                }
              ></input>
            </div>
          </div>
          <div className="AnalizeSessionVideoInfoSessionFrames">
            <div className="AnalizeSessionVideoFrame">
              <div className="AnalizeSessionVideoFrameLabelsInputs">
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Frame </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={currentFrame - 2 > 0 ? currentFrame - 2 : 0}
                  />
                </div>
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Tiempo[ms] </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={Math.max(
                      Math.round(((currentFrame - 2) / FPS.current) * 1000),
                      0
                    )}
                  />
                </div>
              </div>
              {loading && (
                <svg
                  width="40"
                  height="40"
                  stroke="#DA2599"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="loading"
                >
                  <g className="spinner_V8m1">
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      fill="none"
                      strokeWidth="3"
                    ></circle>
                  </g>
                </svg>
              )}
              <ReactPlayer
                playing={playingVideo}
                ref={(videoRef) => (videoRefs.current[0] = videoRef)}
                id="VideoPlayers"
                width={"90%"}
                height={"100%"}
                url={videoSession}
                playdelay={-66}
              />
            </div>

            <div className="AnalizeSessionVideoFrame">
              <div className="AnalizeSessionVideoFrameLabelsInputs">
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Frame </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={currentFrame - 1 > 0 ? currentFrame - 1 : 0}
                  />
                </div>
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Tiempo[ms] </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={Math.max(
                      Math.round(((currentFrame - 1) / FPS.current) * 1000),
                      0
                    )}
                  />
                </div>
              </div>
              {loading && (
                <svg
                  width="40"
                  height="40"
                  stroke="#DA2599"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="loading"
                >
                  <g className="spinner_V8m1">
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      fill="none"
                      strokeWidth="3"
                    ></circle>
                  </g>
                </svg>
              )}

              <ReactPlayer
                playing={playingVideo}
                ref={(videoRef) => (videoRefs.current[1] = videoRef)}
                id="VideoPlayers"
                width={"90%"}
                height={"100%"}
                url={videoSession}
                playdelay={-33}
              />
            </div>
          </div>
        </div>
        <div className="AnalizeSessionVideoCentralFrameContainer">
          <div className="AnalizeSessionVideoCentralFrame">
            <div className="AnalizeSessionVideoFrameLabelsInputs">
              <div className="AnalizeSessionVideoFrameLabelInput">
                <label>Frame </label>
                <input
                  className="AnalizeSessionInputFrame"
                  id="sessionType"
                  type="text"
                  readOnly={true}
                  disabled={true}
                  value={currentFrame}
                />
              </div>
              <div className="AnalizeSessionVideoFrameLabelInput">
                <label>Tiempo[ms] </label>
                <input
                  className="AnalizeSessionInputFrame"
                  id="sessionType"
                  type="text"
                  readOnly={true}
                  disabled={true}
                  value={Math.round((currentFrame / FPS.current) * 1000)}
                />
              </div>
            </div>

            <ReactPlayer
              onProgress={(e) =>
                setCurrentFrame(Math.round(e.playedSeconds * FPS.current))
              }
              progressInterval={1}
              ref={(videoRef) => (videoRefs.current[2] = videoRef)}
              onEnded={() => {
                setPlayingVideo(false);
                setVideoState("Play");
              }}
              onReady={() => setLoading(false)}
              playing={playingVideo}
              id="VideoPlayers"
              width={"100%"}
              height={"100%"}
              url={videoSession}
            />
          </div>
          <div className="AnalizeSessionVideoCentralFrameControl">
            <button
              data-tooltip={`Retroceder Estimulo`}
              className="AnalizeSessionVideoCentralFrameButton"
              onClick={() => {
                if (currentStimulus - 1 > 0) {
                  let toFrame = Math.round(
                    (infoSession.current.stimulusTime[currentStimulus - 1] /
                      1000) *
                      FPS.current
                  );
                  videoRefs.current[2].seekTo(
                    infoSession.current.stimulusTime[currentStimulus - 1] / 1000
                  );
                  if (
                    Math.round((toFrame / FPS.current) * 1000) <
                    infoSession.current.stimulusTime[currentStimulus - 1]
                  ) {
                    setCurrentFrame(
                      Math.round(
                        videoRefs.current[2].getCurrentTime() * FPS.current
                      ) + 1
                    );
                  } else {
                    setCurrentFrame(
                      Math.round(
                        videoRefs.current[2].getCurrentTime() * FPS.current
                      )
                    );
                  }
                } else {
                  videoRefs.current[2].seekTo(0);
                  setCurrentFrame(
                    Math.round(
                      videoRefs.current[2].getCurrentTime() * FPS.current
                    )
                  );
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                width="24"
                viewBox="0 0 512 512"
              >
                <path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3V256v41.7L459.5 440.6zM256 352V256 128 96c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29V352z" />
              </svg>
            </button>
            <button
              data-tooltip={`Frame Anterior`}
              className="AnalizeSessionVideoCentralFrameButton"
              onClick={() => {
                if (videoState === "Pause") {
                  setVideoState("Play");
                }
                if (currentFrame - 1 > 0) {
                  setCurrentFrame(currentFrame - 1);
                } else {
                  setCurrentFrame(0);
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                width="12"
                viewBox="0 0 256 512"
              >
                <path d="M9.4 278.6c-12.5-12.5-12.5-32.8 0-45.3l128-128c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 256c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-128-128z" />
              </svg>
            </button>
            <button
              data-tooltip={`Marca Anterior`}
              className="AnalizeSessionVideoCentralFrameButton"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                width="24"
                viewBox="0 0 512 512"
              >
                <path d="M493.6 445c-11.2 5.3-24.5 3.6-34.1-4.4L288 297.7V416c0 12.4-7.2 23.7-18.4 29s-24.5 3.6-34.1-4.4L64 297.7V416c0 17.7-14.3 32-32 32s-32-14.3-32-32V96C0 78.3 14.3 64 32 64s32 14.3 32 32V214.3L235.5 71.4c9.5-7.9 22.8-9.7 34.1-4.4S288 83.6 288 96V214.3L459.5 71.4c9.5-7.9 22.8-9.7 34.1-4.4S512 83.6 512 96V416c0 12.4-7.2 23.7-18.4 29z" />
              </svg>
            </button>
            <button
              data-tooltip={videoState}
              className="AnalizeSessionVideoCentralFrameButton"
              onClick={() => {
                if (videoState === "Play") {
                  setVideoState("Pause");
                  setPlayingVideo(true);
                } else {
                  setVideoState("Play");
                  setPlayingVideo(false);
                }
              }}
            >
              {videoState === "Play" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  width="24"
                  viewBox="0 0 512 512"
                >
                  <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9V168c0-8.7 4.7-16.7 12.3-20.9z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  width="24"
                  viewBox="0 0 512 512"
                >
                  <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm224-72V328c0 13.3-10.7 24-24 24s-24-10.7-24-24V184c0-13.3 10.7-24 24-24s24 10.7 24 24zm112 0V328c0 13.3-10.7 24-24 24s-24-10.7-24-24V184c0-13.3 10.7-24 24-24s24 10.7 24 24z" />
                </svg>
              )}
            </button>
            <button
              data-tooltip={`Marca Siguiente`}
              className="AnalizeSessionVideoCentralFrameButton"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                width="24"
                viewBox="0 0 512 512"
              >
                <path d="M18.4 445c11.2 5.3 24.5 3.6 34.1-4.4L224 297.7V416c0 12.4 7.2 23.7 18.4 29s24.5 3.6 34.1-4.4L448 297.7V416c0 17.7 14.3 32 32 32s32-14.3 32-32V96c0-17.7-14.3-32-32-32s-32 14.3-32 32V214.3L276.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S224 83.6 224 96V214.3L52.5 71.4c-9.5-7.9-22.8-9.7-34.1-4.4S0 83.6 0 96V416c0 12.4 7.2 23.7 18.4 29z" />
              </svg>
            </button>
            <button
              data-tooltip={`Frame Siguiente`}
              className="AnalizeSessionVideoCentralFrameButton"
              onClick={() => {
                if (videoState === "Pause") {
                  setVideoState("Play");
                }
                if (
                  currentFrame + 1 <
                  Math.round(videoDuration * FPS.current)
                ) {
                  setCurrentFrame(currentFrame + 1);
                } else {
                  setCurrentFrame(Math.round(videoDuration * FPS.current));
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                width="12"
                viewBox="0 0 256 512"
              >
                <path d="M246.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-9.2-9.2-22.9-11.9-34.9-6.9s-19.8 16.6-19.8 29.6l0 256c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l128-128z" />
              </svg>
            </button>
            <button
              data-tooltip={`Avanzar Estimulo`}
              className="AnalizeSessionVideoCentralFrameButton"
              onClick={() => {
                if (
                  currentStimulus + 1 <
                  infoSession.current.stimulusTime.length - 1
                ) {
                  let toFrame = Math.round(
                    (infoSession.current.stimulusTime[currentStimulus + 1] /
                      1000) *
                      FPS.current
                  );
                  videoRefs.current[2].seekTo(
                    infoSession.current.stimulusTime[currentStimulus + 1] / 1000
                  );
                  if (
                    Math.round((toFrame / FPS.current) * 1000) <
                    infoSession.current.stimulusTime[currentStimulus + 1]
                  ) {
                    setCurrentFrame(
                      Math.round(
                        videoRefs.current[2].getCurrentTime() * FPS.current
                      ) + 1
                    );
                  } else {
                    setCurrentFrame(
                      Math.round(
                        videoRefs.current[2].getCurrentTime() * FPS.current
                      )
                    );
                  }
                } else {
                  videoRefs.current[2].seekTo(
                    infoSession.current.stimulusTime[
                      infoSession.current.stimulusTime.length - 1
                    ] / 1000
                  );
                  setCurrentFrame(
                    Math.round(
                      videoRefs.current[2].getCurrentTime() * FPS.current
                    )
                  );
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24"
                width="24"
                viewBox="0 0 512 512"
              >
                <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416V96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3V256v41.7L52.5 440.6zM256 352V256 128 96c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29V352z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="AnalizeSessionVideoFramesCurrentInfoContainer">
          <div className="AnalizeSessionVideoFramesCurrentInfo">
            <div className="">
              <label>Frames totales: </label>
              <input
                className="AnalizeSessionInputFrameInfo"
                id="sessionType"
                type="text"
                readOnly={true}
                disabled={true}
                value={Math.round(videoDuration * FPS.current)}
              />
              <label>FPS: </label>
              <input
                className="AnalizeSessionInputFrameInfo"
                id="sessionType"
                type="text"
                readOnly={true}
                disabled={true}
                value={FPS.current}
              />
            </div>
          </div>
          <div className="AnalizeSessionVideoFramesCurrentInfoFrames">
            <div className="AnalizeSessionVideoFrame">
              <div className="AnalizeSessionVideoFrameLabelsInputs">
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Frame </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={
                      currentFrame + 1 < videoDuration * FPS.current
                        ? currentFrame + 1
                        : currentFrame
                    }
                  />
                </div>
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Tiempo[ms] </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={Math.min(
                      Math.round(((currentFrame + 1) / FPS.current) * 1000),
                      Math.round(
                        (Math.round(videoDuration * FPS.current) /
                          FPS.current) *
                          1000
                      )
                    )}
                  />
                </div>
              </div>
              {loading && (
                <svg
                  width="40"
                  height="40"
                  stroke="#DA2599"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="loading"
                >
                  <g className="spinner_V8m1">
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      fill="none"
                      strokeWidth="3"
                    ></circle>
                  </g>
                </svg>
              )}
              <ReactPlayer
                playing={playingVideo}
                ref={(videoRef) => (videoRefs.current[3] = videoRef)}
                id="VideoPlayers"
                width={"90%"}
                height={"100%"}
                url={videoSession}
              />
            </div>
            <div className="AnalizeSessionVideoFrame">
              <div className="AnalizeSessionVideoFrameLabelsInputs">
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Frame </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={
                      currentFrame + 2 < videoDuration * FPS.current
                        ? currentFrame + 2
                        : currentFrame
                    }
                  />
                </div>
                <div className="AnalizeSessionVideoFrameLabelInput">
                  <label>Tiempo[ms] </label>
                  <input
                    className="AnalizeSessionInputFrame"
                    id="sessionType"
                    type="text"
                    readOnly={true}
                    disabled={true}
                    value={Math.min(
                      Math.round(((currentFrame + 2) / FPS.current) * 1000),
                      Math.round(
                        (Math.round(videoDuration * FPS.current) /
                          FPS.current) *
                          1000
                      )
                    )}
                  />
                </div>
              </div>
              {loading && (
                <svg
                  width="40"
                  height="40"
                  stroke="#DA2599"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="loading"
                >
                  <g className="spinner_V8m1">
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      fill="none"
                      strokeWidth="3"
                    ></circle>
                  </g>
                </svg>
              )}
              <ReactPlayer
                playing={playingVideo}
                ref={(videoRef) => (videoRefs.current[4] = videoRef)}
                id="VideoPlayers"
                width={"90%"}
                height={"100%"}
                url={videoSession}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="AnalizeSessionMarksContainer">
        <div className="AnalizeSessionMarks">
          <div className="AnalizeSessionMarksTable">
            <table className="custom-table">
              <thead>
                <tr>
                  <th className="table-header" data-tooltip={`Frame Siguiente`}>
                    Secuencia
                  </th>
                  <th className="table-header">Error</th>
                  <th className="table-header">Estímulo</th>
                  <th className="table-header">Decision-Making</th>
                  <th className="table-header">Arrival</th>
                  <th className="table-header">Visu-Motor</th>
                  <th className="table-header">Motor</th>
                  <th className="table-header">Cognitive-Motor</th>
                </tr>
              </thead>
            </table>
            <div className="table-containerA">
              <table className="custom-table">
                <tbody className="scrollable-body">
                  {tableData.map((row, index) => (
                    <tr
                      id={`RowSequenceIndex${index}`}
                      style={
                        index === 0
                          ? {
                              background: "rgb(255, 255, 255, 0.75)",
                              color: "black",
                            }
                          : {}
                      }
                      key={index}
                    >
                      <td
                        id={`RowSequenceSequence${index}`}
                        onClick={() => handleRowClick(index, row.playID)}
                      >
                        {row.sequence}
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          checked={row.error}
                          id={`RowSequenceError${index}`}
                          onChange={() => handleCheckboxChange(index)}
                        />
                      </td>
                      <td
                        id={`RowSequenceStimul${index}`}
                        onClick={() => {
                          setCurrentFrame(
                            Math.round(
                              (parseInt(row.estimulo) * FPS.current) / 1000
                            )
                          );
                          if (selectedRowIndex.current !== index) {
                            handleRowClick(index, row.playID);
                          }
                        }}
                      >
                        {row.estimulo}
                      </td>
                      <td
                        id={`RowSequenceDecisionMaking${index}`}
                        onClick={() => {
                          let value = parseInt(row.decisionMaking);
                          if (value === 0) {
                            value = parseInt(
                              document.getElementById(
                                `RowSequenceDecisionMaking${index}`
                              ).innerText
                            );
                            if (value !== 0) {
                              setCurrentFrame(
                                Math.round((value * FPS.current) / 1000)
                              );
                            }
                          } else if (value > 0) {
                            setCurrentFrame(
                              Math.round((value * FPS.current) / 1000)
                            );
                          }
                          if (selectedRowIndex.current !== index) {
                            handleRowClick(index, row.playID);
                          }
                        }}
                      >
                        {row.decisionMaking}
                      </td>
                      <td
                        id={`RowSequenceArrival${index}`}
                        onClick={() => {
                          let value = parseInt(row.arrival);
                          if (value === 0) {
                            value = parseInt(
                              document.getElementById(
                                `RowSequenceArrival${index}`
                              ).innerText
                            );
                            if (value !== 0) {
                              setCurrentFrame(
                                Math.round((value * FPS.current) / 1000)
                              );
                            }
                          } else if (value > 0) {
                            setCurrentFrame(
                              Math.round((value * FPS.current) / 1000)
                            );
                          }
                          if (selectedRowIndex.current !== index) {
                            handleRowClick(index, row.playID);
                          }
                        }}
                      >
                        {row.arrival}
                      </td>
                      <td
                        id={`RowSequenceVisuMotor${index}`}
                        onClick={() => handleRowClick(index, row.playID)}
                      >
                        {row.visuMotor}
                      </td>
                      <td
                        id={`RowSequenceMotor${index}`}
                        onClick={() => handleRowClick(index, row.playID)}
                      >
                        {row.motor}
                      </td>
                      <td
                        id={`RowSequenceCognitiveMotor${index}`}
                        onClick={() => handleRowClick(index, row.playID)}
                      >
                        {row.cognitiveMotor}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="AnalizeSessionCurrentPlay">
          <div
            style={{
              display: "flex",
              gap: "0.5em",
              padding: "0 0.5em",
            }}
          >
            <div style={{ width: "100%" }}>
              <p style={{ margin: "0", textAlign: "center" }}>
                Jugada Anterior
              </p>
              <img
                style={{ width: "100%" }}
                className="AnalizeSessionCurrentPlayImg"
                src={imagePlay.prevPlay}
              />
              <div style={{ display: "flex", gap: "1em" }}>
                <div>
                  Tiempo [ms]:{" "}
                  {infoSession.current.stimulusTime[currentStimulus - 1]
                    ? infoSession.current.stimulusTime[currentStimulus - 1]
                    : 0}
                </div>
                <div>
                  Jugada:{" "}
                  {infoSession.current.stimulusTime[currentStimulus - 1]
                    ? currentStimulus
                    : 1}
                </div>
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <p style={{ margin: "0", textAlign: "center" }}>Jugada Actual</p>
              <img
                style={{ width: "100%" }}
                className="AnalizeSessionCurrentPlayImg"
                src={imagePlay.currentPlay}
              />
              <div style={{ display: "flex", gap: "1em" }}>
                <div>
                  Tiempo [ms]:{" "}
                  {infoSession?.current.stimulusTime[currentStimulus]}
                </div>
                <div>Jugada: {currentStimulus + 1}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="AnalizeSessionMarksControlContainer">
        <div className="AnalizeSessionMarksControlButtons">
          <div>
            <button
              className="AnalizeSessionMarksControlButton"
              id="AddDecisionMakingMark"
              onClick={AddDecisionMakingMark}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                width="16"
                viewBox="0 0 448 512"
              >
                <path d="M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H362.7c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h69.6c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z" />
              </svg>
              Añadir Marca Decision-Making
            </button>
            <button
              className="AnalizeSessionMarksControlButton"
              id="AddArrivalMark"
              onClick={AddArrivalMark}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                width="18"
                viewBox="0 0 512 512"
              >
                <path d="M256 0c17.7 0 32 14.3 32 32V42.4c93.7 13.9 167.7 88 181.6 181.6H480c17.7 0 32 14.3 32 32s-14.3 32-32 32H469.6c-13.9 93.7-88 167.7-181.6 181.6V480c0 17.7-14.3 32-32 32s-32-14.3-32-32V469.6C130.3 455.7 56.3 381.7 42.4 288H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H42.4C56.3 130.3 130.3 56.3 224 42.4V32c0-17.7 14.3-32 32-32zM107.4 288c12.5 58.3 58.4 104.1 116.6 116.6V384c0-17.7 14.3-32 32-32s32 14.3 32 32v20.6c58.3-12.5 104.1-58.4 116.6-116.6H384c-17.7 0-32-14.3-32-32s14.3-32 32-32h20.6C392.1 165.7 346.3 119.9 288 107.4V128c0 17.7-14.3 32-32 32s-32-14.3-32-32V107.4C165.7 119.9 119.9 165.7 107.4 224H128c17.7 0 32 14.3 32 32s-14.3 32-32 32H107.4zM256 224a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
              </svg>
              Añadir Marca Arrival
            </button>
          </div>
          <div>
            <button
              className="AnalizeSessionMarksControlButton"
              id="AutoAnalysis"
              disabled={
                (session === "current" &&
                  currentCalibration.current === null) ||
                !currentSession.current[0].calibration
              }
              onClick={autoAnalysis}
            >
              {processing.value ? (
                <svg
                  width="24"
                  height="24"
                  stroke="#DA2599"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="loading"
                  style={{
                    display: "flex",
                    gap: "0.5em",
                    padding: "0 0.5em",
                    margin: "0",
                  }}
                >
                  <g className="spinner_V8m1">
                    <circle
                      cx="12"
                      cy="12"
                      r="9.5"
                      fill="none"
                      strokeWidth="3"
                    ></circle>
                  </g>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  width="18"
                  viewBox="0 0 576 512"
                >
                  <path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H240l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H346.7L336 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM512 64V352H64V64H512z" />
                </svg>
              )}
              {processing.message}
            </button>
            <button
              className="AnalizeSessionMarksControlButton"
              id="SaveAnalizeSession"
              onClick={SaveAnalizeSession}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                width="16"
                viewBox="0 0 448 512"
              >
                <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V173.3c0-17-6.7-33.3-18.7-45.3L352 50.7C340 38.7 323.7 32 306.7 32H64zm0 96c0-17.7 14.3-32 32-32H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V128zM224 288a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
              </svg>
              Guardar Informacion Sesion
            </button>
            <button
              className="AnalizeSessionMarksControlButton"
              onClick={clearAnalysis}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="20"
                width="20"
                viewBox="0 0 512 512"
              >
                <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z" />
              </svg>
              Borrar análsis
            </button>
          </div>
        </div>
        <div className="AnalizeSessionMarksControlMetrics">
          <table className="AnalizeSessionMarksControlMetricsTable">
            <thead>
              <tr>
                <th className="table-header">Metricas</th>
                <th className="table-header">Total</th>
                <th className="table-header">Promedio</th>
                <th className="table-header">Desviacion Estandar</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td>Visu-Motor {"[ms]"}</td>
                <td>{metrics.totalVisuMotor}</td>
                <td>{metrics.averageVisuMotor}</td>
                <td>{metrics.standardDeviationVisuMotor}</td>
              </tr>
              <tr className="table-row">
                <td>Motor {"[ms]"}</td>
                <td>{metrics.totalMotor}</td>
                <td>{metrics.averageMotor}</td>
                <td>{metrics.standardDeviationMotor}</td>
              </tr>
              <tr className="table-row">
                <td>Tiempo Respuesta {"[ms]"}</td>
                <td>{metrics.totalCognitiveMotor}</td>
                <td>{metrics.averageCognitiveMotor}</td>
                <td>{metrics.standardDeviationCognitiveMotor}</td>
              </tr>
            </tbody>
            <thead>
              <tr>
                <th className="table-header">Correcto</th>
                <th className="table-header">Incorrecto</th>
              </tr>
              <tr className="table-row">
                <td>{metrics.correctPercentage}%</td>
                <td>{metrics.errorPercentage}%</td>
              </tr>
            </thead>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalizeSession;
