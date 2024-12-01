import React, { useContext, useEffect, useRef, useState } from "react";
import "../styles/Webapp.css";
import Menu from "./Menu";
import { Context } from "../services/Context";
import Routes from "../connection/path";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";

const Webapp = () => {
  const { userContext,setUserContext, CrudApi,translate , setLanguage,language} = useContext(Context);
  const [email, setEmail] = useState("");
  const passwordRef = useRef(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const MAX_LOGIN_ATTEMPTS = 3;
  const ATTEMPT_RESET_TIME = 10 * 60 * 1000; // x minutes in milliseconds

  const [loginAttempts, setLoginAttempts] = useState(() => {
    const savedData = JSON.parse(localStorage.getItem("loginData"));
    const currentTime = new Date().getTime();

    if (savedData && currentTime - savedData.lastAttemptTime < ATTEMPT_RESET_TIME) {
      return savedData.attempts;
    } else {
      localStorage.removeItem("loginData");
      return 0;
    }
  });

  useEffect(() => {
    const loginData = {
      attempts: loginAttempts,
      lastAttemptTime: new Date().getTime(),
    };
    localStorage.setItem("loginData", JSON.stringify(loginData));

    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      Swal.fire({
        title: translate("error"),
        text: translate("maxAttemptsReached"),
        icon: "error",
        showCloseButton: true,
        timer: 1500,
      });
    } else if (loginAttempts === MAX_LOGIN_ATTEMPTS - 1) {
      Swal.fire({
        title: translate("warning"),
        text: translate("lastAttempt"),
        icon: "warning",
        showCloseButton: true,
        timer: 1500,
      });
    }
  }, [loginAttempts]);

  const loginUser = async () => {
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) return;

    setLoading(true);
    const password = passwordRef.current.value;
    try {
      const response = await CrudApi.post(Routes.userRoutes.LOGINUSER, {
        email,
        password,
      });

      if (response.status === 200) {
        const userData = response.data.data;

        const encryptedUserData = CryptoJS.AES.encrypt(
          JSON.stringify(userData),
          `${process.env.TOKEN}`
        ).toString();
        localStorage.setItem("user", encryptedUserData);
        setUserContext(userData);
        setLoginAttempts(0); // Reset login attempts on successful login
        localStorage.removeItem("loginData");
      }
    } catch (error) {
      if (error.response?.status === 402) {
        setLoginAttempts((prevAttempts) => prevAttempts + 1);
        Swal.fire({
          title: translate("error"),
          text: translate("incorrectCredentials"),
          icon: "error",
          showCloseButton: true,
          timer: 1500,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("user") === null) return;
    const bytes = CryptoJS.AES.decrypt(
      localStorage.getItem("user"),
      `${process.env.TOKEN}`
    );
    const storedUser = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));

    if (storedUser) {
      setUserContext(storedUser);
    }
  }, []);

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      loginUser();
    }
  };

  return (
    <>
      <div className="languageSwitcher">
        <button
          onClick={() => setLanguage("en")}
          style={{ backgroundColor: language === "en" ? "rgb(218, 37, 153)" : "rgb(218, 37, 153,.25)" }}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage("es")}
          style={{ backgroundColor: language === "es" ? "rgb(218, 37, 153)" : "rgb(218, 37, 153,.25)" }}
        >
          ES
        </button>
      </div>
      {userContext ? (
        <Menu setUser={setUserContext} />
      ) : (
        <div className="WebappContainer">
          <div className="WebappBannerContainer">
            <img
              src="/bannerMCP.png"
              alt="banner"
              style={{ width: "75%" }}
            />
          </div>
          <div className="loginContainer">
            <label htmlFor="email" className="label">
              {translate("email")}
            </label>
            <input
              id="email"
              className="inputs"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyPress}
              autoFocus
              disabled={loginAttempts >= MAX_LOGIN_ATTEMPTS}
            />
            <label htmlFor="password" className="label">
              {translate("password")}
            </label>
            <input
              id="password"
              className="inputs"
              type="password"
              placeholder="Password"
              ref={passwordRef}
              onKeyDown={handleKeyPress}
              disabled={loginAttempts >= MAX_LOGIN_ATTEMPTS}
            />
            <button className="changePassword" style={{display:"none"}}>
              {translate("forgotPassword")}
            </button>
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
                <button className="button" onClick={loginUser} disabled={loginAttempts >= MAX_LOGIN_ATTEMPTS}>
                  {translate("login")}
                </button>
                <button
                  className="button"
                  onClick={() => navigate("create-account")}
                >
                  {translate("createAccount")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Webapp;
