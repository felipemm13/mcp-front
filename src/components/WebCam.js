/* eslint-disable */
import Webcam from "react-webcam";
import React, { useState, useRef, useEffect, useContext } from "react";
import "../styles/WebCam.css";
import Calibration from "./Calibration";
import { Context } from "../services/Context";
import AWS from "aws-sdk";

const WebCam = (props) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recorderVideo = useRef([]);
  const {
    videoCurrentSession,
    isSaveCurrentSession,
    currentSession,
    infoSavedSession,
    currentFPS,
    infoSession,
    userContext,
    CrudApi,
    currentDevice,
    S3_BUCKET,
    REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    currentCalibration,
    calibrationBackground,
  } = useContext(Context);
  const [devices, setDevices] = useState([]);

  const [cameraState, setCameraState] = useState(false);
  const [cameraIsAvailable, setCameraIsAvailable] = useState(false);
  const [deviceId, setDeviceId] = useState("default");
  const [calibrationModal, setCalibrationModal] = useState(false);

  const handleStartCaptureClick = () => {
    document
      .getElementById("StartCaptureVideo")
      .setAttribute("disabled", "true");
    isSaveCurrentSession.current = false;
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );

    mediaRecorderRef.current.start();
  };

  const handleDataAvailable = ({ data }) => {
    if (data.size > 0) {
      recorderVideo.current = data;
      videoCurrentSession.current = recorderVideo.current;
    }
  };
  const handleStopCaptureClick = () => {
    mediaRecorderRef.current.stop();
    currentFPS.current = mediaRecorderRef.current.stream
      .getVideoTracks()[0]
      .getSettings().frameRate;
      console.log(infoSession.current)
    infoSavedSession.current = infoSession.current;
    document.getElementById("StartCaptureVideo").removeAttribute("disabled");
  };
  const padZero = (value) => {
    return value < 10 ? "0" + value : value;
  };
  const handleUploadVideo = async () => {
    document
      .getElementById("SaveCaptureVideo")
      .setAttribute("disabled", "true");
    document
      .getElementById("StartCaptureVideo")
      .setAttribute("disabled", "true");
    document.getElementById("BackToHome").setAttribute("disabled", "true");
    document
      .getElementById("OpenAnalizerView")
      .setAttribute("disabled", "true");
    document
      .getElementById("OpenOtherSessions")
      .setAttribute("disabled", "true");
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
      [recorderVideo.current],
      `${sessionDate}-player${infoSavedSession.current.playerSelected}.mp4`,
      {
        type: "video/webm;codecs=vp9",
      }
    );
    var images = infoSavedSession.current.imageSequences.map((image) => {
      const byteCharacters = atob(image.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new File(
        [byteArray],
        `${sessionDate}/player${infoSavedSession.current.playerSelected}`,
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

    const imagesUrls = infoSavedSession.current.imageSequences.map(
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
    let paramsCalibration;
    if (calibrationBackground.current) {
      const byteCharacters = atob(calibrationBackground.current.split(",")[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const backCalib = new File(
        [byteArray],
        `${sessionDate.split("/")[0]}/calibration.jpg`,
        {
          type: "image/jpeg",
        }
      );
      paramsCalibration = {
        ACL: "public-read",
        Bucket: S3_BUCKET,
        Key: `images/${userContext.current.userId}/calibration/${backCalib.name}`,
        Body: backCalib,
        ContentType: backCalib.type,
      };
    }

    const sessionData = {
      userId: userContext.current.userId,
      playerId: parseInt(infoSavedSession.current.playerSelected),
      timestamp: currentDate.toISOString(),
      duration: Math.floor(recorderVideo.current.size / 1000),
      numPlays: infoSavedSession.current.numberOfPlays,
      seed: infoSavedSession.current.seed,
      sessionType: infoSavedSession.current.typeOfSession,
      timeBetweenPlays: infoSavedSession.current.secondsToNextPlay,
      transitionTime: infoSavedSession.current.secondsForPlayTransition,
      videoURL: videoURL,
      numDistractors: infoSavedSession.current.numOfDistractors,
      fps: parseFloat(currentFPS.current.toFixed(2)),
      calibration: currentCalibration.current,
      imageCalibration: calibrationBackground.current
        ? paramsCalibration.Key
        : "",
    };
    const sessionAnalyticData = {
      complete: 0,
      correctPercentage: 0,
      motorMean: 0,
      motorSd: 0,
      motorTotal: 0,
      responseMean: 0,
      responseSd: 0,
      responseTotal: 0,
      visuMotorMean: 0,
      visuMotorSd: 0,
      visuMotorTotal: 0,
      wrongPercentage: 0,
    };
    const sessionMovesData = infoSavedSession.current.sequenceOfPlays.map(
      (play, index) => {
        let correctMark;
        if (
          infoSavedSession.current.typeOfSession === "evaluative" ||
          infoSavedSession.current.typeOfSession === "applied"
        ) {
          let currentPlay = infoSavedSession.current.playsFromDb.filter(
            (play) =>
              parseInt(play.playName) ===
              infoSavedSession.current.sequenceOfPlays[index]
          )[0];
          correctMark = currentPlay.responsePosition;
        } else {
          correctMark = play;
        }
        return {
          moveNum: index + 1,
          arrival: 0,
          cognitiveMotor: 0,
          correctResponse: correctMark,
          error: false,
          imageUrl: imagesUrls[index],
          motor: 0,
          presentedMs: 0,
          stimulus: infoSavedSession.current.stimulusTime[index],
          decisionMaking: 0,
          autoComplete: false,
        };
      }
    );

    await CrudApi.post("sessions", sessionData)
      .then(async (res) => {
        currentSession.current = [{ ...res.data }];
        await CrudApi.post(`sessionAnalytics`, {
          ...sessionAnalyticData,
          sessionId: res.data.sessionId,
        }).then(async (res) => {
          currentSession.current[0] = {
            ...currentSession.current[0],
            SessionAnalytics: [res.data],
          };
        });
        sessionMovesData.forEach(async (move, index) => {
          await CrudApi.post(`sessionMoves`, {
            ...move,
            sessionId: res.data.sessionId,
          }).then(async (res) => {
            if (currentSession.current[0].SessionMoves) {
              currentSession.current[0] = {
                ...currentSession.current[0],
                SessionMoves: [
                  ...currentSession.current[0].SessionMoves,
                  res.data,
                ],
              };
            } else {
              currentSession.current[0] = {
                ...currentSession.current[0],
                SessionMoves: [res.data],
              };
            }
          });
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
              document.getElementById("SaveCaptureVideo").innerText =
                "Subiendo Imagen " +
                parseInt((evt.loaded * 100) / evt.total) +
                "%";
            })
            .promise();
        });
        if (calibrationBackground.current) {
          s3.putObject(paramsCalibration)
            .on("httpUploadProgress", (evt) => {
              document.getElementById("SaveCaptureVideo").innerText =
                "Subiendo Imagen " +
                parseInt((evt.loaded * 100) / evt.total) +
                "%";
            })
            .promise();
        }

        var upload = s3
          .putObject(paramsVideo)
          .on("httpUploadProgress", (evt) => {
            document.getElementById("SaveCaptureVideo").innerText =
              "Subiendo Video " +
              parseInt((evt.loaded * 100) / evt.total) +
              "%";
          })
          .promise();

        await upload.then(() => {
          isSaveCurrentSession.current = true;
          document.getElementById("SaveCaptureVideo").innerText = `
      Guardado Exitosamente`;
        });
      })
      .catch((err) => {
        console.log(err);
      });
    document.getElementById("OpenAnalizerView").removeAttribute("disabled");
    document.getElementById("OpenOtherSessions").removeAttribute("disabled");
    document.getElementById("StartCaptureVideo").removeAttribute("disabled");
    document.getElementById("BackToHome").removeAttribute("disabled");
  };

  const handleChangeWebCam = async (e) => {
    currentDevice.current = e.target.value;
    setDeviceId(e.target.value);
  };

  const handleListDevices = async () => {
    const hasCameraPermission = localStorage.getItem("cameraPermission");
    if (hasCameraPermission === "granted") {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoDevices = devices.filter(
            (device) => device.kind === "videoinput"
          );
          const allowedDevices = videoDevices.filter(
            (device) => device.label !== ""
          );
          if (allowedDevices.length === 0) {
            localStorage.removeItem("cameraPermission");
            handleListDevices();
          } else {
            setDevices(allowedDevices);
            setDeviceId(allowedDevices[0].deviceId);
          }
        })
        .catch((err) => {
          console.error("Error al enumerar dispositivos:", err);
        });
    } else {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          localStorage.setItem("cameraPermission", "granted");
          navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
              const videoDevices = devices.filter(
                (device) => device.kind === "videoinput"
              );
              const allowedDevices = videoDevices.filter(
                (device) => device.label !== ""
              );

              setDevices(allowedDevices);
              setDeviceId(
                allowedDevices.length > 0 ? allowedDevices[0].deviceId : null
              );
            })
            .catch((err) => {
              console.error("Error al enumerar dispositivos:", err);
            })
            .finally(() => {
              stream.getTracks().forEach((track) => track.stop());
            });
        })
        .catch((err) => {
          console.error("El usuario ha denegado el acceso a la cámara:", err);
        });
    }
  };

  useEffect(() => {
    handleListDevices();
    if (infoSession.current) {
      setTimeout(() => {
        setDeviceId(currentDevice.current);
        setCameraState(true);
      }, 0);
    }

    document
      .getElementById("webcamContainer")
      .addEventListener("startRecord", handleStartCaptureClick);
    document
      .getElementById("webcamContainer")
      .addEventListener("stopRecord", handleStopCaptureClick);
    document
      .getElementById("SaveCaptureVideo")
      .addEventListener("click", handleUploadVideo);
    navigator.mediaDevices.addEventListener("devicechange", handleListDevices);

    return () => {
      // Limpiar los listeners al desmontar el componente
      navigator.mediaDevices.removeEventListener(
        "devicechange",
        handleListDevices
      );
    };
  }, []);

  useEffect(() => {
    if (
      cameraIsAvailable &&
      props.infoSession &&
      props.infoSession.playerSelected
    ) {
      props.openWindow(false);
    }
    if (
      props.showWindowPortal &&
      cameraIsAvailable &&
      props.infoSession &&
      props.infoSession.playerSelected !== "default" &&
      props.infoSession.sequenceOfPlays.length &&
      typeof props.infoSession.sequenceOfPlays[0] === "number"
    ) {
      document.getElementById("StartCaptureVideo").removeAttribute("disabled");
    } else {
      document
        .getElementById("StartCaptureVideo")
        .setAttribute("disabled", "true");
    }
  }, [props.showWindowPortal, cameraIsAvailable, props.infoSession]);
  return (
    <>
      <div className="WebcamContainer" id="webcamContainer">
        {cameraState ? (
          <Webcam
            id="webcam"
            className="WebcamVideo"
            forceScreenshotSourceSize={true}
            screenshotFormat="image/jpeg"
            audio={false}
            ref={webcamRef}
            height={200}
            width={400}
            onCanPlay={() => setCameraIsAvailable(true)}
            videoConstraints={{
              deviceId: deviceId,
              width: { ideal: 1280 },
              height: { ideal: 720 },
              frameRate: { max: 60 },
            }}
          />
        ) : (
          <div className="WebcamSlot">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              width="20"
              viewBox="0 0 640 512"
            >
              <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-86.4-67.7 13.8 9.2c9.8 6.5 22.4 7.2 32.9 1.6s16.9-16.4 16.9-28.2V128c0-11.8-6.5-22.6-16.9-28.2s-23-5-32.9 1.6l-96 64L448 174.9V192 320v5.8l-32-25.1V128c0-35.3-28.7-64-64-64H113.9L38.8 5.1zM407 416.7L32.3 121.5c-.2 2.1-.3 4.3-.3 6.5V384c0 35.3 28.7 64 64 64H352c23.4 0 43.9-12.6 55-31.3z" />
            </svg>
          </div>
        )}
      </div>
      <div className="WebcamButtons">
        <div className="turnCameraButtons">
          <button
            className="webcamConnectButton"
            onClick={() => setCameraState(true)}
            disabled={cameraState}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              width="18"
              viewBox="0 0 576 512"
            >
              <path d="M0 128C0 92.7 28.7 64 64 64H320c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128zM559.1 99.8c10.4 5.6 16.9 16.4 16.9 28.2V384c0 11.8-6.5 22.6-16.9 28.2s-23 5-32.9-1.6l-96-64L416 337.1V320 192 174.9l14.2-9.5 96-64c9.8-6.5 22.4-7.2 32.9-1.6z" />
            </svg>
            Conectar
          </button>

          <button
            className="webcamDissconnectButton"
            disabled={!cameraState}
            onClick={() => setCameraState(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              width="20"
              viewBox="0 0 640 512"
            >
              <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7l-86.4-67.7 13.8 9.2c9.8 6.5 22.4 7.2 32.9 1.6s16.9-16.4 16.9-28.2V128c0-11.8-6.5-22.6-16.9-28.2s-23-5-32.9 1.6l-96 64L448 174.9V192 320v5.8l-32-25.1V128c0-35.3-28.7-64-64-64H113.9L38.8 5.1zM407 416.7L32.3 121.5c-.2 2.1-.3 4.3-.3 6.5V384c0 35.3 28.7 64 64 64H352c23.4 0 43.9-12.6 55-31.3z" />
            </svg>
            Desconectar
          </button>
        </div>
        <label className="WebcamLabel">
          <b>Cámaras disponibles:</b>
          <select value={deviceId} onChange={handleChangeWebCam}>
            <option value="default">Seleccionar Cámara</option>
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label}
              </option>
            ))}
          </select>
        </label>
        <div>
          <button
            className="webcamCalibrationButton"
            disabled={!cameraIsAvailable}
            onClick={() => setCalibrationModal(true)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="16"
              width="20"
              viewBox="0 0 640 512"
            >
              <path d="M64 64V352H576V64H64zM0 64C0 28.7 28.7 0 64 0H576c35.3 0 64 28.7 64 64V352c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM128 448H512c17.7 0 32 14.3 32 32s-14.3 32-32 32H128c-17.7 0-32-14.3-32-32s14.3-32 32-32z" />
            </svg>
            Realizar Calibración
          </button>
        </div>
      </div>
      {calibrationModal && (
        <Calibration
          userEmail={userContext.current.email}
          webcamRef={webcamRef}
          sate={calibrationModal}
          setOpenModal={setCalibrationModal}
        />
      )}
    </>
  );
};

export default WebCam;
