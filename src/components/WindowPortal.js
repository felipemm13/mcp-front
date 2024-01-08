import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";


const WindowPortal = ({ children, closeWindowPortal }) => {
  const externalWindow = useRef(
    window.open("", "Ventana Jugador", "width=1080,height=720,left=0,top=0")
  );
  let headChildrens = document.head.childNodes;
  headChildrens = [...headChildrens];
  const containerEl = document.createElement("div");
  containerEl.setAttribute('id','root')
  useEffect(() => {
    const currentWindow = externalWindow.current;
    return () => currentWindow.close();
  }, []);
  const charsetTag = document.createElement("meta");
  charsetTag.setAttribute("charset", "utf-8");
  externalWindow.current.document.write('<!DOCTYPE html><html><head></head><body></body></html>')
  externalWindow.current.document.title = "Vista Jugador";
  externalWindow.current.document.body.appendChild(containerEl);
  headChildrens.forEach((child) => {
    if (child.nodeName !== "TITLE") {
      let cln = child.cloneNode(true);
      externalWindow.current.document.head.appendChild(cln);
    }
  });

  externalWindow.current.addEventListener("beforeunload", () => {
    closeWindowPortal();
  });

  return ReactDOM.createPortal(children, containerEl);
};
export default WindowPortal;
