/* eslint-disable */
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserData from "../components/CreateAccount/UserData";
import AccountData from "../components/CreateAccount/AccountData";
import SelectPlan from "../components/CreateAccount/SelectPlan";
import ShoppingCart from "../components/ShoppingCart";
import "../styles/CreateAccount.css";
import { Context } from "../services/Context";
import Routes from "../connection/path";
import CryptoJS from "crypto-js";
import Swal from "sweetalert2";

const CreateAccount = () => {
  const { setUserContext, CrudApi, translate } = useContext(Context);
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState(1);
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    phone: "",
    address: "",
    email: "",
    group: "",
    password: "",
    confirmPassword: "",
  });
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (localStorage.getItem("firstLoadDone") === null) {
      localStorage.setItem("firstLoadDone", 1);
    } else {
      navigate("/");
    }
    return () => {
      localStorage.removeItem("firstLoadDone");
    };
  }, []);
  useEffect(() => {
    validateForm();
  }, [formData, currentView, selectedPlan, products]);

  const validateEmail = (email) => {
    const emailPattern = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    if (currentView === 1) {
      if (
        formData.name !== "" &&
        formData.name.length > 2 &&
        formData.lastName !== "" &&
        formData.lastName.length > 2 &&
        formData.address !== "" &&
        formData.address.length > 3 &&
        formData.email !== "" &&
        validateEmail(formData.email) &&
        formData.group !== "" &&
        formData.password !== "" &&
        formData.confirmPassword !== "" &&
        formData.password === formData.confirmPassword
      ) {
        setIsNextDisabled(false);
      } else {
        setIsNextDisabled(true);
      }
    } else if (currentView === 2) {
      if (selectedPlan !== null && products.length > 0) {
        setIsNextDisabled(false);
      } else {
        setIsNextDisabled(true);
      }
    } else {
      setIsNextDisabled(false);
    }
  };

  const nextView = async () => {
    if (currentView < 2) {
      await createUser(); // Llamar a la función para crear el usuario
      //setCurrentView(currentView + 1);
    } else if (currentView === 2) {
      setIsCartOpen(true);
    }
  };

  const prevView = () => {
    setProducts([]);
    setSelectedPlan(null);
    navigate("/");
  };

  //funcion para crear la cuenta del usuario y guardarla en la base de datos utilizando axios y la api de CrudApi
  const createUser = async () => {
    const { password, email, name, lastName, phone, address, group } = formData;
    const role = "user";
    const suscription = "free";

    try {
      const response = await CrudApi.post(Routes.userRoutes.POSTUSER, {
        email,
        password,
        name,
        lastName,
        suscription,
        role,
        address
      });
      if (response.status === 201) {
        const userData = response.data;
        const encryptedUserData = CryptoJS.AES.encrypt(
          JSON.stringify(userData),
          `${process.env.TOKEN}`
        ).toString();
        localStorage.setItem("user", encryptedUserData);
        setUserContext(userData);

        Swal.fire({
          title: translate("success"),
          text: translate("successText"),
          icon: "success",
          showCloseButton: true,
          timer: 1500,
        });
        setCurrentView(currentView + 1);
      }
    } catch (error) {
      Swal.fire({
        title: translate("error"),
        text: translate("errorText"),
        icon: "error",
        showCloseButton: true,
        timer: 1500,
      });
      //solo para pruebas
      //setCurrentView(currentView + 1);
    }
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };
  const generateSessionId = (products) => {
    return products
      .map((product) => {
        const quantity = product.quantity.toString().padStart(2, '0');
        const id = (product.id % 100).toString().padStart(2, '0');
        return `${quantity}${id}`;
      })
      .join('');
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

  const renderView = () => {
    switch (currentView) {
      case 1:
        return (
          <div className="createAccountFormContainer">
            <span
              className="createAccountModalClose"
              onClick={() => navigate("/")}
            >
              &times;
            </span>
            <p className="createAccountModalTitle">{translate("userData")}</p>
            <form className="createAccountForm">
              <UserData formData={formData} setFormData={setFormData} />
              <AccountData formData={formData} setFormData={setFormData} />
            </form>
          </div>
        );
      case 2:
        return (
          <div className="createAccountFormContainer">
            <SelectPlan
              selectedPlan={selectedPlan}
              setSelectedPlan={setSelectedPlan}
              addPlanToCart={addPlanToCart}
              setProducts={setProducts}
              onClose={() => navigate("/")}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div id="myModal" className="createAccountModal">
        <div
          id="formPlayerModalContainer"
          className="createAccountModalContainer"
        >
          <div className="createAccountModalContent">
            {renderView()}
            <div className="createAccountButtonContainer">
              <button onClick={prevView} className="createAccountButtonSubmit">
                {translate("exit")}
              </button>
              <button
                onClick={nextView}
                className="createAccountButtonSubmit"
                disabled={isNextDisabled}
              >
                {currentView === 2 ? translate("viewCart") : translate("createAccount")}
              </button>
            </div>
          </div>
        </div>
      </div>
      {isCartOpen && (
        <ShoppingCart
          products={products}
          setProducts={setProducts}
          onClose={closeCart}
          onCheckout={handleCheckout}
          setSelectedPlan={setSelectedPlan}
        />
      )}
    </>
  );
};

export default CreateAccount;
