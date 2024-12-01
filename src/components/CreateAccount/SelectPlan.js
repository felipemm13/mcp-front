import React, { useContext, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/CreateAccount.css";
import { useEffect } from "react";
import { Context } from "../../services/Context";
import Swal from "sweetalert2";

const SelectPlan = ({
  selectedPlan,
  setSelectedPlan,
  addPlanToCart,
  setProducts,
  onClose,
  view
}) => {
  const { CrudApi } = useContext(Context);
  const [addedProduct, setAddedProduct] = useState(null);
  const [productsList, setProductsList] = useState([]);
  const previousSelectedPlan = useRef(selectedPlan);

  const handlePlanSelect = (planId) => {
    setSelectedPlan(planId);
    const selectedPlanDetails = productsList.find((product) => product.productId === planId && product.category === "planes");
    if (planId === previousSelectedPlan.current) {
      setProducts((prevProducts) => prevProducts.filter((product) => !product.name.startsWith("Plan ")));
      return;
    }
    addPlanToCart(selectedPlanDetails);
  };

  const handleProductAdd = (product) => {
    if (addedProduct === product.productId) {
      return;
    }

    setProducts((prevProducts) => {
      const productIndex = prevProducts.findIndex((p) => p.name === product.name);

      if (productIndex > -1) {
        const updatedProducts = [...prevProducts];
        const currentQuantity = updatedProducts[productIndex].quantity || 1;

        if (currentQuantity >= product.stock) {
          Swal.fire({
            icon: "error",
            title: "Sin stock",
            text: "No hay más stock disponible para este producto.",
          });
          return prevProducts;
        }

        updatedProducts[productIndex] = {
          ...updatedProducts[productIndex],
          quantity: currentQuantity + 1,
        };

        return updatedProducts;
      } else {
        if (product.stock <= 0) {
          Swal.fire({
            icon: "error",
            title: "Sin stock",
            text: "No hay más stock disponible para este producto.",
          });
          return prevProducts;
        }

        return [...prevProducts, { ...product, quantity: 1 }];
      }
    });

    setAddedProduct(product.productId);

    setTimeout(() => {
      setAddedProduct(null);
    }, 500);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await CrudApi.get("product");
        if (response === null) return;
        setProductsList(response);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <>
      <div>
        <span className="createAccountModalClose" onClick={onClose}>
          &times;
        </span>
        <p className="createAccountModalTitle">{view !== 'manage' ?'Seleccionar plan de la cuenta':'Actualizar plan o adquirir productos'} </p>
      </div>

      <div className="scrollable-container">
        <div className="plan-selection-container">
          {productsList
            .filter((product) => product.category === "planes")
            .sort((a, b) => a.price - b.price)
            .map((plan) => (
              <div
                key={plan.productId}
                className={`plan-card ${selectedPlan === plan.productId ? "selected" : ""
                  }`}
                onClick={() => handlePlanSelect(plan.productId)}
              >
                <div className="plan-card-icon">
                  {selectedPlan === plan.productId ? "✓" : "○"}
                </div>
                <div className="plan-card-content">
                  <h3>{plan.name}</h3>
                  <div dangerouslySetInnerHTML={{ __html: plan.description }} />
                  <div className="price">
                    <strong>Precio:</strong> ${plan.price.toLocaleString("es-CL")}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="product-selection-container">
          <h2>Productos disponibles</h2>
          <div className="product-list">
            {productsList
              .filter((product) => product.category !== "planes" && product.stock > 0)
              .sort((a, b) => a.price - b.price)
              .map((product) => (
                <div key={product.productId} className="product-item">
                  <span>{product.name}</span>
                  <span>${product.price.toLocaleString("es-CL")}</span>
                  <button
                    onClick={() => handleProductAdd(product)}
                    disabled={addedProduct === product.productId}
                  >
                    {addedProduct === product.productId ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="green"
                      >
                        <path d="M173.9 439.4c-5.1 5.6-12.3 8.6-19.9 8.6-7.1 0-14.2-2.7-19.7-8.2l-91.3-91.1c-10.9-10.9-10.9-28.5 0-39.4s28.5-10.9 39.4 0l71.6 71.5L407.6 72.4c10.9-10.9 28.5-10.9 39.4 0 10.9 10.9 10.9 28.5 0 39.4L173.9 439.4z" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                      >
                        <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20l44 0 0 44c0 11 9 20 20 20s20-9 20-20l0-44 44 0c11 0 20-9 20-20s-9-20-20-20l-44 0 0-44c0-11-9-20-20-20s-20 9-20 20l0 44-44 0c-11 0-20 9-20 20z" />
                      </svg>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SelectPlan;
