import { useCallback, useEffect, useRef, useState } from "react";
import "../styles/Calibration.css";
import Swal from "sweetalert2";
import firebaseService from "../services/firebaseService2";

const Calibration = ({ setOpenModal, webcamRef, userEmail }) => {
  const [squares, setSquares] = useState(null);
  const [calibrated, setCalibrated] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [correctCalibration, setCorrectCalibration] = useState(true);
  const [currentMark, setCurrentMark] = useState(1);
  const calibrationImageRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [positions, setPositions] = useState(
    Array.from({ length: 9 }, () => ({ x: 0, y: 0 }))
  );
  const [startPositions, setStartPositions] = useState([]);
  const [semiAutoCalibration, setSemiAutoCalibration] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("Intentando calibración automática");

  const autoCalibration = async () => {
    const imgTemp = webcamRef.current.getScreenshot();
    setImgSrc(imgTemp);
    await fetch("https://200.1.17.171:3000/calibration_automatic", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        Screenshot: imgTemp,
        email: "admin@admin.com",
      }),
      headers: { "Content-Type": "application/json" },
      //x-www-form-urlencoded
    })
      .then((response) => response.json()) //obtener las marcas
      .then((data) => {
        setCalibrated(true);
        console.log(data.response);
        setTimeout(() => setSquares(data.response), [100]);
      })
      .catch((err) => {
        console.log(err);
        if (err.message.startsWith("HTTP error")) {
          Swal.fire({
            icon: "error",
            title: "Error...",
            text: `El servidor esta caido, contacte al administrador`,
          });
        } else if (err.name === "TypeError") {
          Swal.fire({
            icon: "error",
            title: "Error...",
            text: `Falta el certificado de seguridad! Aceptarlo en: https://200.1.17.171:3000/`,
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

  const manualCalibration = () => {
    setSemiAutoCalibration(true);
    const currentSquaresMark = squares.Floor.map((rectangle, index) => {
      return {
        x:
          ((((rectangle.vertices[2].x + rectangle.vertices[0].x) / 2) *
            (calibrationImageRef.current.width / squares.Width) +
            positions[index].x) *
            squares.Wcalib) /
          calibrationImageRef.current.width,
        y:
          ((((rectangle.vertices[2].y + rectangle.vertices[0].y) / 2) *
            (calibrationImageRef.current.height / squares.Height) +
            positions[index].y) *
            squares.Hcalib) /
          calibrationImageRef.current.height,
      };
    });
    fetch("https://200.1.17.171:3000/calibration_semiautomatic", {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({
        Screenshot: imgSrc,
        email: "admin@admin.com",
        mark_1_x: currentSquaresMark[0].x,
        mark_1_y: currentSquaresMark[0].y,
        mark_2_x: currentSquaresMark[1].x,
        mark_2_y: currentSquaresMark[1].y,
        mark_3_x: currentSquaresMark[2].x,
        mark_3_y: currentSquaresMark[2].y,
        mark_4_x: currentSquaresMark[3].x,
        mark_4_y: currentSquaresMark[3].y,
        mark_5_x: currentSquaresMark[4].x,
        mark_5_y: currentSquaresMark[4].y,
        mark_6_x: currentSquaresMark[5].x,
        mark_6_y: currentSquaresMark[5].y,
      }),
      headers: { "Content-Type": "application/json" },
      //x-www-form-urlencoded
    })
      .then((response) => response.json()) //obtener las marcas
      .then((data) => {
        setCorrectCalibration(true);
        setCurrentMark(1);
        setTimeout(() => setSquares(data.response), [100]);
        setSemiAutoCalibration(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const saveCalibration = useCallback(() => {
    setCalibrated(false);
    setCurrentMessage("Guardando calibración");
    firebaseService
      .updateUserCalibration(
        userEmail,
        squares.Hcalib,
        squares.Wcalib,
        squares.Homography,
        squares.backgroundImage
      )
      .then(() => {
        document.getElementById("messageState").innerHTML =
          "Calibración Guardada";
        setTimeout(() => document.getElementById("myModal").click(), [1500]);
      })
      .catch((error) => {
        alert(error);
      });
  });

  const handleMouseDown = (index, event) => {
    setDragging(true);
    const updatedStartPositions = [...startPositions];
    updatedStartPositions[index] = {
      x: event.clientX - positions[index].x,
      y: event.clientY - positions[index].y,
    };
    setStartPositions(updatedStartPositions);
  };

  const handleMouseMove = (index, event) => {
    if (dragging) {
      const newPositions = [...positions];
      newPositions[index] = {
        x: event.clientX - startPositions[index].x,
        y: event.clientY - startPositions[index].y,
      };
      setPositions(newPositions);
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setStartPositions([]);
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
                      id="squaresContainer"
                      height="100%"
                      width="100%"
                      style={{ marginLeft: "-100%" }}
                    >
                      {squares &&
                        squares.Floor.map((rectangle, index) => (
                          <g key={`g ${index}`}>
                            <polygon
                              key={`p ${index}`}
                              points={
                                (rectangle.vertices[0].x *
                                  calibrationImageRef.current.width) /
                                  squares.Width +
                                "," +
                                (rectangle.vertices[0].y *
                                  calibrationImageRef.current.height) /
                                  squares.Height +
                                " " +
                                (rectangle.vertices[1].x *
                                  calibrationImageRef.current.width) /
                                  squares.Width +
                                "," +
                                (rectangle.vertices[1].y *
                                  calibrationImageRef.current.height) /
                                  squares.Height +
                                " " +
                                (rectangle.vertices[2].x *
                                  calibrationImageRef.current.width) /
                                  squares.Width +
                                "," +
                                (rectangle.vertices[2].y *
                                  calibrationImageRef.current.height) /
                                  squares.Height +
                                " " +
                                (rectangle.vertices[3].x *
                                  calibrationImageRef.current.width) /
                                  squares.Width +
                                "," +
                                (rectangle.vertices[3].y *
                                  calibrationImageRef.current.height) /
                                  squares.Height
                              }
                              style={{ fill: "#00F545", opacity: 0.6 }}
                            />
                            <text
                              key={`t ${index}`}
                              style={{ userSelect: "none" }}
                              x={
                                ((rectangle.vertices[2].x +
                                  rectangle.vertices[0].x) /
                                  2) *
                                  (calibrationImageRef.current.width /
                                    squares.Width) -
                                4.4
                              }
                              y={
                                ((rectangle.vertices[2].y +
                                  rectangle.vertices[0].y) /
                                  2) *
                                  (calibrationImageRef.current.height /
                                    squares.Height) +
                                4.4
                              }
                              fontFamily="Verdana"
                              fontSize="12"
                              fontWeight={"bold"}
                              fill="#F50000"
                            >
                              {rectangle.id}
                            </text>
                          </g>
                        ))}
                    </svg>
                  ) : (
                    <svg
                      id="squaresContainer"
                      height="100%"
                      width="100%"
                      style={{ marginLeft: "-100%" }}
                      onMouseUp={handleMouseUp}
                    >
                      {squares &&
                        squares.Floor.map(
                          (rectangle, index) =>
                            index < currentMark && (
                              <g
                                key={`g ${index}`}
                                transform={`translate(${
                                  positions[index]?.x || 0
                                }, ${positions[index]?.y || 0})`}
                                onMouseDown={(event) =>
                                  handleMouseDown(index, event)
                                }
                                onMouseMove={(event) =>
                                  handleMouseMove(index, event)
                                }
                                className="draggable"
                              >
                                <circle
                                  key={`cm ${index}`}
                                  cx={
                                    ((rectangle.vertices[2].x +
                                      rectangle.vertices[0].x) /
                                      2) *
                                    (calibrationImageRef.current.width /
                                      squares.Width)
                                  }
                                  cy={
                                    ((rectangle.vertices[2].y +
                                      rectangle.vertices[0].y) /
                                      2) *
                                    (calibrationImageRef.current.height /
                                      squares.Height)
                                  }
                                  r={12}
                                  fill="#00F545"
                                  style={{ opacity: 0.4 }}
                                />
                                <text
                                  key={`t ${index}`}
                                  style={{ userSelect: "none" }}
                                  x={
                                    ((rectangle.vertices[2].x +
                                      rectangle.vertices[0].x) /
                                      2) *
                                      (calibrationImageRef.current.width /
                                        squares.Width) +
                                    8
                                  }
                                  y={
                                    ((rectangle.vertices[2].y +
                                      rectangle.vertices[0].y) /
                                      2) *
                                      (calibrationImageRef.current.height /
                                        squares.Height) -
                                    8
                                  }
                                  fontFamily="Verdana"
                                  fontSize="12"
                                  fontWeight={"bold"}
                                  fill="#F50000"
                                >
                                  {rectangle.id}
                                </text>
                                <circle
                                  key={`c ${index}`}
                                  cx={
                                    ((rectangle.vertices[2].x +
                                      rectangle.vertices[0].x) /
                                      2) *
                                    (calibrationImageRef.current.width /
                                      squares.Width)
                                  }
                                  cy={
                                    ((rectangle.vertices[2].y +
                                      rectangle.vertices[0].y) /
                                      2) *
                                    (calibrationImageRef.current.height /
                                      squares.Height)
                                  }
                                  r={1} // Tamaño del punto
                                  fill="red"
                                />
                              </g>
                            )
                        )}
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
                              <g class="spinner_V8m1">
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
                    <circle class="spinner_b2T7" cx="4" cy="12" r="3" />
                    <circle
                      class="spinner_b2T7 spinner_YRVV"
                      cx="12"
                      cy="12"
                      r="3"
                    />
                    <circle
                      class="spinner_b2T7 spinner_c9oY"
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
