import "../styles/ShoppingCart.css";
import React from "react";

const ShoppingCart = ({
  products,
  setProducts,
  onClose,
  onCheckout,
  setSelectedPlan,
}) => {
  const handleRemoveProduct = (productId) => {
    setProducts((prevProducts) => {
      const productIndex = prevProducts.findIndex(
        (product) => product.id === productId
      );

      if (productIndex === -1) {
        return prevProducts;
      }

      const productToUpdate = prevProducts[productIndex];

      if (productToUpdate.name.includes("Plan")) {
        setSelectedPlan(null);
      }

      if (productToUpdate.quantity > 1) {
        return prevProducts.map((product, index) =>
          index === productIndex
            ? { ...product, quantity: product.quantity - 1 }
            : product
        );
      }
      return prevProducts.filter((product) => product.id !== productId);
    });
  };

  const totalAmount = products.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  return (
    <div className="shoppingCartModal">
      <div className="shoppingCartModalContent">
        <div className="shoppingCartModalHeader">
          <svg
            className="shoppingCartIcon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 576 512"
          >
            <path d="M0 24C0 10.7 10.7 0 24 0L69.5 0c22 0 41.5 12.8 50.6 32l411 0c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3l-288.5 0 5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5L488 336c13.3 0 24 10.7 24 24s-10.7 24-24 24l-288.3 0c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5L24 48C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
          </svg>
          <h2 className="shoppingCartModalTitle">Carrito de compras</h2>
          <button className="shoppingCartModalClose" onClick={onClose}>
            &times;
          </button>
        </div>

        <ul className="shoppingCartProductList">
          {products.map((product) => (
            <li key={product.id} className="shoppingCartProductItem">
              <span className="productName">
                {product.name} {product.quantity > 0 && `(${product.quantity})`}
              </span>
              <span className="productPrice">
                ${(product.price * product.quantity).toLocaleString("es-CL")}{" "}
                {product.quantity > 1 &&
                  `(${product.price.toLocaleString("es-CL")} p/u)`}
              </span>
              <button
                className="removeProductButton"
                onClick={() => handleRemoveProduct(product.id)}
                aria-label="Eliminar producto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 448 512"
                  fill="red"
                >
                  <path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z" />
                </svg>
              </button>
            </li>
          ))}
        </ul>

        <div className="shoppingCartTotal">
          <h3>Total: ${totalAmount.toLocaleString("es-CL")}</h3>
        </div>

        <div className="shoppingCartButtonContainer">
          <button className="shoppingCartButton" onClick={onClose}>
            Cancelar
          </button>
          <button
          disabled={products.length === 0}
            className="shoppingCartButton"
            onClick={onCheckout}
          >
            Pagar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart;
