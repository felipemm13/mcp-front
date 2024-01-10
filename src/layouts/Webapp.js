import { useContext, useEffect, useState } from "react";
import "../styles/Webapp.css";
import Menu from "./Menu";
import { useRef } from "react";
import { Context } from "../services/Context";
import Routes from "../connection/path";
import Swal from "sweetalert2";

const Webapp = () => {
  const { userContext, CrudApi } = useContext(Context);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const email = useRef(null);
  const password = useRef(null);
  const loginUser = async () => {
    setLoading(true);
    await CrudApi.post(Routes.userRoutes.LOGINUSER, {
      email: email.current,
      password: password.current,
    })
      .then((res, req) => {
        if (res.status === 200) {
          userContext.current = res.data.data;
          setUser(res.data.data);
        }
      })
      .catch((error) => {
        console.log(error.response, error.response.status);
        if (error.response.status === 402) {
          Swal.fire({
            title: "Error",
            text: "Correo o contraseña incorrectos!",
            icon: "error",
            showCloseButton: true,
            timer: 1500,
          });
          setLoading(false);
        }
      });
  };

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setUser(userContext.current ? userContext.current : null);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <>
      {user !== null ? (
        <Menu setUser={setUser} />
      ) : (
        <div className="WebappContainer">
          <div className="WebappBannerContainer">
            <img
              src="https://i.imgur.com/UpIwoHQ.png"
              alt="banner"
              style={{
                width: "75%",
              }}
            />
          </div>
          <div className="loginContainer">
            <label htmlFor="email" className="label">
              Correo
            </label>
            <input
              id="email"
              className="inputs"
              type="email"
              placeholder="Email"
              onChange={(e) => (email.current = e.target.value)}
            ></input>
            <label htmlFor="password" className="label">
              Contraseña
            </label>
            <input
              id="password"
              className="inputs"
              type="password"
              placeholder="Password"
              onChange={(e) => (password.current = e.target.value)}
            ></input>
            <button className="changePassword">Cambiar Contraseña</button>
            {loading ? (
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
            ) : (
              <div className="loginButtons">
                <button className="button" onClick={() => loginUser()}>
                  Ingresar
                </button>
                <button className="button">Registrarse</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Webapp;
