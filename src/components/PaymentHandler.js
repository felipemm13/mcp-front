import React, { useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Context } from '../services/Context';
import CryptoJS from "crypto-js";
import Swal from 'sweetalert2';

const PaymentHandler = () => {
    const { CrudApi, userContext, setUserContext } = useContext(Context);
    const location = useLocation();
    const navigate = useNavigate();

    const showAlert = (status) => {
        if (status === 'AUTHORIZED') {
            Swal.fire({
                icon: 'success',
                title: 'Compra Exitosa',
                text: 'Tu compra ha sido realizada con éxito.',
                showConfirmButton: true,
                timer: 2000,
                position: 'center'
            }).then(() => {
                navigate('/');
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Compra Fallida',
                text: 'Hubo un problema con tu compra. Por favor, intenta nuevamente.',
                showConfirmButton: true,
                timer: 2000,
                position: 'center'
            }).then(() => {
                navigate('/');
            })
        }
    };

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenWs = queryParams.get('token_ws');
        if (tokenWs) {
            checkTransaction(tokenWs);
        }
        else {
            navigate('/');
        }
    }, [location]);

    const checkTransaction = async (tokenWs) => {
        const response = await CrudApi.post(`payment/commit`, {
            token_ws: tokenWs
        });
        if (response.status === 200) {
            const status = response.data.commitResponse.status;
            if (status === 'AUTHORIZED') {

                const productsBytes = CryptoJS.AES.decrypt(
                    localStorage.getItem("cartProducts"),
                    `${process.env.TOKEN}`
                );
                const products = JSON.parse(productsBytes.toString(CryptoJS.enc.Utf8));
                const userBytes = CryptoJS.AES.decrypt(
                    localStorage.getItem("user"),
                    `${process.env.TOKEN}`
                );
                setUserContext(JSON.parse(userBytes.toString(CryptoJS.enc.Utf8)))
                products.forEach(async (product) => {
                    if (product.name.includes('Plan')) {
                        const planName = product.name.replace('Plan ', '').trim().toLowerCase();
                        const response = await CrudApi.update(`user/${userContext.current.userId}`, {
                            suscription: planName
                        });
                        if (response !== null) {
                            localStorage.removeItem("cartProducts");
                            setUserContext({
                                ...userContext,
                                suscription: response.suscription
                            })
                            const encryptedUserData = CryptoJS.AES.encrypt(
                                JSON.stringify(userContext),
                                `${process.env.TOKEN}`
                            ).toString();
                            localStorage.setItem("user", encryptedUserData);
                        }
                    }
                    await CrudApi.update(`product/${product.productId}/stock`, {
                        quantity: -product.quantity
                    });
                });
                const totalPriceBytes = CryptoJS.AES.decrypt(
                    localStorage.getItem("totalAmount"),
                    `${process.env.TOKEN}`
                );
                const totalPrice = JSON.parse(totalPriceBytes.toString(CryptoJS.enc.Utf8));
                await CrudApi.post('purchase', {
                    totalPrice: totalPrice,
                    purchaseDate: new Date().toISOString()
                });
            }
            showAlert(status);
        }
    };

    return (
        <>
        </>
    );
};

export default PaymentHandler;