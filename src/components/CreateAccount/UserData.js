import { useContext } from "react";
import { Context } from "../../services/Context";

const UserData = ({formData, setFormData}) => {
  const {translate} =useContext(Context)
  return (
    <>
        <div className="createAccountInputContainer" >
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
              onChange={(e)=>setFormData({...formData, name: e.target.value})}
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
              onChange={(e)=>setFormData({...formData, lastName: e.target.value})}
            />
          </div>
        </div>

        <div className="createAccountInputContainer">
          <div className="createAccountInputLabel">
            <label htmlFor="nameInput" className="form-label">
              {translate("phone")}
            </label>
            <input
              type="phone"
              className="form-control"
              id="nameInput"
              placeholder="Ingrese su telefono"
              value={formData.phone}
              onChange={(e)=>setFormData({...formData, phone: e.target.value})}
            />
          </div>
          <div className="createAccountInputLabel">
            <label htmlFor="lastNameInput" className="form-label">
              {translate("address")} <span className="required">*</span>
            </label>
            <input
              type="address"
              className="form-control"
              id="lastNameInput"
              placeholder="Ingrese su dirección"
              value={formData.address}
              onChange={(e)=>setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>
      
    </>
  );
};

export default UserData;
