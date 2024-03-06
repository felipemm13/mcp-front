/* eslint-disable */
import { useContext, useEffect, useState } from "react";
import "../styles/FormPlayer.css";
import { Context } from "../services/Context";

const FormPlayer = ({ setOpenModal, title, player, updatePlayers }) => {
  const { userContext, CrudApi } = useContext(Context);
  const typeForm = title.split(" ")[0];
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("default");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [institution, setInstitution] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [position, setPosition] = useState("");
  const [limb, setLimb] = useState("default");

  // Función para verificar si todos los campos están completos
  const areFieldsComplete = () => {
    return (
      name !== "" &&
      lastName !== "" &&
      age !== "" &&
      dob !== "" &&
      gender !== "" &&
      height !== "" &&
      weight !== "" &&
      institution !== "" &&
      category !== "" &&
      experience !== "" &&
      position !== "" &&
      limb !== ""
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      UserId: userContext.current.userId,
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

    // Aquí puedes manejar el envío de formData, por ejemplo, llamar a una función que envíe los datos a una API.
    console.log("Datos a enviar:", formData);
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
    // También puedes resetear los campos del formulario después de enviar los datos.
    /*
        setLastName('');
        setAge('');
        setDob('');
        setGender('');
        setHeight('');
        setWeight('');
        setInstitution('');
        setCategory('');
        setExperience('');
        setPosition('');
        setLimb('');*/
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
      setAge(calculateAge(player.Birthday));
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
                  <label htmlFor="nameInput" className="form-label">
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
                  <label htmlFor="lastNameInput" className="form-label">
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
              </div>
              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="ageInput" className="form-label">
                    Edad
                  </label>
                  <input
                    readOnly
                    disabled
                    className="form-control"
                    id="ageInput"
                    placeholder="Ingrese su edad"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="dobInput" className="form-label">
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
                <div className="formPlayerInputLabel">
                  <label htmlFor="genderInput" className="form-label">
                    Sexo
                  </label>
                  <select
                    className="form-select"
                    id="genderInput"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    defaultValue={"default"}
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
                  <label htmlFor="heightInput" className="form-label">
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
                  <label htmlFor="weightInput" className="form-label">
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
              </div>

              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="institutionInput" className="form-label">
                    Institución
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="institutionInput"
                    placeholder="Ingrese la institución"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="categoryInput" className="form-label">
                    Categoría
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="categoryInput"
                    placeholder="Ingrese la categoría"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="experienceInput" className="form-label">
                    Experiencia
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    id="experienceInput"
                    placeholder="Ingrese los años de experiencia"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>

              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="positionInput" className="form-label">
                    Posición
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="positionInput"
                    placeholder="Ingrese la posición de juego"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
                <div className="formPlayerInputLabel">
                  <label htmlFor="limbInput" className="form-label">
                    Extremidad
                  </label>
                  <select
                    className="form-select"
                    id="limbInput"
                    value={limb}
                    onChange={(e) => setLimb(e.target.value)}
                    defaultValue={"default"}
                  >
                    <option selected value="default" disabled="disabled">
                      Seleccione la extremidad dominante
                    </option>
                    <option value={1}>Derecha</option>
                    <option value={2}>Izquierda</option>
                  </select>
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
