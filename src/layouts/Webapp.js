import { useContext, useEffect, useState } from "react";
import "../styles/Webapp.css";
import Menu from "./Menu";
import { useRef } from "react";
import authService from "../services/authService";
import { Context } from "../services/Context";
import Routes from "../connection/path";
import Connect from "../connection/Connect";
import axios from "axios";

const Webapp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const email = useRef(null);
  const password = useRef(null);
  const Crud = new Connect();
  const loginUser = async () => {
    setLoading(true);
    
    /*
    await Crud.post(Routes.userRoutes.LOGINUSER, {
      email: email.current,
      password: password.current,
    })
      .then((res, req) => {
        if (res.status === 200) {
          console.log(res);
        }
      })
      .catch((res) => console.log(res));
      */

    await authService.loginUser(email.current, password.current, setUser);
  };

  useEffect(() => {
    setUser(null);
    setLoading(true);
    setTimeout(() => {
      setUser(authService.getCurrentUser);
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
              Email
            </label>
            <input
              id="email"
              className="inputs"
              type="email"
              placeholder="Email"
              onChange={(e) => (email.current = e.target.value)}
            ></input>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              className="inputs"
              type="password"
              placeholder="Password"
              onChange={(e) => (password.current = e.target.value)}
            ></input>
            <button className="changePassword">Change password</button>
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
                  Login
                </button>
                <button className="button">Register</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Webapp;
