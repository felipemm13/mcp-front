/* eslint-disable */
import { useContext, useEffect, useState } from "react";
import "../../styles/CreateAccount.css";
import { Context } from "../../services/Context";
import Swal from "sweetalert2";

const AccountData = ({ formData, setFormData, addAnalystic, editUser }) => {
  const { customsUser, setCustomsUser, CrudApi, userContext, translate } = useContext(Context);
  const [institution, setInstitution] = useState(formData.group);
  const [isCustoms, setIsCustoms] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    strength: "",
    score: 0,
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const apiPaths = {
    Institución: ["group", "groups"],
  };
  useEffect(() => {
    validatePasswords();
  }, [formData.password, formData.confirmPassword]);

  const validatePasswords = () => {
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Las contraseñas no coinciden.");
    } else {
      setErrorMessage("");
    }
  };
  const checkPasswordStrength = (password) => {
    let score = 0;

    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    let strength = "";
    switch (score) {
      case 0:
      case 1:
        strength = "Muy débil";
        break;
      case 2:
        strength = "Débil";
        break;
      case 3:
        strength = "Moderada";
        break;
      case 4:
        strength = "Fuerte";
        break;
      case 5:
        strength = "Muy fuerte";
        break;
      default:
        strength = "Muy débil";
    }

    return { strength, score };
  };
  useEffect(() => {
    const result = checkPasswordStrength(formData.password);
    setPasswordStrength(result);
  }, [formData.password]);

  const getStrengthColor = (score) => {
    switch (score) {
      case 1:
        return "red"; // Muy débil
      case 2:
        return "orange"; // Débil
      case 3:
        return "yellow"; // Moderada
      case 4:
        return "cyan"; // Fuerte
      case 5:
        return "green"; // Muy fuerte
      default:
        return "red";
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const [emailError, setEmailError] = useState("");

  const validateEmail = (email) => {
    const emailPattern = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/;
    return emailPattern.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });

    if (validateEmail(email)) {
      setEmailError("");
    } else {
      setEmailError("Por favor, ingrese un correo electrónico válido.");
    }
  };
  const existCustoms = (type, string) => {
    const [path, pathPlural] = apiPaths[type];

    const collections = {
      Institución: customsUser?.groups,
      Categoría: customsUser?.categories,
      Posición: customsUser?.positions,
    };

    const predefinedValues = {
      Categoría: [
        "En formación",
        "Universitaria",
        "Profesional 1ra",
        "Profesional 2da",
        "Profesional 3ra",
      ],
      Posición: ["Guardameta", "Defensor", "Mediocampista", "Atacante"],
    };

    return (
      predefinedValues[type]?.includes(string) ||
      collections[type]?.some((item) => item[`${path}Name`] === string)
    );
  };

  const handleAddCustom = async (type) => {
    const [path, pathPlural] = apiPaths[type];

    Swal.fire({
      title: `Ingrese el nombre de la ${type}`,
      input: "text",
      showCancelButton: true,
      confirmButtonText: "Crear",
      showLoaderOnConfirm: true,
      preConfirm: async (string) => {
        if (existCustoms(type, string)) {
          Swal.showValidationMessage(
            `El nombre ${string} ya existe. Por favor, ingrese un nuevo nombre.`
          );
          return;
        }
        try {
          const res = await CrudApi.post(path, {
            [`${path}Name`]: string,
            userId: userContext.userId,
          });
          setCustomsUser({
            ...customsUser,
            [`${pathPlural}`]: [...customsUser[`${pathPlural}`], res.data],
          });
          // Actualiza los estados específicos según el tipo
          if (type === "Institución") {
            setInstitution(string)
            setFormData({ ...formData, group: string });
          };
        } catch (error) {
          console.error("Error adding custom:", error);
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
  };

  const handleEditCustom = async (type) => {
    const [path, pathPlural] = apiPaths[type];

    // Encuentra el custom actual basándote en el tipo
    const currentCustom = customsUser[pathPlural]?.find(
      (item) =>
        item[`${path}Name`] ===
        (type === "Institución"
          ? institution
          : type === "Categoría"
            ? category
            : type === "Posición"
              ? position
              : "")
    );

    const currentCustomId = currentCustom?.[`${path}Id`];

    if (!currentCustomId) {
      console.error("No se encontró el custom actual.");
      return;
    }

    try {
      // Solicita el nuevo nombre al usuario
      const result = await Swal.fire({
        title: `Ingrese el nuevo nombre de la ${type}`,
        input: "text",
        inputValue: currentCustom[`${path}Name`],
        showCancelButton: true,
        showDenyButton: true,
        denyButtonText: "Eliminar",
        confirmButtonText: "Editar",
        showLoaderOnConfirm: true,
        preConfirm: async (newName) => {
          if (existCustoms(type, newName)) {
            Swal.showValidationMessage(
              `El nombre ${newName} ya existe. Por favor, ingrese un nuevo nombre.`
            );
            return;
          }
          try {
            const res = await CrudApi.update(`${path}/${currentCustomId}`, {
              [`${path}Name`]: newName,
            });
            return res.data;
          } catch (error) {
            Swal.showValidationMessage("Error al actualizar el custom.");
            throw error;
          }
        },
      });

      // Si la acción fue confirmada
      if (result.isConfirmed) {
        const updatedData = result.value;
        const updatedCustoms = customsUser[pathPlural].map((item) => {
          return item[`${path}Id`] === currentCustomId
            ? { ...item, [`${path}Name`]: updatedData }
            : item;
        });

        // Actualiza el estado con los datos modificados
        setCustomsUser({
          ...customsUser,
          [pathPlural]: updatedCustoms,
        });

        // Actualiza los estados específicos según el tipo
        if (type === "Institución") setInstitution(updatedData);
      } else if (result.isDenied) {
        // Si se seleccionó "Eliminar", llama a la función de eliminar
        await handleDeleteCustom(type, currentCustomId);
      }
    } catch (error) {
      console.error("Error handling edit custom:", error);
    }
  };

  const handleDeleteCustom = async (type, customId) => {
    const [path, pathPlural] = apiPaths[type];

    const result = await Swal.fire({
      title: `¿Estás seguro de que quieres eliminar esta ${type}?`,
      text: "¡Esta acción no se puede deshacer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await CrudApi.delete(`${path}/${customId}`);
        const updatedCustoms = customsUser[`${pathPlural}`].filter(
          (item) => item[`${path}Id`] !== customId
        );
        setCustomsUser({
          ...customsUser,
          [`${pathPlural}`]: updatedCustoms,
        });
        if (type === "Institución") setInstitution("default");
        Swal.fire(
          "Eliminado",
          "El custom ha sido eliminado exitosamente.",
          "success"
        );
      } catch (error) {
        Swal.fire(
          "Error",
          "No se pudo eliminar el custom. Inténtalo de nuevo más tarde.",
          "error"
        );
      }
    }
  };

  useEffect(() => {
    let groupCustom = customsUser?.groups?.find(
      (Group) => Group.groupName === institution
    );
    setIsCustoms({
      ...isCustoms,
      group: groupCustom,
    });
  }, [institution]);
  return (
    <>
      {addAnalystic && (
        <>
          <div className="createAccountInputContainer">
            <div className="createAccountInputLabel">
              <label htmlFor="nameInput" className="form-label">
                {translate("firstName")} <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="nameInput"
                placeholder="Ingrese su nombre"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="createAccountInputLabel">
              <label htmlFor="lastNameInput" className="form-label">
                {translate("lastName")} <span className="required">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                id="lastNameInput"
                placeholder="Ingrese su apellido"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
              />
            </div>
          </div>
        </>
      )}
      <div className="createAccountInputContainer">
        <div className="createAccountInputLabel" >
          <label htmlFor="nameInput" className="form-label">
            {translate("email")} <span className="required">*</span>
          </label>
          <input
            type="email"
            className="form-control"
            style={{
              borderColor: formData.email && emailError ? "red" : "",
            }}
            id="emailInput"
            placeholder="Ingrese su correo"
            value={formData.email}
            onChange={handleEmailChange}
            aria-describedby="emailHelp"
            autoComplete="off"
          />
          {formData.email && emailError && (
            <div className="error-message" id="emailHelp" style={{ marginTop: '1em' }}>
              {emailError}
            </div>
          )}
        </div>
        {addAnalystic ? (
          <>
            <div className="createAccountInputLabel">
              <label htmlFor="institutionInput" className="createAccountLabel">
                {translate("institution")} <span className="required">*</span>
              </label>
              <select
                className="form-control"
                id="institutionInput"
                placeholder="Ingrese la institución"
                value={institution}
                onChange={(e) => {
                  setInstitution(e.target.value);
                  setFormData({ ...formData, group: e.target.value });
                }}
              >
                <option value="default">{translate("selectThe")} {translate("institution")}</option>
                {customsUser?.groups?.map((option) => (
                  <option value={option.groupId}>{option.groupName}</option>
                )
                )}
              </select>
            </div>
            <div className="createAccountAddCustoms">
              {!isCustoms?.group ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="50"
                  width="25"
                  viewBox="0 0 512 512"
                  onClick={() => handleAddCustom("Institución")}
                >
                  <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="50"
                  width="25"
                  viewBox="0 0 512 512"
                  onClick={() => handleEditCustom("Institución")}
                >
                  <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z" />
                </svg>
              )}
            </div>
          </>
        ) : (
          <div className="createAccountInputLabel">
            <label htmlFor="institutionInput" className="form-label">
              {translate("institution")}/{translate("group")} <span className="required">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="institutionInput"
              placeholder="Ingrese la institución o grupo"
              value={formData.group}
              onChange={(e) =>
                setFormData({ ...formData, group: e.target.value })
              }
            />
          </div>
        )}
      </div>
      <div className="createAccountInputContainer">
        <div className="createAccountInputLabel">
          <label htmlFor="nameInput" className="form-label">
            {editUser && 'Nueva '}{translate("password")} <span className="required">*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              autoComplete="new-password"
              type={passwordVisible ? "text" : "password"}
              className="form-control"
              id="passwordInput"
              placeholder="Ingrese su contraseña"
              style={{
                borderColor: formData.password
                  ? getStrengthColor(passwordStrength.score)
                  : "",
              }}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <span
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "2em",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {passwordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  fill="white"
                  style={{ width: "1.5em", height: "1em" }}
                >
                  <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  fill="white"
                  style={{ width: "1.5em", height: "1em" }}
                >
                  <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
                </svg>
              )}
            </span>
          </div>
          <div
            className="strength-message"
            style={{ color: getStrengthColor(passwordStrength.score) }}
          >
            {formData.password &&
              `Nivel de robustez: ${passwordStrength.strength}`}
          </div>
        </div>
        <div className="createAccountInputLabel">
          <label htmlFor="lastNameInput" className="form-label">
            {translate("confirm")} {editUser && 'Nueva '}{translate("password")} <span className="required">*</span>
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              className="form-control"
              id="lastNameInput"
              placeholder="Confirme su contraseña"
              style={{ borderColor: errorMessage ? "red" : "white" }}
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
            <span
              onClick={toggleConfirmPasswordVisibility}
              style={{
                position: "absolute",
                right: "2em",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {confirmPasswordVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 640 512"
                  fill="white"
                  style={{ width: "1.5em", height: "1em" }}
                >
                  <path d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 576 512"
                  fill="white"
                  style={{ width: "1.5em", height: "1em" }}
                >
                  <path d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z" />
                </svg>
              )}
            </span>
          </div>

          {errorMessage && (
            <div className="error-message" style={{ color: "red" }}>
              {errorMessage}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AccountData;
