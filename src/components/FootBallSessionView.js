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
    numberOfPlayers ? numberOfPlayers.red : 4,
    (i) => ({}),
    []
  );

  const [yellowPlayersAnimation, apiYellowPlayersAnimation] = useSprings(
    numberOfPlayers ? numberOfPlayers.yellow : 4,
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
      var link = document.createElement("a");
      imageSequences.current.forEach((image, index) => {
        link.href = image;
        link.download = "image.jpeg";
        //link.click();
      });
      //console.log(stimulusTimeSequence.current)
      infoSession.current = {
        ...infoSession.current,
        imageSequences: imageSequences.current,
        stimulusTime: stimulusTimeSequence.current,
      };
      //console.log(infoSession.current);
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
      to: { opacity: 1, transform: "scale(1.5)" },

      from: { opacity: 0, transform: "scale(0.75)" },
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
        return {
          x: positions[ballPosition].cx,
          y: positions[ballPosition].cy,
          opacity: 1,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        };
      }
    );
    setShowAnimation("reactive");
    ballAnimationRef.update({
      from: {
        x: containerWidth.current * 0.5,
        y: containerHeight.current * 0.5,
        opacity: 0,
      },
      to: [ballAnimationMoves],
      config: {
        duration: infoSession.current.secondsForPlayTransition.current * 1000,
      },
      onResolve: () =>
        setTimeout(
          () => handleFinishAnimation(),
          infoSession.current.secondsToNextPlay.current * 1000
        ),
      onStart: () => {
        if (view === "coach") {
          if (
            sequenceIndex < infoSession.current.sequenceOfPlays.current.length
          ) {
            stimulusTimeSequence.current.push(new Date().getTime() - time);
            setTimeout(() => {
              htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
                imageSequences.current.push(dataUrl);
              });
            }, [infoSession.current.secondsForPlayTransition.current * 1000]);
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
    ballAnimationRef.start();
  };

  const handleDiscriminativeAnimation = () => {
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
          "brown",
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
          indexColor = Math.floor(Math.random() * (colors.length - 1));
          if (i === 0) {
            if (infoSession.current.sequenceOfPlays.current[iteracion] > 4) {
              indexPosition =
                infoSession.current.sequenceOfPlays.current[iteracion] - 2;
            } else {
              indexPosition =
                infoSession.current.sequenceOfPlays.current[iteracion] - 1;
            }
          } else {
            indexPosition = rand(0, positions.length - 1, sequence * 100);
          }
          distractorsMoves[i][iteracion] = {
            cx: positions[indexPosition].cx,
            cy: positions[indexPosition].cy,
            opacity: 1,
            fill: colors[indexColor],
            delay: infoSession.current.secondsToNextPlay.current * 1000,
          };
          colors.splice(indexColor, 1);
          positions.splice(indexPosition, 1);
        }
      }
    );

    let sequenceIndex = 0;
    apiDiscriminativeAnimation.update((i) => {
      return {
        from: {
          cx: containerWidth.current * 0.5,
          cy: containerHeight.current * 0.5,
          opacity: 0,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        },
        to: [distractorsMoves[i]],
        config: {
          duration: infoSession.current.secondsForPlayTransition.current * 1000,
        },
        onStart: () => {
          if (i === 0) {
            let color = distractorsMoves[i][sequenceIndex++].fill;
            imgRef.current.src = `assets/reactions/reaction-${color}.jpg`;
            if (
              indexSequence < infoSession.current.sequenceOfPlays.current.length
            ) {
              stimulusTimeSequence.current.push(new Date().getTime() - time);
              setTimeout(() => {
                htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
                  imageSequences.current.push(dataUrl);
                });
              }, [infoSession.current.secondsForPlayTransition.current * 1000]);
              indexSequence++;
            }
          }
        },
        onResolve: () => {
          if (i === 0) {
            setTimeout(
              () => handleFinishAnimation(),
              infoSession.current.secondsToNextPlay.current * 1000
            );
          }
        },
      };
    }, []);
    if (view === "coach") {
      document
        .getElementById("webcamContainer")
        .dispatchEvent(new Event("startRecord"));
    }
    let time = new Date().getTime();
    apiDiscriminativeAnimation.start();
  };

  const handleAppliedAnimation = () => {
    stimulusTimeSequence.current = [];
    imageSequences.current = [];
    let sequenceIndex = 0;
    const plays = infoSession.current.sequenceOfPlays.current.map(
      (sequence) => {
        let play = infoSession.current.playsFromDb.current.find(
          (play) => play.id === sequence.toString()
        );
        return play;
      }
    );
    setNumberOfPlayers({
      red: Math.max(...plays.map((play) => play.Red.length)),
      yellow: Math.max(...plays.map((play) => play.Yellow.length)),
    });

    //console.log("Applied");
    let playerTeams = plays.map((play) => play.PlayerTeam);

    //Red players
    let redPlayersMoves = plays.map((play) => {
      return play.Red.map((player) => {
        return {
          cx: (player.x / 48) * containerWidth.current,
          cy: (player.y / 48) * containerHeight.current,
          opacity: 1,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        };
      });
    });

    let animationRedPlayersMoves = [];
    for (let i = 0; i < apiRedPlayersAnimation.current.length; i++) {
      animationRedPlayersMoves.push(
        redPlayersMoves.map((move) => {
          if (move[i]) {
            return move[i];
          } else {
            return {
              opacity: 0,
              delay: infoSession.current.secondsToNextPlay.current * 1000,
            };
          }
        })
      );
    }

    //Yellow players
    let yellowPlayersMoves = plays.map((play) => {
      return play.Yellow.map((player) => {
        return {
          cx: (player.x / 48) * containerWidth.current,
          cy: (player.y / 48) * containerHeight.current,
          opacity: 1,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        };
      });
    });

    let animationYellowPlayersMoves = [];
    for (let i = 0; i < apiYellowPlayersAnimation.current.length; i++) {
      animationYellowPlayersMoves.push(
        yellowPlayersMoves.map((move) => {
          if (move[i]) {
            return move[i];
          } else {
            return {
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
        cx: (play.PlayerIdealPosition.x / 48) * containerWidth.current,
        cy: (play.PlayerIdealPosition.y / 48) * containerHeight.current,
        opacity: 1,
        delay: infoSession.current.secondsToNextPlay.current * 1000,
      };
    });

    //Ball Animation
    let animationBallMoves = plays.map((play) => {
      return {
        x: (play.Ball.x / 48) * containerWidth.current,
        y: (play.Ball.y / 48) * containerHeight.current,
        opacity: 1,
        delay: infoSession.current.secondsToNextPlay.current * 1000,
      };
    });
    setShowAnimation("applied");
    //Actualizar animaciones red players
    apiRedPlayersAnimation.update((i) => {
      return {
        from: {
          cx: containerWidth.current * 0.5,
          cy: containerHeight.current * 0.5,
          opacity: 0,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        },
        to: animationRedPlayersMoves[i],
        config: {
          duration: infoSession.current.secondsForPlayTransition.current * 1000,
        },
      };
    }, []);

    //Actualizar animaciones yellow players
    apiYellowPlayersAnimation.update((i) => {
      return {
        from: {
          cx: containerWidth.current * 0.5,
          cy: containerHeight.current * 0.5,
          opacity: 0,
          delay: infoSession.current.secondsToNextPlay.current * 1000,
        },
        to: animationYellowPlayersMoves[i],
        config: {
          duration: infoSession.current.secondsForPlayTransition.current * 1000,
        },
      };
    }, []);

    //Actualizar animaciones ideal player
    idealPlayerAnimationRef.update({
      from: {
        cx: containerWidth.current * 0.5,
        cy: containerHeight.current * 0.5,
        opacity: 0,
        delay: infoSession.current.secondsToNextPlay.current * 1000,
      },
      to: animationIdealPlayerMoves,
      config: {
        duration: infoSession.current.secondsForPlayTransition.current * 1000,
      },
    });

    //Actualizar animaciones ball
    let teamIndex = 0;
    ballAnimationRef.update({
      from: {
        x: containerWidth.current * 0.5,
        y: containerHeight.current * 0.5,
        opacity: 0,
        delay: infoSession.current.secondsToNextPlay.current * 1000,
      },
      to: animationBallMoves,
      config: {
        duration: infoSession.current.secondsForPlayTransition.current * 1000,
      },
      onResolve: () =>
        setTimeout(
          () => handleFinishAnimation(),
          infoSession.current.secondsToNextPlay.current * 1000
        ),
      onStart: () => {
        imgRef.current.src = `assets/teams/team-${
          playerTeams[teamIndex++]
        }.jpg`;
        if (view === "coach") {
          if (
            sequenceIndex < infoSession.current.sequenceOfPlays.current.length
          ) {
            stimulusTimeSequence.current.push(new Date().getTime() - time);
            setTimeout(() => {
              htmlToImage.toJpeg(sessionContainer.current).then((dataUrl) => {
                imageSequences.current.push(dataUrl);
              });
            }, [infoSession.current.secondsForPlayTransition.current * 1000]);
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
    ballAnimationRef.start();
    idealPlayerAnimationRef.start();
    apiRedPlayersAnimation.start();
    apiYellowPlayersAnimation.start();
  };

  const handleStartSesion = () => {
    setCount(3);
    imgRef.current.src = "assets/player-zone.png";
    setShowFinalMessage(false);
    setShowAnimation("");
    if (sessionContainer.current.style) {
      sessionContainer.current.style.border = "none";
    }
    document.getElementById("SaveCaptureVideo").setAttribute("disabled", true);
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
        //width="1920px"
        //height="720px"
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
