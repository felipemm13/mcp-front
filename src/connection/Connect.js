import axios from "axios";

class Connect {
  #baseUrlApi = process.env.REACT_APP_APIMCP; // Asegúrate de que el nombre de la variable coincida con el que se usa en el código
  #token = process.env.REACT_APP_TOKEN;
  #headerName = process.env.REACT_APP_HEADER; // Nombre del encabezado para la autorización

  // Configuración común para las solicitudes
  #config = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      [this.#headerName]: this.#token, // Usa el nombre del encabezado y el token tal como están en el .env
    },
  };

  async post(path, data) {
    try {
      const url = `${this.#baseUrlApi}${path}`;
      console.log(url, this.#config);
      const response = await axios.post(url, data, this.#config); // Usa la configuración común

      return response;
    } catch (error) {
      console.error("Error en la solicitud POST:", error);
      throw error;
    }
  }

  async get(path) {
    try {
      const url = `${this.#baseUrlApi}${path}`;
      const response = await axios.get(url, this.#config); // Usa la configuración común
      return response.data;
    } catch (error) {
      console.error("Error en la solicitud GET:", error);
      throw error;
    }
  }

  // Método para DELETE
  async delete(path) {
    try {
      const url = `${this.#baseUrlApi}${path}`;
      const response = await axios.delete(url, this.#config); // Usa la configuración común
      return response.data;
    } catch (error) {
      console.error("Error en la solicitud DELETE:", error);
      throw error;
    }
  }

  // Método para UPDATE (generalmente se usa PUT o PATCH)
  async update(path, data) {
    try {
      const url = `${this.#baseUrlApi}${path}`;
      const response = await axios.put(url, data, this.#config); // Aquí se usa PUT, pero podrías usar PATCH si es necesario
      return response.data;
    } catch (error) {
      console.error("Error en la solicitud UPDATE:", error);
      throw error;
    }
  }
}

export default Connect;
