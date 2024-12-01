/*eslint-disable*/ 
import { useContext, useEffect, useState } from "react";
import "../styles/HandleAnalysticAccount.css";
import AccountData from "./CreateAccount/AccountData";
import { Context } from "../services/Context";

const HandleAnalysticAccount = ({ onSave, onClose, selectedAccount }) => {
  const [accountData, setAccountData] = useState({
    id: selectedAccount?.id || 0,
    name: selectedAccount?.name || "",
    lastName: selectedAccount?.lastName || "",
    email: selectedAccount?.email || "",
    password:  "",
    confirmPassword:  "",
    group: selectedAccount?.Group.groupId || "default",
  });
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  useEffect(() => {
    console.log(selectedAccount);
  },[]);

  useEffect(() => {
    validateForm();
  }, [accountData]);
  const validateEmail = (email) => {
    const emailPattern = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    if (
      accountData.name !== "" &&
      accountData.lastName !== "" &&
      accountData.email !== "" &&
      validateEmail(accountData.email) &&
      accountData.group !== "default" &&
      accountData.password === accountData.confirmPassword
    ) {
      setIsSaveDisabled(false);
    } else {
      setIsSaveDisabled(true);
    }
  };

  return (
    <>
      <div className="shoppingCartModal">
        <div className="shoppingCartModalContent">
          <div className="shoppingCartModalHeader" style={{marginBottom:'1em'}}>
            <h2 className="shoppingCartModalTitle">Crear Cuenta de Analista</h2>
            <button className="shoppingCartModalClose" onClick={onClose}>
              &times;
            </button>
          </div>
          <AccountData formData={accountData} setFormData={setAccountData} addAnalystic={true}/>

          <div className="shoppingCartButtonContainer">
            <button className="shoppingCartButton" onClick={onClose}>
              Cancelar
            </button>
            <button
              className="shoppingCartButton"
              disabled={isSaveDisabled}
              onClick={() => onSave(accountData)}
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HandleAnalysticAccount;
