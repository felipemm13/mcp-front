import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "../styles/AnalizeSession.css";
import { useNavigate, useParams } from "react-router-dom";
import { Context } from "../services/Context";
import AWS from "aws-sdk";

const AnalizeSession = () => {
  const {
    videoCurrentSession,
    infoSession,
    currentFPS,
    CrudApi,
    currentSession,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
  } = useContext(Context);
  if (!infoSession.current.stimulusTime) {
    infoSession.current = {
      stimulusTime: currentSession.current[0].SessionMoves.map(
        (move) => move.stimulus
      ),
    };
  }
  const navigate = useNavigate();
  const session = useParams().session;
  const FPS = currentFPS.current ? currentFPS.current : 30;
  const [videoSession, setVideoSession] = useState(null);
  const [videoState, setVideoState] = useState("Play");
  const [videoStepFrames, setVideoStepFrames] = useState({
    next: 1,
    previous: 1,
  });
  const videosPlayersRef = useRef([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const currentPlay = useRef(null);
  const prevPlay = useRef(null);
  const currentStimulus = useRef(0);
  const selectedRowIndex = useRef(0);
  const selectedPlayID = useRef(null);

  const initialData = Array.from({ length: 0 }, (_, index) => ({
    sequence: index + 1,
    playID: index + 1,
    error: false,
    estimulo: 0,
    takeoff: 0,
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
    durationP.then((d) => setVideoDuration(d));
  };

  useEffect(async () => {
    videosPlayersRef.current = document.querySelectorAll(
      ".AnalizeSessionVideoCentral"
    );
    //console.log(videosPlayersRef.current);
    if (session === "current" && videoCurrentSession.current) {
      //infoSession.current.imageSequences.pop()
      const url = URL.createObjectURL(videoCurrentSession.current);
      console.log(videoCurrentSession.current);
      console.log(url);
      getVideoDuration(url);
      //console.log(videoDuration);
      setVideoSession(url);
      currentPlay.current.src = infoSession.current.imageSequences[0];
      prevPlay.current.src = infoSession.current.imageSequences[0];
      setTableData(
        Array.from(
          { length: infoSession.current.numberOfPlays.current },
          (element, index) => ({
            sequence: index + 1,
            playID: infoSession.current.sequenceOfPlays.current[index],
            error: false,
            estimulo: infoSession.current.stimulusTime[index],
            takeoff: 0,
            arrival: 0,
            visuMotor: 0,
            motor: 0,
            cognitiveMotor: 0,
          })
        )
      );
    } else {
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

      AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      });
      let blob = await fetch(
        `https://mcp-wildsense.s3.us-east-2.amazonaws.com/${currentSession.current[0].videoURL}`
      ).then((r) => r.blob());
      const url = URL.createObjectURL(blob);
      getVideoDuration(url);
      //console.log(videoDuration);
      setVideoSession(url);
      currentPlay.current.src = infoSession.current.imageSequences[0];
      prevPlay.current.src = infoSession.current.imageSequences[0];
      infoSession.current.stimulusTime.sort((a, b) => a - b);
      setTableData(
        Array.from(
          { length: infoSession.current.numberOfPlays },
          (element, index) => ({
            sequence: index + 1,
            playID: infoSession.current.sequenceOfPlays[index],
            error: false,
            estimulo: infoSession.current.stimulusTime[index],
            takeoff: 0,
            arrival: 0,
            visuMotor: 0,
            motor: 0,
            cognitiveMotor: 0,
          })
        )
      );
    }
  }, []);

  useEffect(() => {
    if (videosPlayersRef.current.length) {
      if (currentFrame > 0) {
        if (
          Math.round(videosPlayersRef.current[2].currentTime * 1000) >=
          infoSession.current.stimulusTime[currentStimulus.current]
        ) {
          currentStimulus.current =
            currentStimulus.current + 1 <=
            infoSession.current.stimulusTime.length - 1
              ? currentStimulus.current + 1
              : currentStimulus.current;
          currentPlay.current.src =
            infoSession.current.imageSequences[currentStimulus.current];
          prevPlay.current.src =
            infoSession.current.imageSequences[
              currentStimulus.current - 1 > 0 ? currentStimulus.current - 1 : 0
            ];
        }
        if (
          Math.round(videosPlayersRef.current[2].currentTime * 1000) <
            infoSession.current.stimulusTime[currentStimulus.current] &&
          currentStimulus.current > 0 &&
          Math.round(videosPlayersRef.current[2].currentTime * 1000) >=
            infoSession.current.stimulusTime[currentStimulus.current - 1]
        ) {
          currentStimulus.current -= 1;
          currentPlay.current.src =
            infoSession.current.imageSequences[currentStimulus.current];
          prevPlay.current.src =
            infoSession.current.imageSequences[
              currentStimulus.current - 1 > 0 ? currentStimulus.current - 1 : 0
            ];
        }

        if (videoState === "Play") {
          videosPlayersRef.current[0].currentTime = (currentFrame - 2) / FPS;
          videosPlayersRef.current[1].currentTime = (currentFrame - 1) / FPS;
          videosPlayersRef.current[2].currentTime = currentFrame / FPS;
          videosPlayersRef.current[3].currentTime = (currentFrame + 1) / FPS;
          videosPlayersRef.current[4].currentTime = (currentFrame + 2) / FPS;
          //setCurrentTime(videosPlayersRef.current[2].currentTime);
        }
      } else {
        videosPlayersRef.current[0].currentTime = 0;
        videosPlayersRef.current[1].currentTime = 0;
        videosPlayersRef.current[2].currentTime = 0;
        videosPlayersRef.current[3].currentTime = 0;
        videosPlayersRef.current[4].currentTime = 0;
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
      document.getElementById("AddTakeoffMark").disabled = true;
      document.getElementById("AddArrivalMark").disabled = true;
    } else {
      selectedRow.style.background = "rgb(255, 255, 255, 0.75)";
      selectedRow.style.color = "black";
      selectedRowIndex.current = index;
      selectedPlayID.current = playID;
      document.getElementById("AddTakeoffMark").disabled = false;
      document.getElementById("AddArrivalMark").disabled = false;
    }
  };

  const AddTakeoffMark = () => {
    if (
      document.getElementById(`RowSequenceTakeoff${selectedRowIndex.current}`)
    ) {
      document.getElementById(
        `RowSequenceTakeoff${selectedRowIndex.current}`
      ).innerHTML = Math.round(videosPlayersRef.current[2].currentTime * 1000);
      document.getElementById(
        `RowSequenceVisuMotor${selectedRowIndex.current}`
      ).innerHTML =
        document.getElementById(`RowSequenceTakeoff${selectedRowIndex.current}`)
          .innerHTML -
        document.getElementById(`RowSequenceStimul${selectedRowIndex.current}`)
          .innerHTML;
      if (
        document.getElementById(
          `RowSequenceVisuMotor${selectedRowIndex.current}`
        ).innerHTML > 0 &&
        document.getElementById(`RowSequenceMotor${selectedRowIndex.current}`)
          .innerHTML > 0
      ) {
        document.getElementById(
          `RowSequenceCognitiveMotor${selectedRowIndex.current}`
        ).innerHTML =
          parseInt(
            document.getElementById(
              `RowSequenceMotor${selectedRowIndex.current}`
            ).innerHTML
          ) +
          parseInt(
            document.getElementById(
              `RowSequenceVisuMotor${selectedRowIndex.current}`
            ).innerHTML
          );
      }
    }
  };

  const AddArrivalMark = () => {
    if (
      document.getElementById(`RowSequenceArrival${selectedRowIndex.current}`)
    ) {
      document.getElementById(
        `RowSequenceArrival${selectedRowIndex.current}`
      ).innerHTML = Math.round(videosPlayersRef.current[2].currentTime * 1000);
      if (
        document.getElementById(`RowSequenceTakeoff${selectedRowIndex.current}`)
          .innerHTML > 0
      ) {
        document.getElementById(
          `RowSequenceMotor${selectedRowIndex.current}`
        ).innerHTML =
          document.getElementById(
            `RowSequenceArrival${selectedRowIndex.current}`
          ).innerHTML -
          document.getElementById(
            `RowSequenceTakeoff${selectedRowIndex.current}`
          ).innerHTML;
      }
      if (
        document.getElementById(
          `RowSequenceVisuMotor${selectedRowIndex.current}`
        ).innerHTML > 0 &&
        document.getElementById(`RowSequenceMotor${selectedRowIndex.current}`)
          .innerHTML > 0
      ) {
        document.getElementById(
          `RowSequenceCognitiveMotor${selectedRowIndex.current}`
        ).innerHTML =
          parseInt(
            document.getElementById(
              `RowSequenceMotor${selectedRowIndex.current}`
            ).innerHTML
          ) +
          parseInt(
            document.getElementById(
              `RowSequenceVisuMotor${selectedRowIndex.current}`
            ).innerHTML
          );
      }
    }
  };

  const getTotalMetrics = useCallback(
    (metric) => {
      let total = 0;
      for (let i = 0; i < tableData.length; i++) {
        total +=
          document.getElementById(`RowSequence${metric}${i}`) &&
          parseInt(
            document.getElementById(`RowSequence${metric}${i}`).innerHTML
          );
      }
      return total;
    },
    [selectedRowIndex.current, currentFrame]
  );

  const getAverageMetrics = useCallback(
    (metric) => {
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
    },
    [selectedRowIndex.current, currentFrame]
  );

  const getStandardDeviationMetrics = useCallback(
    (metric) => {
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
    },
    [selectedRowIndex.current, currentFrame]
  );

  const getCorrectPercentage = useCallback(
    (metric) => {
      let correct = (getAverageMetrics(metric) / getTotalMetrics(metric)) * 100;
      return Math.floor(correct);
    },
    [selectedRowIndex.current, currentFrame]
  );

  const getErrorPercentage = useCallback(
    (metric) => {
      let error = 100 - getCorrectPercentage(metric);
      return Math.floor(error);
    },
    [selectedRowIndex.current, currentFrame]
  );

  const SaveAnalizeSession = async () => {
    const dataAnalytic = {
      sessionId: currentSession.current[0].sessionId,
      complete: 0, // Reemplaza con el valor correcto
      correctPercentage: getCorrectPercentage("VisuMotor"),
      motorMean: getAverageMetrics("Motor"),
      motorSd: getStandardDeviationMetrics("Motor"),
      motorTotal: getTotalMetrics("Motor"),
      responseMean: getAverageMetrics("CognitiveMotor"),
      responseSd: getStandardDeviationMetrics("CognitiveMotor"),
      responseTotal: getTotalMetrics("CognitiveMotor"),
      visuMotorMean: getAverageMetrics("VisuMotor"),
      visuMotorSd: getStandardDeviationMetrics("VisuMotor"),
      visuMotorTotal: getTotalMetrics("VisuMotor"),
      wrongPercentage: getErrorPercentage("VisuMotor"),
    };
    console.log(dataAnalytic);
    await CrudApi.update(
      `sessionAnalytics/${currentSession.current[0].SessionAnalytics[0].sessionAnalyticId}`,
      dataAnalytic
    ).then((response) => {
      console.log(response);
    });
    const dataMoves = tableData.map((row, index) => ({
      sessionId: currentSession.current[0].sessionId,
      moveNum: row.playID,
      arrival: row.arrival,
      cognitiveMotor: row.cognitiveMotor,
      correctResponse: 0,
      error: 0,
      motor: row.motor,
      presentedMs: row.visuMotor,
      stimulus: row.estimulo,
      takeoff: row.takeoff,
    }));
    console.log(tableData)
    currentSession.current[0].SessionMoves.map(async (move, index) => {
      console.log(dataMoves[index]);
      await CrudApi.update(
        `sessionMoves/${move.sessionMovesId}`,
        dataMoves[index]
      ).then((response) => {
        console.log('response',response);
      });
    });
  };

  return (
    <div className="AnalizeSessionContainer">
      <button
        className="AnalizeSessionBackButton"
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
      <div className="AnalizeSessionVideoContainer">
        <div className="AnalizeSessionVideoInfoSessionContainer">
          <div className="AnalizeSessionVideoTitle">
            <b>Sesión de jugador</b>
          </div>
          <div className="AnalizeSessionVideoInfoSession">
            <div className="">
              <label>Tipo de sesión: </label>
              <input
                className="AnalizeSessionInputInfo"
                id="sessionType"
                type="text"
                readOnly
                disabled
                value={"Reactiva"}
              ></input>
              <label>Grupo: </label>
              <input
                className="AnalizeSessionInputInfo"
                id="sessionType"
                type="text"
                readOnly={true}
                style={{ width: "50%" }}
                value="Universidad Tecnica Federico Santa Maria"
              ></input>
            </div>
            <div className="">
              <label>Nombre: </label>
              <input
                className="AnalizeSessionInputInfo"
                id="sessionType"
                type="text"
                readOnly
                disabled
                value="Lucas"
              ></input>
              <label>Apellido: </label>
              <input
                className="AnalizeSessionInputInfo"
                id="sessionType"
                type="text"
                readOnly
                disabled
                value="Navarro"
              ></input>
              <label>Fecha: </label>
              <input
                className="AnalizeSessionInputInfo"
                id="sessionType"
                type="text"
                readOnly
                disabled
                value="2023/12/28"
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
                    value={
                      videosPlayersRef.current.length &&
                      Math.round(videosPlayersRef.current[0].currentTime * 1000)
                    }
                  />
                </div>
              </div>
              <video
                className="AnalizeSessionVideoCentral"
                id="videoPlayer1"
                src={videoSession}
                disablePictureInPicture
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
                    value={
                      videosPlayersRef.current.length &&
                      Math.round(videosPlayersRef.current[1].currentTime * 1000)
                    }
                  />
                </div>
              </div>
              <video
                className="AnalizeSessionVideoCentral"
                id="videoPlayer2"
                src={videoSession}
                disablePictureInPicture
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
                  value={
                    videosPlayersRef.current.length &&
                    Math.round(videosPlayersRef.current[2].currentTime * 1000)
                  }
                />
              </div>
            </div>
            <video
              className="AnalizeSessionVideoCentral"
              style={{ width: "100%" }}
              id="videoPlayer3"
              src={videoSession}
              disablePictureInPicture
              onTimeUpdate={(e) => {
                setCurrentFrame(Math.round(e.target.currentTime * FPS));
              }}
            />
          </div>
          <div className="AnalizeSessionVideoCentralFrameControl">
            <button
              data-tooltip={`Retroceder Estimulo`}
              className="AnalizeSessionVideoCentralFrameButton"
              onClick={() => {
                if (currentStimulus.current - 1 > 0) {
                  console.log(
                    currentStimulus.current,
                    infoSession.current.stimulusTime[
                      currentStimulus.current - 1
                    ]
                  );
                  videosPlayersRef.current[2].currentTime =
                    infoSession.current.stimulusTime[
                      currentStimulus.current - 1
                    ] / 1000;
                } else {
                  videosPlayersRef.current[2].currentTime = 0;
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
                  for (let videoPlayer of videosPlayersRef.current) {
                    videoPlayer.play();
                  }
                } else {
                  setVideoState("Play");
                  for (let videoPlayer of videosPlayersRef.current) {
                    videoPlayer.pause();
                  }
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
                if (currentFrame + 1 < Math.round(videoDuration * FPS)) {
                  setCurrentFrame(currentFrame + 1);
                } else {
                  setCurrentFrame(Math.round(videoDuration * FPS));
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
                  currentStimulus.current + 1 <
                  infoSession.current.stimulusTime.length - 1
                ) {
                  videosPlayersRef.current[2].currentTime =
                    infoSession.current.stimulusTime[
                      currentStimulus.current + 1
                    ] / 1000;
                } else {
                  videosPlayersRef.current[2].currentTime =
                    infoSession.current.stimulusTime[
                      infoSession.current.stimulusTime.length - 1
                    ] / 1000;
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
          <div className="AnalizeSessionVideoTitle">
            <b>Frame Seleccionado</b>
          </div>
          <div className="AnalizeSessionVideoFramesCurrentInfo">
            <div className="">
              <label>Frame </label>
              <input
                className="AnalizeSessionInputFrameInfo"
                id="sessionType"
                type="text"
                readOnly={true}
                value={currentFrame}
                style={{ width: "10%" }}
              />
              <label>Tiempo[ms] </label>
              <input
                className="AnalizeSessionInputFrameInfo"
                id="sessionType"
                type="text"
                readOnly={true}
                value={
                  videosPlayersRef.current.length
                    ? Math.round(videosPlayersRef.current[2].currentTime * 1000)
                    : 0
                }
              />

              <label>Frames totales: </label>
              <input
                className="AnalizeSessionInputFrameInfo"
                id="sessionType"
                type="text"
                readOnly={true}
                value={Math.round(videoDuration * FPS)}
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
                      currentFrame + 1 < videoDuration * FPS
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
                    value={
                      videosPlayersRef.current.length &&
                      Math.round(videosPlayersRef.current[3].currentTime * 1000)
                    }
                  />
                </div>
              </div>
              <video
                className="AnalizeSessionVideoCentral"
                id="videoPlayer4"
                src={videoSession}
                disablePictureInPicture
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
                      currentFrame + 2 < videoDuration * FPS
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
                    value={
                      videosPlayersRef.current.length &&
                      Math.round(videosPlayersRef.current[4].currentTime * 1000)
                    }
                  />
                </div>
              </div>
              <video
                className="AnalizeSessionVideoCentral"
                id="videoPlayer5"
                src={videoSession}
                disablePictureInPicture
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
                  <th className="table-header">Secuencia</th>
                  <th className="table-header">Play ID</th>
                  <th className="table-header">Error</th>
                  <th className="table-header">Estímulo</th>
                  <th className="table-header">Takeoff</th>
                  <th className="table-header">Arrival</th>
                  <th className="table-header">Visu-Motor</th>
                  <th className="table-header">Motor</th>
                  <th className="table-header">Cognitive-Motor</th>
                </tr>
              </thead>
            </table>
            <div className="table-container">
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
                      onClick={() => handleRowClick(index, row.playID)}
                    >
                      <td id={`RowSequenceSequence${index}`}>{row.sequence}</td>
                      <td id={`RowSequencePlayId${index}`}>{row.playID}</td>
                      <td>
                        <input
                          type="checkbox"
                          checked={row.error}
                          onChange={() => handleCheckboxChange(index)}
                        />
                      </td>
                      <td id={`RowSequenceStimul${index}`}>{row.estimulo}</td>
                      <td id={`RowSequenceTakeoff${index}`}>{row.takeoff}</td>
                      <td id={`RowSequenceArrival${index}`}>{row.arrival}</td>
                      <td id={`RowSequenceVisuMotor${index}`}>
                        {row.visuMotor}
                      </td>
                      <td id={`RowSequenceMotor${index}`}>{row.motor}</td>
                      <td id={`RowSequenceCognitiveMotor${index}`}>
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
                ref={prevPlay}
                src=""
              />
              <div>
                Tiempo [ms]:{" "}
                {infoSession.current.stimulusTime[currentStimulus.current - 1]
                  ? infoSession.current.stimulusTime[
                      currentStimulus.current - 1
                    ]
                  : 0}
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <p style={{ margin: "0", textAlign: "center" }}>Jugada Actual</p>
              <img
                style={{ width: "100%" }}
                className="AnalizeSessionCurrentPlayImg"
                ref={currentPlay}
                src=""
              />
              <div>
                Tiempo [ms]:{" "}
                {infoSession.current.stimulusTime[currentStimulus.current]}
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
              id="AddTakeoffMark"
              onClick={AddTakeoffMark}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="18"
                width="16"
                viewBox="0 0 448 512"
              >
                <path d="M320 48a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM125.7 175.5c9.9-9.9 23.4-15.5 37.5-15.5c1.9 0 3.8 .1 5.6 .3L137.6 254c-9.3 28 1.7 58.8 26.8 74.5l86.2 53.9-25.4 88.8c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l28.7-100.4c5.9-20.6-2.6-42.6-20.7-53.9L238 299l30.9-82.4 5.1 12.3C289 264.7 323.9 288 362.7 288H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H362.7c-12.9 0-24.6-7.8-29.5-19.7l-6.3-15c-14.6-35.1-44.1-61.9-80.5-73.1l-48.7-15c-11.1-3.4-22.7-5.2-34.4-5.2c-31 0-60.8 12.3-82.7 34.3L57.4 153.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l23.1-23.1zM91.2 352H32c-17.7 0-32 14.3-32 32s14.3 32 32 32h69.6c19 0 36.2-11.2 43.9-28.5L157 361.6l-9.5-6c-17.5-10.9-30.5-26.8-37.9-44.9L91.2 352z" />
              </svg>
              Añadir Marca Takeoff
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
            <button className="AnalizeSessionMarksControlButton">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="16"
                width="18"
                viewBox="0 0 576 512"
              >
                <path d="M64 0C28.7 0 0 28.7 0 64V352c0 35.3 28.7 64 64 64H240l-10.7 32H160c-17.7 0-32 14.3-32 32s14.3 32 32 32H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H346.7L336 416H512c35.3 0 64-28.7 64-64V64c0-35.3-28.7-64-64-64H64zM512 64V352H64V64H512z" />
              </svg>
              Procesar Pasos
            </button>
          </div>
          <div>
            <button
              className="AnalizeSessionMarksControlButton"
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
            <button className="AnalizeSessionMarksControlButton">
              {true ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    width="14"
                    viewBox="0 0 384 512"
                  >
                    <path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM105.8 229.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L216 328.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V314.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H158.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM160 416a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
                  </svg>
                  Marcas No Estan Listas
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="18"
                    width="14"
                    viewBox="0 0 384 512"
                  >
                    <path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM305 273L177 401c-9.4 9.4-24.6 9.4-33.9 0L79 337c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L271 239c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z" />
                  </svg>
                  Guardar Metricas
                </>
              )}
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
                <th className="table-header">Correcto{"[%]"}</th>
                <th className="table-header">Incorrecto{"[%]"}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="table-row">
                <td>Visu-Motor Reaccion {"[ms]"}</td>
                <td>{getTotalMetrics("VisuMotor")}</td>
                <td>{getAverageMetrics("VisuMotor")}</td>
                <td>{getStandardDeviationMetrics("VisuMotor")}</td>
                <td>{getCorrectPercentage("VisuMotor")}</td>
                <td>{getErrorPercentage("VisuMotor")}</td>
              </tr>
              <tr className="table-row">
                <td>Motor Reaccion {"[ms]"}</td>
                <td>{getTotalMetrics("Motor")}</td>
                <td>{getAverageMetrics("Motor")}</td>
                <td>{getStandardDeviationMetrics("Motor")}</td>
                <td>{getCorrectPercentage("Motor")}</td>
                <td>{getErrorPercentage("Motor")}</td>
              </tr>
              <tr className="table-row">
                <td>Tiempo Respuesta {"[ms]"}</td>
                <td>{getTotalMetrics("CognitiveMotor")}</td>
                <td>{getAverageMetrics("CognitiveMotor")}</td>
                <td>{getStandardDeviationMetrics("CognitiveMotor")}</td>
                <td>{getCorrectPercentage("CognitiveMotor")}</td>
                <td>{getErrorPercentage("CognitiveMotor")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalizeSession;
