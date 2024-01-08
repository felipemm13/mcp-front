import { useEffect, useState } from "react";
import "../styles/FormPlayer.css";

const FormPlayer = ({ setOpenModal, title, player }) => {
  const typeForm = title.split(" ")[0];
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [age, setAge] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [institution, setInstitution] = useState("");
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [position, setPosition] = useState("");
  const [limb, setLimb] = useState("");

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
  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = {
      name,
      lastName,
      age,
      dob,
      gender,
      height,
      weight,
      institution,
      category,
      experience,
      position,
      limb,
    };

    // Aquí puedes manejar el envío de formData, por ejemplo, llamar a una función que envíe los datos a una API.
    console.log("Datos a enviar:", formData);
    if(typeForm === 'Agregar'){

    }else if(typeForm === 'Editar'){

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
  useEffect(() => {
    if (player && typeForm == "Editar") {
      setName(player[0][1].Name);
      setLastName(player[0][1].Surname);
      setAge(player[0][1].Age);
      setDob("");
      setGender(player[0][1].Gender);
      setHeight(player[0][1].Height_cm);
      setWeight(player[0][1].Weight_kg);
      setInstitution("");
      setCategory(player[0][1].Category);
      setExperience(player[0][1].Experience);
      setPosition(player[0][1].FootballPlayer.FieldPosition);
      setLimb(player[0][1].FootballPlayer.SkilfulExtremity);
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
                    type="number"
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
                  >
                    <option selected disabled>
                      Seleccione una opción
                    </option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="X">Otro</option>
                  </select>
                </div>
              </div>

              <div className="formPlayerInputContainer">
                <div className="formPlayerInputLabel">
                  <label htmlFor="heightInput" className="form-label">
                    Altura
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
                    Peso
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
                  <input
                    type="text"
                    className="form-control"
                    id="limbInput"
                    placeholder="Ingrese la extremidad dominante"
                    value={limb}
                    onChange={(e) => setLimb(e.target.value)}
                  />
                </div>
              </div>

              {/* Botón de envío */}
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
