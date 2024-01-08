import Webcam from "react-webcam";
import React, { useState, useRef, useEffect, useContext } from "react";
import "../styles/WebCam.css";
import Calibration from "./Calibration";
import { Context } from "../services/Context";

const WebCam = (props) => {
  const webcamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recorderVideo = useRef([]);
  const { videoCurrentSession } = useContext(Context);
  const [devices, setDevices] = useState([]); //list of cameras

  const [cameraState, setCameraState] = useState(false);
  const [cameraIsAvailable, setCameraIsAvailable] = useState(false);
  const [deviceId, setDeviceId] = useState({});
  const [calibrationModal, setCalibrationModal] = useState(false);

  const handleStartCaptureClick = () => {
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
  };

  const handleUploadVideo = () => {
    if (recorderVideo.current.length) {
      const blob = new Blob(recorderVideo.current, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "video.mp4";
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };
  const handleChangeWebCam = (e) => {
    setDeviceId(e.target.value);
  };
  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((mediaDevices) => {
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));
    });
    document
      .getElementById("webcamContainer")
      .addEventListener("startRecord", handleStartCaptureClick);
    document
      .getElementById("webcamContainer")
      .addEventListener("stopRecord", handleStopCaptureClick);
    document
      .getElementById("SaveCaptureVideo")
      .addEventListener("click", handleUploadVideo);
    //document.getElementById("StartCaptureVideo").addEventListener("click", handleStartCaptureClick);
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
      props.infoSession.playerSelected
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
              width: { min: 640, ideal: 1920, max: 1920 },
              height: { min: 400, ideal: 1080 },
              frameRate: { min: 15, ideal: 60 },
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
          <select defaultValue={true} onChange={handleChangeWebCam}>
            <option defaultChecked={false}>Cámara por defecto</option>
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
          userEmail={props.user.email}
          webcamRef={webcamRef}
          sate={calibrationModal}
          setOpenModal={setCalibrationModal}
        />
      )}
    </>
  );
};

export default WebCam;
