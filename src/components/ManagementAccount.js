/*eslint-disable*/
import { useNavigate } from "react-router-dom";
import "../styles/ManagementAccount.css";
import { useContext, useEffect, useState } from "react";
import { Context } from "../services/Context";
import HandleAnalysticAccount from "./HandleAnalysticAccount";
import HandleUserData from "./HandleUserData";
import Routes from "../connection/path";
import Swal from "sweetalert2";
import ShoppingCart from "./ShoppingCart";
import CryptoJS from "crypto-js";
import SelectPlan from "./CreateAccount/SelectPlan";

const ManagementAccount = () => {
  const { userContext, setUserContext, customsUser, setCustomsUser, CrudApi } = useContext(Context);
  const [aviableAddAccount, setAviableAddAccount] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isUserEditModalOpen, setIsUserEditModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isShoppingCartOpen, setIsShoppingCartOpen] = useState(false);
  const subscriptionValue = userContext?.suscription === "coach" ? 1 : userContext?.suscription === "team" ? 2 : userContext?.suscription === "club" ? 3 : 0;
  const [selectedPlan, setSelectedPlan] = useState(subscriptionValue);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const addPlanToCart = (plan) => {
    setProducts((prevProducts) => {
      const planProduct = {
        id: plan.productId,
        name: "Plan " + plan.name,
        price: plan.price,
        quantity: 1,
      };

      const updatedProducts = prevProducts.filter(
        (product) => !product.name.startsWith("Plan ")
      );

      return [...updatedProducts, planProduct];
    });
  };
  const getCustomsUser = async (maxRetries = 3, user) => {
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
            CrudApi.get(`user/${user.userId}/groups`),
            CrudApi.get(`user/${user.userId}/categories`),
            CrudApi.get(`user/${user.userId}/positions`),
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
            title: "Error",
            text: "No se pudo obtener la información. Por favor, intente de nuevo más tarde.",
          });
        }
      }
    }
  };

  const fetchAnalysts = async (user) => {
    try {
      const response = await CrudApi.get(`${Routes.userRoutes.POSTUSER}/${user.userId}/analysts`);
      if (response) {
        setAccounts(response.Analysts);
        return response.Analysts;
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo obtener la lista de analistas. Por favor, intente de nuevo.",
        icon: "error",
        showCloseButton: true,
        timer: 1500,
      });
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
      getCustomsUser(3, storedUser);
      fetchAnalysts(storedUser).then((analysts) => {
        setUserData({ ...storedUser, accounts: analysts });
      });
    }
    if (userContext) {
      fetchAnalysts(userContext);
      getCustomsUser(3, userContext);
    }
  }, []);

  useEffect(() => {
    if (userContext?.suscription === "club" && accounts.length < 10) {
      setAviableAddAccount(false);
    } else {
      setAviableAddAccount(true);
    }
  }, [accounts, userContext?.suscription]);

  const handleAddAccount = () => {
    setSelectedAccount(null);
    setIsModalOpen(true);
  };

  const handleEditAccount = (account) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleEditUserData = (updatedUser) => {
    setUserData(updatedUser);
    setIsUserEditModalOpen(false);
  };

  const handleSaveUserData = async (updatedData) => {
    const { password, email, name, lastName, role, suscription } = updatedData;

    try {
      const dataToUpdate = {
        email,
        name,
        lastName,
        suscription,
        role
      };

      if (password !== "") {
        dataToUpdate.password = password;
      }

      // Realizar la petición de actualización
      const response = await CrudApi.update(`${Routes.userRoutes.POSTUSER}/${userContext.userId}`, dataToUpdate);
      if (response) {
        const userData = response.data;
        setUserContext(userData);
        Swal.fire({
          title: "Éxito",
          text: "Cuenta editada correctamente!",
          icon: "success",
          showCloseButton: true,
          timer: 1500,
        });
        setIsUserEditModalOpen(false);
      }
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "No se pudo crear la cuenta. Por favor, intente de nuevo.",
        icon: "error",
        showCloseButton: true,
        timer: 1500,
      });
    }

  };

  const handleCheckout = async () => {
    const totalAmount = products.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );
    const encryptedProducts = CryptoJS.AES.encrypt(
      JSON.stringify(products),
      `${process.env.TOKEN}`
    ).toString();
    localStorage.setItem("cartProducts", encryptedProducts);
    const encryptedTotalAmount = CryptoJS.AES.encrypt(
      JSON.stringify(totalAmount),
      `${process.env.TOKEN}`
    ).toString();
    localStorage.setItem("totalAmount", encryptedTotalAmount);
    const sessionId = generateSessionId(products);
    const response = await CrudApi.post(`payment/create`, {
      buyOrder: 1,
      sessionId: sessionId,
      returnUrl: "http://localhost:3030/payment-handler",
      amount: totalAmount
    });
    if (response.status === 200) {
      const { token, url } = response.data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = "token_ws";
      input.value = token;
      form.appendChild(input);
      document.body.appendChild(form);
      form.submit();
    }
    setIsCartOpen(false);
  };

  return (
    <>
      <div className="ManagementAccountContainer">
        <div className="ManagementAccountBackButton">
          <button
            className="ManagementAccountButtonBack"
            onClick={() => navigate("/")}
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
        <div className="ManagementAccountContent">
          <div className="ManagementAccountLeft">
            <div className="ManagementAccountTable">
              <h2 className="ManagementAccountTitle">Cuentas de Analistas</h2>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Grupo</th>
                    <th>Editar</th>
                  </tr>
                </thead>
              </table>
              <div className="table-container">
                <table className="custom-table">
                  <tbody>
                    {accounts.map((account, index) => (
                      <tr key={index} id={"account" + index}>
                        <td>{account.name}</td>
                        <td>{account.lastName}</td>
                        <td>{account.email}</td>
                        <td>{account.Group.groupName}</td>
                        <td>
                          <button
                            className="ManagementAccountEditButton"
                            onClick={() => handleEditAccount(account)}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 512 512"
                              width={"2em"}
                            >
                              <path d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                style={{
                  height: "7.5%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                <button
                  className="ManagementAccountButton"
                  disabled={aviableAddAccount}
                  onClick={handleAddAccount}
                >
                  Agregar Cuenta
                </button>
              </div>
            </div>
          </div>
          <div className="ManagementAccountRight">


            <h2 className="ManagementAccountTitle">Datos del Usuario</h2>
            <p>
              <strong>Nombre:</strong>{" "}
              {userData?.name?.charAt(0).toUpperCase() + userData?.name?.slice(1)}
            </p>
            <p>
              <strong>Apellido:</strong>{" "}
              {userData?.lastName?.charAt(0).toUpperCase() +
                userData?.lastName?.slice(1)}
            </p>
            <p>
              <strong>Email:</strong> {userData?.email}
            </p>




            <p>
              <strong>Suscripción:</strong> Plan{" "}
              {userData?.suscription?.charAt(0).toUpperCase() +
                userData?.suscription?.slice(1)}
            </p>
            <p>
              <strong>Analistas</strong> {userData?.accounts.length}
            </p>


            <button
              className="ManagementAccountButton"
              onClick={() => setIsUserEditModalOpen(true)}
            >
              Editar Datos
            </button>
            <div className="ManagementAccountShoppingButton" data-tooltip={`Adquirir productos`} onClick={() => setIsShoppingCartOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 576 512"
              >
                <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      {isUserEditModalOpen && (
        <HandleUserData
          userData={userContext} // O el estado que contenga los datos actuales del usuario
          onClose={() => setIsUserEditModalOpen(false)}
          onSave={handleSaveUserData}
        />
      )}

      {isModalOpen && (
        <HandleAnalysticAccount
          selectedAccount={selectedAccount}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onSave={async (newAccount) => {
            const newAnalyst = {
              name: newAccount.name,
              lastName: newAccount.lastName,
              email: newAccount.email,
              userId: userContext.userId,
              groupId: parseInt(newAccount.group),
              role: "analyst",
            };

            if (newAccount.password !== "") {
              newAnalyst.password = newAccount.password;
            }
            try {
              let response;
              if (selectedAccount) {
                response = await CrudApi.update(`analyst/${selectedAccount.analystId}`, newAnalyst);
              } else {
                response = await CrudApi.post('/analyst', newAnalyst);
              }
              if (response.status === 200 || response.status === 201 || response.analystId) {
                Swal.fire({
                  title: "Éxito",
                  text: selectedAccount ? "Cuenta editada correctamente!" : "Cuenta creada correctamente!",
                  icon: "success",
                  showCloseButton: true,
                  timer: 1500,
                });
                fetchAnalysts(userContext);
              }
            } catch (error) {
              Swal.fire({
                title: "Error",
                text: selectedAccount ? "No se pudo editar la cuenta. Por favor, intente de nuevo." : "No se pudo crear la cuenta. Por favor, intente de nuevo.",
                icon: "error",
                showCloseButton: true,
                timer: 1500,
              });
            }
            setIsModalOpen(false);

          }}
        />
      )}
      {
        isShoppingCartOpen && (
          <div className="ManagementAccountModalContainer">
            <div className="ManagementAccountCartContainer">
              <SelectPlan
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                addPlanToCart={addPlanToCart}
                setProducts={setProducts}
                onClose={() => setIsShoppingCartOpen(false)}
                view="manage"
              />
              <button className="ManagementAccountButton" onClick={()=>setIsCartOpen(true)}>Abrir Carrito</button>
            </div>
          </div>)
      }
      {isCartOpen && (
        <ShoppingCart
          products={products}
          setProducts={setProducts}
          onClose={()=>setIsCartOpen(false)}
          onCheckout={handleCheckout}
          setSelectedPlan={setSelectedPlan}
        />
      )}
    </>
  );
};

export default ManagementAccount;
