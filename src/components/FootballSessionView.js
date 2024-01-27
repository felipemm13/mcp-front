import { useContext, useEffect, useRef, useState } from "react";
import {
  animated,
  useSpring,
  useSprings,
  useSpringRef,
} from "@react-spring/web";
import "../styles/FootballSessionView.css";
import React from "react";
import { rand } from "../utility/math_functions";
import * as htmlToImage from "html-to-image";
import { Context } from "../services/Context";

const FootballSessionView = ({ view }) => {
  const { infoSession } = useContext(Context);
  const imgRef = useRef(null);
  const teamRef = useRef(null);
  const finalMessageAnimationRef = useSpringRef(null);
  const ballAnimationRef = useSpringRef(null);
  const idealPlayerAnimationRef = useSpringRef(null);
  const sessionContainer = useRef(null);

  const containerWidth = useRef(
    sessionContainer.current ? sessionContainer.current.clientWidth : 0
  );
  const containerHeight = useRef(
    sessionContainer.current ? sessionContainer.current.clientHeight : 0
  );
  const [count, setCount] = useState(null);
  const [showFinalMessage, setShowFinalMessage] = useState(false);
  const [showAnimation, setShowAnimation] = useState(null);
  const [numberOfPlayers, setNumberOfPlayers] = useState(null);
  const [numberOfDistractors, setNumberOfDistractors] = useState(null);
  const imageSequences = useRef([]);
  const stimulusTimeSequence = useRef([]);

  const finish = useSpring({
    ref: finalMessageAnimationRef,
  });

  const counter = useSpring({
    to: async (next) => {
      await next({ opacity: 1, transform: "scale(1.2)" });
      await next({ opacity: 0, transform: "scale(1)" });
    },
    from: { opacity: 1, transform: "scale(0.5)" },
    onRest: () => {
      if (count > 1) {
        setTimeout(1000);
        setCount(count - 1);
      } else if (count === 1) {
        setTimeout(1000);
        setCount(0);
        handleStartAnimation();
      }
    },
  });

  const ballAnimation = useSpring({
    ref: ballAnimationRef,
  });

  const idealPlayerAnimation = useSpring({ ref: idealPlayerAnimationRef });

  const [redPlayersAnimation, apiRedPlayersAnimation] = useSprings(
    numberOfPlayers ? numberOfPlayers.red : 5,
    (i) => ({}),
    []
  );

  const [yellowPlayersAnimation, apiYellowPlayersAnimation] = useSprings(
    numberOfPlayers ? numberOfPlayers.yellow : 5,
    (i) => ({}),
    []
  );

  const [discriminativeAnimation, apiDiscriminativeAnimation] = useSprings(
    numberOfDistractors ? numberOfDistractors : 8,
    (i) => [],
    []
  );

  const handleStartAnimation = () => {
    sessionContainer.current.style.border = "5px solid #FF0000";
    containerWidth.current = sessionContainer.current.clientWidth;
    containerHeight.current = sessionContainer.current.clientHeight;
    switch (infoSession.current.typeOfSession.current) {
      case "reactive":
        handleReactiveAnimation();
        break;
      case "discriminative":
        handleDiscriminativeAnimation();
        break;
      case "applied":
        handleAppliedAnimation();
        break;
      default:
        break;
    }
  };

  const handleFinishAnimation = () => {
    if (view === "coach") {
      document
        .getElementById("webcamContainer")
        .dispatchEvent(new Event("stopRecord"));
      infoSession.current = {
        ...infoSession.current,
        imageSequences: imageSequences.current,
        stimulusTime: stimulusTimeSequence.current,
      };
      document.getElementById("SaveCaptureVideo").removeAttribute("disabled");
      document.getElementById("OpenAnalizerView").removeAttribute("disabled");
    }
    setShowAnimation("");
    setShowFinalMessage(true);
    if (imgRef.current && imgRef.current.src !== "assets/player-zone.png") {
      imgRef.current.src = "assets/player-zone.png";
    }
    if (sessionContainer.current) {
      sessionContainer.current.style.border = "none";
    }
    finalMessageAnimationRef.start({
      from: { opacity: 0, transform: "scale(0.75)" },
      to: { opacity: 1, transform: "scale(1.5)" },
    });
  };

  const handleReactiveAnimation = () => {
    stimulusTimeSequence.current = [];
    imageSequences.current = [];
    let sequenceIndex = 0;
    let positions = [
      {
        cx: containerWidth.current * (1 / 6),
        cy: containerHeight.current * (1 / 6),
      },
      {
        cx: containerWidth.current * (3 / 6),
        cy: containerHeight.current * (1 / 6),
      },
      {
        cx: containerWidth.current * (5 / 6),
        cy: containerHeight.current * (1 / 6),
      },
      {
        cx: containerWidth.current * (1 / 6),
        cy: containerHeight.current * (3 / 6),
      },
      {
        cx: containerWidth.current * (5 / 6),
        cy: containerHeight.current * (3 / 6),
      },
      {
        cx: containerWidth.current * (1 / 6),
        cy: containerHeight.current * (5 / 6),
      },
      {
        cx: containerWidth.current * (3 / 6),
        cy: containerHeight.current * (5 / 6),
      },
      {
        cx: containerWidth.current * (5 / 6),
        cy: containerHeight.current * (5 / 6),
      },
    ];
    const ballAnimationMoves = infoSession.current.sequenceOfPlays.current.map(
      (sequence) => {
        let ballPosition;
        if (sequence > 4) {
          ballPosition = sequence - 2;
        } else {
          ballPosition = sequence - 1;
        }
        if (
          positions[ballPosition - 1] &&
          positions[ballPosition].cx === positions[ballPosition - 1].cx &&
          positions[ballPosition].cy === positions[ballPosition - 1].cy
        ) {
          return {
            x: positions[ballPosition].cx + 0.1,
            y: positions[ballPosition].cy,
            opacity: 1,
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          };
        } else {
          return {
            x: positions[ballPosition].cx,
            y: positions[ballPosition].cy,
            opacity: 1,
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          };
        }
      }
    );
    setShowAnimation("reactive");
    setTimeout(() => {
      htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
        imageSequences.current.push(dataUrl);
      });
    }, [infoSession.current.secondsForPlayTransition.current * 750]);
    ballAnimationRef.update({
      from: ballAnimationMoves[0],
      to: [
        ...ballAnimationMoves.splice(1, ballAnimationMoves.length - 1),
        {
          x: containerWidth.current * 0.5,
          y: containerHeight.current * 0.5,
          opacity: 0,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        },
      ],
      config: {
        duration: infoSession.current.secondsForPlayTransition.current * 1000,
      },
      onResolve: () => handleFinishAnimation(),
      onStart: () => {
        if (view === "coach") {
          if (
            sequenceIndex <
            infoSession.current.sequenceOfPlays.current.length - 1
          ) {
            stimulusTimeSequence.current.push(new Date().getTime() - time);
            setTimeout(() => {
              htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
                imageSequences.current.push(dataUrl);
              });
            }, [
              infoSession.current.secondsToNextPlay.current * 250 +
                infoSession.current.secondsForPlayTransition.current * 1000,
            ]);
            sequenceIndex++;
          }
        }
      },
    });
    if (view === "coach") {
      document
        .getElementById("webcamContainer")
        .dispatchEvent(new Event("startRecord"));
    }
    let time = new Date().getTime();
    stimulusTimeSequence.current.push(0);
    ballAnimationRef.start();
  };

  const handleDiscriminativeAnimation = () => {
    let seed = new Date().getSeconds();
    let checkbox = document.getElementById("randomSeed").isChecked;
    if (checkbox) {
      if (infoSession.current.seed) {
        seed = infoSession.current.seed;
      }
    }
    let colors = [];
    let positions = [];
    let indexSequence = 0;
    stimulusTimeSequence.current = [];
    imageSequences.current = [];
    setShowAnimation("discriminative");
    setNumberOfDistractors(infoSession.current.numOfDistractors.current + 1);
    let distractorsMoves = [[], [], [], [], [], [], [], []];
    infoSession.current.sequenceOfPlays.current.forEach(
      (sequence, iteracion) => {
        colors = [
          "black",
          "blue",
          "cyan",
          "gray",
          "green",
          "red",
          "white",
          "yellow",
        ];
        positions = [
          {
            cx: containerWidth.current * (1 / 6),
            cy: containerHeight.current * (1 / 6),
          },
          {
            cx: containerWidth.current * (3 / 6),
            cy: containerHeight.current * (1 / 6),
          },
          {
            cx: containerWidth.current * (5 / 6),
            cy: containerHeight.current * (1 / 6),
          },
          {
            cx: containerWidth.current * (1 / 6),
            cy: containerHeight.current * (3 / 6),
          },
          {
            cx: containerWidth.current * (5 / 6),
            cy: containerHeight.current * (3 / 6),
          },
          {
            cx: containerWidth.current * (1 / 6),
            cy: containerHeight.current * (5 / 6),
          },
          {
            cx: containerWidth.current * (3 / 6),
            cy: containerHeight.current * (5 / 6),
          },
          {
            cx: containerWidth.current * (5 / 6),
            cy: containerHeight.current * (5 / 6),
          },
        ];
        let indexColor;
        let indexPosition;
        for (
          let i = 0;
          i <= infoSession.current.numOfDistractors.current;
          i++
        ) {
          if (colors.length - 1 > 0) {
            indexColor = rand(
              0,
              colors.length - 1,
              seed * (iteracion + 1) * sequence
            );
          } else {
            indexColor = 0;
          }
          if (i === 0) {
            if (infoSession.current.sequenceOfPlays.current[iteracion] > 4) {
              indexPosition =
                infoSession.current.sequenceOfPlays.current[iteracion] - 2;
            } else {
              indexPosition =
                infoSession.current.sequenceOfPlays.current[iteracion] - 1;
            }
          } else {
            if (positions.length - 1 > 0) {
              indexPosition = rand(
                0,
                positions.length - 1,
                seed * (iteracion + 1) * sequence
              );
            } else {
              indexPosition = 0;
            }
          }
          if (
            distractorsMoves[i][iteracion - 1] &&
            positions[indexPosition].cx ===
              distractorsMoves[i][iteracion - 1].cx &&
            positions[indexPosition].cy ===
              distractorsMoves[i][iteracion - 1].cy
          ) {
            distractorsMoves[i][iteracion] = {
              cx: positions[indexPosition].cx + 0.1,
              cy: positions[indexPosition].cy,
              opacity: 1,
              fill: colors[indexColor],
              delay: infoSession.current.secondsToNextPlay.current * 1000,
            };
          } else {
            distractorsMoves[i][iteracion] = {
              cx: positions[indexPosition].cx,
              cy: positions[indexPosition].cy,
              opacity: 1,
              fill: colors[indexColor],
              delay: infoSession.current.secondsToNextPlay.current * 1000,
            };
          }
          colors.splice(indexColor, 1);
          positions.splice(indexPosition, 1);
        }
      }
    );
    let sequenceIndex = 0;
    console.log(distractorsMoves);
    apiDiscriminativeAnimation.update((i) => {
      if (distractorsMoves[i]) {
        let distractorsInitialPosition = distractorsMoves[i].shift();
        if (i === 0) {
          let color =
            distractorsInitialPosition && distractorsInitialPosition.fill;
          teamRef.current.style.fill = color;
          //imgRef.current.src = `assets/reactions/reaction-${color}.jpg`;
          if (
            indexSequence < infoSession.current.sequenceOfPlays.current.length
          ) {
            setTimeout(() => {
              htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
                imageSequences.current.push(dataUrl);
              });
            }, [infoSession.current.secondsForPlayTransition.current * 750]);
            indexSequence++;
          }
        }
        return {
          from: distractorsInitialPosition,
          to: [
            distractorsMoves[i],
            {
              cx: containerWidth.current * 0.5,
              cy: containerHeight.current * 0.5,
              opacity: 0,
              delay: infoSession.current.secondsToNextPlay.current * 1000,
            },
          ],
          config: {
            duration:
              infoSession.current.secondsForPlayTransition.current * 1000,
          },
          onStart: () => {
            if (i === 0 && distractorsMoves[i][sequenceIndex]) {
              let color = distractorsMoves[i][sequenceIndex++].fill;
              //imgRef.current.src = `assets/reactions/reaction-${color}.jpg`;
              teamRef.current.style.fill = color;
              if (
                indexSequence <
                infoSession.current.sequenceOfPlays.current.length
              ) {
                stimulusTimeSequence.current.push(new Date().getTime() - time);
                setTimeout(() => {
                  htmlToImage
                    .toJpeg(sessionContainer.current)
                    .then((dataUrl) => {
                      imageSequences.current.push(dataUrl);
                    });
                }, [
                  infoSession.current.secondsToNextPlay.current * 250 +
                    infoSession.current.secondsForPlayTransition.current * 1000,
                ]);
                indexSequence++;
              }
            }
          },
          onResolve: () => {
            if (i === 0) {
              handleFinishAnimation();
            }
          },
        };
      }
    }, []);
    if (view === "coach") {
      document
        .getElementById("webcamContainer")
        .dispatchEvent(new Event("startRecord"));
    }
    let time = new Date().getTime();
    stimulusTimeSequence.current.push(0);
    apiDiscriminativeAnimation.start();
  };

  const handleAppliedAnimation = () => {
    stimulusTimeSequence.current = [];
    imageSequences.current = [];
    let sequenceIndex = 0;

    const plays = infoSession.current.sequenceOfPlays.current.map(
      (sequence) => {
        let play = infoSession.current.playsFromDb.current.find(
          (play) => play.playsId === sequence
        );
        return play;
      }
    );
    let maxPlayersInPlayRed = 0;
    let maxPlayersInPlayYellow = 0;

    plays.forEach((play) => {
      let playersInPlayRed = 0;
      let playersInPlayYellow = 0;

      play.figureCoordinates.forEach((player) => {
        if (player.color === "Red") {
          playersInPlayRed++;
        } else if (player.color === "Yellow") {
          playersInPlayYellow++;
        }
      });

      // Actualizar el contador máximo para cada equipo
      maxPlayersInPlayRed = Math.max(maxPlayersInPlayRed, playersInPlayRed);
      maxPlayersInPlayYellow = Math.max(
        maxPlayersInPlayYellow,
        playersInPlayYellow
      );
    });
    let maxPlayersInPlay = Math.max(
      maxPlayersInPlayRed,
      maxPlayersInPlayYellow
    );
    setNumberOfPlayers({
      red: maxPlayersInPlay,
      yellow: maxPlayersInPlay,
    });

    let playerTeams = plays.map((play) => play.Team);

    //Red players
    let redPlayersMoves = plays.map((play) => {
      return play.figureCoordinates.map((player) => {
        if (player.color === "Red") {
          return {
            cx: (player.xCoor / 50) * containerWidth.current,
            cy: (player.yCoor / 50) * containerHeight.current,
            opacity: 1,
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          };
        }else{
          return undefined
        }
      });
    });
    redPlayersMoves = redPlayersMoves.map((move) =>
      move.filter((player) => player !== undefined)
    );

    let animationRedPlayersMoves = [];
    for (let i = 0; i < apiRedPlayersAnimation.current.length; i++) {
      animationRedPlayersMoves.push(
        redPlayersMoves.map((move, j) => {
          if (move[i]) {
            return move[i];
          } else {
            return {
              cx: containerWidth.current * 0.5 + j/10,
              cy: containerHeight.current * 0.5,
              opacity: 0,
              delay: infoSession.current.secondsToNextPlay.current * 1000,
            };
          }
        })
      );
    }

    //Yellow players
    let yellowPlayersMoves = plays.map((play, index) => {
      return play.figureCoordinates.map((player) => {
        if (player.color === "Yellow") {
          return {
            cx: (player.xCoor / 50) * containerWidth.current,
            cy: (player.yCoor / 50) * containerHeight.current,
            opacity: 1,
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          };
        }else{
          return undefined
        }
      });
    });
    yellowPlayersMoves = yellowPlayersMoves.map((move) =>
      move.filter((player) => player !== undefined)
    );
    let animationYellowPlayersMoves = [];
    for (let i = 0; i < apiYellowPlayersAnimation.current.length; i++) {
      animationYellowPlayersMoves.push(
        yellowPlayersMoves.map((move, j) => {
          if (move[i]) {
            return move[i];
          } else {
            return {
              cx: containerWidth.current * 0.5 + j/10,
              cy: containerHeight.current * 0.5,
              opacity: 0,
              delay: infoSession.current.secondsToNextPlay.current * 1000,
            };
          }
        })
      );
    }

    //Ideal Player
    let animationIdealPlayerMoves = plays.map((play) => {
      return {
        cx: (play.IdealPositionX / 50) * containerWidth.current,
        cy: (play.IdealPositionY / 50) * containerHeight.current,
        opacity: 1,
        delay: infoSession.current.secondsToNextPlay.current * 1000,
      };
    });

    //Ball Animation
    let animationBallMoves = plays.map((play) => {
      return {
        x: (play.ballX / 50) * containerWidth.current,
        y: (play.ballY / 50) * containerHeight.current,
        opacity: 1,
        delay: infoSession.current.secondsToNextPlay.current * 1000,
      };
    });

    //console.log(animationRedPlayersMoves);
    //console.log(animationYellowPlayersMoves);
    animationRedPlayersMoves = animationRedPlayersMoves.map((move, index) => {
      for (let i = 0; i < move.length; i++) {
        if (
          move[i - 1] &&
          move[i] &&
          move[i - 1].cx === move[i].cx &&
          move[i - 1].cy === move[i].cy
          ) {
          move[i] = {
            ...move[i],
            cx: move[i].cx + 0.1,
          };
        }
      }
      return move;
    });
    animationYellowPlayersMoves = animationYellowPlayersMoves.map((move, index) => {
      for (let i = 0; i < move.length; i++) {
        if (
          move[i - 1] &&
          move[i] &&
          move[i - 1].cx === move[i].cx &&
          move[i - 1].cy === move[i].cy
          ) {
            move[i] = {
              ...move[i],
              cx: move[i].cx + 0.1,
            };
          }
        }
        return move;
      });
      setShowAnimation("applied");
    //console.log(animationYellowPlayersMoves);
    //Actualizar animaciones red players
    apiRedPlayersAnimation.update((i) => {
      return {
        from: animationRedPlayersMoves[i][0],
        to: [
          ...animationRedPlayersMoves[i].slice(1),
          {
            cx: containerWidth.current * 0.5,
            cy: containerHeight.current * 0.5,
            opacity: 0,
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          },
        ],
        config: {
          duration: infoSession.current.secondsForPlayTransition.current * 1000,
        },
      };
    }, []);

    //Actualizar animaciones yellow players
    apiYellowPlayersAnimation.update((i) => {
      return {
        from: animationYellowPlayersMoves[i][0],
        to: [
          ...animationYellowPlayersMoves[i].slice(1),
          {
            cx: containerWidth.current * 0.5,
            cy: containerHeight.current * 0.5,
            opacity: 0,
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          },
        ],
        config: {
          duration: infoSession.current.secondsForPlayTransition.current * 1000,
        },
      };
    }, []);

    //Actualizar animaciones ideal player
    idealPlayerAnimationRef.update({
      from: animationIdealPlayerMoves[0],
      to: [
        ...animationIdealPlayerMoves.slice(1),
        {
          cx: containerWidth.current * 0.5,
          cy: containerHeight.current * 0.5,
          opacity: 0,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        },
      ],
      config: {
        duration: infoSession.current.secondsForPlayTransition.current * 1000,
      },
    });

    //Actualizar animaciones ball
    let teamIndex = 0;
    ballAnimationRef.update(() => {
      teamRef.current.style.fill =
        playerTeams[teamIndex++] === "Red" ? "#FF0000" : "#FFFF00";
      if (view === "coach") {
        if (
          sequenceIndex < infoSession.current.sequenceOfPlays.current.length
        ) {
          setTimeout(() => {
            htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
              imageSequences.current.push(dataUrl);
            });
          }, [infoSession.current.secondsForPlayTransition.current * 750]);
          sequenceIndex++;
        }
      }
      return {
        from: animationBallMoves[0],
        to: [
          ...animationBallMoves.slice(1),
          {
            x: containerWidth.current * 0.5,
            y: containerHeight.current * 0.5,
            opacity: 0,
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          },
        ],
        config: {
          duration: infoSession.current.secondsForPlayTransition.current * 1000,
        },
        onResolve: () => handleFinishAnimation(),

        onStart: () => {
          if (playerTeams.length > teamIndex) {
            teamRef.current.style.fill =
              playerTeams[teamIndex++] === "Red" ? "#FF0000" : "#FFFF00";
          }
          if (view === "coach") {
            if (
              sequenceIndex < infoSession.current.sequenceOfPlays.current.length
            ) {
              stimulusTimeSequence.current.push(new Date().getTime() - time);
              setTimeout(() => {
                htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
                  imageSequences.current.push(dataUrl);
                });
              }, [
                infoSession.current.secondsToNextPlay.current * 1000 +
                  infoSession.current.secondsForPlayTransition.current * 250,
              ]);
              sequenceIndex++;
            }
          }
        },
      };
    });

    if (view === "coach") {
      document
        .getElementById("webcamContainer")
        .dispatchEvent(new Event("startRecord"));
    }
    let time = new Date().getTime();
    stimulusTimeSequence.current.push(0);
    setTimeout(() => {
      htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
        imageSequences.current.push(dataUrl);
      });
    }, [infoSession.current.secondsForPlayTransition.current * 750]);
    ballAnimationRef.start();
    idealPlayerAnimationRef.start();
    apiRedPlayersAnimation.start();
    apiYellowPlayersAnimation.start();
  };

  const handleStartSesion = () => {
    setCount(3);
    setShowFinalMessage(false);
    setShowAnimation("");
    if (sessionContainer.current) {
      sessionContainer.current.style.border = "none";
    }
    document.getElementById("SaveCaptureVideo").setAttribute("disabled", true);
    document.getElementById("SaveCaptureVideo").innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="25" width="25" viewBox="0 0 448 512">
    <path d="M48 96V416c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16V170.5c0-4.2-1.7-8.3-4.7-11.3l33.9-33.9c12 12 18.7 28.3 18.7 45.3V416c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V96C0 60.7 28.7 32 64 32H309.5c17 0 33.3 6.7 45.3 18.7l74.5 74.5-33.9 33.9L320.8 84.7c-.3-.3-.5-.5-.8-.8V184c0 13.3-10.7 24-24 24H104c-13.3 0-24-10.7-24-24V80H64c-8.8 0-16 7.2-16 16zm80-16v80H272V80H128zm32 240a64 64 0 1 1 128 0 64 64 0 1 1 -128 0z" />
  </svg>
  Guardar Sesion`;
    document
      .getElementById("OpenAnalizerView")
      .setAttribute("disabled", "true");
  };

  useEffect(() => {
    document
      .getElementById("StartCaptureVideo")
      .addEventListener("click", handleStartSesion);
  }, []);

  return (
    <div
      className={
        view === "coach"
          ? "sessionPlayerContainer"
          : "sessionPlayerContainerPlayerView"
      }
      ref={sessionContainer}
    >
      <img
        id="ImagePlayerSesion"
        alt="playerZone"
        ref={imgRef}
        src="assets/player-zone.png"
        style={{
          height: "100%",
          width: "100%",
          aspectRatio: "1/1",
        }}
      />

      <div id="containerMessages" className="containerMessages">
        {count > 0 && (
          <animated.div
            id="counterAnimation"
            style={{
              ...counter,
              fontSize: "6em",
            }}
          >
            {count}
          </animated.div>
        )}
        {showFinalMessage && (
          <animated.div
            id="FinalMessage"
            style={{
              fontSize: "4em",
              maxWidth: "90%",
              textAlign: "center",
              ...finish,
            }}
          >
            Finalizado
          </animated.div>
        )}
      </div>
      <div className="containerTeam" ref={teamRef}>
        {(showAnimation === "discriminative" ||
          showAnimation === "applied") && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height={view === "player" ? "14vmin" : "10vmin"}
            width={view === "player" ? "14vmin" : "10vmin"}
            viewBox="0 0 512 512"
          >
            <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z" />
          </svg>
        )}
      </div>
      <div id="containerAnimation" className="containerAnimation">
        {showAnimation === "reactive" && (
          <animated.div
            id="Animation"
            style={{
              width: 0,
              height: 0,
              justifySelf: "start",
              alignSelf: "start",
              ...ballAnimation,
            }}
          >
            <svg
              width={view === "player" ? "14vmin" : "10vmin"}
              height={view === "player" ? "14vmin" : "10vmin"}
              style={{
                marginTop: view === "player" ? "-7vmin" : "-5vmin",
                marginLeft: view === "player" ? "-7vmin" : "-5vmin",
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
          </animated.div>
        )}

        {showAnimation === "discriminative" && (
          <svg
            width="100%"
            height="100%"
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          >
            {discriminativeAnimation.map((distractor, index) => (
              <animated.circle
                cx={containerWidth.current * 0.5}
                cy={containerHeight.current * 0.5}
                key={index}
                style={distractor}
                opacity={0}
                r={view === "player" ? "6vmin" : "4vmin"}
              />
            ))}
          </svg>
        )}
        {showAnimation === "applied" && (
          <>
            <svg
              width="100%"
              height="100%"
              style={{ maxWidth: "100%", maxHeight: "100%" }}
            >
              {redPlayersAnimation.map((player, index) => (
                <animated.circle
                  cx={containerWidth.current * 0.5}
                  cy={containerHeight.current * 0.5}
                  key={index}
                  style={player}
                  opacity={0}
                  r={view === "player" ? "7vmin" : "5vmin"}
                  fill="red"
                />
              ))}
              {yellowPlayersAnimation.map((player, index) => (
                <animated.circle
                  cx={containerWidth.current * 0.5}
                  cy={containerHeight.current * 0.5}
                  key={index}
                  style={player}
                  opacity={0}
                  r={view === "player" ? "7vmin" : "5vmin"}
                  fill="yellow"
                />
              ))}
              {view === "coach" && (
                <animated.circle
                  cx={containerWidth.current * 0.5}
                  cy={containerHeight.current * 0.5}
                  opacity={0}
                  r={view === "player" ? "7vmin" : "5vmin"}
                  fill="green"
                  style={idealPlayerAnimation}
                />
              )}
            </svg>
            <animated.div
              id="Animation"
              style={{
                width: 0,
                height: 0,
                marginLeft: "-100%",
                opacity: 1,
                ...ballAnimation,
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={view === "player" ? "14vmin" : "10vmin"}
                height={view === "player" ? "14vmin" : "10vmin"}
                style={{
                  marginTop: view === "player" ? "-7vmin" : "-5vmin",
                  marginLeft: view === "player" ? "-7vmin" : "-5vmin",
                }}
                viewBox="-2500 -2500 5000 5000"
              >
                <g stroke="#000" stroke-width="24">
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
            </animated.div>
          </>
        )}
      </div>
    </div>
  );
};
export default FootballSessionView;
