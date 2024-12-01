import React, { useEffect, useState } from "react";
import UserData from "./CreateAccount/UserData"; // Asegúrate de importar los componentes correctos
import AccountData from "./CreateAccount/AccountData";
import "../styles/HandleUserData.css"; // Archivo CSS para los estilos del modal

const HandleUserData = ({ userData, onClose, onSave }) => {
  const [formData, setFormData] = useState({ ...userData, password:"",confirmPassword:"" } || {}); // Estado para manejar los datos del formulario
  const [isNextDisabled, setIsNextDisabled] = useState(true); // Estado para manejar la deshabilitación del botón de siguiente

  useEffect(() => {
    validateForm();
  }, [formData]);

  const validateEmail = (email) => {
    const emailPattern = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    return emailPattern.test(email);
  };

  const validateForm = () => {
    // Validar que todos los campos obligatorios estén llenos
    const isBasicInfoValid =
      formData.name !== "" &&
      formData.lastName !== "" &&
      formData.address !== "" &&
      formData.email !== "" &&
      validateEmail(formData.email) &&
      formData.group !== "";
  
    // Validar la contraseña solo si hay algo en el campo password
    const isPasswordValid =
      formData.password === "" ||
      (formData.password !== "" &&
        formData.confirmPassword !== "" &&
        formData.password === formData.confirmPassword);
  
    // Si ambas validaciones son correctas, habilitar el botón de siguiente
    if (isBasicInfoValid && isPasswordValid) {
      setIsNextDisabled(false);
    } else {
      setIsNextDisabled(true);
    }
  };
  
  
  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="shoppingCartModal">
      <div className="shoppingCartModalContent">
        <h2>Editar Información de Usuario</h2>

        <UserData formData={formData} setFormData={setFormData} />
        <AccountData
          formData={formData}
          setFormData={setFormData}
          addAnalystic={false}
          editUser={true}
        />

        <div className="modal-buttons">
          <button className="createAccountButtonSubmit" onClick={onClose}>
            Cancelar
          </button>
          <button className="createAccountButtonSubmit" disabled={isNextDisabled} onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default HandleUserData;
