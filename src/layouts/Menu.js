/* eslint-disable */
import { useContext, useEffect } from "react";
import "../styles/Menu.css";
import { useLocation, useNavigate } from "react-router-dom";
import { Context } from "../services/Context";
import Swal from "sweetalert2";
import CryptoJS from "crypto-js";

const Menu = (props) => {
  const { infoSession, userContext,setUserContext, customsUser, setCustomsUser, CrudApi,translate } =
    useContext(Context);
  const navigate = useNavigate();
  const location = useLocation();

  const getCustomsUser = async (maxRetries = 3) => {
    // Verifica si los datos ya están presentes
    if (
      customsUser &&
      customsUser.groups &&
      customsUser.categories &&
      customsUser.positions
    ) {
      return; // No hacer nada si los datos ya están cargados
    }

    let retries = 0;
    while (retries < maxRetries) {
      try {
        // Inicializa arrays vacíos para los datos
        const groups = [];
        const categories = [];
        const positions = [];

        // Realiza las solicitudes en paralelo para mayor eficiencia
        const [groupsResponse, categoriesResponse, positionsResponse] =
          await Promise.all([
            CrudApi.get(`user/${userContext.userId}/groups`),
            CrudApi.get(`user/${userContext.userId}/categories`),
            CrudApi.get(`user/${userContext.userId}/positions`),
          ]);
        // Asigna los datos a los arrays correspondientes
        groups.push(...groupsResponse.Groups);
        categories.push(...categoriesResponse.Categories);
        positions.push(...positionsResponse.Position);

        // Actualiza el estado con los datos obtenidos
        setCustomsUser({ groups, categories, positions });

        // Salir del bucle si todo ha salido bien
        return;
      } catch (error) {
        retries++;
        console.error(
          `Error fetching custom data (attempt ${retries}):`,
          error
        );

        if (retries >= maxRetries) {
          // Mostrar mensaje al usuario después de agotar los intentos
          Swal.fire({
            icon: "error",
            title: translate("error"),
            text: translate("errorFetchingData"),
          });
        }
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("cartProducts") !== null) {
      localStorage.removeItem("cartProducts");
    }
    if (localStorage.getItem("user") !== null) {
      const bytes = CryptoJS.AES.decrypt(
        localStorage.getItem("user"),
        `${process.env.TOKEN}`
      );
      setUserContext(JSON.parse(bytes.toString(CryptoJS.enc.Utf8)));
    }
    getCustomsUser();
    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          devices.filter(({ kind }) => kind === "videoinput");
        })
        .catch((err) => {
          console.error(`${err.name}: ${err.message}`);
        });
    } else {
      console.log("Error al cargar dispositivos de video");
    }
  }, []);

  return (
    <>
      <div className="MenuContainer">
        <div className="MenuBannerContainer">
          <img
            src="/bannerMCP.png"
            alt="banner"
            style={{
              width: "80%",
            }}
          />
        </div>
        <div className="menuContainer">
          <button
            className="button"
            onClick={() => navigate("football-session")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              width="25"
              viewBox="0 0 512 512"
            >
              <path d="M435.4 361.3l-89.7-6c-5.2-.3-10.3 1.1-14.5 4.2s-7.2 7.4-8.4 12.5l-22 87.2c-14.4 3.2-29.4 4.8-44.8 4.8s-30.3-1.7-44.8-4.8l-22-87.2c-1.3-5-4.3-9.4-8.4-12.5s-9.3-4.5-14.5-4.2l-89.7 6C61.7 335.9 51.9 307 49 276.2L125 228.3c4.4-2.8 7.6-7 9.2-11.9s1.4-10.2-.5-15L100.4 118c19.9-22.4 44.6-40.5 72.4-52.7l69.1 57.6c4 3.3 9 5.1 14.1 5.1s10.2-1.8 14.1-5.1l69.1-57.6c27.8 12.2 52.5 30.3 72.4 52.7l-33.4 83.4c-1.9 4.8-2.1 10.1-.5 15s4.9 9.1 9.2 11.9L463 276.2c-3 30.8-12.7 59.7-27.6 85.1zM256 48l.9 0h-1.8l.9 0zM56.7 196.2c.9-3 1.9-6.1 2.9-9.1l-2.9 9.1zM132 423l3.8 2.7c-1.3-.9-2.5-1.8-3.8-2.7zm248.1-.1c-1.3 1-2.7 2-4 2.9l4-2.9zm75.2-226.6l-3-9.2c1.1 3 2.1 6.1 3 9.2zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm14.1-325.7c-8.4-6.1-19.8-6.1-28.2 0L194 221c-8.4 6.1-11.9 16.9-8.7 26.8l18.3 56.3c3.2 9.9 12.4 16.6 22.8 16.6h59.2c10.4 0 19.6-6.7 22.8-16.6l18.3-56.3c3.2-9.9-.3-20.7-8.7-26.8l-47.9-34.8z" />
            </svg>
            
            {translate("footballSession")}
          </button>

          <button
            className="button"
            onClick={() =>
              window.location.replace("https://spt-group.cl/dashboard")
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 512 512"
              height="25"
              width="25"
            >
              <path d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V400c0 44.2 35.8 80 80 80H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H80c-8.8 0-16-7.2-16-16V64zm406.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L320 210.7l-57.4-57.4c-12.5-12.5-32.8-12.5-45.3 0l-112 112c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L240 221.3l57.4 57.4c12.5 12.5 32.8 12.5 45.3 0l128-128z" />
            </svg>
            {translate("dashboard")}
          </button>
          <button className="button" onClick={() => navigate("list-of-plays")}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              width="25"
              viewBox="0 0 512 512"
            >
              <path d="M64 144a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM64 464a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm48-208a48 48 0 1 0 -96 0 48 48 0 1 0 96 0z" />
            </svg>
            {translate("listOfPlays")}
          </button>
          {userContext?.role && userContext?.role !== "analyst" ?

            (
              <button
                className="button"
                onClick={() => navigate("management-account")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="25"
                  height="25"
                  viewBox="0 0 448 512"
                >
                  <path d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z" />
                </svg>
                {translate("manageAccount")}
              </button>
            )
            : <></>
          }
          <button
            className="button logout"
            onClick={() => {
              infoSession.current = null;
              props.setUser(null);
              localStorage.removeItem("user");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="25"
              width="25"
              viewBox="0 0 512 512"
            >
              <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
            </svg>
            {translate("logout")}
          </button>
        </div>
      </div>
    </>
  );
};
export default Menu;
