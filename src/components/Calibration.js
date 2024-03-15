/* eslint-disable */
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import "../styles/Calibration.css";
import Swal from "sweetalert2";
import Draggable from "react-draggable";
import axios from "axios";
import { Context } from "../services/Context";

const Calibration = ({ setOpenModal, webcamRef, userEmail }) => {
  const { urlVision, currentCalibration,calibrationBackground } = useContext(Context);
  const calibration = useRef(null);
  const [stains, setStains] = useState(null);
  const [calibrated, setCalibrated] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [correctCalibration, setCorrectCalibration] = useState(true);
  const [currentMark, setCurrentMark] = useState(1);
  const calibrationImageRef = useRef(null);
  const [semiAutoCalibration, setSemiAutoCalibration] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(
    "Intentando calibración automática"
  );
  const [proportions, setProportions] = useState({ width: null, height: null });
  const calib_measures = useRef({ calib_h: 0, calib_w: 0 });

  const autoCalibration = async () => {
    const imgTemp = webcamRef.current.getScreenshot();
    setImgSrc(imgTemp);
    await axios
      .post("http://localhost:3001/calibration_automatic", {
      //  .post(`${urlVision}calibration_automatic`, {
        Screenshot: imgTemp,
      })
      .then((response) => {
        calib_measures.current = {
          calib_h: response.data.response.calib_h,
          calib_w: response.data.response.calib_w,
        };
        setCalibrated(true);
        calibration.current = response.data.response;
        setTimeout(() => setStains(response.data.response.points), [0]);
      })
      .catch((err) => {
        console.log(err);
        if (err.message.startsWith("HTTP error")) {
          Swal.fire({
            icon: "error",
            title: "Error...",
            text: `El servidor esta caido, contacte al administrador`,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error...",
            text: `Error inesperado, reintente`,
          });
        }
      });
  };
  const handleDrag = (index, data) => {
    const svgRect = document
      .getElementById("StainsContainer")
      .getBoundingClientRect();
    const { x, y } = data;
    const updatedStains = [...stains];
    updatedStains[index] = {
      ...updatedStains[index],
      x: stains[index].x + (x - svgRect.left) / svgRect.width,
      y: stains[index].y + (y - svgRect.top) / svgRect.height,
    };
    setStains(updatedStains);
  };

  const manualCalibration = async () => {
    setSemiAutoCalibration(true);
    const circulosPequenos = document.querySelectorAll('circle[r="1"]');
    const centros = [];
    circulosPequenos.forEach((circulo) => {
      const mark = circulo.getAttribute("id");
      const cx = circulo.getAttribute("cx") / proportions.width;
      const cy = circulo.getAttribute("cy") / proportions.height;
      centros.push({ x: parseFloat(cx), y: parseFloat(cy) });
    });
    await axios
      //.post("http://localhost:3001/calibration_semiautomatic", {
      .post(`${urlVision}calibration_semiautomatic`, {
        Screenshot: imgSrc,
        marks: centros,
      })
      .then((response) => {
        setCurrentMark(1);
        setCorrectCalibration(true);
        calibration.current = response.data.response;
        setTimeout(() => setStains(response.data.response.points), [0]);
        setSemiAutoCalibration(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const saveCalibration = () => {
    setTimeout(() => {
      setCalibrated(false);
      setCurrentMessage("Guardando calibración");
    }, [0]);
    currentCalibration.current = calibration.current;
    calibrationBackground.current = imgSrc;
    setTimeout(() => {
      document.getElementById("messageState").innerHTML = "Calibración Guardada";
    }, [1000]);
    setTimeout(() => document.getElementById("myModal").click(), [2000]);
  };

  useEffect(() => {
    document.addEventListener("click", (e) => {
      if (document.getElementById("myModal") == e.target) {
        setOpenModal(false);
      }
    });
    autoCalibration();
  }, []);

  return (
    <>
      <div id="myModal" className="calibrationModal">
        <div className="calibrationModalContent">
          <span
            className="calibrationModalClose"
            onClick={() => setOpenModal(false)}
          >
            &times;
          </span>
          <p className="calibrationModalTitle">Calibración</p>
          <div
            id="calibrationModalContainer"
            className="calibrationModalContainer"
          >
            {calibrated ? (
              <>
                <div className="calibrationModalImage">
                  <img
                    style={{ height: "100%", width: "100%" }}
                    ref={calibrationImageRef}
                    src={imgSrc}
                  />
                  {correctCalibration ? (
                    <svg
                      id="StainsContainer"
                      height="100%"
                      width="100%"
                      style={{ marginLeft: "-100%" }}
                    >
                      {stains &&
                        stains.map((stain, index) => {
                          if (
                            proportions.width === null &&
                            proportions.height === null
                          ) {
                            setProportions({
                              width:
                                document.getElementById("StainsContainer")
                                  .clientWidth / calib_measures.current.calib_w,
                              height:
                                document.getElementById("StainsContainer")
                                  .clientHeight /
                                calib_measures.current.calib_h,
                            });
                          }
                          return (
                            <g>
                              <polygon
                                key={`p ${index}`}
                                points={stain.contorno
                                  .map(
                                    (point) =>
                                      `${point.x * proportions.width},${
                                        point.y * proportions.height
                                      }`
                                  )
                                  .join(" ")}
                                style={{ fill: "#00F545", opacity: 0.6 }}
                              />
                              <text
                                key={`t ${index}`}
                                style={{ userSelect: "none" }}
                                x={(stain.x - 5) * proportions.width}
                                y={(stain.y + 5) * proportions.height}
                                fontFamily="Verdana"
                                fontSize="11"
                                fontWeight={"bold"}
                                fill="#F50000"
                              >
                                {stain.z}
                              </text>
                            </g>
                          );
                        })}
                    </svg>
                  ) : (
                    <svg
                      id="StainsContainer"
                      height="100%"
                      width="100%"
                      style={{ marginLeft: "-100%" }}
                    >
                      {stains &&
                        stains.slice(0, currentMark).map((stain, index) => (
                          <Draggable
                            key={`draggable-${index}`}
                            onStop={(e, data) => handleDrag(index, data)}
                            bounds={document.getElementById("StainsContainer")}
                          >
                            <g key={`g ${index}`}>
                              <circle
                                key={`cm ${index}`}
                                cx={stain.x * proportions.width}
                                cy={stain.y * proportions.height}
                                r={12}
                                fill="#00F545"
                                style={{ opacity: 0.4 }}
                              />
                              <text
                                key={`t ${index}`}
                                style={{ userSelect: "none" }}
                                x={(stain.x + 5) * proportions.width}
                                y={(stain.y - 15) * proportions.height}
                                fontFamily="Verdana"
                                fontSize="12"
                                fontWeight={"bold"}
                                fill="#F50000"
                              >
                                {index + 1}
                              </text>
                              <circle
                                key={`c ${index}`}
                                id={index + 1}
                                cx={stain.x * proportions.width}
                                cy={stain.y * proportions.height}
                                r={1} // Tamaño del punto
                                fill="red"
                              />
                            </g>
                          </Draggable>
                        ))}
                    </svg>
                  )}
                </div>
                <div className="calibrationModalActions">
                  {correctCalibration ? (
                    <>
                      <p className="calibrationModalQuestion">
                        ¿Puede apreciar en la imagen de la cámara una
                        calibración como la imagen de ejemplo?
                      </p>
                      <img
                        src="assets/calibrations/calibration-example.png"
                        style={{
                          height: "auto",
                          width: "auto",
                          maxHeight: "80%",
                          border: "0.5px solid #000",
                        }}
                      />
                      <div className="calibrationModalButtonsActions">
                        <button
                          className="calibrationModalButtonNo"
                          onClick={() => {
                            setCorrectCalibration(false);
                          }}
                        >
                          No
                        </button>
                        <button
                          className="calibrationModalButtonYes"
                          onClick={() => saveCalibration()}
                        >
                          Si
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="calibrationModalQuestion">
                        Seleccion Manual de las marcas en la imagen
                      </p>
                      <img
                        src={`assets/calibrations/calibration-mark-${currentMark}.png`}
                        style={{
                          height: "auto",
                          width: "auto",
                          maxHeight: "80%",
                          justifySelf: "center",
                          border: "0.5px solid #000",
                        }}
                      />
                      <div>
                        <p style={{ lineHeight: "0.5em" }}>
                          En la imagen de la camara, arrastre la ubicacion de la
                          marca {currentMark}{" "}
                        </p>
                      </div>
                      <div className="calibrationModalButtonsManual">
                        <button
                          className="calibrationModalButtonCancel"
                          onClick={() => setCorrectCalibration(true)}
                        >
                          Cancelar
                        </button>
                        <button
                          className="calibrationModalButtonPrevMark"
                          disabled={currentMark === 1}
                          onClick={() => setCurrentMark(currentMark - 1)}
                        >
                          Marca Anterior
                        </button>
                        <button
                          className="calibrationModalButtonNextMark"
                          disabled={currentMark === 6}
                          onClick={() => setCurrentMark(currentMark + 1)}
                        >
                          Siguiente Marca
                        </button>
                        <button
                          className="calibrationModalButtonTryCalibration"
                          disabled={currentMark !== 6}
                          onClick={() => manualCalibration()}
                        >
                          {semiAutoCalibration ? (
                            <svg
                              width="40"
                              height="40"
                              stroke="#fff"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <g className="spinner_V8m1">
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="9.5"
                                  fill="none"
                                  stroke-width="3"
                                ></circle>
                              </g>
                            </svg>
                          ) : (
                            "Intentar Calibracion Semi-Automatica"
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 id="messageState">
                  {currentMessage}
                  <svg
                    width="75"
                    height="75"
                    viewBox="0 0 24 6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="#fff"
                    style={{ marginLeft: "1em" }}
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
                </h1>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Calibration;
