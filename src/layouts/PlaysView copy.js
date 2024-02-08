import { useNavigate } from "react-router-dom";
import "../styles/PlaysView.css";
import { useCallback, useContext, useEffect, useState } from "react";
import { Context } from "../services/Context";
import Routes from "../connection/path";
import Draggable from "react-draggable";

const PlaysView = () => {
  const { CrudApi } = useContext(Context);
  const navigate = useNavigate();
  const [playsFromDb, setPlaysFromDb] = useState([]);
  const [colorTeam, setColorTeam] = useState("red");

  useEffect(() => {
    getPlays();
  }, []);

  const getPlays = async () => {
    await CrudApi.get(Routes.playsRoutes.GETPLAYFIGCOORD)
      .then((response) => {
        setPlaysFromDb(response);
      })
      .catch((error) => console.log(error));
  };
  return (
    <div className="PlaysViewContainer">
      <div className="PlaysViewBackButton">
        <button
          className="PlaysViewButtonBack"
          onClick={() => {
            navigate("/");
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
      </div>
      <div className="PlaysViewPlaysContainer">
        <div className="PlaysViewPlays">
          <div className="PlaysViewPlayImageContainer">
            <img className="PlaysViewPlayImage" src="assets/player-zone.png" />
          </div>
          <div className="PlaysViewPlayPlayersContainer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height={"100%"}
              width={"100%"}
              viewBox="0 0 100 100"
            >
              <foreignObject x="40%" y="42%" width="18%" height="20%">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 512 512"
                  fill={colorTeam}
                >
                  <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z" />
                </svg>
              </foreignObject>
              <Draggable offsetParent={document.getElementById('PlaysViewPlayPlayersContainer')}>
                <foreignObject x="40%" y="10%" width="14%" height="18%">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
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
                </foreignObject>
              </Draggable>
              <foreignObject x="50%" y="10%" width="14%" height="18%">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <circle cx={"50%"} cy={"50%"} r={"46.8%"} fill="red" />
                </svg>
              </foreignObject>
              <foreignObject x="25%" y="10%" width="14%" height="18%">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <circle cx={"50%"} cy={"50%"} r={"46.8%"} fill="yellow" />
                </svg>
              </foreignObject>
              <foreignObject x="80%" y="10%" width="14%" height="18%">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <circle cx={"50%"} cy={"50%"} r={"46.8%"} fill="green" />
                </svg>
              </foreignObject>
            </svg>
          </div>
        </div>
        <div className="PlaysViewHandlePlays">
          <div>
            <div>
              <div>
                <h2>
                  Puede agregar nuevas situaciones de juego o editar una creada
                  anteriormente
                </h2>
              </div>
              <div>
                <h4>Jugada base</h4>

                <div>
                  <select className="">
                    <option disabled="">Seleccionar una jugada base</option>
                    {playsFromDb.map((play) => (
                      <option key={play.playsId} value={play.playsIDd}>
                        {play.playsId}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <h4>Equipo del deportista</h4>
                  <div>
                    <select onChange={(e) => setColorTeam(e.target.value)}>
                      <option value="red">Rojo</option>
                      <option value="yellow">Amarillo</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <h4>Deportistas rojos</h4>
                </div>
                <div className="">
                  <input
                    id="sessionType"
                    type="number"
                    min="1"
                    max="4"
                    step="1"
                    defaultValue={1}
                  />
                </div>
              </div>
              <div>
                <div>
                  <h4>Deportistas amarillos</h4>
                </div>
                <div>
                  <input
                    id="sessionType"
                    type="number"
                    min="1"
                    max="4"
                    step="1"
                    defaultValue={1}
                  />
                </div>
              </div>
            </div>
            <div>
              <button>Guardar nueva situación de juego</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaysView;
