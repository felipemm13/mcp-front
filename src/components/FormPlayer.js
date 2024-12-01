/* eslint-disable */
import { useContext, useEffect, useState } from "react";
import "../styles/FormPlayer.css";
import { Context } from "../services/Context";
import Swal from "sweetalert2";

const FormPlayer = ({ setOpenModal, title, player, updatePlayers }) => {
  const { userContext, CrudApi, customsUser, setCustomsUser } =
    useContext(Context);
  const typeForm = title.split(" ")[0];
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("default");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [institution, setInstitution] = useState("default");
  const [category, setCategory] = useState("default");
  const [experience, setExperience] = useState("");
  const [position, setPosition] = useState("default");
  const [limb, setLimb] = useState("default");
  const [isCustoms, setIsCustoms] = useState(null);
  const apiPaths = {
    Institución: ["group", "groups"],
    Categoría: ["category", "categories"],
    Posición: ["position", "positions"],
  };

  const areFieldsComplete = () => {
    return (
      name !== "" &&
      lastName !== "" &&
      dob !== "" &&
      gender !== "" &&
      height !== "" &&
      weight !== "" &&
      institution !== "default" &&
      category !== "default" &&
      experience !== "" &&
      position !== "default" &&
      limb !== "default"
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      UserId: userContext.userId,
      Name: name,
      SkillfulLeg: limb,
      SportGroup: institution,
      Experience: experience,
      FieldPosition: position,
      Weight: weight,
      Height: height,
      Gender: gender,
      Category: category,
      Birthday: dob,
      Surname: lastName,
    };

    if (typeForm === "Agregar") {
      await CrudApi.post("player", formData)
        .then((res, req) => {
          console.log(res);
          updatePlayers();
          setOpenModal(false);
        })
        .catch((error) => {
          console.log(error);
        });
    } else if (typeForm === "Editar") {
      await CrudApi.update(`player/${player.playerId}`, formData)
        .then((res, req) => {
          console.log(res);
          updatePlayers();
          setOpenModal(false);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  const calculateAge = (dob) => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (player && typeForm === "Editar") {
      setName(player.Name);
      setLastName(player.Surname);
      setDob(player.Birthday);
      setGender(player.Gender);
      setLimb(player.SkillfulLeg);
      setHeight(player.Height);
      setWeight(player.Weight);
      setInstitution(player.SportGroup);
      setCategory(player.Category);
      setExperience(player.Experience);
      setPosition(player.FieldPosition);
    }
  }, []);

  const existCustoms = (type, string) => {
    const [path, pathPlural] = apiPaths[type];

    const collections = {
      Institución: customsUser.groups,
      Categoría: customsUser.categories,
      Posición: customsUser.positions,
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
          if (type === "Institución") setInstitution(string);
          if (type === "Categoría") setCategory(string);
          if (type === "Posición") setPosition(string);
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
          console.log(
            item,
            item[`${path}Id`],
            currentCustomId,
            item[`${path}Id`] === currentCustomId
              ? { ...item, [`${path}Name`]: updatedData }
              : item
          );
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
        if (type === "Categoría") setCategory(updatedData);
        if (type === "Posición") setPosition(updatedData);
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
        console.log(customsUser, path, customId);
        await CrudApi.delete(`${path}/${customId}`);
        const updatedCustoms = customsUser[`${pathPlural}`].filter(
          (item) => item[`${path}Id`] !== customId
        );
        setCustomsUser({
          ...customsUser,
          [`${pathPlural}`]: updatedCustoms,
        });
        if (type === "Institución") setInstitution("default");
        if (type === "Categoría") setCategory("default");
        if (type === "Posición") setPosition("default");
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
    let groupCustom = customsUser.groups?.find(
      (Group) => Group.groupName === institution
    );
    let categoryCustom = customsUser.categories?.find(
      (Category) => Category.categoryName === category
    );
    let positionCustom = customsUser.positions?.find(
      (Position) => Position.positionName === position
    );
    setIsCustoms({
      ...isCustoms,
      group: groupCustom,
      category: categoryCustom,
      position: positionCustom,
    });
  }, [institution, category, position]);
  return (
    <>
      <div id="myModal" className="formPlayerModal">
        <div className="formPlayerModalContent">
          <span
            className="formPlayerModalClose"
            onClick={() => setOpenModal(false)}
          >
            &times;
          </span>
          <p className="formPlayerModalTitle">{title}</p>
          <div
            id="formPlayerModalContainer"
            className="formPlayerModalContainer"
          >
            <form onSubmit={handleSubmit} className="formPlayerForm">
              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="nameInput" className="formPlayerLabel">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="nameInput"
                    placeholder="Ingrese su nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="lastNameInput" className="formPlayerLabel">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="lastNameInput"
                    placeholder="Ingrese su apellido"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="genderInput" className="formPlayerLabel">
                    Sexo
                  </label>
                  <select
                    className="form-select"
                    id="genderInput"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option selected value="default" disabled="disabled">
                      Seleccione una opción
                    </option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
              </div>
              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="dobInput" className="formPlayerLabel">
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="dobInput"
                    placeholder="DD-MM-AAAA"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel" style={{ width: "20%" }}>
                  <label htmlFor="ageInput" className="formPlayerLabel">
                    Edad [años]
                  </label>
                  <input
                    readOnly
                    disabled
                    className="form-control"
                    id="ageInput"
                    value={calculateAge(dob) || ""}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="experienceInput" className="formPlayerLabel">
                    Fecha de inicio de actividad
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    id="experienceInput"
                    placeholder="DD-MM-AAAA"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel" style={{ width: "30%" }}>
                  <label
                    htmlFor="calculateExperience"
                    className="formPlayerLabel"
                  >
                    Experiencia [años]
                  </label>
                  <input
                    readOnly
                    disabled
                    className="form-control"
                    id="calculateExperience"
                    value={calculateAge(experience) || ""}
                  />
                </div>
              </div>
              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="heightInput" className="formPlayerLabel">
                    Altura [cm]
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="heightInput"
                    placeholder="Ingrese la altura en centímetros"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="weightInput" className="formPlayerLabel">
                    Peso [kg]
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="weightInput"
                    placeholder="Ingrese el peso en kilogramos"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="limbInput" className="formPlayerLabel">
                    Extremidad
                  </label>
                  <select
                    className="form-select"
                    id="limbInput"
                    value={limb}
                    onChange={(e) => setLimb(e.target.value)}
                  >
                    <option selected value="default" disabled="disabled">
                      Seleccione la extremidad dominante
                    </option>
                    <option value={1}>Derecha</option>
                    <option value={2}>Izquierda</option>
                  </select>
                </div>
              </div>
              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="institutionInput" className="formPlayerLabel">
                    Institución
                  </label>
                  <select
                    className="form-control"
                    id="institutionInput"
                    placeholder="Ingrese la institución"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  >
                    <option value="default">Seleccione la institución</option>
                    {customsUser.groups?.map((option) => (
                      <option value={option.groupName}>
                        {option.groupName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="formPlayerAddCustoms">
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
                <div className="formPlayerInputLabel">
                  <label htmlFor="categoryInput" className="formPlayerLabel">
                    Categoría
                  </label>
                  <select
                    id="categoryInput"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="default">Seleccione la categoría</option>
                    {customsUser.categories?.map((option) => (
                      <option value={option.categoryName}>
                        {option.categoryName}
                      </option>
                    ))}
                    <option value="En formación">En formación</option>
                    <option value="Universitaria">Universitaria</option>
                    <option value="Profesional 1ra">Profesional 1ra</option>
                    <option value="Profesional 2da">Profesional 2da</option>
                    <option value="Profesional 3ra">Profesional 3ra</option>
                  </select>
                </div>
                <div className="formPlayerAddCustoms">
                  {!isCustoms?.category ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="50"
                      width="25"
                      viewBox="0 0 512 512"
                      onClick={() => handleAddCustom("Categoría")}
                    >
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="50"
                      width="25"
                      viewBox="0 0 512 512"
                      onClick={() => handleEditCustom("Categoría")}
                    >
                      <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z" />
                    </svg>
                  )}
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="positionInput" className="formPlayerLabel">
                    Posición
                  </label>
                  <select
                    className="form-control"
                    id="positionInput"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="default">Seleccione la posición</option>
                    {customsUser.positions?.map((option) => (
                      <option value={option.positionName}>
                        {option.positionName}
                      </option>
                    ))}
                    <option value="Guardameta">Guardameta</option>
                    <option value="Defensor">Defensor</option>
                    <option value="Mediocampista">Mediocampista</option>
                    <option value="Atacante">Atacante</option>
                  </select>
                </div>
                <div className="formPlayerAddCustoms">
                  {!isCustoms?.position ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="50"
                      width="25"
                      viewBox="0 0 512 512"
                      onClick={() => handleAddCustom("Posición")}
                    >
                      <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM232 344V280H168c-13.3 0-24-10.7-24-24s10.7-24 24-24h64V168c0-13.3 10.7-24 24-24s24 10.7 24 24v64h64c13.3 0 24 10.7 24 24s-10.7 24-24 24H280v64c0 13.3-10.7 24-24 24s-24-10.7-24-24z" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="50"
                      width="25"
                      viewBox="0 0 512 512"
                      onClick={() => handleEditCustom("Posición")}
                    >
                      <path d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z" />
                    </svg>
                  )}
                </div>
              </div>
              <button
                type="submit"
                className="formPlayerButtonSubmit"
                disabled={!areFieldsComplete()}
              >
                {title.split(" ")[0]}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default FormPlayer;
